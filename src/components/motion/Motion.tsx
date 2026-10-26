"use client";

import { useEffect } from "react";
import {
  animate,
  createScope,
  createTimeline,
  onScroll,
  splitText,
  stagger,
  utils,
} from "animejs";

/**
 * Все анимации сайта — anime.js, в одном месте.
 *
 * Разметка только помечает элементы атрибутами, а этот компонент один
 * раз после загрузки находит их и запускает движения. Так секции
 * остаются серверными компонентами, а весь клиентский код анимаций
 * лежит здесь и отменяется одной строкой.
 *
 * Словарь у анимаций один на весь сайт, четыре движения:
 *
 *   data-split   — заголовок; строки поднимаются из-под своей линии
 *   data-reveal  — блок поднимается и проявляется
 *   data-rule    — золотая черта прочерчивается слева направо
 *   data-rise    — элемент выходит из-под края родителя (цифры этапов)
 *
 * плюс data-settle — кадр внутри блока «оседает» из лёгкого
 * увеличения, пока блок поднимается. Задержки — data-*-delay в мс.
 *
 * Первый экран — отдельная постановка: вступление при загрузке и
 * параллакс фотографии при прокрутке.
 *
 * Начальные состояния (откуда стартуют движения) заданы в globals.css,
 * а не здесь: страница рисуется раньше, чем загружается скрипт, и
 * элементы иначе успели бы мелькнуть.
 *
 * Кривые — только плавные замедления, без отскоков и пружин: сайт
 * спокойный, и движение должно быть таким же.
 *
 * Кто запускает разовые появления. Сами движения — anime.js, а момент
 * «элемент вошёл в кадр» ловит IntersectionObserver. Сначала триггером
 * был onScroll из anime.js, но при проверке он терял срабатывания у
 * соседей разбиваемых заголовков: splitText перестраивает заголовок
 * после загрузки шрифтов, и пять блоков рядом так и не появились при
 * обычной прокрутке. IntersectionObserver считает пересечение в момент
 * прокрутки и любые сдвиги вёрстки учитывает сам. onScroll остался там,
 * где он незаменим: в параллаксе, привязанном к прокрутке непрерывно.
 */

type Cleanup = () => void;

/** Порог появления: верх элемента поднялся выше 90% высоты окна. */
const ROOT_MARGIN = "0px 0px -10% 0px";

/** Вызывает start один раз — когда элемент впервые входит в кадр. */
function whenVisible(target: Element, start: () => void): Cleanup {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    },
    { rootMargin: ROOT_MARGIN },
  );
  observer.observe(scrollerOf(target) ?? target);
  return () => observer.disconnect();
}

/**
 * Горизонтальная лента, в которой лежит элемент, — если он в ней.
 *
 * Карточки за правым краем ленты обрезаны её собственной прокруткой, и
 * наблюдатель их не видит: команда на телефоне въезжала бы по одной,
 * пока ленту листают пальцем, да ещё снизу вверх, поперёк движения.
 * Поэтому смотрим на саму ленту: она входит в кадр — и карточки
 * проявляются каскадом по своим задержкам.
 */
function scrollerOf(el: Element) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowX } = getComputedStyle(node);
    if (overflowX === "auto" || overflowX === "scroll") return node;
  }
  return null;
}

const delayOf = (el: HTMLElement, key: string) =>
  Number(el.dataset[key] ?? 0) || 0;

export function Motion() {
  useEffect(() => {
    const scope = createScope({
      mediaQueries: { reduce: "(prefers-reduced-motion: reduce)" },
    }).add((self) => {
      // Анимация выключена в системе: начальные состояния в CSS в этом
      // случае не применяются, всё и так стоит на местах.
      if (self?.matches.reduce) return;

      heroIntro();
      heroParallax();

      const cleanups = [reveals(), rules(), rises(), splitHeadings()];
      return () => cleanups.forEach((cleanup) => cleanup());
    });

    return () => {
      scope.revert();
    };
  }, []);

  return null;
}

/**
 * Вступление первого экрана: кадр оседает, знак поднимается из-под
 * своей нижней кромки — сначала «LUSI», следом «WEDDING», — затем
 * прочерчивается линия и проявляется подпись.
 */
function heroIntro() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  createTimeline({ defaults: { ease: "out(4)" } })
    .add(
      hero.querySelectorAll("[data-hero-photo]"),
      { scale: [1.08, 1], duration: 2600, ease: "out(3)" },
      0,
    )
    .add(
      hero.querySelectorAll("[data-wordmark]"),
      {
        clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
        y: ["18%", "0%"],
        duration: 1300,
      },
      stagger(170, { start: 250 }),
    )
    .add(
      hero.querySelectorAll("[data-hero-rule]"),
      { scaleX: [0, 1], duration: 900, ease: "outExpo" },
      950,
    )
    .add(
      hero.querySelectorAll("[data-hero-fade]"),
      { opacity: [0, 1], y: [14, 0], duration: 1000 },
      1050,
    )
    // Первый кадр — сразу, а не на следующем тике. Иначе параллакс,
    // который создаётся следом на том же фото, успевает записать свой
    // transform без масштаба, и кадр на мгновение прыгает 1.08 → 1 → 1.08.
    .init();
}

/**
 * Фото первого экрана уходит вниз медленнее, чем прокручивается
 * страница, — появляется глубина. Движение привязано к прокрутке
 * напрямую: от момента, когда верх кадра упирается в верх окна, до
 * момента, когда кадр уходит целиком.
 *
 * Открывшаяся сверху полоса всегда за пределами окна: кадр съезжает на
 * 12% своей высоты, а сама секция к этому времени уходит выше на всю.
 */
function heroParallax() {
  const hero = document.querySelector("[data-hero]");
  const photo = hero?.querySelector("[data-hero-photo]");
  if (!hero || !photo) return;

  animate(photo, {
    y: ["0%", "12%"],
    ease: "linear",
    autoplay: onScroll({
      target: hero,
      enter: "top top",
      leave: "top bottom",
      sync: true,
    }),
  });
}

/** Блоки: поднимаются на 28px и проявляются; кадры внутри оседают. */
function reveals(): Cleanup {
  const stops = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].map(
    (el) => {
      const timeline = createTimeline({
        delay: delayOf(el, "revealDelay"),
        defaults: { ease: "out(3)" },
        autoplay: false,
      }).add(el, { opacity: [0, 1], y: [28, 0], duration: 1100 }, 0);

      const photos = el.querySelectorAll("[data-settle] img");
      if (photos.length) {
        timeline.add(photos, { scale: [1.12, 1], duration: 1800 }, 0);
      }

      return whenVisible(el, () => timeline.play());
    },
  );
  return () => stops.forEach((stop) => stop());
}

/** Золотые черты прочерчиваются от левого края. */
function rules(): Cleanup {
  const stops = [...document.querySelectorAll<HTMLElement>("[data-rule]")].map(
    (el) => {
      const animation = animate(el, {
        scaleX: [0, 1],
        duration: 1200,
        delay: delayOf(el, "ruleDelay"),
        ease: "outExpo",
        autoplay: false,
      });
      return whenVisible(el, () => animation.play());
    },
  );
  return () => stops.forEach((stop) => stop());
}

/**
 * Выход из-под края родителя. Наблюдаем за родителем: сам элемент в
 * начале сдвинут вниз на свою высоту и порог считался бы не от того
 * места.
 */
function rises(): Cleanup {
  const stops = [...document.querySelectorAll<HTMLElement>("[data-rise]")].map(
    (el) => {
      const animation = animate(el, {
        y: ["105%", "0%"],
        duration: 1200,
        delay: delayOf(el, "riseDelay"),
        ease: "out(4)",
        autoplay: false,
      });
      return whenVisible(el.parentElement ?? el, () => animation.play());
    },
  );
  return () => stops.forEach((stop) => stop());
}

/**
 * Заголовки разбиваются на строки, и строки по очереди поднимаются
 * из-под своей нижней кромки.
 *
 * splitText ждёт загрузки шрифтов и пересчитывает строки при каждом
 * изменении ширины, поэтому анимация объявлена через addEffect — он
 * вызывается после каждой разбивки. Если заголовок уже проявился,
 * повторно его не прячем: иначе поворот телефона заново проигрывал бы
 * появление всех заголовков на странице.
 *
 * Скринридер читает заголовок целиком: splitText по умолчанию кладёт
 * рядом скрытую копию исходного текста, а строки прячет от него.
 *
 * Загрузку шрифтов ждём сами, до вызова splitText. Иначе он откладывает
 * разбивку внутри себя, и если сцену отменят во время ожидания (React в
 * разработке запускает эффект дважды; в работе — переключение
 * «уменьшения движения» в системе), отложенная разбивка всё равно
 * срабатывает, а новая ложится поверх неё. Заголовок оказывается разбит
 * дважды: все слова уходят в невидимую копию для скринридера, и
 * заголовок схлопывается в ноль — так пропадал «Свадьбы LUSI Wedding».
 */
function splitHeadings(): Cleanup {
  let cancelled = false;
  const cleanups: Cleanup[] = [];

  document.fonts.ready.then(() => {
    if (cancelled) return;
    document
      .querySelectorAll<HTMLElement>("[data-split]")
      .forEach((heading) => cleanups.push(splitHeading(heading)));
  });

  return () => {
    cancelled = true;
    cleanups.forEach((cleanup) => cleanup());
  };
}

function splitHeading(heading: HTMLElement): Cleanup {
  let revealed = false;
  // анимация и наблюдатель от предыдущей разбивки
  let dispose: Cleanup = () => {};

  const split = splitText(heading, { lines: { wrap: "clip" } });

  split.addEffect(({ lines }) => {
    dispose();
    dispose = () => {};

    if (revealed) {
      unclip(lines);
    } else {
      // Строки прячутся до того, как заголовок станет видимым, —
      // иначе он мелькнёт целиком между разбивкой и анимацией.
      utils.set(lines, { y: "100%" });
    }
    heading.style.visibility = "visible";
    if (revealed) return;

    const animation = animate(lines, {
      y: ["100%", "0%"],
      duration: 1150,
      delay: stagger(110, { start: delayOf(heading, "splitDelay") }),
      ease: "out(4)",
      autoplay: false,
      onBegin: () => {
        revealed = true;
      },
      onComplete: () => unclip(lines),
    });
    const stop = whenVisible(heading, () => animation.play());

    dispose = () => {
      stop();
      animation.revert();
    };
  });

  return () => {
    dispose();
    split.revert();
    heading.style.visibility = "";
  };
}

/**
 * Снимает обрезку со строк заголовка. Маска нужна, только пока строка
 * поднимается из-под своей кромки; стоящую на месте она подрезает: у
 * Cormorant при плотном интерлиньяже хвосты «у» и «р» выходят за высоту
 * строки на пару пикселей.
 */
function unclip(lines: HTMLElement[]) {
  lines.forEach((line) => {
    if (line.parentElement) line.parentElement.style.overflow = "visible";
  });
}

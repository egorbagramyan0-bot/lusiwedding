"use client";

import { useEffect } from "react";
import { animate, createScope, onScroll, splitText, stagger, waapi } from "animejs";

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
 * Первый экран — отдельная постановка: вступление при загрузке и, на
 * компьютере, параллакс фотографии при прокрутке.
 *
 * Начальные состояния (откуда стартуют движения) заданы в globals.css,
 * а не здесь: страница рисуется раньше, чем загружается скрипт, и
 * элементы иначе успели бы мелькнуть.
 *
 * Кривые — только плавные замедления, без отскоков и пружин: сайт
 * спокойный, и движение должно быть таким же.
 *
 * ПЛАВНОСТЬ НА ТЕЛЕФОНЕ
 *
 * Все разовые движения идут через waapi.animate — Web Animations API.
 * Такие анимации браузер ведёт на видеокарте, отдельно от основного
 * потока, и они не дёргаются, пока страница прокручивается или
 * загружается. Особенно это заметно во встроенных браузерах — Telegram,
 * Instagram: там основной поток медленнее, а прокрутка идёт своим ходом.
 *
 * Отсюда два правила:
 *
 * — анимируются только opacity, translate, scale и clip-path: их
 *   видеокарта ведёт сама. Отдельные свойства translate и scale, а не
 *   transform, — и в начальных состояниях в CSS тоже, иначе сдвиг из
 *   transform сложился бы с анимируемым translate;
 * — кривые заданы через cubic-bezier, а не out(3): кривые anime.js
 *   превращаются в linear(), и Safari с ними уводит анимацию обратно в
 *   основной поток. На iPhone так работает и браузер Telegram.
 *
 * Параллакс фото — единственное движение, привязанное к прокрутке, —
 * включён только там, где есть мышь. На телефоне прокрутка идёт в
 * отдельном потоке, а скрипт, двигающий фото, отстаёт от неё на кадр:
 * фото дрожит относительно страницы с первого же движения пальцем.
 *
 * Кто запускает появления. Момент «элемент вошёл в кадр» ловит
 * IntersectionObserver: onScroll из anime.js при проверке терял
 * срабатывания у соседей разбиваемых заголовков. IntersectionObserver
 * считает пересечение сам и любые сдвиги вёрстки учитывает.
 */

type Cleanup = () => void;

/*
  Кривые замедления в виде cubic-bezier — их Safari ведёт на видеокарте.
  Это те же «out cubic», «out quart» и «out expo», что раньше были
  записаны как out(3), out(4) и outExpo.
*/
const OUT_3 = "cubic-bezier(0.33, 1, 0.68, 1)";
const OUT_4 = "cubic-bezier(0.25, 1, 0.5, 1)";
const OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

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
      mediaQueries: {
        reduce: "(prefers-reduced-motion: reduce)",
        // мышь, а не палец: параллакс только здесь
        pointer: "(hover: hover) and (pointer: fine)",
      },
    }).add((self) => {
      // Анимация выключена в системе: начальные состояния в CSS в этом
      // случае не применяются, всё и так стоит на местах.
      if (self?.matches.reduce) return;

      const cleanups = [
        heroIntro(),
        self?.matches.pointer ? heroParallax() : () => {},
        pauseFilmOffscreen(),
        reveals(),
        rules(),
        rises(),
        splitHeadings(),
      ];
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
 *
 * Последовательность собрана задержками, а не таймлайном: у WAAPI
 * таймлайна нет, а на первом экране движения идут, пока страница ещё
 * догружается, — именно тут видеокарта важнее всего.
 */
function heroIntro(): Cleanup {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return () => {};

  const animations = [
    waapi.animate(hero.querySelectorAll("[data-hero-photo]"), {
      scale: [1.08, 1],
      duration: 2600,
      ease: OUT_3,
    }),
    waapi.animate(hero.querySelectorAll("[data-wordmark]"), {
      clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
      translate: ["0 18%", "0 0"],
      duration: 1300,
      delay: stagger(170, { start: 250 }),
      ease: OUT_4,
    }),
    waapi.animate(hero.querySelectorAll("[data-hero-rule]"), {
      scale: ["0 1", "1 1"],
      duration: 900,
      delay: 950,
      ease: OUT_EXPO,
    }),
    waapi.animate(hero.querySelectorAll("[data-hero-fade]"), {
      opacity: [0, 1],
      translate: ["0 14px", "0 0"],
      duration: 1000,
      delay: 1050,
      ease: OUT_4,
    }),
  ];

  return () => animations.forEach((animation) => animation.revert());
}

/**
 * Фото первого экрана уходит вниз медленнее, чем прокручивается
 * страница, — появляется глубина. Только там, где есть мышь: см. шапку
 * файла, почему не на телефоне.
 *
 * Движение двигает transform, а вступление — отдельное свойство scale,
 * поэтому они не мешают друг другу.
 */
function heroParallax(): Cleanup {
  const hero = document.querySelector("[data-hero]");
  const photo = hero?.querySelector("[data-hero-photo]");
  if (!hero || !photo) return () => {};

  const animation = animate(photo, {
    y: ["0%", "12%"],
    ease: "linear",
    autoplay: onScroll({
      target: hero,
      enter: "top top",
      leave: "top bottom",
      sync: true,
    }),
  });
  return () => animation.revert();
}

/**
 * Лента киноплёнки крутится бесконечно, но видна только у первого
 * экрана. Всё остальное время она останавливается — видеокарте не
 * нужно гонять её, пока посетитель листает тарифы.
 */
function pauseFilmOffscreen(): Cleanup {
  const strips = document.querySelectorAll<HTMLElement>(".film-strip");
  if (!strips.length) return () => {};

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      (entry.target as HTMLElement).toggleAttribute(
        "data-offscreen",
        !entry.isIntersecting,
      );
    }
  });
  strips.forEach((strip) => observer.observe(strip));

  return () => {
    observer.disconnect();
    strips.forEach((strip) => strip.removeAttribute("data-offscreen"));
  };
}

/** Блоки: поднимаются на 28px и проявляются; кадры внутри оседают. */
function reveals(): Cleanup {
  const cleanups = [
    ...document.querySelectorAll<HTMLElement>("[data-reveal]"),
  ].map((el) => {
    const delay = delayOf(el, "revealDelay");
    const animations = [
      waapi.animate(el, {
        opacity: [0, 1],
        translate: ["0 28px", "0 0"],
        duration: 1100,
        delay,
        ease: OUT_3,
        autoplay: false,
      }),
    ];

    const photos = el.querySelectorAll("[data-settle] img");
    if (photos.length) {
      animations.push(
        waapi.animate(photos, {
          scale: [1.12, 1],
          duration: 1800,
          delay,
          ease: OUT_3,
          autoplay: false,
        }),
      );
    }

    const stop = whenVisible(el, () =>
      animations.forEach((animation) => animation.play()),
    );
    return () => {
      stop();
      animations.forEach((animation) => animation.revert());
    };
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}

/** Золотые черты прочерчиваются от левого края. */
function rules(): Cleanup {
  const cleanups = [
    ...document.querySelectorAll<HTMLElement>("[data-rule]"),
  ].map((el) => {
    const animation = waapi.animate(el, {
      scale: ["0 1", "1 1"],
      duration: 1200,
      delay: delayOf(el, "ruleDelay"),
      ease: OUT_EXPO,
      autoplay: false,
    });
    const stop = whenVisible(el, () => animation.play());
    return () => {
      stop();
      animation.revert();
    };
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}

/**
 * Выход из-под края родителя. Наблюдаем за родителем: сам элемент в
 * начале сдвинут вниз на свою высоту и порог считался бы не от того
 * места.
 */
function rises(): Cleanup {
  const cleanups = [
    ...document.querySelectorAll<HTMLElement>("[data-rise]"),
  ].map((el) => {
    const animation = waapi.animate(el, {
      translate: ["0 105%", "0 0"],
      duration: 1200,
      delay: delayOf(el, "riseDelay"),
      ease: OUT_4,
      autoplay: false,
    });
    const stop = whenVisible(el.parentElement ?? el, () => animation.play());
    return () => {
      stop();
      animation.revert();
    };
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}

/**
 * Заголовки разбиваются на строки, и строки по очереди поднимаются
 * из-под своей нижней кромки.
 *
 * splitText пересчитывает строки при каждом изменении ширины, поэтому
 * анимация объявлена через addEffect — он вызывается после каждой
 * разбивки. Если заголовок уже проявился, повторно его не прячем:
 * иначе поворот телефона заново проигрывал бы появление всех
 * заголовков на странице.
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
 * заголовок схлопывается в ноль.
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

  // splitText типизирует строки как any[] — уточняем
  split.addEffect(({ lines }: { lines: HTMLElement[] }) => {
    dispose();
    dispose = () => {};

    if (revealed) {
      unclip(lines);
    } else {
      // Строки прячутся до того, как заголовок станет видимым, —
      // иначе он мелькнёт целиком между разбивкой и анимацией.
      lines.forEach((line) => (line.style.translate = "0 100%"));
    }
    heading.style.visibility = "visible";
    if (revealed) return;

    const animation = waapi.animate(lines, {
      translate: ["0 100%", "0 0"],
      duration: 1150,
      delay: stagger(110, { start: delayOf(heading, "splitDelay") }),
      ease: OUT_4,
      autoplay: false,
      onComplete: () => unclip(lines),
    });
    const stop = whenVisible(heading, () => {
      revealed = true;
      animation.play();
    });

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
 * поднимается из-под своей кромки; стоящую на месте она подрезает: при
 * плотном интерлиньяже хвосты «у» и «р» выходят за высоту строки на
 * пару пикселей.
 */
function unclip(lines: HTMLElement[]) {
  lines.forEach((line) => {
    if (line.parentElement) line.parentElement.style.overflow = "visible";
  });
}

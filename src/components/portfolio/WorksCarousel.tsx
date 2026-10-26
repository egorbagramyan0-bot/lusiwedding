"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { Work } from "@/content/works";

/**
 * Карусель свадеб для телефона: карточки стоят стопкой в глубину,
 * смахивание листает по одной, нажатие на переднюю открывает карточку
 * целиком. Стопка зациклена — ушедшая карточка возвращается в конец
 * очереди, и листать можно бесконечно.
 *
 * Анимация покадровая, а не на CSS-переходах, и это принципиально.
 * При зацикливании карточка в какой-то момент перескакивает с начала
 * очереди в конец; CSS-переход отыграл бы этот перескок прокруткой
 * через всю стопку. Пересчитывая раскладку каждый кадр, мы проводим
 * карточку через точку перескока плавно — и делаем это там, где она
 * полностью прозрачна, так что подмены не видно.
 *
 * Анимационная библиотека для этого не нужна: весь тween — десяток
 * строк на requestAnimationFrame.
 */

/** Насколько карточки уходят вглубь и вбок друг от друга. */
const DEPTH = 150;
const SPREAD = 46;
const TILT = 15;
/** Насколько темнеет и размывается каждая следующая. */
const FALLOFF = 0.22;
const BLUR = 4;
/** Длительность доводки до карточки. */
const DURATION = 620;

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/** Кратчайшее расстояние по кругу: от -count/2 до +count/2. */
function wrapDelta(value: number, count: number) {
  const d = ((value % count) + count) % count;
  return d > count / 2 ? d - count : d;
}

type Drag = {
  startX: number;
  startPos: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
  pointerId: number;
};

export function WorksCarousel({
  works,
  onOpen,
}: {
  works: Work[];
  onOpen: (index: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const posRef = useRef(0);
  const rafRef = useRef(0);
  const dragRef = useRef<Drag | null>(null);
  const reducedRef = useRef(false);
  const [focus, setFocus] = useState(0);

  /**
   * Кольцо длиннее списка свадеб.
   *
   * Прозрачность обязана падать до нуля в точке перескока — на половине
   * кольца. При четырёх карточках это d = 2, и в стопке остаётся всего
   * два видимых слоя. Проходим круг дважды: половина кольца уезжает на
   * d = 4, и слоёв становится четыре. Одна и та же свадьба попадает в
   * кольцо дважды, но второй раз — ровно в невидимой точке.
   */
  const repeat = works.length < 6 ? 2 : 1;
  const count = works.length * repeat;
  const slides = Array.from({ length: count }, (_, i) => works[i % works.length]);

  /**
   * Расставляет карточки для дробной позиции стопки.
   *
   * Прозрачность гасится с обеих сторон круга: ушедшая карточка тает
   * впереди, дальняя проявляется из глубины. Встречаются они ровно в
   * точке перескока, где обе невидимы, — поэтому цикл не заметен.
   */
  const layout = useCallback(
    (pos: number) => {
      const half = count / 2;
      const fade = Math.min(0.8, half);

      cardsRef.current.forEach((el, i) => {
        if (!el) return;

        const d = wrapDelta(i - pos, count);
        const back = Math.max(0, d);

        const opacity =
          d < 0 ? Math.max(0, 1 + d) : clamp((half - d) / fade, 0, 1);
        const brightness = Math.max(0.15, 1 - back * FALLOFF);
        const blur = Math.min(BLUR, (back / Math.max(half, 1)) * BLUR);

        el.style.transform = `translate(-50%, -50%) translateX(${(SPREAD * d).toFixed(1)}px) translateZ(${(-DEPTH * d).toFixed(1)}px) rotateY(${(TILT * clamp(d, 0, 1)).toFixed(2)}deg)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blur.toFixed(2)}px)`;
        el.style.zIndex = String(Math.round(2000 - d * 20));
        el.style.pointerEvents = opacity > 0.05 ? "auto" : "none";
      });
    },
    [count],
  );

  /** Доводит стопку до цели покадрово, с затуханием к концу. */
  const tweenTo = useCallback(
    (target: number) => {
      cancelAnimationFrame(rafRef.current);

      const from = posRef.current;
      const delta = target - from;
      const duration = reducedRef.current ? 0 : DURATION;

      if (duration === 0) {
        posRef.current = ((target % count) + count) % count;
        layout(posRef.current);
        return;
      }

      const started = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        posRef.current = from + delta * eased;
        layout(posRef.current);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          // держим позицию в пределах круга, чтобы числа не росли
          posRef.current = ((target % count) + count) % count;
          layout(posRef.current);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [count, layout],
  );

  /** Листает к карточке по кратчайшей дуге. */
  const goTo = useCallback(
    (rawIndex: number) => {
      const index = ((Math.round(rawIndex) % count) + count) % count;
      tweenTo(posRef.current + wrapDelta(index - posRef.current, count));
      setFocus(index);
    },
    [count, tweenTo],
  );

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    layout(posRef.current);
    return () => cancelAnimationFrame(rafRef.current);
  }, [layout]);

  /** Сколько пикселей пальца стоит одна карточка. */
  const stepPx = () => Math.max((rootRef.current?.clientWidth ?? 320) * 0.5, 60);

  function handlePointerDown(event: React.PointerEvent) {
    if (count < 2) return;
    cancelAnimationFrame(rafRef.current);
    dragRef.current = {
      startX: event.clientX,
      startPos: posRef.current,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
      pointerId: event.pointerId,
    };
  }

  function handlePointerMove(event: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.startX;
    if (!drag.moved) {
      // до этого порога считаем жест нажатием, а не перетаскиванием
      if (Math.abs(dx) < 5) return;
      drag.moved = true;
      rootRef.current?.setPointerCapture(drag.pointerId);
    }

    const now = performance.now();
    drag.velocity =
      (event.clientX - drag.lastX) / Math.max(now - drag.lastTime, 1);
    drag.lastX = event.clientX;
    drag.lastTime = now;

    // За один жест стопка сдвигается не больше чем на карточку — дальше
    // палец идёт с сопротивлением. Без этого длинным смахиванием можно
    // было пролистать все свадьбы разом, а на отпускании стопку
    // отбрасывало назад.
    const raw = drag.startPos - dx / stepPx();
    const limited = clamp(raw, drag.startPos - 1, drag.startPos + 1);
    posRef.current = limited + (raw - limited) * 0.12;
    layout(posRef.current);
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag?.moved) return;

    // короткий бросок пальцем доводит до соседней карточки
    const projected = posRef.current - (drag.velocity * 90) / stepPx();
    const target = clamp(
      Math.round(projected),
      drag.startPos - 1,
      drag.startPos + 1,
    );
    goTo(target);
  }

  function handleCardClick(index: number) {
    if (dragRef.current?.moved) return;
    if (index === focus) onOpen(index % works.length);
    else goTo(index);
  }

  const current = slides[focus];

  // Карусель живёт только на телефоне: с 640px её сменяет обычная сетка,
  // поэтому граница здесь sm, а не lg.
  return (
    <div className="sm:hidden">
      <div
        ref={rootRef}
        // pan-y оставляет странице вертикальную прокрутку, а горизонтальные
        // движения достаются карусели.
        // overflow-hidden обязателен: карточки в глубине смещены вправо и
        // без него растягивают страницу по горизонтали.
        className="relative h-[calc(72vw*4/3)] max-h-[26rem] touch-pan-y overflow-hidden select-none [perspective:1200px]"
        // Полосок-указателей под стопкой нет, поэтому листать без пальца
        // можно стрелками — сама стопка принимает фокус.
        tabIndex={0}
        role="group"
        aria-label="Свадьбы, листается стрелками"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(posRef.current + 1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(posRef.current - 1);
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {slides.map((work, index) => (
          <button
            key={`${work.id}-${index}`}
            type="button"
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            onClick={() => handleCardClick(index)}
            tabIndex={index === focus ? 0 : -1}
            aria-hidden={index !== focus}
            aria-label={`Свадьба «${work.title}», ${work.date}`}
            className="absolute top-1/2 left-1/2 w-[72vw] max-w-[19.5rem] cursor-pointer overflow-hidden [backface-visibility:hidden] [transform-style:preserve-3d]"
          >
            <MediaFrame
              slot={work.cover}
              tone="light"
              sizes="72vw"
              className="pointer-events-none"
            />
          </button>
        ))}
      </div>

      {/* Подпись одна на всю стопку: у карточек в глубине её не прочесть. */}
      <div className="mt-8 min-h-[4.5rem]">
        <span className="block text-caption text-gold-dim uppercase">
          {current.date}
        </span>
        <span className="mt-3 flex items-baseline gap-3 font-heading font-light text-[1.65rem] leading-tight text-wine-ink">
          {current.title}
          <span aria-hidden className="text-gold-dim">
            &rarr;
          </span>
        </span>
      </div>

    </div>
  );
}

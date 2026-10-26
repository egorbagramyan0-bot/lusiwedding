"use client";

import { useEffect, useRef, useState } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { WorkDetails } from "@/components/portfolio/WorkDetails";
import { WorksCarousel } from "@/components/portfolio/WorksCarousel";
import type { Work } from "@/content/works";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

/**
 * Сетка портфолио и развёрнутая карточка свадьбы.
 *
 * Карточка открывается в нативном <dialog>: браузер сам уводит фокус
 * внутрь, закрывает по Escape и делает остальную страницу недоступной
 * для скринридера. На нас остаётся блокировка прокрутки под окном и
 * возврат к началу при переходе к следующей свадьбе.
 */
export function WorksGallery({ works }: { works: Work[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (openIndex !== null) {
      if (!dialog.open) dialog.showModal();
      lockScroll();
      // При переходе между свадьбами окно открывается сначала. Именно
      // присваивание, а не scrollTo: страница объявляет плавную прокрутку,
      // и окно перематывалось бы анимацией на глазах у читателя.
      dialog.scrollTop = 0;
    } else if (dialog.open) {
      dialog.close();
    }

    return () => {
      unlockScroll();
    };
  }, [openIndex]);

  const open = openIndex !== null ? works[openIndex] : null;
  const previous = openIndex !== null ? works[(openIndex - 1 + works.length) % works.length] : null;
  const next = openIndex !== null ? works[(openIndex + 1) % works.length] : null;

  return (
    <>
      {/* На телефоне — стопка с глубиной: смахивание листает,
          нажатие на переднюю карточку открывает её целиком. */}
      <div className="mt-10 sm:hidden">
        <WorksCarousel works={works} onOpen={setOpenIndex} />
      </div>

      {/* От планшета — обычный ряд с подписью под кадром. */}
      <ul className="mt-10 hidden gap-x-5 gap-y-12 sm:grid sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
        {works.map((work, index) => (
          <li key={work.id}>
            <Reveal delay={index * 90}>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group block w-full cursor-pointer text-left"
              >
                <figure className="m-0">
                  {/* обрезку держит обёртка: у самого кадра при наведении
                      увеличивается и его собственная рамка */}
                  <div data-settle className="overflow-hidden">
                    <MediaFrame
                      slot={work.cover}
                      tone="light"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transform-none"
                    />
                  </div>

                  <figcaption className="mt-5">
                    <span className="block text-caption text-gold-dim uppercase">
                      {work.date}
                    </span>
                    <span className="mt-3 flex items-baseline gap-3 font-serif text-[clamp(1.15rem,1.5vw,1.45rem)] leading-tight text-wine-ink">
                      {work.title}
                      <span
                        aria-hidden
                        className="text-gold-dim transition-transform duration-500 group-hover:translate-x-2 motion-reduce:transform-none"
                      >
                        &rarr;
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        aria-label={open ? "Свадьба: " + open.title : "Свадьба"}
        className="m-0 h-full max-h-none w-full max-w-none overflow-y-auto scroll-auto [overflow-anchor:none] bg-wine text-cream backdrop:bg-black/80"
      >
        {open ? (
          <div className="pb-20">
            <div className="sticky top-0 z-10 border-b border-gold/15 bg-wine/95 backdrop-blur-sm">
              <div className="mx-auto flex h-(--header-h) w-full max-w-[calc(var(--container-site)+var(--gutter)*2)] items-center justify-between px-(--gutter)">
                <span className="text-caption text-gold-soft uppercase">
                  {String(openIndex! + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}
                </span>

                <button
                  type="button"
                  onClick={() => setOpenIndex(null)}
                  aria-label="Закрыть"
                  className="-mr-2 flex size-11 cursor-pointer items-center justify-center text-2xl text-gold transition-colors hover:text-cream"
                >
                  <span aria-hidden>&times;</span>
                </button>
              </div>
            </div>

            <WorkDetails work={open} />

            <nav
              aria-label="Другие свадьбы"
              className="mx-auto mt-20 w-full max-w-[calc(var(--container-site)+var(--gutter)*2)] px-(--gutter)"
            >
              <div className="grid gap-4 border-t border-gold/20 pt-10 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex((openIndex! - 1 + works.length) % works.length)}
                  className="group cursor-pointer border border-gold/20 px-6 py-6 text-left transition-colors hover:border-gold/50"
                >
                  <span className="flex items-center gap-2 text-caption text-gold uppercase">
                    <span aria-hidden>&larr;</span>
                    Предыдущая
                  </span>
                  <span className="mt-3 block font-serif text-xl text-cream">
                    {previous?.title}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpenIndex((openIndex! + 1) % works.length)}
                  className="group cursor-pointer border border-gold/20 px-6 py-6 text-right transition-colors hover:border-gold/50 sm:text-right"
                >
                  <span className="flex items-center justify-end gap-2 text-caption text-gold uppercase">
                    Следующая
                    <span aria-hidden>&rarr;</span>
                  </span>
                  <span className="mt-3 block font-serif text-xl text-cream">
                    {next?.title}
                  </span>
                </button>
              </div>
            </nav>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

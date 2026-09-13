import { Container } from "@/components/ui/Container";
import { media } from "@/content/media";
import { site } from "@/content/site";
import { Typo } from "@/components/ui/Typo";

/**
 * Первый экран: кадр во всю ширину, поверх него вордмарк в две строки.
 *
 * На макете «WEDDING» намеренно уходит за правый край — секция обрезает
 * его по краю окна. На телефоне обе строки укладываются в ширину экрана,
 * иначе от слова осталась бы половина.
 *
 * Кадр подставляет <picture>, а не next/image: на телефоне и на широком
 * экране это разные файлы — один и тот же снимок в разном кадрировании.
 * Горизонтальный кадр в высокой рамке телефона обрезался до неузнаваемости,
 * а next/image умеет менять только размер, но не сам файл. Оба файла уже
 * подготовлены под свои пропорции, поэтому оптимизация здесь не нужна.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col justify-end overflow-hidden bg-wine-veil lg:block lg:h-[min(56vw,806px)] lg:min-h-0"
    >
      <div className="absolute inset-0 -z-10">
        <picture>
          <source
            media="(min-width: 1024px)"
            srcSet={media.hero.src ?? undefined}
          />
          <img
            src={media.heroMobile.src ?? undefined}
            alt={media.hero.label}
            fetchPriority="high"
            className="h-full w-full object-cover object-center"
          />
        </picture>

        {/*
          Подложка только на телефоне: там низ кадра занимает светлое
          платье, и золото с кремовым на нём пропадают. На широких экранах
          вордмарк лежит на тёмных портьерах и затемнения не требует.
        */}
        <div className="absolute inset-0 bg-gradient-to-t from-wine-veil via-wine-veil/40 to-transparent lg:hidden" />
      </div>

      <Container className="relative pb-14 lg:h-full lg:pb-0">
        <p className="font-display text-[19vw] leading-[0.78] text-gold lg:absolute lg:top-[34.1%] lg:left-(--gutter) lg:text-[min(16.36vw,14.57rem)]">
          {site.wordmark.first}
        </p>

        <p className="font-display text-[19vw] leading-[0.78] text-cream lg:absolute lg:top-[62%] lg:left-[20%] lg:text-[min(16.36vw,14.57rem)]">
          {site.wordmark.second}
        </p>

        <div className="mt-9 lg:absolute lg:top-[69%] lg:left-(--gutter) lg:mt-0">
          <span aria-hidden className="hairline w-14" />
          <p className="mt-4 max-w-[19ch] text-sm leading-relaxed text-gold-soft">
            <Typo>{site.tagline}</Typo>
          </p>
        </div>
      </Container>
    </section>
  );
}

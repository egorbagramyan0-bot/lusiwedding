import { Container } from "@/components/ui/Container";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { media } from "@/content/media";
import { processSteps } from "@/content/site";
import { Typo } from "@/components/ui/Typo";

/**
 * Четыре шага работы.
 *
 * Слева кадр в золотой рамке со смещением — рамка отрисована отдельным
 * элементом позади фотографии, поэтому выглядывает слева и сверху.
 */
export function Process() {
  return (
    <section id="process" className="bg-wine py-(--section-y)">
      <Container>
        <h2 className="sr-only">Как мы работаем</h2>

        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:items-center lg:gap-20">
          <Reveal>
            <div
              data-settle
              className="relative mx-auto w-[72%] max-w-[19rem] sm:w-[52%] lg:mx-0 lg:w-full lg:max-w-none"
            >
              <span
                aria-hidden
                className="absolute -top-4 -left-5 h-full w-full border border-gold/45"
              />
              <MediaFrame
                slot={media.processPortrait}
                sizes="(max-width: 1024px) 60vw, 26vw"
                mono
                className="relative"
              />
            </div>
          </Reveal>

          {/*
            На телефоне шаги идут в один столбец, а номер уходит влево от
            текста: в двух узких колонках строка получалась в двадцать
            символов и текст читался рвано.
          */}
          <ol className="grid gap-y-10 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-12">
            {processSteps.map((step, index) => (
              <li key={step.number}>
                <Reveal delay={index * 90} className="flex gap-5 sm:block">
                  <div className="w-14 shrink-0 sm:w-auto">
                    {/* цифра выходит из-под своей нижней кромки — обрезку
                        держит обёртка */}
                    <span aria-hidden className="block overflow-clip">
                      <span
                        data-rise
                        data-rise-delay={index * 90 + 100}
                        className="block font-heading text-[clamp(3rem,6vw,5.5rem)] leading-none font-extralight text-gold"
                      >
                        {step.number}
                      </span>
                    </span>

                    <span
                      aria-hidden
                      data-rule
                      data-rule-delay={index * 90 + 350}
                      className="hairline mt-4 w-10 sm:mt-6 sm:w-14"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-caption text-gold-soft uppercase sm:mt-6">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-cream/50 sm:text-sm">
                      <Typo>{step.text}</Typo>
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

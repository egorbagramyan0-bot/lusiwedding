import { Container } from "@/components/ui/Container";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { media } from "@/content/media";
import { statement } from "@/content/site";
import { Typo } from "@/components/ui/Typo";

/**
 * Заявление агентства на винном фоне.
 *
 * Стол вырезан и лежит на прозрачном фоне, поэтому растворять его
 * градиентом не нужно — он просто стоит на винной плоскости и уходит
 * за правый край секции.
 *
 * На телефоне он тоже стоит, а не висит: кадр вынесен из контейнера
 * на всю ширину окна, а нижнее поле секции убрано, чтобы скатерть
 * доходила до её границы. Внутри контейнера стол оказывался в рамке
 * из боковых полей и отступа снизу и выглядел криво обрезанным.
 */
export function Statement() {
  return (
    <section id="about" className="relative overflow-hidden bg-wine">
      {/* стол поднимается из-под нижней кромки секции и встаёт на неё */}
      <div
        data-reveal
        data-reveal-delay={150}
        className="absolute -right-[5%] bottom-0 hidden h-[92%] w-[58%] lg:block"
      >
        <MediaFrame slot={media.statement} fill sizes="58vw" />
      </div>

      <Container className="relative pt-(--section-y) lg:py-(--section-y)">
        <div className="lg:max-w-[46%]">
          <h2
            data-split
            className="font-heading text-[clamp(2.45rem,8.5vw,4.25rem)] leading-[1.12] text-cream"
          >
            {statement.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <span
            aria-hidden
            data-rule
            data-rule-delay={350}
            className="hairline mt-10 w-20"
          />

          <p
            data-reveal
            data-reveal-delay={250}
            className="mt-8 max-w-[42ch] text-lead text-cream/60"
          >
            <Typo>{statement.body}</Typo>
          </p>
        </div>
      </Container>

      <Reveal className="mt-12 lg:hidden" delay={120}>
        <MediaFrame slot={media.statement} sizes="100vw" />
      </Reveal>
    </section>
  );
}

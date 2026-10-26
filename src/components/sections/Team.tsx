import { Container } from "@/components/ui/Container";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { team, teamLead, teamNote, teamTitle } from "@/content/team";

/**
 * Команда проекта.
 *
 * Продолжение блока «Процесс»: там четыре шага, здесь — кто их ведёт.
 * Поэтому фон тот же винный, а секции разделены волосяной линией,
 * а не сменой цвета.
 *
 * От макета отличается подачей портретов: вместо рамок с уголками —
 * просто кадр, подпись под ним и воздух между колонками, как в
 * остальных сетках сайта.
 */
export function Team() {
  return (
    <section
      id="team"
      className="border-t border-gold/15 bg-wine py-(--section-y)"
    >
      <Container>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
          <h2
            data-split
            className="max-w-[16ch] font-heading text-[clamp(2.2rem,4.4vw,3.5rem)] leading-[1.1] text-cream"
          >
            {teamTitle}
          </h2>
          <p
            data-reveal
            data-reveal-delay={200}
            className="max-w-[42ch] text-sm leading-relaxed text-cream/55"
          >
            {teamLead}
          </p>
        </div>

        {/*
          На телефоне — одна лента, которая листается пальцем: пятеро
          в сетке из двух колонок занимали три экрана. Лента выходит за
          контейнер на ширину поля, чтобы карточки уезжали под край, а
          первая всё равно вставала по общей линии.
          С 640px это снова обычная сетка.
        */}
        <ul className="rail mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto -mx-(--gutter) px-(--gutter) scroll-pl-(--gutter) sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:mt-20 lg:grid-cols-5 lg:gap-x-8">
          {team.map((member, index) => (
            <li
              key={member.id}
              // карточки входят по очереди, слева направо
              data-reveal
              data-reveal-delay={index * 90}
              className="w-[62vw] shrink-0 snap-start sm:w-auto"
            >
              <MediaFrame
                slot={member.photo}
                sizes="(max-width: 640px) 62vw, (max-width: 1024px) 33vw, 20vw"
              />

              <h3 className="mt-5 font-heading text-[1.3rem] leading-snug text-cream">
                {member.role}
              </h3>

              <p className="mt-2 text-[0.8125rem] leading-relaxed text-cream/50">
                {member.description}
              </p>
            </li>
          ))}
        </ul>

        <Reveal delay={200}>
          <p className="mt-14 max-w-[52ch] border-t border-gold/20 pt-8 text-sm leading-relaxed text-cream/60 lg:mt-20">
            {teamNote}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

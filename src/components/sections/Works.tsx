import { WorksGallery } from "@/components/portfolio/WorksGallery";
import { works, worksTitle } from "@/content/works";

/**
 * Портфолио.
 *
 * Единственная секция, которая выходит за общий контейнер: четыре
 * свадьбы в один ряд внутри 1240px превращались в мелкие превью.
 * Заголовок выровнен по тому же полю, что и карточки, — иначе левые
 * края расходятся и это читается как ошибка вёрстки.
 */
export function Works() {
  return (
    <section id="works" className="bg-ivory py-(--section-y) text-wine-ink">
      <div className="w-full px-(--gutter)">
        <div className="flex items-center gap-8">
          <h2
            data-split
            className="font-heading text-[clamp(1.95rem,4.15vw,3.05rem)] leading-tight"
          >
            {worksTitle}
          </h2>
          <span
            aria-hidden
            data-rule
            data-rule-delay={300}
            className="hairline ml-auto hidden w-16 bg-gold-dim sm:block"
          />
        </div>

        <WorksGallery works={works} />
      </div>
    </section>
  );
}

import { MediaFrame } from "@/components/ui/MediaFrame";
import type { Work } from "@/content/works";
import { cn } from "@/lib/cn";

/**
 * Содержимое развёрнутой карточки свадьбы.
 *
 * Вынесено из модального окна отдельно: разметка не знает ни про
 * <dialog>, ни про состояние — её можно будет без правок положить на
 * отдельную страницу, если раздел когда-нибудь вырастет.
 */
export function WorkDetails({ work }: { work: Work }) {
  return (
    <article>
      {/*
        Обложка ограничена по высоте: кадр 16:9 во всю ширину занял бы
        целый экран, и заголовок оказался бы ниже сгиба.
      */}
      <div className="relative h-[min(56svh,600px)] w-full">
        <MediaFrame
          slot={work.hero}
          fill
          // в высокой рамке object-cover тянет кадр по высоте,
          // поэтому на узких экранах ему нужно больше 100vw
          sizes="(max-width: 1024px) 300vw, 100vw"
        />
      </div>

      <div className="mx-auto w-full max-w-[calc(var(--container-site)+var(--gutter)*2)] px-(--gutter)">
        <header className="mt-12 lg:mt-16">
          <p className="text-caption text-gold uppercase">
            {work.date}
          </p>

          <h2 className="mt-5 font-heading text-[clamp(2.45rem,6.1vw,4.6rem)] leading-[1.05] text-cream">
            {work.title}
          </h2>

          <span aria-hidden className="hairline mt-8 w-20" />

          <p className="mt-8 max-w-[34ch] font-light text-[clamp(1.0625rem,1.8vw,1.25rem)] leading-[1.65] text-cream/85">
            {work.lead}
          </p>
        </header>

        <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-gold/20 pt-10 sm:grid-cols-4">
          {work.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-caption text-gold uppercase">{fact.label}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-cream/75">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        {/*
          Рассказ идёт в две колонки: одна на всю ширину карточки была бы
          слишком длинной строкой, а узкая оставляла бы полполосы пустой.
          Отступ снизу, а не сверху, — иначе абзац в начале второй колонки
          получал бы лишний зазор.
        */}
        <div className="mt-16 lg:columns-2 lg:gap-16">
          {work.story.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="mb-6 break-inside-avoid text-lead text-cream/65 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 w-full max-w-[calc(var(--container-site)+var(--gutter)*2)] px-(--gutter) lg:mt-20">
        <h3 className="sr-only">Кадры со свадьбы</h3>
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {work.gallery.map((item) => (
            <li
              key={item.file}
              className={cn(item.span === 2 && "sm:col-span-2")}
            >
              <MediaFrame
                slot={item}
                // Квадратные ячейки заняты горизонтальными снимками:
                // object-cover тянет их по высоте, и ширины рамки мало —
                // отсюда полуторный запас.
                sizes={
                  item.span === 2
                    ? "(max-width: 1024px) 100vw, 1240px"
                    : "(max-width: 640px) 150vw, 930px"
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

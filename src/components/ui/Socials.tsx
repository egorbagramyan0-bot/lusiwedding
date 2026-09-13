import { socials, socialsNote } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Мессенджеры и соцсети одной строкой плюс сноска про Meta.
 *
 * Кнопки текстовые, без фирменных значков: на сайте нет ни одной иконки,
 * кроме стрелки и плюса, и три чужих логотипа выбивались бы из набора.
 *
 * Пока у сервиса нет адреса, кнопка рисуется неактивной — ссылка в
 * никуда хуже честной заглушки.
 */
/*
  Кегль, трекинг и поля мельче, чем у капса на остальном сайте: три
  кнопки должны вставать в одну строку даже на экране 360px. Высота
  при этом остаётся 44px — под палец.
*/
const chip =
  "flex min-h-11 items-center whitespace-nowrap border border-gold/25 px-2.5 text-[0.6875rem] tracking-[0.08em] uppercase transition-colors";

export function Socials({
  place,
  className,
}: {
  /** Блок выводится дважды — в меню и в подвале. Нужен, чтобы
   *  идентификатор сноски был уникальным: на два одинаковых id
   *  скринридер связь со сноской не построит. */
  place: string;
  className?: string;
}) {
  const noteId = `socials-meta-note-${place}`;

  return (
    <div className={className}>
      <ul className="flex flex-nowrap items-center gap-1.5">
        {socials.map((item) => {
          const label = (
            <>
              {item.label}
              {item.meta ? (
                <span aria-hidden className="ml-0.5 text-gold">
                  *
                </span>
              ) : null}
            </>
          );

          return (
            <li key={item.id}>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-describedby={item.meta ? noteId : undefined}
                  className={cn(chip, "text-cream/80 hover:border-gold hover:text-gold")}
                >
                  {label}
                </a>
              ) : (
                <span
                  aria-describedby={item.meta ? noteId : undefined}
                  className={cn(chip, "text-cream/55")}
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <p
        id={noteId}
        className="mt-4 max-w-[44ch] text-[0.6875rem] leading-relaxed text-cream/55"
      >
        {socialsNote}
      </p>
    </div>
  );
}

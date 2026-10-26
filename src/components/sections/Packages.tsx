import { Container } from "@/components/ui/Container";
import { PackagesList } from "@/components/sections/PackagesList";
import { packages, packagesLead, packagesTitle } from "@/content/packages";
import { cn } from "@/lib/cn";

/**
 * Форматы работы.
 *
 * Никаких карточек с рамками и заливками: три колонки разделены
 * волосяными линиями, как сетки в остальных секциях. Популярный формат
 * выделен только золотом — надписью и залитой кнопкой.
 *
 * Колонки выровнены построчно через subgrid: описания разной длины
 * иначе разъезжали бы, и цена с кнопками стояли бы на разной высоте.
 */
const column =
  "border-t border-wine-ink/15 pt-10 " +
  "lg:border-t-0 lg:px-10 lg:pt-0 " +
  "lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-wine-ink/15";

export function Packages() {
  return (
    <section id="packages" className="bg-ivory py-(--section-y) text-wine-ink">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
          <h2
            data-split
            className="max-w-[24ch] font-heading text-[clamp(2.2rem,4.4vw,3.5rem)] leading-[1.1]"
          >
            {packagesTitle}
          </h2>
          <p
            data-reveal
            data-reveal-delay={200}
            className="max-w-[46ch] text-sm leading-relaxed text-wine-ink/70"
          >
            {packagesLead}
          </p>
        </div>

        {/* На телефоне тарифы идут раскрывающимся списком. */}
        <PackagesList />

        {/*
          От 1024px — три колонки рядом, чтобы форматы сравнивались
          взглядом. Колонки входят по очереди, слева направо.
        */}
        <ul
          className={cn(
            "mt-14 hidden gap-y-12 lg:mt-20 lg:-mx-10 lg:grid lg:grid-cols-3 lg:gap-y-0",
            // семь строк: надпись, название, аудитория, описание,
            // цена, раскрывающиеся списки и кнопка
            "lg:grid-rows-[auto_auto_auto_auto_auto_1fr_auto]",
          )}
        >
          {packages.map((item, index) => (
            <li
              key={item.id}
              data-reveal
              data-reveal-delay={index * 120}
              className={cn(
                "flex flex-col lg:row-span-7 lg:grid lg:grid-rows-subgrid",
                column,
              )}
            >
              <span
                className={cn(
                  "text-caption uppercase",
                  item.featured ? "text-gold-dim" : "text-wine-ink/65",
                )}
              >
                {item.eyebrow}
              </span>

              <h3 className="mt-4 font-heading text-[clamp(1.85rem,2.95vw,2.45rem)] leading-none">
                {item.name}
              </h3>

              <span className="mt-4 text-caption text-wine-ink/65 uppercase">
                {item.audience}
              </span>

              <p className="mt-6 text-[0.9375rem] leading-relaxed text-wine-ink/70 sm:text-sm">
                {item.description}
              </p>

              <div className="mt-8">
                <span className="block text-caption text-wine-ink/65 uppercase">
                  {item.priceLabel}
                </span>
                <span className="mt-2 block text-[clamp(1.25rem,1.7vw,1.5rem)] leading-none font-medium tracking-[0.01em] tabular-nums">
                  {item.price}
                </span>
              </div>

              <div className="mt-10">
                {item.blocks.map((block) => (
                  <details
                    key={block.title}
                    className="disclosure group border-t border-wine-ink/15 last:border-b"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-caption text-wine-ink/70 uppercase transition-colors hover:text-wine-ink [&::-webkit-details-marker]:hidden">
                      {block.title}
                      <span
                        aria-hidden
                        className="text-lg leading-none text-gold-dim transition-transform duration-300 group-open:rotate-45 motion-reduce:transform-none"
                      >
                        +
                      </span>
                    </summary>

                    <ul className="pb-5">
                      {block.items.map((line) => (
                        <li
                          key={line}
                          className="flex gap-3 py-1.5 text-[0.8125rem] leading-relaxed text-wine-ink/70"
                        >
                          <span aria-hidden className="text-gold-dim">
                            &mdash;
                          </span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>

              <div className="mt-10">
                <a
                  href="#lead"
                  className={cn(
                    "block border px-5 py-4 text-center text-caption uppercase transition-colors",
                    item.featured
                      ? "border-gold-dim bg-gold-dim text-ivory hover:bg-transparent hover:text-gold-dim"
                      : "border-wine-ink/25 text-wine-ink hover:border-gold-dim hover:text-gold-dim",
                  )}
                >
                  {item.action}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

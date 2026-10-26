import { packages } from "@/content/packages";

/**
 * Тарифы на телефоне — три раскрывающиеся строки друг под другом.
 *
 * В свёрнутом виде видно главное: название, на сколько человек формат и
 * сколько стоит. Подробности открываются по нажатию. Три полные колонки,
 * которые на широком экране стоят рядом, на телефоне вытягивались в одно
 * длинное полотно текста, и сравнить форматы было невозможно.
 *
 * Раскрытие нативное, на <details>. Атрибут name делает список
 * взаимоисключающим: открывается один тариф, остальные закрываются, —
 * ради этого всё и затевалось. Браузеры без поддержки name просто дадут
 * открыть несколько, ничего не сломав.
 *
 * Вложенных списков внутри раскрытия нет: гармошка в гармошке — лишний
 * слой, здесь разделы просто идут подряд с золотыми подзаголовками.
 */
export function PackagesList() {
  return (
    <div className="mt-12 lg:hidden">
      {packages.map((item) => (
        <details
          key={item.id}
          name="package"
          className="disclosure group border-t border-wine-ink/15 last:border-b"
        >
          {/*
            Название тарифа — h3: под ним идут h4 «Что входит» и другие,
            и без него уровень заголовков перескакивал с h2 сразу на h4.

            Сетка задана самому summary, без обёртки: внутри summary
            допустимы только строчные элементы и один заголовок, div
            туда класть нельзя. Плюс стоит во второй колонке на все
            три строки.
          */}
          <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 py-7 [&::-webkit-details-marker]:hidden">
            {/* Надписи «Чаще всего выбирают» здесь нет: в компактном
                списке популярный формат помечает только золотая кнопка. */}
            <h3 className="font-serif text-[1.6rem] leading-none text-wine-ink">
              {item.name}
            </h3>

            <span
              aria-hidden
              className="row-span-3 mt-1 text-xl leading-none text-gold-dim transition-transform duration-300 group-open:rotate-45 motion-reduce:transform-none"
            >
              +
            </span>

            <span className="mt-2.5 block text-caption text-wine-ink/65 uppercase">
              {item.audience}
            </span>

            <span className="mt-4 block text-[1.25rem] leading-none tracking-[0.01em] text-wine-ink tabular-nums">
              {item.price}
            </span>
          </summary>

          <div className="pb-8">
            <p className="text-[0.9375rem] leading-relaxed text-wine-ink/70">
              {item.description}
            </p>

            {item.blocks.map((block) => (
              <div key={block.title} className="mt-7">
                <h4 className="text-caption text-gold-dim uppercase">
                  {block.title}
                </h4>
                <ul className="mt-3">
                  {block.items.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 py-1 text-[0.8125rem] leading-relaxed text-wine-ink/70"
                    >
                      <span aria-hidden className="text-gold-dim">
                        &mdash;
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Кнопка у всех трёх одинаковая: в компактном списке
                выделять популярный формат заливкой нечем — надпись
                «Чаще всего выбирают» отсюда убрана. */}
            <a
              href="#lead"
              className="mt-8 block border border-wine-ink/25 px-5 py-4 text-center text-caption text-wine-ink uppercase transition-colors"
            >
              {item.action}
            </a>
          </div>
        </details>
      ))}
    </div>
  );
}

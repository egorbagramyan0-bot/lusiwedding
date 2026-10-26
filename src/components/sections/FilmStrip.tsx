import { MediaFrame } from "@/components/ui/MediaFrame";
import { filmFrames } from "@/content/media";

/**
 * Полоса негатива под первым экраном.
 *
 * Кадры продублированы: дорожка едет ровно на половину своей ширины и
 * возвращается в исходное положение, поэтому шов не виден. Отступ между
 * кадрами задан полем самой ячейки, а не gap — иначе половина ширины
 * перестала бы совпадать с целым числом кадров.
 */
const CELL = "mr-[6px] w-[164px] shrink-0 sm:w-[200px] lg:w-[247px]";

export function FilmStrip() {
  const strip = [...filmFrames, ...filmFrames];
  const cells = [...strip, ...strip];

  return (
    <div
      role="group"
      className="film-strip relative overflow-hidden bg-noir py-3"
      aria-label="Кадры со свадеб"
    >
      <div className="film-track flex w-max">
        {cells.map((frame, index) => {
          // нумерация кадров идёт подряд, как на настоящей плёнке
          const number = 41 + index;
          // Кадры повторены четыре раза ради бесшовной петли. Скринридеру
          // достаточно первого набора: иначе каждый кадр зачитывался бы
          // четырежды подряд.
          const copy = index >= filmFrames.length;

          return (
            <div
              key={`${frame.file}-${index}`}
              className={CELL}
              aria-hidden={copy || undefined}
            >
              <div className="flex items-baseline justify-between px-1 text-[10px] tracking-[0.2em] text-gold/70">
                <span aria-hidden>400TX</span>
                <span aria-hidden>{number}</span>
              </div>

              <MediaFrame
                slot={frame}
                sizes="(max-width: 640px) 164px, (max-width: 1024px) 200px, 247px"
                mono
                className="mt-1"
              />

              <div className="mt-1 px-1">
                <span
                  aria-hidden
                  className="block size-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-gold/70"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

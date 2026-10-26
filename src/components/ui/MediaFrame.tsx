import Image from "next/image";
import type { MediaSlot } from "@/content/media";
import { cn } from "@/lib/cn";

type Props = {
  slot: MediaSlot;
  /** На каком фоне стоит кадр — от этого зависит вид заглушки. */
  tone?: "dark" | "light";
  /** Растянуть на весь родитель вместо собственной пропорции. */
  fill?: boolean;
  /**
   * Обесцветить кадр. Фильтр вешается на саму фотографию, а не на рамку:
   * иначе он гасит и заглушку, и она перестаёт отличаться от фона.
   */
  mono?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Место под фотографию.
 *
 * Пока src === null, рисуется заглушка. В разработке на ней имя
 * ожидаемого файла и пропорция — видно, какой кадр нужен; в собранном
 * сайте — только знак агентства. Как только путь появится,
 * на этом же месте окажется next/image без правок в разметке.
 */
export function MediaFrame({
  slot,
  tone = "dark",
  fill = false,
  mono = false,
  className,
  sizes = "100vw",
  priority = false,
}: Props) {
  const filled = Boolean(slot.src);
  const cutout = filled && slot.cutout === true;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill && "h-full w-full",
        !filled && (tone === "dark" ? "bg-wine-lift" : "bg-ivory-deep"),
        // обводка только у кадра с собственными границами: на весь экран
        // она превратилась бы в рамку вокруг всей секции
        !filled &&
          !fill &&
          (tone === "dark"
            ? "ring-1 ring-gold/20 ring-inset"
            : "ring-1 ring-wine-ink/10 ring-inset"),
        className,
      )}
      style={fill ? undefined : { aspectRatio: slot.ratio }}
    >
      {filled ? (
        <Image
          src={slot.src as string}
          alt={slot.label}
          fill
          sizes={sizes}
          quality={90}
          priority={priority}
          className={cn(
            cutout ? "object-contain" : "object-cover",
            mono && "grayscale",
          )}
          style={{ objectPosition: slot.position ?? "50% 50%" }}
        />
      ) : (
        <Placeholder slot={slot} tone={tone} fill={fill} />
      )}
    </div>
  );
}

/**
 * Спокойная заглушка: подпись кадра и имя файла, который его заменит.
 * В режиме fill она уходит в угол, чтобы не спорить с текстом поверх кадра.
 */
function Placeholder({
  slot,
  tone,
  fill,
}: {
  slot: MediaSlot;
  tone: "dark" | "light";
  fill: boolean;
}) {
  /*
    Подпись с именем файла — подсказка для того, кто готовит съёмку,
    а не для посетителя. В собранном сайте вместо неё стоит знак
    агентства: пустой слот выглядит задуманной паузой, а не забытой
    служебной надписью «images/team/01-manager.jpg».
  */
  if (process.env.NODE_ENV === "production") {
    return (
      <div aria-hidden className="absolute inset-0 grid place-items-center">
        <span
          className={cn(
            "logo-mask block w-[38%] max-w-28",
            tone === "dark" ? "text-gold/25" : "text-gold-dim/25",
          )}
        />
      </div>
    );
  }

  const muted = tone === "dark" ? "text-cream/40" : "text-wine-ink/45";
  const accent = tone === "dark" ? "text-gold/60" : "text-gold-dim/80";

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col gap-1.5 p-5",
        fill
          ? "items-start justify-end"
          : "items-center justify-center text-center",
      )}
    >
      <span className={cn("text-caption uppercase", accent)}>
        {slot.ratio.replace(" / ", ":")}
      </span>
      <span
        className={cn(
          "max-w-[24ch] font-sans text-[0.6875rem] leading-relaxed break-all",
          muted,
        )}
      >
        {slot.file}
      </span>
    </div>
  );
}

import type { ReactNode } from "react";

/**
 * Блок, который проявляется при прокрутке: поднимается и набирает
 * непрозрачность. Сама анимация — в components/motion/Motion.tsx
 * (anime.js), здесь только разметка-метка.
 *
 * Задержка передаётся атрибутом, а не через style, и это важно. Блок
 * стоит в том числе внутри формы заявки, а она перерисовывается на
 * каждом нажатии клавиши. Будь у обёртки проп style, React при
 * перерисовке выставлял бы его заново и стирал инлайн-стили, которыми
 * anime.js держит конечное состояние, — блок снова пропадал бы.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Задержка в миллисекундах — для каскада внутри одной секции. */
  delay?: number;
}) {
  return (
    <div
      data-reveal
      data-reveal-delay={delay || undefined}
      className={className}
    >
      {children}
    </div>
  );
}

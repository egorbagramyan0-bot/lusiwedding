/**
 * Блокировка прокрутки под модальным окном.
 *
 * Просто выключить прокрутку недостаточно: вместе с ней может пропасть
 * полоса прокрутки, страница станет шире и прыгнет вбок — вместе с
 * липкой шапкой и кнопкой меню. Поэтому ширину полосы возвращаем полем
 * справа.
 *
 * Величину меряем по факту: насколько область документа стала шире
 * после выключения прокрутки. Это надёжнее, чем «ширина окна минус
 * ширина документа» до блокировки: там, где полоса накладная или место
 * под неё зарезервировано, разницы нет, и поле только сдвинуло бы
 * страницу в другую сторону.
 *
 * Шапки это не касается: кнопка меню стоит на месте независимо от
 * блокировки — см. width у .lusi-menu.staggered-menu-wrapper.
 */
export function lockScroll() {
  const before = document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  const gap = document.documentElement.clientWidth - before;

  if (gap > 0) {
    document.body.style.paddingRight = `${gap}px`;
  }
}

export function unlockScroll() {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
}

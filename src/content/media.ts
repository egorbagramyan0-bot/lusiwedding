/**
 * Реестр фотослотов сайта.
 *
 * Все слоты заполнены настоящими кадрами. Если у слота src === null, на
 * его месте рисуется заглушка с именем ожидаемого файла — так удобно
 * готовить новый блок до съёмки: положить файл в public/images/ по
 * указанному пути и заменить null на строку, вёрстку трогать не нужно.
 *
 * ratio — пропорция, снятая с макета. Кадрируйте под неё, иначе object-cover
 * срежет края.
 */
export type MediaSlot = {
  /** Путь в public/. null — слот ещё не заполнен. */
  src: string | null;
  /** Имя файла, которое ожидается в public/images/. */
  file: string;
  /** Осмысленный alt: описывает кадр, а не называет его «фото». */
  label: string;
  /** Пропорция кадра, как в CSS aspect-ratio. */
  ratio: string;
  /** object-position, если центр кадра смещён. */
  position?: string;
  /**
   * Объект вырезан и лежит на прозрачном фоне. Такому кадру не нужны
   * ни подложка, ни обводка, и вписывать его надо целиком (contain),
   * иначе object-cover срежет предмету края.
   */
  cutout?: boolean;
};

export const media = {
  /**
   * Первый экран. Кадров два: горизонтальный для широких экранов и
   * вертикальный для телефона — один и тот же снимок, но кадрированный
   * под пропорцию окна. Подставляет их <picture> в Hero.tsx, потому что
   * next/image не умеет менять сам файл по медиазапросу.
   */
  hero: {
    src: "/images/hero-couple.jpg",
    file: "images/hero-couple.jpg",
    label:
      "Жених и невеста стоят лбом ко лбу на фоне тёмных портьер, тёплый приглушённый свет",
    ratio: "16 / 9",
  },
  heroMobile: {
    src: "/images/hero-couple-mobile.jpg",
    file: "images/hero-couple-mobile.jpg",
    label:
      "Жених и невеста стоят лбом ко лбу на фоне тёмных портьер, тёплый приглушённый свет",
    ratio: "941 / 1672",
  },
  statement: {
    src: "/images/statement-table.webp",
    file: "images/statement-table.webp",
    label:
      "Круглый стол под льняной скатертью: бокал шампанского, белые орхидеи и тёмные ягоды",
    ratio: "4 / 3",
    // стол прижат к правому нижнему углу и уходит за край секции
    position: "right bottom",
    cutout: true,
  },
  processPortrait: {
    src: "/images/process-veil.jpg",
    file: "images/process-veil.jpg",
    label:
      "Невеста держит фату поднятой на вытянутых руках, чёрно-белый портрет",
    ratio: "15 / 16",
    // кадр 2:3 обрезается по высоте — держим лицо и фату
    position: "50% 25%",
  },
} satisfies Record<string, MediaSlot>;

/**
 * Кадры для ленты киноплёнки. Пропорция 9:8 почти квадратная, поэтому у
 * вертикальных снимков смещён центр кадрирования — иначе срезает главное.
 */
export const filmFrames: MediaSlot[] = [
  {
    src: "/images/film/01-show.jpg",
    file: "images/film/01-show.jpg",
    label: "Шоу-программа в зале с красной подсветкой",
    ratio: "9 / 8",
  },
  {
    src: "/images/film/02-hall.jpg",
    file: "images/film/02-hall.jpg",
    label: "Тёмный зал перед выходом гостей",
    ratio: "9 / 8",
    position: "50% 45%",
  },
  {
    src: "/images/film/03-guests.jpg",
    file: "images/film/03-guests.jpg",
    label: "Гости со светящимися шарами на танцполе",
    ratio: "9 / 8",
  },
  {
    src: "/images/film/04-blue-hall.jpg",
    file: "images/film/04-blue-hall.jpg",
    label: "Накрытые столы в зале с синей подсветкой",
    ratio: "9 / 8",
  },
  {
    src: "/images/film/05-chairs.jpg",
    file: "images/film/05-chairs.jpg",
    label: "Прозрачные стулья и серебряная бахрома в зале",
    ratio: "9 / 8",
    position: "50% 40%",
  },
  {
    src: "/images/film/06-candles.jpg",
    file: "images/film/06-candles.jpg",
    label: "Пара среди свечей в вечернем зале",
    ratio: "9 / 8",
    position: "50% 35%",
  },
];

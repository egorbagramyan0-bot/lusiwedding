import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cormorant, Tenor_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Motion } from "@/components/motion/Motion";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

/**
 * Bodoni Moda — цифры 01–04 в разделе «Подход» и нумерация пунктов меню.
 * Вордмарк первого экрана им больше не набирается — там знак заказчика.
 *
 * Кириллицы в шрифте нет (доступны только latin, latin-ext, math и
 * symbols), поэтому русский текст им набирать нельзя — для заголовков
 * рядом работает Cormorant. Ось opsz выкручена в 96 прямо в вёрстке:
 * на крупном кегле дидона рисует более тонкие волосяные линии.
 */
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

/** Cormorant — русские заголовки. Тот же высокий контраст, что у Bodoni. */
const cormorant = Cormorant({
  subsets: ["latin", "cyrillic"],
  // 300 не нужен: тонкое начертание нигде не используется, а грузилось бы
  weight: "400",
  variable: "--font-cormorant",
  display: "swap",
});

/** Tenor Sans — меню, подписи и основной текст. Только начертание 400. */
const tenor = Tenor_Sans({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-tenor",
  display: "swap",
});

/*
  Картинки превью (opengraph-image.jpg, twitter-image.jpg) и иконка для
  домашнего экрана (apple-icon.png) лежат рядом в app/ — Next подставляет
  их теги сам. Полные адреса для них собираются из metadataBase.
*/
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: site.title,
    description: site.description,
    url: "/",
    siteName: site.name,
    locale: "ru_RU",
    type: "website",
  },
  // крупная карточка: без этого превью сожмётся в квадратик сбоку
  twitter: { card: "summary_large_image" },
};

/** Цвет строки браузера на телефоне — в тон шапке. */
export const viewport: Viewport = {
  themeColor: "#521220",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${bodoni.variable} ${cormorant.variable} ${tenor.variable}`}>
      <head>
        {/*
          Без JS анимации не запустятся, а начальные состояния из
          globals.css спрятали бы блоки навсегда. Список атрибутов —
          тот же, что в блоке начальных состояний.
        */}
        <noscript>
          <style>{`[data-reveal],[data-rule],[data-rise],[data-split],[data-hero-photo],[data-wordmark],[data-hero-rule],[data-hero-fade]{opacity:1 !important;transform:none !important;visibility:visible !important;clip-path:none !important;animation:none !important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-wine-veil focus:px-4 focus:py-2 focus:text-cream"
        >
          Перейти к содержанию
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        {/* после всей разметки: анимации ищут уже отрисованные элементы */}
        <Motion />
      </body>
    </html>
  );
}

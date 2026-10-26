import type { Metadata, Viewport } from "next";
import { Alumni_Sans, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Motion } from "@/components/motion/Motion";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

/**
 * Alumni Sans — заголовки, цифры этапов, подписи капсом и пункты меню.
 *
 * Узкий гротеск с ровным штрихом, того же склада, что знак LUSI WEDDING:
 * у округлых букв прямые бока, концы срезаны ровно. Подписи капсом с
 * широкой разрядкой продолжают EVENT DECOR под знаком.
 *
 * Шрифт переменный: нужны 200 (цифры), 300 (заголовки) и 500 (подписи),
 * и все они приходят одним файлом. Кириллица в нём есть, знак ₽ тоже.
 */
const alumni = Alumni_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-alumni",
  display: "swap",
});

/**
 * Manrope — основной текст, цены и поля формы. Тоже переменный.
 *
 * Знак ₽ в нём есть — у прежнего Tenor Sans его не было, и в ценах «₽»
 * подставлялся из запасного шрифта.
 */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
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
    <html lang="ru" className={`${alumni.variable} ${manrope.variable}`}>
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

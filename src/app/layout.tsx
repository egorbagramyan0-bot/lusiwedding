import type { Metadata } from "next";
import { Bodoni_Moda, Cormorant, Tenor_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { site } from "@/content/site";
import "./globals.css";

/**
 * Bodoni Moda — вордмарк «LUSI WEDDING» и цифры 01–04.
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
  weight: ["300", "400"],
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

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${bodoni.variable} ${cormorant.variable} ${tenor.variable}`}>
      <head>
        {/* без JS блоки не должны остаться прозрачными */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <a
          href="#works"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-wine-veil focus:px-4 focus:py-2 focus:text-cream"
        >
          Перейти к содержанию
        </a>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

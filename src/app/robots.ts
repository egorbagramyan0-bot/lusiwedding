import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Статическая выгрузка под Timeweb требует объявить это явно: без
// строки ниже сборка с output: export падает на этом файле.
export const dynamic = "force-static";

/** Сайт открыт для поисковиков целиком; карта сайта — рядом. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}

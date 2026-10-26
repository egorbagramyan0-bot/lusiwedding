import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Статическая выгрузка под Timeweb требует объявить это явно: без
// строки ниже сборка с output: export падает на этом файле.
export const dynamic = "force-static";

/** Страница на сайте одна — карточки свадеб открываются поверх неё. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl.toString(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

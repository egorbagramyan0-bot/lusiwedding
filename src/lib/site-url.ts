/**
 * Адрес сайта — для ссылок, которым нужен полный URL: canonical,
 * картинка превью в соцсетях, robots.txt и sitemap.xml. Мессенджер,
 * который строит превью ссылки, относительный путь не откроет.
 *
 * Откуда берётся, по порядку:
 *
 * 1. NEXT_PUBLIC_SITE_URL — задаётся вручную. Нужна, когда у сайта свой
 *    домен: и на Vercel с подключённым доменом, и для выгрузки на
 *    Timeweb (NEXT_PUBLIC_SITE_URL=https://… npm run build:static).
 * 2. VERCEL_PROJECT_PRODUCTION_URL — Vercel подставляет её при сборке
 *    сам: это рабочий адрес проекта, а не адрес конкретной сборки.
 * 3. Локальный сервер — чтобы сборка не падала без настроек.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3100";
}

export const siteUrl = new URL(resolveSiteUrl());

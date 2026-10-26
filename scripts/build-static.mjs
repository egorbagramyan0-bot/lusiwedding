/**
 * Сборка статической версии сайта в папку out/.
 *
 * Отдельный скрипт, а не переменная прямо в npm-скрипте: синтаксис
 * `VAR=1 команда` не работает в командной строке Windows, а тянуть ради
 * одного флага зависимость вроде cross-env не хочется.
 */
import { spawnSync } from "node:child_process";

/*
  Адрес сайта попадает в canonical, в ссылку на картинку превью и в
  sitemap.xml. На Vercel его подставляет сама платформа, а у выгрузки
  для обычного хостинга взять его неоткуда — без переменной там окажется
  localhost, и ссылка на сайт придёт в мессенджер без картинки.
  Сборку это не ломает, поэтому только предупреждаем.
*/
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "\n⚠  NEXT_PUBLIC_SITE_URL не задан: в canonical, превью для соцсетей и\n" +
      "   sitemap.xml попадёт http://localhost:3100. Для публикации соберите так:\n" +
      "   NEXT_PUBLIC_SITE_URL=https://ваш-домен npm run build:static\n" +
      "   (в PowerShell: $env:NEXT_PUBLIC_SITE_URL=\"https://ваш-домен\"; npm run build:static)\n",
  );
}

const result = spawnSync("next", ["build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, STATIC_EXPORT: "1" },
});

process.exit(result.status ?? 1);

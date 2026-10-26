import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Код из реестра React Bits: держим как есть, чтобы обновлялся командой
    "src/components/reactbits/**",
    // Наследие первой версии и резервная копия её исходников: к сборке
    // отношения не имеют, а их импорты указывают на файлы, которых здесь нет
    "_archive/**",
  ]),
]);

export default eslintConfig;

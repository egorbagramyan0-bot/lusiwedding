import { Logo } from "@/components/layout/Logo";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { navigation } from "@/content/site";

/**
 * Шапка — сплошная винная полоса над кадром, как на макете: она не лежит
 * поверх фотографии, а отделяет её сверху. Прилипает к верху страницы,
 * поэтому меню доступно на всей длине сайта.
 *
 * На телефоне логотип и кнопку рисует SiteMenu (компонент StaggeredMenu),
 * который лежит выше полосы и остаётся на месте, когда панель выезжает.
 * Полоса при этом никуда не девается — она фон под этой шапкой.
 */
export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gold/15 bg-wine-bar">
        <div className="mx-auto flex h-(--header-h) w-full max-w-[calc(var(--container-site)+var(--gutter)*2)] items-center justify-between px-(--gutter)">
          <a href="#top" className="-my-3 hidden items-center py-3 text-gold lg:flex">
            <Logo className="h-7" />
          </a>

          <nav aria-label="Основное меню" className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-caption text-gold-soft uppercase transition-colors hover:text-cream"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <div className="lg:hidden">
        <SiteMenu />
      </div>
    </>
  );
}

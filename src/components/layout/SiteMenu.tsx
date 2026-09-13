"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StaggeredMenu from "@/components/reactbits/StaggeredMenu";
import { Socials } from "@/components/ui/Socials";
import { navigation } from "@/content/site";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

/**
 * Меню на телефоне — компонент StaggeredMenu из React Bits
 * (npx shadcn@latest add @react-bits/StaggeredMenu-JS-CSS).
 *
 * Сам компонент лежит в components/reactbits/ и почти не правится: так
 * его можно обновить из реестра одной командой. Оформление вынесено в
 * переопределения стилей в конце globals.css; из исходника переведены
 * только подписи кнопки — см. README.
 *
 * Три вещи компонент не делает, и они добавлены здесь, снаружи:
 *
 * — не блокирует прокрутку страницы под открытым меню;
 * — не закрывается по Escape;
 * — оставляет ссылки панели в порядке обхода табом, когда меню закрыто,
 *   хотя и помечает панель aria-hidden. Скрытая от скринридера, но
 *   доступная с клавиатуры ссылка — это ловушка, поэтому закрытой
 *   панели проставляется inert.
 *
 * Логотип компонент вставляет тегом <img>, поэтому нашу маску сюда не
 * подать — для него подготовлен золотой файл logo-gold.png.
 *
 * Свой блок со ссылками кладём в panelFooter — этот проп добавлен
 * патчем в исходник; штатный displaySocials не подошёл: он рисует
 * заголовок «Socials» и ждёт готовые адреса, а сноску про Meta
 * вставить в него некуда.
 */
export function SiteMenu() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const panel = () =>
    rootRef.current?.querySelector<HTMLElement>(".staggered-menu-panel");
  const toggle = () =>
    rootRef.current?.querySelector<HTMLButtonElement>(".sm-toggle");

  const handleOpen = useCallback(() => {
    setOpen(true);
    lockScroll();
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    unlockScroll();
  }, []);

  // Закрытой панели — inert: она уезжает за экран, но ссылки в ней
  // остаются кликабельными и ловят фокус при обходе табом.
  useEffect(() => {
    const element = panel();
    if (!element) return;
    if (open) element.removeAttribute("inert");
    else element.setAttribute("inert", "");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // у компонента нет метода закрытия, поэтому нажимаем его же кнопку
      if (event.key === "Escape") toggle()?.click();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Переход по пункту не закрывает меню сам: у ссылок в компоненте нет
  // обработчика. Ловим клик по панели и закрываем той же кнопкой —
  // до того, как браузер отработает переход к якорю.
  useEffect(() => {
    const root = rootRef.current;
    if (!open || !root) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      // логотип ведёт наверх и тоже должен закрывать меню
      if (target?.closest(".sm-panel-item, .sm-logo a")) toggle()?.click();
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [open]);

  useEffect(() => () => unlockScroll(), []);

  const items = navigation.map((item) => ({
    label: item.label,
    ariaLabel: item.label,
    link: item.href,
  }));

  return (
    <div ref={rootRef}>
      <StaggeredMenu
        position="right"
        items={items}
        displaySocials={false}
        displayItemNumbering
        isFixed
        logoUrl="/logo-gold.png"
        logoHref="#top"
        /* золотая и тёмно-винная шторки перед самой панелью */
        colors={["#a8814f", "#521220"]}
        accentColor="#c9a063"
        menuButtonColor="#c9a063"
        openMenuButtonColor="#c9a063"
        changeMenuColorOnOpen={false}
        className="lusi-menu"
        onMenuOpen={handleOpen}
        onMenuClose={handleClose}
        panelFooter={<Socials place="menu" className="mt-14" />}
      />
    </div>
  );
}

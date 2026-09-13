import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { Socials } from "@/components/ui/Socials";
import { contacts, site } from "@/content/site";
import { Typo } from "@/components/ui/Typo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="contacts" className="border-t border-gold/15 bg-wine-bar">
      <Container className="py-14 lg:py-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="text-gold">
            <Logo className="h-5" />
            <p className="mt-5 max-w-[24ch] text-sm text-cream/55">
              <Typo>{site.tagline}</Typo>
            </p>
          </div>

          <div>
            <h2 className="text-caption text-gold uppercase">Контакты</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {contacts.map((item) => (
                <li key={item.label} className="text-sm">
                  <span className="text-cream/55">{item.label}: </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-cream transition-colors hover:text-gold"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-cream/70">{item.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Socials place="footer" className="mt-14 border-t border-gold/15 pt-10" />

        <p className="mt-14 text-caption text-cream/55 uppercase">
          &copy; {year} {site.name}
        </p>
      </Container>
    </footer>
  );
}

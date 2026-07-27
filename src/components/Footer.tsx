import { Link } from "react-router-dom";
import { Instagram, Youtube } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

const socialLinks = [{
  name: "Instagram",
  url: "https://instagram.com/canvaviagem",
  icon: Instagram
}, {
  name: "YouTube",
  url: "https://www.youtube.com/@CanvaViagem",
  icon: Youtube
}];

export const Footer = () => {
  const {
    t
  } = useLanguage();

  const quickLinks = [{
    name: t('header.home'),
    to: "/"
  }, {
    name: t('header.calendar'),
    to: "/calendar"
  }];

  return (
    <footer className="bg-background text-muted-foreground py-8 border-t border-border mt-auto">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col items-center gap-6">
          {/* Brand & Social */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
              <img src={logoImage} alt="Canva Viagem" className="h-6 w-6 rounded-md object-cover grayscale" />
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                Canva Viagem
              </h3>
            </div>

            <div className="flex items-center justify-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-medium hidden sm:inline">{social.name === 'Instagram' ? '@canvaviagem' : social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {quickLinks.map(link => (
              <Link
                key={link.name}
                to={link.to}
                className="text-[11px] uppercase font-bold tracking-widest hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link to="/termos" className="text-[11px] uppercase font-bold tracking-widest hover:text-foreground transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to="/privacidade" className="text-[11px] uppercase font-bold tracking-widest hover:text-foreground transition-colors">
              Privacidade
            </Link>
          </nav>

          {/* Copyright */}
          <div className="flex flex-col items-center gap-1 text-center mt-2">
            <p className="text-[11px] font-medium opacity-60 tracking-wide">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
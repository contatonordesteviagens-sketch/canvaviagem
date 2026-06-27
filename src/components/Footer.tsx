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
    <footer className="bg-black text-zinc-400 py-6 border-t border-zinc-800">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col items-center gap-6">
          {/* Brand & Social */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Canva Viagem" className="h-6 w-6 rounded-md object-cover" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Canva Viagem
              </h3>
            </div>

            <div className="flex flex-col items-center gap-2">
              <a
                href={socialLinks[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">@canvaviagem</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="flex items-center gap-6">
            {quickLinks.map(link => (
              <Link
                key={link.name}
                to={link.to}
                className="text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link to="/termos" className="text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors">
              {t('footer.terms')}
            </Link>
          </nav>

          {/* Copyright */}
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[10px] font-medium opacity-50 tracking-wide">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
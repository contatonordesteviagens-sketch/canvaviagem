import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

// TikTok icon (lucide doesn't have it)
const TikTokIcon = ({
  className
}: {
  className?: string;
}) => <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>;
const socialLinks = [{
  name: "Instagram",
  url: "https://instagram.com/canvaviagem",
  icon: Instagram
}, {
  name: "Facebook",
  url: "https://facebook.com/canvaviagem",
  icon: Facebook
}, {
  name: "TikTok",
  url: "https://tiktok.com/@canvaviagem",
  icon: TikTokIcon
}, {
  name: "YouTube",
  url: "https://youtube.com/@canvaviagem",
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
  return <footer className="mt-16 border-t border-border/50 bg-gradient-to-br from-background to-muted/30">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Brand Column */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Canva Viagem" className="h-10 w-10 rounded-xl shadow-lg object-cover" />
              <h3 className="text-xl font-bold text-foreground">
                Canva Viagem
              </h3>
            </div>
            <p className="text-muted-foreground text-center md:text-left text-sm leading-relaxed max-w-xs">Conteúdo para Agências de Viagens ✈️🌴</p>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Links Rápidos
            </h4>
            <nav className="flex flex-col items-center md:items-start gap-2">
              {quickLinks.map(link => <Link key={link.name} to={link.to} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {link.name}
                </Link>)}
            </nav>
          </div>

          {/* Social Links Column */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Conecte-se
            </h4>
            <div className="flex items-center gap-3">
              {socialLinks.map(social => <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:scale-110 transition-all duration-200" aria-label={social.name}>
                  <social.icon className="h-5 w-5" />
                </a>)}
            </div>
            <p className="text-muted-foreground text-sm">@canvaviagem</p>
          </div>
        </div>
      </div>

      {/* Gradient Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-3 md:py-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            <Link to="/termos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('footer.terms')}
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link to="/privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
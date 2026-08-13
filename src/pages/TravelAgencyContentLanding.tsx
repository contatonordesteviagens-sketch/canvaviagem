import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MessageCircle } from "lucide-react";
import logoImage from "@/assets/logo.png";
import TravelAgencyContentHero from "@/components/travel-agency-content/TravelAgencyContentHero";
import TravelAgencyContentMechanism from "@/components/travel-agency-content/TravelAgencyContentMechanism";
import TravelAgencyContentBenefits from "@/components/travel-agency-content/TravelAgencyContentBenefits";
import TravelAgencyContentConversion from "@/components/travel-agency-content/TravelAgencyContentConversion";
import { trackEvent } from "@/hooks/useAnalyticsEvents";
import { ELITE_OFFER } from "@/lib/eliteOffer";
import type { TravelAgencyBillingCycle } from "@/types/travel-agency-content";

const landingPath = "/carrosseis-para-agencia-de-viagens";
const metaPixelId = "916689227676142";
const supportWhatsAppUrl =
  "https://wa.me/5585998458995?text=Ol%C3%A1%2C%20quero%20entender%20melhor%20os%20modelos%20de%20carross%C3%A9is%20para%20ag%C3%AAncias%20de%20viagens";

const secureCheckoutUrl: Record<TravelAgencyBillingCycle, string> = {
  monthly: ELITE_OFFER.monthlyCheckoutUrl,
  semiannual: ELITE_OFFER.semiannualCheckoutUrl,
  annual: ELITE_OFFER.annualCheckoutUrl,
};

export default function TravelAgencyContentLanding() {
  const [checkoutLoading, setCheckoutLoading] = useState<TravelAgencyBillingCycle | null>(null);
  const pageTrackedRef = useRef(false);

  const recordEvent = useCallback((eventType: string, data: Record<string, unknown> = {}) => {
    void trackEvent(eventType, {
      offer_variant: "travel_content_v1",
      landing_path: landingPath,
      feature: "carousel_export",
      ...data,
    });
  }, []);

  useEffect(() => {
    if (pageTrackedRef.current) return;
    pageTrackedRef.current = true;
    recordEvent("landing_viewed");
  }, [recordEvent]);

  const scrollToPlans = useCallback((source: string) => {
    recordEvent("cta_clicked", { source });
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [recordEvent]);

  const startCheckout = useCallback((cycle: TravelAgencyBillingCycle, value: number) => {
    recordEvent("plan_selected", { billing_cycle: cycle, value });
    recordEvent("checkout_started", { billing_cycle: cycle, value });

    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("trackSingle", metaPixelId, "InitiateCheckout", {
      value,
      currency: "BRL",
      content_name: "Canva Viagem - Conteúdo para Agências",
      content_category: `landing_content_${cycle}`,
    });

    setCheckoutLoading(cycle);
    window.location.assign(secureCheckoutUrl[cycle]);
  }, [recordEvent]);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#08080b] text-[#f5f5f7] selection:bg-[#7c5cff] selection:text-white"
      style={{ fontFamily: "Geist, Outfit, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <Helmet>
        <html lang="pt-BR" />
        <title>Carrosséis para agência de viagens | Canva Viagem</title>
        <meta
          name="description"
          content="Crie artes, carrosséis para Feed e versões para Stories com 10 modelos feitos especialmente para agências de viagens."
        />
        <link rel="canonical" href={`https://canvaviagem.com${landingPath}`} />
        <meta property="og:title" content="Carrosséis de turismo prontos para personalizar | Canva Viagem" />
        <meta
          property="og:description"
          content="10 modelos de carrosséis, artes para Feed e versões para Stories feitos para agências de viagens."
        />
        <meta property="og:url" content={`https://canvaviagem.com${landingPath}`} />
        <meta name="theme-color" content="#08080b" />
      </Helmet>

      <main>
        <TravelAgencyContentHero onScrollToPlans={scrollToPlans} onRecordEvent={recordEvent} />
        <TravelAgencyContentMechanism />
        <TravelAgencyContentBenefits />
        <TravelAgencyContentConversion
          onScrollToPlans={scrollToPlans}
          onRecordEvent={recordEvent}
          checkoutLoading={checkoutLoading}
          onCheckout={startCheckout}
        />
      </main>

      <footer className="border-t border-white/[.08] bg-[#060608] py-16 text-sm text-white/45 sm:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 sm:px-8 md:grid-cols-[1.5fr_.7fr_.8fr]">
          <div className="max-w-md">
            <img src={logoImage} alt="Canva Viagem" className="h-8 w-auto brightness-0 invert" />
            <p className="mt-5 leading-7">Artes, carrosséis e Stories para agências de viagens. Escolha o modelo, personalize, exporte e publique.</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-white/75">Plataforma</p>
            <ul className="mt-5 space-y-3"><li><a href="#como-funciona" className="hover:text-white">Como funciona</a></li><li><a href="#planos" className="hover:text-white">Planos</a></li><li><a href="#faq" className="hover:text-white">FAQ</a></li></ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-white/75">Contato</p>
            <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 hover:text-white" onClick={() => recordEvent("support_clicked", { source: "footer" })}><MessageCircle className="h-4 w-4" /> Falar no WhatsApp</a>
          </div>
        </div>
        <div className="mx-auto mt-14 flex max-w-[1200px] flex-col gap-4 border-t border-white/[.08] px-5 pt-7 text-xs sm:px-8 md:flex-row md:items-center md:justify-between"><p>Canva Viagem · 2026</p><div className="flex gap-6"><a href="/privacidade" className="hover:text-white">Privacidade</a><a href="/termos" className="hover:text-white">Termos e reembolso</a></div></div>
      </footer>
    </div>
  );
}

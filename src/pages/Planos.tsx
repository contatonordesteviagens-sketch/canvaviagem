import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import SeoMetadata from "@/components/SeoMetadata";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserInfoCard } from "@/components/UserInfoCard";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";
import { Loader2, Check, Plane, Settings, RefreshCw, Star, ChevronDown, ChevronUp, CreditCard, Shield, Activity, Sparkles, X, Crown, Zap, Keyboard, Smartphone, MessageCircle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MinimalistHero } from "@/components/ui/minimalist-hero";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Instagram } from "lucide-react";
import garantia7dias from "@/assets/garantia-7-dias.png";
import { createAbacateCheckout } from "@/lib/abacatePay";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ImageTrail } from "@/components/ui/image-trail";
import { CountdownTimer } from "@/components/planos/CountdownTimer";
import { SocialProofToast } from "@/components/planos/SocialProofToast";
import { MobileFloatingCTA } from "@/components/planos/MobileFloatingCTA";
import { ProductDemo } from "@/components/planos/ProductDemo";

const STRIPE = {
  monthly: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  annual: "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09",
  // Elite — Payment Links reais da Stripe
  elite_monthly: "https://buy.stripe.com/fZucN6bma6QEeH96kI8so0c",
  elite_annual: "https://buy.stripe.com/fZu14ogGugreeH9bF28so0d",
};

const ABACATE_PIX_LINKS = {
  monthly: "https://app.abacatepay.com/pay/bill_yUw05raaAtRTPQQafx4peM4s",
  annual: "https://app.abacatepay.com/pay/bill_w2ma2BcnfRfyWmr3Ly3quhB2"
};

// ÔöÇÔöÇÔöÇ Trust logos ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const StripeLogoSVG = () => (
  <svg width="51" height="21" viewBox="0 0 51 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.956 6.888c0-.692.57-1.025 1.52-1.025 1.356 0 3.077.41 4.433 1.14V3.21C17.554 2.61 16.136 2.4 14.476 2.4c-3.64 0-6.063 1.9-6.063 5.054 0 4.936 6.801 4.142 6.801 6.27 0 .82-.712 1.089-1.71 1.089-1.481 0-3.38-.615-4.879-1.44v3.845c1.661.718 3.33 1.024 4.88 1.024 3.713 0 6.265-1.832 6.265-5.017-.013-5.328-6.814-4.38-6.814-6.337zM26.88 0l-3.754.795-.013 12.26c0 2.265 1.7 3.934 3.966 3.934 1.254 0 2.172-.23 2.679-.5v-3.023c-.49.2-2.911.905-2.911-1.36V6.657h2.91V3.375h-2.91L26.88 0zm7.3 4.399l-.243-1.024h-3.458v13.387h3.997V8.14c.943-1.23 2.54-1.006 3.035-.84V3.375c-.508-.192-2.36-.538-3.33 1.024zm4.584-1.024h4.01v13.387h-4.01V3.375zm2.005-4.62C39.412 1.165 38 2.577 38 4.426c0 1.85 1.412 3.261 3.37 3.261 1.957 0 3.37-1.412 3.37-3.261C44.74 2.577 43.327 1.165 41.37 1.165zm7.3 15.59l-4.01-13.38h4.24l2.35 8.822 2.35-8.822H50l-4.02 13.38h-.31z" fill="rgba(255,255,255,0.7)"/>
  </svg>
);

const TRAIL_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&q=80",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&q=80",
];

const PixCheckoutModal = ({ 
  isOpen, 
  onClose, 
  planType,
  onGeneratePix,
  isGenerating
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  planType: 'monthly' | 'annual',
  onGeneratePix: () => Promise<void>,
  isGenerating: boolean
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'pix'>('card');
  const { user } = useAuth();
  
  if (!isOpen) return null;
  
  const total = planType === "annual" ? "R$ 197,00" : "R$ 29,00";
  const pixTotal = planType === "annual" ? "R$ 197,00" : "R$ 27,55";
  const cardInstallments = planType === "annual" ? "ou 12x de R$ 19,70" : null;
  const planName = planType === "annual" ? "Plano Anual Full" : "Plano Mensal Full";

  const handleAction = async () => {
    if (activeTab === 'card') {
      window.open(STRIPE[planType], "_blank");
      onClose();
    } else {
      // Direct redirect as fallback because dynamic generation is failing locally
      window.open(ABACATE_PIX_LINKS[planType], "_blank");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white w-full max-w-lg rounded-t-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-1 px-4 flex justify-between items-center bg-zinc-50 border-b border-zinc-100">
           <div className="flex">
             {['card', 'pix'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={cn(
                   "px-5 py-4 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                   activeTab === tab ? "border-b-2 border-black text-black" : "text-zinc-400"
                 )}
               >
                 {tab === 'card' ? <CreditCard className="w-4 h-4" /> : <Activity className="w-4 h-4 text-[#1DB9A3]" />}
                 {tab === 'card' ? "Cart├úo" : "Pix"}
               </button>
             ))}
           </div>
           <button onClick={onClose} className="p-2 text-zinc-300 hover:text-black">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'pix' && (
            <div className="grid grid-cols-1 gap-2 mb-6">
              {[
                { icon: RefreshCw, title: "Aprova├º├úo imediata", desc: "Processamento instant├óneo via Banco Central." },
                { icon: Shield, title: "Transa├º├úo segura", desc: "Seus dados est├úo 100% protegidos." },
              ].map((b, i) => (
                <div key={i} className="p-3 rounded-xl border border-zinc-100 flex items-center gap-4 bg-zinc-50/50">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <b.icon className="w-4 h-4 text-[#1DB9A3]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-black leading-none mb-1">{b.title}</p>
                    <p className="text-[10px] text-zinc-500 leading-tight">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="text-center p-5 rounded-2xl bg-zinc-50 border border-zinc-100 relative">
               {activeTab === 'pix' && (
                 <div className="absolute top-2 right-2 bg-[#1DB9A3]/10 text-[#1DB9A3] text-[9px] font-black px-2 py-1 rounded-full">
                   5% OFF
                 </div>
               )}
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{planName}</p>
               <p className="text-3xl font-black text-black tracking-tighter">
                 {activeTab === 'pix' ? pixTotal : total}
               </p>
               {activeTab === 'card' && cardInstallments && (
                 <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">{cardInstallments}</p>
               )}
            </div>

            <button 
              onClick={handleAction}
              disabled={isGenerating}
              className={cn(
                "w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg flex items-center justify-center gap-3",
                activeTab === 'pix' ? "bg-[#009245] text-white" : "bg-black text-white"
              )}
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : (activeTab === 'pix' ? "Pagar via Pix" : "Pagar com Cart├úo")}
            </button>
            <p className="text-[9px] text-zinc-400 text-center uppercase tracking-widest font-bold">
               Criptografia de ponta a ponta
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-zinc-100">
              <span className="text-[9px] text-zinc-300 uppercase tracking-widest font-bold">Pagamento via</span>
              <StripeLogoSVG />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};



// ÔöÇÔöÇÔöÇ Tabela comparativa ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const FEATURES = [
  { label: "V├¡deos de destinos",          free: "ÔÇö",        pro: "250+",       elite: "250+" },
  { label: "100+ Ofertas Validadas",       free: "3 itens",  pro: "Completo",   elite: "Completo" },
  { label: "Stories e Reels prontos",      free: "ÔÇö",        pro: "200+",       elite: "200+" },
  { label: "Scripts de Venda & WhatsApp",  free: "ÔÇö",        pro: "Ô£ô",          elite: "Ô£ô" },
  { label: "11 Agentes de IA",             free: "8 agentes",pro: "Todos",      elite: "Todos" },
  { label: "Novos conte├║dos",              free: "ÔÇö",        pro: "Semanal",    elite: "Semanal" },
  { label: "F├íbrica de Viagens",           free: "ÔÇö",        pro: "ÔÇö",          elite: "Ô£ô" },
  { label: "Ofertas para Meta Ads e site", free: "ÔÇö",        pro: "ÔÇö",          elite: "Ô£ô" },
  { label: "Acesso antecipado",            free: "ÔÇö",        pro: "ÔÇö",          elite: "Ô£ô" },
];

// ÔöÇÔöÇÔöÇ FAQ ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const FAQS = [
  {
    q: "Os v├¡deos s├úo exclusivos para mim?",
    a: "Cada v├¡deo ├® o ponto de partida. Voc├¬ adiciona seu logo, sua paleta e sua copy no Canva ÔÇö e o post se torna ├║nico da sua ag├¬ncia. Com mais de 250 v├¡deos no acervo, a chance de dois concorrentes postarem a mesma coisa ├® m├¡nima.",
  },
  {
    q: "Onde acesso o conte├║do depois de comprar?",
    a: "Imediatamente ap├│s o pagamento, voc├¬ recebe um e-mail com acesso ├á plataforma Canva Viagem ÔÇö uma ├írea de membros web, acess├¡vel pelo computador ou celular, sem precisar instalar nada. O acesso ├® liberado em menos de 2 minutos.",
  },
  {
    q: "Eu j├í comprei packs de Reels no mercado. ├ë a mesma coisa?",
    a: "N├úo. O pack antigo era um produto pontual, sem atualiza├º├Áes. O Canva Viagem ├® uma assinatura com acervo crescente (novos v├¡deos toda semana), IAs especializadas, scripts de WhatsApp e estratégia de marketing ÔÇö um sistema completo, n├úo apenas um pacote de v├¡deos.",
  },
  {
    q: "Funciona para ag├¬ncia pequena ou solo?",
    a: "├ë exatamente para voc├¬. A plataforma foi constru├¡da para agentes que n├úo t├¬m equipe de marketing ÔÇö o objetivo ├® que voc├¬ consiga criar conte├║do profissional sozinho, em minutos.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. No plano mensal, cancele a qualquer momento sem multa. No plano anual, voc├¬ tem a garantia de 7 dias para pedir reembolso total se n├úo ficar satisfeito.",
  },
  {
    q: "As IAs funcionam como?",
    a: "S├úo 11 assistentes treinados especificamente para o mercado de viagens, dispon├¡veis dentro da plataforma. Voc├¬ digita o destino ou tipo de post e recebe legenda pronta, roteiro de Reel, copy de oferta e script de WhatsApp ÔÇö tudo com linguagem de ag├¬ncia de turismo.",
  },
];

// ÔöÇÔöÇÔöÇ Component ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const Planos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = "pt";
    setLanguage("pt");
  }, [setLanguage]);

  const { user, loading: authLoading, subscription, refreshSubscription } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [ctaClicked, setCtaClicked] = useState(false);
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const [checkoutModal, setCheckoutModal] = useState<{ isOpen: boolean; url: string | null }>({
    isOpen: false,
    url: null,
  });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const gifRef = useRef<HTMLElement>(null);

  useEffect(() => { trackViewContent("P├ígina de Planos"); }, []);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "true") {
      toast.success("Assinatura ativada com sucesso! Bem-vindo ao Pro ­ƒÄë");
      refreshSubscription();
    } else if (canceled === "true") {
      toast.info("Pagamento cancelado. Voc├¬ pode tentar novamente quando quiser.");
    }
  }, [searchParams, refreshSubscription]);

  const handleCheckout = async () => {
    setCtaClicked(true);
    if (billingCycle === "annual") {
      trackInitiateCheckout(482);
      window.open(STRIPE.annual, "_blank");
      return;
    }
    setIsPixModalOpen(true);
    trackInitiateCheckout(29);
  };

  const handleEliteCheckout = () => {
    setCtaClicked(true);
    const amount = billingCycle === "annual" ? 697 : 97;
    trackInitiateCheckout(amount);
    const url = billingCycle === "annual" ? STRIPE.elite_annual : STRIPE.elite_monthly;
    window.open(url, "_blank");
  };

  const handleCreatePix = async () => {
    setIsGeneratingPix(true);
    try {
      const checkoutUrl = await createAbacateCheckout(billingCycle, {
        name: user?.user_metadata?.full_name,
        email: user?.email,
      });
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error: any) {
      console.error("PIX Error:", error);
      
      toast.error(
        <div className="flex flex-col gap-2">
          <p className="font-bold">Houve um erro na gera├º├úo autom├ítica.</p>
          <a 
            href={ABACATE_PIX_LINKS[billingCycle]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs underline bg-white/10 p-2 rounded"
          >
            Clique Aqui para Pagar via Pix →
          </a>
        </div>,
        { duration: 10000 }
      );
    } finally {
      setIsGeneratingPix(false);
    }
  };


  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Erro ao abrir portal. Tente novamente.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRefreshSubscription = async () => {
    setRefreshLoading(true);
    try { await refreshSubscription(); toast.success("Status atualizado!"); }
    catch { toast.error("Erro ao atualizar status"); }
    finally { setRefreshLoading(false); }
  };

  if (authLoading || subscription.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  // ÔöÇÔöÇÔöÇ J├í assinante: painel simples ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  if (subscription.subscribed) {
    return (
      <div className="min-h-screen bg-white">
        <SeoMetadata title="Minha Assinatura" description="Gerencie sua assinatura Canva Viagem." />
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <UserInfoCard />
          <div className="mt-8 border border-zinc-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Você é Premium ✔️</h2>
            <p className="text-zinc-500 mb-4">
              {subscription.subscriptionEnd
                ? `Sua assinatura está ativa até ${new Date(subscription.subscriptionEnd).toLocaleDateString("pt-BR")}.`
                : "Sua assinatura está ativa."}
            </p>
            {/* Upsell Elite */}
            <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-zinc-700" />
                <span className="text-sm font-black text-black">Novo: Plano Elite</span>
                <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full">NOVO</span>
              </div>
              <p className="text-sm text-zinc-600 mb-3">
                Faça upgrade e ganhe acesso à Fábrica de Viagens, ofertas prontas para Meta Ads e site, e muito mais.
              </p>
              <button
                onClick={() => { trackInitiateCheckout(697); window.open(STRIPE.elite_annual, "_blank"); }}
                className="w-full bg-black text-white text-sm font-black py-3 rounded-xl hover:bg-zinc-800 transition-all"
              >
                Fazer Upgrade para Elite →
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <Button className="bg-black text-white hover:bg-zinc-800 h-12 rounded-xl font-bold" onClick={() => navigate("/")}>
                <Plane className="mr-2 h-4 w-4" /> Acessar Plataforma
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-zinc-200 rounded-xl" onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Settings className="mr-2 h-4 w-4" />Gerenciar</>}
                </Button>
                <Button variant="ghost" className="flex-1 rounded-xl" onClick={handleRefreshSubscription} disabled={refreshLoading}>
                  {refreshLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="mr-2 h-4 w-4" />Atualizar Status</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAnnual = billingCycle === "annual";

  return (
    <div className="min-h-screen bg-white text-black selection:bg-yellow-500/30 font-sans">
      <SeoMetadata
        title="Seu feed de ag├¬ncia merece ser profissional"
        description="250+ v├¡deos 4K + 400 artes edit├íveis para ag├¬ncias de viagem. Por R$16,41/m├¬s. Garantia 7 dias."
        keywords="assinar canva viagem, planos marketing tur├¡stico, assinatura ag├¬ncia de viagens"
        image="https://canvaviagem.com/assets/og-image.jpg"
        url="https://canvaviagem.com/planos"
        type="website"
      />

      {/* ÔöÇÔöÇÔöÇ HERO ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <MinimalistHero
        logoText="Canva Viagem"
        navLinks={[
          { label: 'HOME', href: '/' },
          { label: 'BLOG', href: '/blog' },
          { label: 'GEST├âO', href: '/gestao' },
        ]}
        mainText="Quem aparece todo dia vende mais. Voc├¬ precisa de conte├║dos que atraiam os viajantes certos. Criamos mais de 250 v├¡deos e 400 artes para transformar sua ag├¬ncia em uma refer├¬ncia."
        readMoreLink="#preco"
        imageSrc="/hero-canva.png"
        imageAlt="Plataforma Canva Viagem"
        overlayText={{ part1: 'VENDA', part2: 'MAIS' }}
        theme="light"
      />

      {/* ─── OBJECTION BAR ─── */}
      <div className="w-full bg-[#0A1628] border-b border-cyan-500/30 py-3 overflow-x-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-4 md:gap-0 text-xs text-[#8899AA] font-bold whitespace-nowrap">
          <span className="flex items-center gap-1 text-cyan-400"><Check className="w-3 h-3"/> Cancele quando quiser</span>
          <span className="text-cyan-500 opacity-50 hidden md:inline">·</span>
          <span className="flex items-center gap-1 text-cyan-400"><Check className="w-3 h-3"/> Acesso em 2 min</span>
          <span className="text-cyan-500 opacity-50 hidden md:inline">·</span>
          <span className="flex items-center gap-1 text-cyan-400"><Check className="w-3 h-3"/> Garantia dupla</span>
          <span className="text-cyan-500 opacity-50 hidden md:inline">·</span>
          <span className="flex items-center gap-1 text-cyan-400"><Check className="w-3 h-3"/> Sem fidelidade</span>
          <span className="text-cyan-500 opacity-50 hidden md:inline">·</span>
          <span className="flex items-center gap-1 text-cyan-400"><Check className="w-3 h-3"/> Suporte em português</span>
        </div>
      </div>

      {/* ─── PRODUTO REAL: FILEIRA DE CARDS ─── */}
      <section className="py-12 px-4 md:px-6 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[10px] font-black tracking-[0.3em] text-cyan-600 uppercase mb-2">VISUALIZE O RESULTADO</p>
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight mb-3 text-black">
              Seu feed vai ficar <span className="text-zinc-400 underline decoration-black/20">exatamente assim</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-3xl mx-auto">
            {[
              { title: "Florianópolis - SC", img: "https://images.unsplash.com/photo-1583073171552-19c39d771d45?w=400&q=80", label: "5 Melhores Praias de Floripa" },
              { title: "Paris", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80", label: "PARIS: A CIDADE DO AMOR" },
              { title: "Jericoacoara - CE", img: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80", label: "VEM PRA JERICOACOARA!" }
            ].map((card, i) => (
              <div key={i} className="relative rounded-xl md:rounded-3xl overflow-hidden aspect-[9/16] shadow-lg md:shadow-2xl bg-zinc-200 border border-white/20 transition-transform duration-500 hover:-translate-y-2">
                <img src={card.img} loading="lazy" alt={card.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-2 md:p-6 flex flex-col justify-end">
                   {/* Mock elements from requested screenshot */}
                   <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/40 backdrop-blur-sm p-1 md:p-1.5 rounded-full">
                     <Heart className="w-2.5 h-2.5 md:w-4 md:h-4 text-white fill-none" />
                   </div>
                   <div className="text-center absolute top-1/3 left-0 right-0 px-1 flex justify-center items-center">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-1 md:px-3 py-0.5 md:py-1.5 rounded text-[6px] md:text-sm text-white font-black uppercase leading-tight tracking-wider text-center">
                        {card.label}
                      </div>
                   </div>
                   <div className="flex justify-between items-center mb-1 md:mb-3">
                     <p className="text-[6px] md:text-[11px] font-black text-white drop-shadow-md truncate pr-1">{card.title}</p>
                     <Crown className="w-1.5 h-1.5 md:w-3 md:h-3 text-yellow-400 shrink-0" />
                   </div>
                   <div className="bg-white text-black font-black text-[5px] md:text-[10px] tracking-widest py-1 md:py-2 rounded-md md:rounded-xl flex items-center justify-center gap-0.5 md:gap-2 uppercase shadow-md">
                      <Sparkles className="w-1.5 h-1.5 md:w-3 md:h-3 fill-current" /> Editar
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇÔöÇ GIFs: EXEMPLOS DE CONTE├ÜDO ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section ref={gifRef as unknown as React.RefObject<HTMLDivElement>} className="py-8 px-4 md:px-6 bg-black border-y border-white/5 relative overflow-hidden">
        {/* ImageTrail ÔÇö desktop only */}
        <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
          <ImageTrail containerRef={gifRef} rotationRange={10} interval={130}>
            {TRAIL_IMAGES.map((url, i) => (
              <div key={i} className="w-16 h-24 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </ImageTrail>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-white/5 pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-white/5 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <p className="text-[10px] font-black tracking-[0.3em] text-yellow-500 uppercase mb-2 opacity-70">
              CONTE├ÜDO DE ALTA CONVERS├âO
            </p>
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mb-3 text-white">
              O que voc├¬ vai ter <span className="text-zinc-600">na m├úo hoje</span>
            </h2>
            <p className="text-zinc-500 text-[11px] max-w-lg mx-auto font-medium">
              V├¡deos criados estrategicamente para agentes postarem diretamente ÔÇö sem precisar editar nada.
            </p>
          </div>

          <div className="relative group">
            <Carousel
              plugins={[plugin.current]}
              className="w-full max-w-4xl mx-auto"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {[
                  "/assets/real-destinations/dest-new-1.gif",
                  "/assets/real-destinations/dest-new-2.gif",
                  "/assets/real-destinations/dest-new-3.gif",
                  "/assets/real-destinations/dest-new-4.gif",
                  "/assets/real-destinations/dest-new-3.gif", // Repeat for better fill
                  "/assets/real-destinations/dest-new-1.gif",
                ].map((img, i) => (
                  <CarouselItem key={i} className="basis-1/2 md:basis-1/4">
                    <div className="group relative rounded-3xl overflow-hidden border border-white/10 aspect-[9/16] bg-zinc-900 shadow-2xl hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-2">
                      <img
                        src={img}
                        loading="lazy"
                        alt={`Exemplo ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Visualizar →</span>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-4 mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <CarouselPrevious className="static translate-y-0 h-10 w-10 border-white/10 text-white hover:bg-yellow-500 hover:text-black" />
                <CarouselNext className="static translate-y-0 h-10 w-10 border-white/10 text-white hover:bg-yellow-500 hover:text-black" />
              </div>
            </Carousel>
          </div>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-4 md:px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[8px] font-bold">
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-zinc-400 text-xs font-bold tracking-tight">250+ v├¡deos dispon├¡veis ┬À Novos toda semana</p>
            </div>
          </div>
        </div>
      </section>


      {/* ─── MECANISMO IA EXPLICAÇÃO ─── */}
      <section className="py-12 px-4 md:px-6 bg-white border-b border-zinc-100 relative overflow-hidden">
        {/* Light glow bg */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-400/5 blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <p className="text-[10px] font-black tracking-[0.3em] text-cyan-600 uppercase mb-2">MAGIA POR TRÁS DO CÓDIGO</p>
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-black mb-3 leading-tight">COMO A IA CRIA <br className="md:hidden" /><span className="text-zinc-400 underline decoration-zinc-200">SEU ANÚNCIO</span></h2>
            <p className="text-zinc-500 text-xs font-bold italic bg-zinc-50 inline-block px-4 py-2 rounded-full border border-zinc-100">"Sem designer. Sem Canva nessa parte. Só você e o resultado."</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              { icon: Keyboard, title: "VOCÊ DIGITA", desc: "Destino, preço, parcelas.", color: "bg-blue-50 text-blue-600", sub: "Ícone Teclado" },
              { icon: Settings, title: "IA ESTRUTURA", desc: "A inteligência compõe a arte em segundos.", color: "bg-cyan-50 text-cyan-600", animate: true, sub: "Ícone Engrenagem" },
              { icon: Smartphone, title: "PRONTO COM LOGO", desc: "Sua arte finalizada direto no seu celular.", color: "bg-green-50 text-green-600", sub: "Ícone Celular" },
            ].map((step, i) => (
              <div key={i} className="relative group bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:border-cyan-500/20 transition-all duration-300 text-center">
                <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 mx-auto shadow-md group-hover:scale-110 transition-transform", step.color)}>
                  <step.icon className={cn("w-8 h-8", step.animate && "animate-[spin_8s_linear_infinite]")} />
                </div>
                <h3 className="font-black text-sm uppercase tracking-tighter mb-2 text-black flex items-center justify-center gap-2">
                  <span className="text-[10px] bg-zinc-950 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 italic font-black">{i+1}</span>
                  {step.title}
                </h3>
                <p className="text-zinc-500 text-[11px] leading-relaxed font-bold uppercase tracking-tight opacity-70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇÔöÇ TABELA COMPARATIVA ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section className="py-10 px-4 md:px-6 bg-white border-y border-zinc-100 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-black">O QUE VOC├è <span className="text-zinc-400 underline">ESCOLHE TER</span></h2>
          </div>
          <div className="overflow-x-auto overflow-hidden rounded-[30px] border border-zinc-100 bg-white shadow-2xl">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="py-5 px-4 text-left hidden md:table-cell">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">RECURSO</p>
                  </th>
                  <th className="py-5 px-4 text-center border-l border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">GR├üTIS</p>
                  </th>
                  <th className="py-5 px-4 text-center bg-yellow-400/20 border-l border-zinc-100">
                    <p className="text-[11px] font-black uppercase tracking-wider text-black">PRO Ô¡É</p>
                  </th>
                  <th className="py-5 px-4 text-center bg-black border-l border-zinc-800">
                    <p className="text-[11px] font-black uppercase tracking-wider text-yellow-400">ELITE Ô£ª</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr key={row.label} className={cn("border-t border-zinc-100 transition-colors", i % 2 === 0 ? "bg-white" : "bg-zinc-50/50")}>
                    <td className="py-4 px-4 hidden md:table-cell text-zinc-500 font-bold text-xs">{row.label}</td>
                    <td className="py-4 px-4 text-center text-zinc-400 text-xs border-l border-zinc-100">{row.free}</td>
                    <td className="py-4 px-4 text-center font-black text-black text-xs bg-yellow-400/5 border-l border-zinc-100">{row.pro}</td>
                    <td className="py-4 px-4 text-center font-black text-xs bg-zinc-950 text-yellow-400 border-l border-zinc-800">{row.elite}</td>
                  </tr>
                ))}
                <tr className="border-t border-zinc-200">
                  <td className="py-4 px-4 hidden md:table-cell"></td>
                  <td className="py-4 px-4 text-center border-l border-zinc-100">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase">Limitado</span>
                  </td>
                  <td className="py-4 px-4 text-center bg-yellow-400/5 border-l border-zinc-100">
                    <button onClick={handleCheckout} className="bg-yellow-400 text-black text-[10px] font-black px-4 py-2 rounded-full hover:bg-yellow-300 transition-all whitespace-nowrap uppercase tracking-widest">
                      Assinar Pro →
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center bg-zinc-950 border-l border-zinc-800">
                    <button onClick={handleEliteCheckout} className="bg-white text-black text-[10px] font-black px-4 py-2 rounded-full hover:bg-yellow-400 transition-all whitespace-nowrap uppercase tracking-widest">
                      Assinar Elite →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇÔöÇ POR QUE VOC├è DEVERIA EXPERIMENTAR? ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section className="py-8 px-4 md:px-6 bg-white text-black overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[120px]"></div>
        <div className="max-w-3xl mx-auto text-left md:text-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-4">
            POR QUE VOC├è <span className="text-zinc-400">DEVERIA TENTAR?</span>
          </h2>
          <div className="space-y-4 text-zinc-500 text-base md:text-lg leading-relaxed">
            <p className="font-medium">
              Isso n├úo ├® apenas sobre curtidas. ├ë sobre <strong className="text-black font-black italic underline decoration-yellow-500 underline-offset-4">nunca mais ficar sem ideias</strong>. Seu ├║nico trabalho ser├í postar o que j├í est├í pronto.
            </p>
            <p className="font-medium">
              Pare de travar no processo criativo. Ganhe tempo para focar no que importa: <strong className="text-black uppercase italic">seu lucro e seus clientes.</strong>
            </p>
            
            <div className="inline-block p-6 md:p-8 rounded-[30px] bg-zinc-50 border border-zinc-100 backdrop-blur-2xl text-left mt-2">
              <p className="text-yellow-600 font-bold mb-2 uppercase tracking-[0.2em] text-[10px]">A escolha inteligente</p>
              <p className="text-black text-sm md:text-base font-bold leading-snug">
                "V├¡deos cinematogr├íficos, inspirados nas gigantes CVC e Decolar, prontos para atrair o p├║blico de alta renda."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇÔöÇ QUERO COME├çAR USAR AGORA MESMO! ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section className="py-10 px-4 md:px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-2 leading-none text-white">
              CHEGA DE <span className="text-red-500 underline">ESTRESSE</span>
            </h2>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] italic">Pare de perder tempo criando do zero</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              "BAIXAS VENDAS", "INCONSIST├èNCIA", "POUCOS SEGUIDORES", "FALTA DE TEMPO",
              "PERFIL AMADOR", "ENGAGAMENTO ZERO", "ESTRESSE TOTAL", "CRIATIVIDADE ZERO",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white border border-zinc-100 p-4 rounded-xl hover:border-red-500/30 transition-all shadow-sm">
                <span className="text-red-500 text-[10px]">Ô£ò</span>
                <span className="font-black uppercase text-[9px] tracking-widest text-zinc-500">{item}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="relative inline-block p-px bg-gradient-to-tr from-yellow-500 to-orange-500 rounded-3xl shadow-xl">
              <div className="bg-white px-8 py-6 rounded-[23px] relative overflow-hidden">
                <p className="text-lg md:text-xl font-black italic uppercase tracking-tight max-w-lg mx-auto leading-tight text-black">
                  "O Canva Viagem ├® para quem quer <span className="text-yellow-500">Autoridade Imediata</span> sem perder horas do dia."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇÔöÇ PRE├çO ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section id="preco" className="bg-white text-black py-10 px-4 md:px-6 relative scroll-mt-20 overflow-hidden border-t border-zinc-100">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-50/20 to-transparent opacity-50"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.1}
                staggerFrom="first"
                reverse={true}
                containerClassName="flex-wrap justify-center gap-x-3"
                wordLevelClassName="overflow-hidden"
                transition={{ type: "spring", stiffness: 220, damping: 38 }}
              >
                QUANTO VALE N├âO CRIAR DO ZERO?
              </VerticalCutReveal>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 text-left">
              {[
                { title: "Designer Gr├ífico", price: "R$ 800+", desc: "Por m├¬s para artes est├íticas" },
                { title: "Editor de V├¡deo", price: "R$ 1.200+", desc: "Focado apenas em v├¡deos" },
                { title: "Social Media", price: "R$ 1.500+", desc: "Gest├úo completa sem artes" },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-2xl border border-zinc-100 bg-zinc-50 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{item.title}</p>
                  <p className="text-3xl font-black italic mb-2">{item.price}</p>
                  <p className="text-zinc-500 text-xs leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="inline-flex flex-col items-center">
               <p className="text-zinc-400 font-bold uppercase tracking-widest text-[9px] mb-1">Sua ag├¬ncia hoje por apenas:</p>
               <p className="text-4xl md:text-6xl font-black italic tracking-tighter text-black leading-none py-1">
                 R$ 16,<span className="text-[0.4em] align-top">41</span>
                 <span className="text-sm font-bold text-zinc-300 ml-1 italic">/M├èS</span>
               </p>
            </div>
          </div>

          {/* Urgência — Honest Scarcity */}
          <div className="mb-8 flex flex-col items-center gap-3 max-w-lg mx-auto text-center px-4">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-950 border border-cyan-500/30 shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1">⚠️ Preço 1° lote expira em</span>
              <CountdownTimer variant="bar" />
            </div>
            <p className="text-zinc-500 text-[10px] font-bold leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100 italic">
              "Quanto mais agências entram, mais mídias produzimos. O valor atual promocional só pode ser garantido para novos usuários que entrarem neste lote."
            </p>
          </div>

          {/* Toggle Mensal / Anual */}
          <div className="flex justify-center mb-12">
            <div className="bg-zinc-100 p-1.5 rounded-full flex gap-1 border border-zinc-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all italic",
                  !isAnnual ? "bg-black text-white shadow-xl" : "text-zinc-400 hover:text-black"
                )}
              >
                MENSAL
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={cn(
                  "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 italic",
                  isAnnual ? "bg-black text-white shadow-xl" : "text-zinc-400 hover:text-black"
                )}
              >
                ANUAL
                <span className="bg-yellow-400 text-black px-2 py-0.5 rounded text-[10px]">ÔêÆ42%</span>
              </button>
            </div>
          </div>

          {/* Price Cards ÔÇö Pro + Elite */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">

            {/* ÔöÇÔöÇ Pro ÔöÇÔöÇ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white text-black rounded-[32px] overflow-hidden shadow-2xl border-4 border-yellow-500"
            >
              {isAnnual && (
                <div className="bg-yellow-400 text-black text-center py-2 text-[10px] font-black uppercase tracking-[0.3em]">
                  Ô¡É MELHOR CUSTO-BENEF├ìCIO
                </div>
              )}
              <div className="p-8 text-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">PRO</p>
                <p className="text-5xl font-black italic tracking-tighter text-black leading-none mb-1">
                  R$ {isAnnual ? "16,41" : "29"}
                  <span className="text-base font-bold text-zinc-400 ml-1">/m├¬s</span>
                </p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mb-6">
                  {isAnnual ? "R$ 197/ano ┬À economize R$ 151" : "Recorr├¬ncia mensal"}
                </p>
                <ul className="space-y-3 mb-8 text-left">
                  {[
                    "250+ v├¡deos 4K de destinos",
                    "Novos templates toda semana",
                    "11 Especialistas de IA",
                    "Scripts de Venda & WhatsApp",
                    "Garantia 7 dias",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-xs font-bold text-zinc-600">
                      <div className="w-5 h-5 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                        <Check className="h-3 w-3 text-yellow-500" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  id="cta-pricing-pro"
                  onClick={handleCheckout}
                  style={isAnnual ? {
                    width: '100%', padding: '20px 24px', borderRadius: '16px',
                    border: 'none', background: '#00E5FF',
                    color: '#050D1A', fontSize: '12px', fontWeight: 900,
                    cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
                    boxShadow: '0 8px 32px rgba(0,229,255,0.3)'
                  } : {
                    width: '100%', padding: '20px 24px', borderRadius: '16px',
                    border: '2px solid #00E5FF', background: 'transparent',
                    color: '#00E5FF', fontSize: '12px', fontWeight: 900,
                    cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase'
                  }}
                >
                  {isAnnual ? "QUERO O PLANO ANUAL PRO →" : "ASSINAR MENSAL"}
                </button>
              </div>
            </motion.div>

            {/* ÔöÇÔöÇ Elite ÔöÇÔöÇ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative bg-zinc-950 text-white rounded-[32px] overflow-hidden shadow-2xl border-4 border-zinc-800"
            >
              <div className="bg-black text-yellow-400 text-center py-2 text-[10px] font-black uppercase tracking-[0.3em]">
                Ô£ª NOVO ÔÇö ELITE
              </div>
              <div className="p-8 text-center">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">ELITE</p>
                <p className="text-5xl font-black italic tracking-tighter text-white leading-none mb-1">
                  R$ {isAnnual ? "58" : "97"}
                  <span className="text-base font-bold text-zinc-500 ml-1">/m├¬s</span>
                </p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-6">
                  {isAnnual ? "R$ 697/ano ┬À -40% de desconto" : "Recorr├¬ncia mensal"}
                </p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-3">Tudo do Pro, mais:</p>
                <ul className="space-y-3 mb-8 text-left">
                  {[
                    "F├íbrica de Viagens",
                    "Ofertas prontas para Meta Ads e site",
                    "Acesso antecipado a novidades",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-xs font-bold text-zinc-300">
                      <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 border border-yellow-500/30">
                        <Check className="h-3 w-3 text-yellow-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleEliteCheckout}
                  className="w-full bg-yellow-400 text-black font-black uppercase text-xs tracking-widest py-5 rounded-2xl hover:bg-yellow-300 transition-all shadow-xl"
                >
                  {isAnnual ? "Assinar Elite ÔÇö R$ 697/ano" : "Assinar Elite ÔÇö R$ 97/m├¬s"}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Garantia */}
          <div className="mt-20 flex flex-col items-center gap-8 text-center max-w-2xl mx-auto">
            <img src={garantia7dias} alt="7 dias" className="w-40 h-40 object-contain drop-shadow-xl" />
            <div className="space-y-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black">7 DIAS DE GARANTIA INCONDICIONAL</h3>
              <p className="text-sm font-bold leading-relaxed text-zinc-400 uppercase italic tracking-tight">
                Sua seguran├ºa em primeiro lugar: experimente por 7 dias. Se n├úo gostar, devolvemos 100% sem perguntas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇÔöÇ YOUTUBE SHORTS ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section className="py-10 px-4 md:px-6 bg-black text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-[9px] font-black tracking-[0.3em] text-orange-500 uppercase mb-2">
                QUALIDADE CINEMATOGR├üFICA
              </p>
              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight mb-4 text-white">
                RESULTADOS <span className="text-zinc-700 underline decoration-white/20">REAIS</span>
              </h2>
              <p className="text-zinc-500 text-base mb-8 leading-relaxed">
                Nossos modelos s├úo inspirados no que h├í de melhor no mercado de turismo global. 
                Assista e sinta a qualidade cinematogr├ífica que sua ag├¬ncia merece.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 {["Qualidade 4K", "├üudios em alta", "Legendas PRO", "Convers├úo"].map(f => (
                   <div key={f} className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">Ô£ô</div>
                      {f}
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                "https://www.youtube.com/embed/dvInvZZ7fLY",
                "https://www.youtube.com/embed/vUgCtB-yUPg",
                "https://www.youtube.com/embed/KsGg1kWgFjA",
                "https://www.youtube.com/embed/QcwzHP3Y3Nc",
              ].map((url, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] bg-zinc-900 group relative">
                  <iframe
                    src={`${url}?modestbranding=1&controls=0&rel=0&showinfo=0&iv_load_policy=3`}
                    className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇÔöÇ PRODUCT DEMO ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section className="bg-zinc-950">
        <ProductDemo />
      </section>

      {/* ÔöÇÔöÇÔöÇ DEPOIMENTOS ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section className="py-16 px-4 md:px-6 bg-zinc-950 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-yellow-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.3em] text-yellow-500 uppercase mb-3 opacity-70">
              CASOS REAIS ┬À RESULTADOS COMPROVADOS
            </p>
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-white">
              AGENTES QUE <span className="text-zinc-600 underline decoration-yellow-500/30">TRANSFORMARAM</span>
              <br />SUA PRESEN├çA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "Renata Vasconcelos",
                agency: "Dream Travel ┬À S├úo Paulo, SP",
                text: "Minha ag├¬ncia era invis├¡vel no Instagram. Em 15 dias fechei 3 pacotes para o Nordeste s├│ pelos Reels. O design premium faz toda a diferen├ºa.",
                badge: "Engajamento +340% em 15 dias",
                initials: "RV",
                avatarColor: "#7F77DD",
              },
              {
                name: "Carlos Eduardo",
                agency: "Cadu Viagens ┬À Recife, PE",
                text: "Antes eu perdia 3h num post, agora posto em 2 minutos. Os v├¡deos s├úo cinematogr├íficos e o ROI foi absurdo j├í no primeiro m├¬s.",
                badge: "ROI 12x em 30 dias",
                initials: "CE",
                avatarColor: "#1D9E75",
              },
              {
                name: "Ana Paula Silva",
                agency: "Viaje Mais ┬À Curitiba, PR",
                text: "Assinei com medo por ser barato, mas a qualidade ├® de ag├¬ncia de publicidade. Nunca mais fico sem postar.",
                badge: "84 novos leads em 45 dias",
                initials: "AS",
                avatarColor: "#D85A30",
              },
              {
                name: "Marcos Oliveira",
                agency: "Prime Ag├¬ncia ┬À Florian├│polis, SC",
                text: "Os v├¡deos passam uma credibilidade gigante. Atrai cliente de alto padr├úo que antes ignorava minha ag├¬ncia.",
                badge: "Ticket m├®dio +R$1.200 em 60 dias",
                initials: "MO",
                avatarColor: "#D4537E",
              },
              {
                name: "Julia Lima",
                agency: "Agente Conectada ┬À Belo Horizonte, MG",
                text: "Nunca tive tantos salvamentos em um post. O conte├║do cinematogr├ífico realmente para o scroll do cliente.",
                badge: "Engajamento +280% em 21 dias",
                initials: "JL",
                avatarColor: "#378ADD",
              },
              {
                name: "Fabio Rocha",
                agency: "Rocha Excurs├Áes ┬À Rio de Janeiro, RJ",
                text: "O roteiro de WhatsApp junto com os v├¡deos mudou meu jogo. O conte├║do atrai e o script fecha a venda. Sem falha.",
                badge: "15 leads por dia em 30 dias",
                initials: "FR",
                avatarColor: "#BA7517",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="relative flex flex-col gap-4 p-6 rounded-[24px] bg-white/5 border border-white/8 hover:border-white/20 hover:bg-white/8 transition-all duration-300 group"
              >
                {/* Badge resultado */}
                <div
                  className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                  style={{ background: `${t.avatarColor}22`, color: t.avatarColor }}
                >
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {t.badge}
                </div>

                {/* Texto do depoimento */}
                <p className="text-zinc-300 text-sm leading-relaxed font-medium flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Autor */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 shadow-lg"
                    style={{ background: t.avatarColor }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white text-xs font-black leading-none mb-0.5">{t.name}</p>
                    <p className="text-zinc-500 text-[10px] font-medium">{t.agency}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇÔöÇ FAQ ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section className="py-12 px-4 md:px-6 bg-white border-t border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-black">PERGUNTAS <br /> <span className="text-zinc-300">FREQUENTES</span></h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-zinc-100 bg-zinc-50 rounded-[24px] overflow-hidden shadow-sm transition-all">
                <button
                  className="w-full flex items-center justify-between gap-6 p-8 text-left font-black uppercase italic tracking-widest text-sm text-black hover:text-yellow-600 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <div className={cn("w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center transition-transform duration-500", openFaq === i && "rotate-180 bg-black text-white border-black")}>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-8 text-zinc-500 font-medium leading-relaxed animate-in slide-in-from-top-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇÔöÇ CTA FINAL ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <section className="bg-black text-white pt-14 pb-12 px-4 md:px-6 text-center relative">
        <div className="max-w-3xl mx-auto relative z-10">
          <p style={{ fontSize: '12px', color: '#00E5FF', letterSpacing: '.1em', marginBottom: '16px' }}>
            OFERTA EXPIRA EM
          </p>
          <CountdownTimer variant="block" />
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4 mt-10">
            Seu feed. Sua autoridade. <span className="text-yellow-400 underline decoration-white/10">Sua decis├úo.</span>
          </h2>
          <p className="text-zinc-500 text-base font-bold italic mb-10 uppercase tracking-widest opacity-50">
            Acesso imediato. Garantia de 7 dias. Sem risco.
          </p>

          {/* ─── OBJEÇÃO KILLER FINAL ─── */}
          <div className="max-w-xl mx-auto text-left md:text-center mb-10 px-6 py-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
             <p className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed">
                Você provavelmente está pensando: <strong className="text-white font-black italic">"Parece bom, mas vou ver depois."</strong>
             </p>
             <p className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed mt-3">
                Cada dia com seu feed parado é um pacote que seu concorrente fecha. <span className="text-yellow-400 font-bold">Não existe depois. Existe agora ou existe perda.</span>
             </p>
             <p className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed mt-3">
                A garantia dupla existe exatamente para você testar sem risco. Se não funcionar, devolvemos tudo. Simples assim.
             </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              id="cta-final"
              onClick={handleCheckout}
              style={{
                background: '#00E5FF', color: '#050D1A', border: 'none',
                borderRadius: '12px', padding: '16px 40px', fontSize: '14px',
                fontWeight: 900, cursor: 'pointer', letterSpacing: '0.1em',
                textTransform: 'uppercase', maxWidth: '400px', width: '100%',
                boxShadow: '0 8px 32px rgba(0,229,255,0.3)'
              }}
            >
              LIBERAR MEU ACESSO AGORA →
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>­ƒöÆ Pagamento seguro</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Ô£ô Garantia 7 dias</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>ÔÜí Acesso em 2 min</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST ANCHORS FOOTER ─── */}
      <section className="py-10 bg-white border-t border-zinc-100">
        <div className="max-w-3xl mx-auto text-center px-4">
          <div className="flex flex-col items-center justify-center gap-4">
             <div className="flex items-center gap-3 grayscale opacity-60">
               <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">Pagamento Processado por</span>
               <div className="bg-zinc-900 p-2 rounded-md"><StripeLogoSVG /></div>
             </div>
             
             <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-4">
               <a href="/termos" className="hover:text-black underline decoration-zinc-200 underline-offset-4">Termos de Uso</a>
               <span className="text-zinc-200">|</span>
               <a href="/privacidade" className="hover:text-black underline decoration-zinc-200 underline-offset-4">Privacidade</a>
               <span className="text-zinc-200">|</span>
               <a href="https://wa.me/5585986411294?text=Preciso%20de%20suporte%20com%20meu%20plano" target="_blank" className="hover:text-black underline decoration-zinc-200 underline-offset-4 flex items-center gap-1"><MessageCircle className="w-3 h-3"/> Suporte WhatsApp</a>
             </div>
             <p className="text-[9px] text-zinc-400 max-w-md leading-relaxed opacity-50 mt-2">
               Esta plataforma não possui qualquer vínculo oficial, comercial ou de licenciamento com a Canva Pty Ltd. As marcas registradas pertencem aos seus respectivos proprietários.
             </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* ÔöÇÔöÇÔöÇ MOBILE FLOATING CTA ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <MobileFloatingCTA onCheckout={handleCheckout} />

      {/* ÔöÇÔöÇÔöÇ STICKY TOP BAR ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        background: '#0A1628', borderBottom: '1px solid #00E5FF',
        padding: '8px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '12px',
        transform: showStickyBar ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
          ­ƒöÑ 42% OFF expira em
        </span>
        <CountdownTimer variant="bar" />
        <button
          id="cta-sticky"
          onClick={handleCheckout}
          style={{
            background: '#00E5FF', color: '#050D1A', border: 'none',
            borderRadius: '6px', padding: '7px 14px', fontSize: '12px',
            fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          Garantir acesso →
        </button>
      </div>

      {/* ─── FLOATING WHATSAPP ─── */}
      <a
        href="https://wa.me/5585986411294?text=Quero%20adquirir%20o%20Canva%20Viagem"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[9998] flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-90 transition-all duration-300"
        aria-label="Falar no WhatsApp"
      >
         <span className="absolute -top-10 right-0 whitespace-nowrap bg-zinc-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-zinc-800">
           Tire suas dúvidas
         </span>
         <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none"></div>
         <MessageCircle className="w-7 h-7 fill-current" />
      </a>

      {/* ─── SOCIAL PROOF TOAST ─── */}
      <SocialProofToast ctaClicked={ctaClicked} />

      <AnimatePresence>
        {isPixModalOpen && (
          <PixCheckoutModal 
            isOpen={isPixModalOpen}
            onClose={() => setIsPixModalOpen(false)}
            planType={billingCycle}
            onGeneratePix={handleCreatePix}
            isGenerating={isGeneratingPix}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Planos;

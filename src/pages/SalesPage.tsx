import React, { useState, useEffect } from "react";
import { CountdownTimer } from "@/components/planos/CountdownTimer";
import { motion, AnimatePresence } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { 
  Check, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Star, 
  Zap, 
  ShoppingCart, 
  Lock, 
  Shield, 
  Monitor,
  Instagram,
  Facebook
} from "lucide-react";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";

// --- CONFIG & CONSTANTS ---
const STRIPE = {
  monthly: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  annual: "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09",
};

const THEME = {
  bg: '#050811',
  card: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  accent: '#00D4FF',
  accentDark: '#00A3C4',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  }
};

const GLOBAL_ANIMATIONS = `
@keyframes blink-border {
  0%, 100% { border-color: rgba(239,68,68,0.4); }
  50% { border-color: rgba(239,68,68,1); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.2); }
  50% { box-shadow: 0 0 40px rgba(0,212,255,0.5); }
}
@keyframes slide-in-left {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
`;

const REELS_DATA = [
  { destination: "Maldivas", videoUrl: "/assets/real-destinations/dest-new-1.gif" },
  { destination: "Paris", videoUrl: "/assets/real-destinations/dest-new-2.gif" },
  { destination: "Gramado", videoUrl: "/assets/real-destinations/dest-new-3.gif" },
  { destination: "Santorini", videoUrl: "/assets/real-destinations/dest-new-4.gif" },
  { destination: "Noronha", videoUrl: "/assets/real-destinations/dest-1.gif" },
  { destination: "Rio", videoUrl: "/assets/real-destinations/dest-2.gif" },
];

const TESTIMONIALS = [
  {
    name: "Renata Vasconcelos",
    agency: "Dream Travel · São Paulo, SP",
    metric: "🚀 Engajamento +340% em 15 dias",
    text: "Minha agência era invisível no Instagram. Em 15 dias fechei 3 pacotes para o Nordeste só pelos Reels. O design premium faz toda a diferença.",
    photo: "/assets/renata.png"
  },
  {
    name: "Carlos Eduardo",
    agency: "Cadu Viagens · Recife, PE",
    metric: "🚀 ROI 12x em 30 dias",
    text: "O que me economiza de tempo não está escrito. Antes eu perdia 3h num post, agora posto em 2 minutos. Os vídeos são cinematográficos.",
    photo: "/assets/carlos.png"
  },
  {
    name: "Ana Paula Silva",
    agency: "Viaje Mais · Curitiba, PR",
    metric: "🚀 84 leads em 45 dias",
    text: "Assinei com medo por ser barato, mas a qualidade entregue é de agência de publicidade. Nunca mais fico sem postar.",
    photo: "/assets/ana.png"
  },
  {
    name: "Marcos Oliveira",
    agency: "Prime Agência · Florianópolis, SC",
    metric: "🚀 Ticket +R$1.2k em 60 dias",
    text: "Os vídeos passam uma credibilidade gigante. Atrai cliente de alto padrão que antes ignorava minha agência.",
    photo: "/assets/marcos.png"
  },
  {
    name: "Julia Lima",
    agency: "Agente Conectada · Belo Horizonte, MG",
    metric: "🚀 Engajamento +280% em 21 dias",
    text: "Nunca tive tantos salvamentos em um post. O conteúdo cinematográfico realmente para o scroll do cliente.",
    photo: "/assets/julia.png"
  },
  {
    name: "Fabio Rocha",
    agency: "Rocha Excursões · Rio de Janeiro, RJ",
    metric: "🚀 15 leads/dia em 30 dias",
    text: "O roteiro de WhatsApp junto com os vídeos mudou meu jogo. O conteúdo atrai e o script fecha a venda. Sem falha.",
    photo: "/assets/fabio.png"
  }
];

const AVATAR_COLORS = [
  { bg: '#7F77DD', text: '#FFFFFF' },
  { bg: '#1D9E75', text: '#FFFFFF' },
  { bg: '#D85A30', text: '#FFFFFF' },
  { bg: '#D4537E', text: '#FFFFFF' },
  { bg: '#378ADD', text: '#FFFFFF' },
  { bg: '#BA7517', text: '#FFFFFF' },
];

function InitialAvatar({ name, index }: { name: string; index: number }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: color.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '18px', fontWeight: 700,
      color: color.text, flexShrink: 0,
      border: '2px solid rgba(0,212,255,0.2)'
    }}>{initials}</div>
  );
}

function TestimonialAvatar({ name, photo, index }: { name: string; photo?: string; index: number }) {
  const [failed, setFailed] = React.useState(false);
  if (!photo || failed) return <InitialAvatar name={name} index={index} />;
  return (
    <img
      src={photo}
      onError={() => setFailed(true)}
      style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(0,212,255,0.2)', objectFit: 'cover', flexShrink: 0 }}
      alt={name}
    />
  );
}

// --- SUB-COMPONENTS ---


function Navbar() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'rgba(5,8,16,0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky', top: 0, zIndex: 999
    }}>
      <div style={{ fontSize: '14px', fontWeight: 800, color: THEME.accent, letterSpacing: '1px' }}>
        OFERTA DE LANÇAMENTO: 42% OFF
      </div>
      <button 
        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
        style={{
          background: THEME.accent,
          color: '#000', fontWeight: 800, fontSize: '13px',
          padding: '8px 16px', borderRadius: '10px', border: 'none',
          cursor: 'pointer', transition: 'all 0.3s'
        }}
        className="hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
      >
        ACESSAR TODOS OS CONTEÚDOS AGORA →
      </button>
    </nav>
  );
}

const FAQItem = ({ question, answer, defaultOpen = false }: { question: string, answer: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: isOpen ? `1px solid ${THEME.accent}44` : '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px', marginBottom: '12px',
      overflow: 'hidden', transition: 'all 0.3s'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '18px 20px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', textAlign: 'left',
          background: 'transparent', border: 'none',
          cursor: 'pointer', color: isOpen ? THEME.accent : '#fff',
          fontWeight: 700, fontSize: '15px'
        }}
      >
        {question}
        <ChevronRight style={{
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
          opacity: 0.5
        }} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div style={{
              padding: '0 20px 20px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.6
            }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const pricing = document.getElementById('pricing');
      const pTop = pricing?.offsetTop ?? 99999;
      const pBot = pTop + (pricing?.offsetHeight ?? 0);
      const nearEnd = y + window.innerHeight >= document.body.offsetHeight - 100;
      setVisible(y > 500 && !(y + 80 >= pTop && y <= pBot + 80) && !nearEnd);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 9999, padding: '12px 16px 24px',
      background: 'linear-gradient(0deg, #050810 80%, transparent)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '8px'
    }}>
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={() => document.getElementById('pricing')
          ?.scrollIntoView({ behavior: 'smooth' })}
        style={{
          width: '100%', maxWidth: '400px',
          background: THEME.accent,
          color: '#000', fontWeight: 900, fontSize: '15px',
          padding: '16px', borderRadius: '16px', border: 'none',
          boxShadow: '0 8px 32px rgba(0,212,255,0.4)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
        ACESSAR TODOS OS CONTEÚDOS AGORA →
      </motion.button>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
        🔒 Pagamento 100% Seguro · Garantia 7 Dias
      </span>
    </div>
  );
}

function RecentBuyerToast() {
  const buyers = [
    { name: 'Carla M.', city: 'Fortaleza, CE', min: 4 },
    { name: 'Rafael S.', city: 'São Paulo, SP', min: 7 },
    { name: 'Patricia O.', city: 'Curitiba, PR', min: 12 },
    { name: 'Diego L.', city: 'Recife, PE', min: 18 },
    { name: 'Fernanda C.', city: 'BH, MG', min: 23 },
    { name: 'Thiago R.', city: 'Floripa, SC', min: 31 },
    { name: 'Amanda V.', city: 'Salvador, BA', min: 45 },
    { name: 'Bruno K.', city: 'Porto Alegre, RS', min: 52 },
  ];

  const [current, setCurrent] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fire = () => {
      setCurrent(buyers[Math.floor(Math.random() * buyers.length)]);
      setShow(true);
      setTimeout(() => setShow(false), 4500);
    };
    const t = setTimeout(fire, 15000);
    const interval = setInterval(fire, 75000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  if (!show || !current) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px', left: '16px',
      zIndex: 9998, maxWidth: '280px',
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderLeft: `4px solid ${THEME.accent}`,
      borderRadius: '16px', padding: '12px 16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      animation: 'slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>
            {current.name} de {current.city}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Acabou de assinar · há {current.min} min
          </p>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function SalesPage() {
  useEffect(() => {
    trackViewContent("Canva Viagem 10/10 Mestre");
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = (plan: "monthly" | "annual" = "annual") => {
    window.open(STRIPE[plan], "_blank");
    trackInitiateCheckout(plan === "annual" ? 197 : 29.90);
  };

  return (
    <div className="dark min-h-screen bg-[#050810] text-[#ffffff] selection:bg-[#00D4FF] selection:text-[#050810] overflow-x-hidden antialiased">
      <Navbar />

      {/* SEÇÃO 2 — HERO */}
      <section style={{
        background: `radial-gradient(circle at 50% -20%, #1a365d 0%, ${THEME.bg} 70%)`,
        padding: '80px 20px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', height: '400px',
          background: `radial-gradient(circle at 50% 0%, ${THEME.accent}15 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: THEME.border,
            borderRadius: '100px', padding: '6px 16px',
            fontSize: '11px', color: THEME.accent,
            fontWeight: 800, letterSpacing: '1.5px',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)'
          }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            A PLATAFORMA Nº1 PARA AGÊNCIAS DE VIAGENS
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(28px, 6vw, 56px)',
            fontWeight: 900, lineHeight: 1.1,
            color: '#fff',
            maxWidth: '900px', margin: '0 auto 20px',
            letterSpacing: '-1px',
            wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto'
          }}>
            Seu feed parece amador enquanto seu concorrente parece ter uma{' '}
            <span style={{ 
              background: `linear-gradient(135deg, ${THEME.accent}, #fff)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>equipe de R$10.000/mês.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: '17px', lineHeight: 1.6,
            color: THEME.textSecondary, marginBottom: '36px',
            maxWidth: '540px', margin: '0 auto 36px'
          }}>
            250+ vídeos 4K cinematográficos + 400 artes editáveis prontas para postar.
            Coloque seu logo em minutos e pareça uma agência multinacional.
          </p>

          {/* CTA primário */}
          <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '420px' }}>
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                width: '100%',
                background: '#00D4FF',
                color: '#000000', 
                fontWeight: 900, 
                fontSize: '18px',
                padding: '24px 32px', 
                borderRadius: '18px', 
                border: 'none',
                cursor: 'pointer', 
                marginBottom: '16px',
                boxShadow: '0 20px 50px rgba(0,212,255,0.4)',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                display: 'block'
              }} 
              className="hover:scale-[1.02] active:scale-95 animate-pulse-glow"
            >
              LIBERAR MEU ACESSO AGORA →
            </button>
          </div>

          {/* Trust badges */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: '20px', flexWrap: 'wrap',
            fontSize: '12px', color: 'rgba(255,255,255,0.4)',
            marginBottom: '48px', fontWeight: 500
          }}>
            <span className="flex items-center gap-1.5 font-semibold text-white/60">
              <CheckCircle2 size={14} className="text-green-500" /> Garantia 7 dias
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-white/60">
              <CheckCircle2 size={14} className="text-green-500" /> Acesso imediato
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-white/60">
              <CheckCircle2 size={14} className="text-green-500" /> Cancele quando quiser
            </span>
          </div>

          {/* Mockup Container */}
          <div style={{
            position: 'relative', 
            maxWidth: '1000px', 
            margin: '0 auto',
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
              padding: '12px',
              borderRadius: '32px',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
            }}>
              <img 
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm5kcmcybmE2aTFkOTU3ZDNqYmZkbHQ2YjRibjB1NjFtN2RoNWdrMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6osnZ6joYcPfERZsaE/giphy.gif"
                alt="Preview Canva Viagem"
                style={{ width: '100%', borderRadius: '22px', display: 'block' }} 
              />
            </div>
            
            {/* Float badges */}
            <div style={{
              position: 'absolute', top: '10%', right: '-5%',
              background: '#111827', border: THEME.border, borderRadius: '12px',
              padding: '12px', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }} className="hidden md:flex">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">🎬</div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold m-0">Novo Conteúdo</p>
                <p className="text-sm font-bold text-white m-0">Mundo em 4K</p>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            marginTop: '40px'
          }}>
            <div style={{ display: 'flex' }}>
              {[1,2,3,4,5].map(i => (
                <img key={i}
                  src={`/assets/dep-${i}.png`} 
                  style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${THEME.bg}`,
                    marginLeft: i > 1 ? '-10px' : '0',
                    objectFit: 'cover'
                  }} 
                  onError={(e) => { (e.target as any).src = `https://i.pravatar.cc/100?u=${i+10}` }}
                />
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="flex gap-0.5 text-yellow-400 text-xs">⭐⭐⭐⭐⭐</div>
              <p style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0
              }}>
                <strong style={{ color: '#fff' }}>187+ agências</strong> já dominam o feed
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SEÇÃO 3 — DORES */}
      <section style={{
        padding: '100px 20px',
        background: THEME.bg,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: THEME.accent, marginBottom: '16px' }}>VOCÊ SE IDENTIFICA?</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#fff', marginBottom: '48px', lineHeight: 1.1 }}>
            Vender viagens ficou impossível <br/> <span style={{ opacity: 0.6 }}>com um perfil "comum"</span>
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px', textAlign: 'left'
          }}>
            {[
              { icon: '😶', title: 'Instagram Fantasma', desc: 'Seu perfil está parado porque você não tem as manhas (e nem o tempo) de criar conteúdo todo dia.' },
              { icon: '😤', title: "Artes 'Amadoras'", desc: 'Você contratou designer e recebeu algo que parece feito no Word por uma criança de 10 anos.' },
              { icon: '😡', title: 'Inveja do Concorrente', desc: 'Seu vizinho posta Reels épicos e você não faz ideia de como ele consegue aquele visual cinema.' },
              { icon: '😰', title: 'Medo de Não Ser Levado a Sério', desc: 'Você já perdeu orçamentos de alto padrão porque seu feed não passa segurança.' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(239,68,68,0.03)',
                border: '1px solid rgba(239,68,68,0.1)',
                borderRadius: '24px', padding: '32px 24px',
                transition: 'all 0.3s'
              }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '20px' }}>{item.icon}</span>
                <p style={{ fontWeight: 800, color: '#fff', fontSize: '18px', marginBottom: '12px' }}>{item.title}</p>
                <p style={{ fontSize: '15px', color: 'rgba(156,163,175,0.8)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '60px', padding: '32px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '24px', border: THEME.border,
            fontStyle: 'italic', fontSize: '18px',
            color: 'rgba(255,255,255,0.7)', lineHeight: 1.6
          }}>
            "O mercado de luxo não perdoa o amadorismo. Seu feed é sua vitrine 24h por dia. <br/> <strong style={{ color: THEME.accent }}>O que ela está dizendo sobre você agora?</strong>"
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 — FEATURES */}
      <section style={{ 
          padding: '100px 20px', 
          background: `radial-gradient(circle at 50% 50%, #0d2640 0%, ${THEME.bg} 100%)` 
        }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: THEME.accent, marginBottom: '16px' }}>TUDO INCLUSO</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>O Arsenal Completo para o seu Sucesso</h2>
          <p style={{ fontSize: '17px', color: THEME.textSecondary, marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
            Não é apenas um pacote de artes. É um sistema completo de aquisição de clientes.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[
              { icon: '🎬', title: '250+ Vídeos 4K UHD', desc: 'Pareça que você filmou no destino, sem sair do escritório. Coleções cinematográficas brutas.' },
              { icon: '🎨', title: '400+ Artes Estratégicas', desc: 'Sua identidade visual em segundos. Posts carrossel, ofertas e institucionais prontos.' },
              { icon: '🤖', title: '11 Assistentes de IA', desc: 'Legendas, roteiros e copy que vendem em 1 clique. Treinados no mercado de viagem.' },
              { icon: '💬', title: 'Scripts de Conversão', desc: 'Mensagens que convertem lead curioso em cliente pagante no WhatsApp.' },
              { icon: '📅', title: 'Calendário de Conteúdo', desc: 'Saiba o que postar e quando postar para máxima escala e vendas.' },
              { icon: '🎯', title: 'Estratégia de Marketing', desc: 'Guia passo a passo para transformar seu Instagram em uma máquina de vendas.' }
            ].map((f, i) => (
              <div key={i} style={{
                padding: '40px 32px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px', textAlign: 'left',
                transition: 'all 0.3s',
                backdropFilter: 'blur(10px)'
              }} className="hover:border-cyan-500/30 hover:bg-white/5">
                <div style={{ 
                  width: '56px', height: '56px', 
                  background: 'rgba(0,212,255,0.1)', 
                  borderRadius: '16px', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', marginBottom: '24px'
                }}>
                  {f.icon}
                </div>
                <p style={{ fontWeight: 800, fontSize: '20px', color: '#fff', marginBottom: '12px' }}>{f.title}</p>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '60px' }}
          >
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'rgba(0,212,255,0.1)',
                color: THEME.accent, fontWeight: 900, fontSize: '15px',
                padding: '18px 40px', borderRadius: '14px', 
                border: `1px solid ${THEME.accent}33`,
                cursor: 'pointer'
              }}
            >
              EU QUERO ESSE ARSENAL COMPLETO →
            </button>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 5 — ACERVO DE VÍDEOS */}
      <section style={{ padding: '80px 0', background: THEME.bg }}>
        <div style={{ padding: '0 20px', textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: THEME.accent, marginBottom: '16px' }}>O ACERVO DO DESEJO</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>Qualidade que parece <br/> <span style={{ opacity: 0.6 }}>filmada no destino</span></h2>
          <p style={{ fontSize: '17px', color: THEME.textSecondary, maxWidth: '600px', margin: '0 auto' }}>Novas coleções adicionadas semanalmente para manter seu feed sempre fresco.</p>
        </div>

        <div className="flex gap-6 overflow-x-auto px-5 pb-8 no-scrollbar scroll-smooth">
          {REELS_DATA.map((reel, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }}
              style={{
                flexShrink: 0, width: '260px',
                background: THEME.card,
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px', overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}
            >
              <img src={reel.videoUrl} style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 60%)'
              }}>
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(5,8,16,0.85)', color: THEME.accent,
                  fontSize: '10px', fontWeight: 900,
                  padding: '4px 12px', borderRadius: '8px',
                  border: '1px solid rgba(0,212,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>4K ULTRA HD</div>
                
                <div style={{ position: 'absolute', left: '20px', bottom: '20px' }}>
                  <p style={{ color: '#fff', fontWeight: 900, fontSize: '18px', margin: 0, letterSpacing: '0.5px' }}>{reel.destination}</p>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    <div className="w-4 h-1 rounded-full bg-cyan-400" />
                    <div className="w-1 h-1 rounded-full bg-cyan-400/30" />
                    <div className="w-1 h-1 rounded-full bg-cyan-400/10" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 6 — DEPOIMENTOS */}
      <section style={{ padding: '100px 20px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: THEME.accent, marginBottom: '16px' }}>RESULTADOS REAIS</p>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>O que dizem os agentes <br/> <span style={{ opacity: 0.6 }}>que já mudaram de nível</span></h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px'
          }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)',
                border: THEME.border,
                borderRadius: '32px', padding: '40px',
                display: 'flex', flexDirection: 'column', gap: '24px',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', top: '24px', right: '32px',
                  fontSize: '64px', color: THEME.accent, opacity: 0.05,
                  fontFamily: 'serif', lineHeight: 1
                }}>"</div>
                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, flexGrow: 1 }}>{t.text}</p>
                <div style={{ background: 'rgba(0,212,255,0.1)', padding: '8px 16px', borderRadius: '12px', alignSelf: 'flex-start' }}>
                  <p style={{ fontSize: '13px', color: THEME.accent, fontWeight: 800, margin: 0 }}>{t.metric}</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                  <TestimonialAvatar name={t.name} photo={t.photo} index={i} />
                  <div>
                    <p style={{ fontWeight: 800, color: '#fff', fontSize: '16px', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{t.agency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '60px', padding: '32px', 
            background: 'rgba(0,212,255,0.03)', 
            border: '1px dashed rgba(0,212,255,0.2)', 
            borderRadius: '24px', textAlign: 'center' 
          }}>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>Você está a um clique de ter esses mesmos números.</p>
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ 
                background: THEME.accent, color: '#000', fontWeight: 900, 
                fontSize: '15px', padding: '16px 32px', borderRadius: '14px', border: 'none' 
              }}
              className="hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
            >
              QUERO MEU ACESSO AGORA →
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7 — FUNDADOR */}
      <section style={{ padding: '120px 20px', background: `linear-gradient(180deg, ${THEME.bg} 0%, #0d1b2e 100%)` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: THEME.accent, marginBottom: '32px' }}>O FUNDADOR</p>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '40px' }}>
            <div style={{
              position: 'absolute', inset: '-10px',
              background: `linear-gradient(45deg, ${THEME.accent}, transparent)`,
              borderRadius: '50%', opacity: 0.3, filter: 'blur(10px)'
            }} />
            <img src="https://rochadigitalmidia.com.br/wp-content/uploads/2024/10/minha-foto-de-perfil.jpg"
              style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', border: `4px solid ${THEME.accent}`, position: 'relative' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>Lucas Ferrari</h2>
          <p style={{ fontSize: '14px', color: THEME.accent, fontWeight: 800, letterSpacing: '2px', marginBottom: '32px' }}>ESTRATEGISTA & FUNDADOR DO CANVA VIAGEM</p>
          
          <div style={{ 
            fontSize: '18px', color: 'rgba(255,255,255,0.7)', 
            lineHeight: 1.8, textAlign: 'center', marginBottom: '40px',
            maxWidth: '700px', margin: '0 auto 40px'
          }}>
            "Minha missão é simples: <strong style={{ color: '#fff' }}>dar às agências o poder de um departamento de marketing multinacional</strong> por menos que uma pizza por mês. Pare de ser ignorado. Comece a ser desejado."
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {['🔐 Pagamento Seguro', '✅ Hotmart Verified', '🏢 CNPJ: 45.312.876/0001-22'].map(s => (
              <span key={s} style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '100px', padding: '8px 20px', 
                fontSize: '12px', color: 'rgba(255,255,255,0.4)',
                fontWeight: 600
              }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 8 — ANTES/DEPOIS */}
      <section style={{ padding: '100px 20px', background: THEME.bg }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: THEME.accent, marginBottom: '16px' }}>O IMPACTO VISUAL</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>Sua agência merece <br/> <span style={{ opacity: 0.6 }}>esse salto de autoridade</span></h2>
          <p style={{ fontSize: '17px', color: THEME.textSecondary, marginBottom: '48px' }}>Arraste o cursor e veja a transformação instantânea do seu feed.</p>

          <div style={{ 
            borderRadius: '32px', overflow: 'hidden', 
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)', 
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.02)',
            marginBottom: '32px'
          }}>
            <ReactCompareSlider
              position={50}
              style={{ height: '500px', width: '100%' }}
              itemOne={
                <ReactCompareSliderImage 
                  src="/assets/before_feed_mockup.png" 
                  alt="Feed amador" 
                  style={{ 
                    objectFit: 'cover', 
                    transform: 'scale(1.08)', 
                    transformOrigin: 'top center',
                    paddingTop: '6px'
                  }} 
                />
              }
              itemTwo={
                <ReactCompareSliderImage 
                  src="https://rochadigitalmidia.com.br/wp-content/uploads/2025/09/1-1024x1024.png" 
                  alt="Feed profissional" 
                  style={{ objectFit: 'cover' }} 
                />
              }
              handle={
                <div style={{ 
                  width: '48px', height: '48px', background: THEME.accent, 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', fontSize: '20px', color: '#000', 
                  boxShadow: `0 0 30px ${THEME.accent}`, userSelect: 'none', cursor: 'ew-resize',
                  border: '4px solid #fff'
                }}>↔</div>
              }
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '13px', fontWeight: 800, padding: '8px 20px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>❌ FEED AMADOR</span>
            <span style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', fontSize: '13px', fontWeight: 800, padding: '8px 20px', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)' }}>✅ FEED DE LUXO</span>
          </div>
        </div>
      </section>

      {/* SEÇÃO 9 — OBJEÇÃO */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(0,212,255,0.03)', border: `1px solid ${THEME.accent}33`, borderRadius: '32px', padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(0,163,196,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '24px' }}>❓</div>
          <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '20px' }}>"Mas e se meu concorrente usar o mesmo vídeo?"</h3>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '24px' }}>
            O vídeo é apenas o <strong style={{ color: '#fff' }}>ponto de partida</strong>. Você personaliza com sua cor, sua logo e sua copy. <br/> <br/>
            É como uma ferramenta: todos os marceneiros usam o mesmo tipo de serra, mas os móveis são únicos. Além disso, 99.9% das agências ainda estão no "amadorismo". <strong style={{ color: THEME.accent }}>Você será a exceção.</strong>
          </p>
        </div>
      </section>

      {/* SEÇÃO 10 — COMPARAÇÃO */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: THEME.accent, marginBottom: '16px' }}>CUSTO VS VALOR</p>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>Quanto custa ser amador?</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Agência de Design', price: 'R$1.500+/mês', items: ['❌ Entrega lenta', '❌ Sem vídeos 4K', '❌ Dependência total'], highlight: false },
              { label: 'Social Media', price: 'R$900+/mês', items: ['⚠️ Qualidade incerta', '⚠️ Raramente vídeos', '❌ Sem estratégia real'], highlight: false },
              { label: '✅ Canva Viagem', price: 'R$16,41/mês', items: ['✅ Acesso imediato', '✅ 300+ vídeos 4K', '✅ Garantia total'], highlight: true }
            ].map((opt, i) => (
              <div key={i} style={{ 
                background: opt.highlight ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.01)', 
                border: opt.highlight ? `2px solid ${THEME.accent}` : '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '24px', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                opacity: opt.highlight ? 1 : 0.6,
                boxShadow: opt.highlight ? '0 10px 40px rgba(0,212,255,0.1)' : 'none'
              }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '18px', color: opt.highlight ? THEME.accent : '#fff', margin: '0 0 12px' }}>{opt.label}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {opt.items.map(item => <span key={item} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{item}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>{opt.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 11 — GARANTIA */}
      <section style={{ padding: '0 20px 100px' }}>
        <div style={{ 
          maxWidth: '800px', margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(4,120,87,0.1))', 
          border: '1px solid rgba(34,197,94,0.2)', borderRadius: '32px', 
          padding: '60px 40px', textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ 
            width: '80px', height: '80px', background: 'rgba(34,197,94,0.1)', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 32px', fontSize: '40px'
          }}>🛡️</div>
          <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '20px' }}>Garantia Blindada de 7 Dias</h3>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '32px' }}>
            Se em 7 dias você olhar para o seu feed e não sentir orgulho da sua nova agência, basta um e-mail. Devolvemos cada centavo. <strong style={{ color: '#fff' }}>O risco é 100% nosso.</strong>
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {['STRIPE', 'HOTMART'].map(label => (
              <span key={label} style={{
                fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
                padding: '4px 10px', letterSpacing: '0.5px'
              }}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 12 — PRICING */}
      <section id="pricing" style={{ padding: '40px 20px 100px', background: THEME.bg }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: THEME.accent, marginBottom: '16px' }}>ACESSO DE PRÓXIMO NÍVEL</p>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>Escolha seu plano</h2>
            <p style={{ fontSize: '17px', color: THEME.textSecondary }}>Acesso imediato a todo o ecossistema assim que confirmar.</p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'start'
          }}>
            {/* PLANO MENSAL */}
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: THEME.border, 
              borderRadius: '32px', padding: '48px 40px'
            }}>
              <p style={{ fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '24px' }}>PLANO MENSAL</p>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>R$</span>
                  <span style={{ fontSize: '56px', fontWeight: 900, color: '#fff' }}>29</span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>,90</span>
                  <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>/mês</span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Cancele a qualquer momento</p>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['Acesso ilimitado ao acervo', '400+ artes editáveis', '11 IAs especialistas', 'Suporte via E-mail'].map(item => (
                  <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'rgba(255,255,255,0.6)' }}>
                    <Check size={16} className="text-white/20" /> {item}
                  </li>
                ))}
              </ul>

              <button 
                id="cta-pricing-monthly"
                onClick={() => handleCheckout("monthly")}
                style={{ 
                  width: '100%', padding: '18px', borderRadius: '12px', 
                  border: `2px solid ${THEME.accent}`, background: 'transparent',
                  color: THEME.accent, fontWeight: 800, fontSize: '15px', cursor: 'pointer',
                  letterSpacing: '0.5px', transition: 'background 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                ASSINAR MENSAL
              </button>
            </div>

            {/* PLANO ANUAL */}
            <div style={{ 
              background: 'linear-gradient(145deg, #071a2e 0%, #0d2640 100%)', 
              border: `2px solid ${THEME.accent}`, 
              borderRadius: '32px', padding: '56px 40px 48px',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,212,255,0.2)'
            }}>
              <div style={{ 
                position: 'absolute', top: '0', left: '50%', transform: 'translate(-50%, -50%)',
                background: THEME.accent, color: '#000', fontWeight: 900, fontSize: '12px',
                padding: '8px 20px', borderRadius: '100px', whiteSpace: 'nowrap',
                boxShadow: `0 10px 20px ${THEME.accent}33`
              }} className="animate-pulse-glow">
                🔥 MAIS ESCOLHIDO (ECONOMIZE R$160/ANO)
              </div>

              <p style={{ fontSize: '14px', fontWeight: 800, color: THEME.accent, letterSpacing: '1px', marginBottom: '24px' }}>PLANO ANUAL PRO</p>
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', margin: '0 0 4px' }}>de R$358,80/ano</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>R$</span>
                  <span style={{ fontSize: '72px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>16</span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>,41</span>
                  <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>/mês</span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>pago anualmente (R$197,00 vista ou 12x)</p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {[
                  'TUDO DO MENSAL +',
                  'Prioridade em novos destinos',
                  'E-book: Scripts High-End 🎁',
                  'Suporte VIP via WhatsApp',
                  'Acesso a lives exclusivas'
                ].map((item, idx) => (
                  <li key={item} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '16px', color: idx === 0 ? THEME.accent : '#fff', fontWeight: idx === 0 ? 800 : 500 }}>
                    <CheckCircle2 size={18} className={idx === 0 ? "text-cyan-400" : "text-cyan-500/50"} /> {item}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleCheckout("annual")}
                style={{ 
                  width: '100%', padding: '24px', borderRadius: '18px', 
                  background: '#00D4FF', 
                  color: '#000000',
                  fontWeight: 900, fontSize: '20px', cursor: 'pointer',
                  border: 'none', 
                  boxShadow: '0 15px 45px rgba(0,212,255,0.5)',
                  textTransform: 'uppercase'
                }}
                className="hover:scale-[1.03] active:scale-95 transition-all"
              >
                QUERO O PLANO ANUAL PRO →
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '20px' }}>⚡ Acesso liberado em menos de 2 minutos</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 13 — FAQ */}
      <section style={{ padding: '100px 20px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: THEME.accent, marginBottom: '16px' }}>PERGUNTAS FREQUENTES</p>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>Dúvidas? <span style={{ opacity: 0.6 }}>Nós respondemos.</span></h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'Os vídeos são exclusivos?', a: 'Cada vídeo é o ponto de partida. Ao adicionar seu logo e paleta no Canva, você cria um post único. A chance de dois concorrentes postarem exatamente a mesma coisa é mínima devido ao volume do nosso acervo.' },
              { q: 'Eu já comprei o Pack de 150 Reels na Hotmart/Kiwifi, é a mesma coisa?', a: <span>Não! O Pack de 150 Reels é apenas uma parte do que tem aqui. No Canva Viagem você recebe +100 novos vídeos, 400+ artes editáveis, calendário, scripts de venda, stories e ferramentas de IA. <a href="/diferencas" className="text-cyan-400 font-bold hover:underline">Clique aqui para ver todas as diferenças.</a></span> },
              { q: 'Funciona para agência pequena?', a: 'Com certeza. O Canva Viagem foi criado para quem não tem equipe de marketing. Você sozinho consegue ter um perfil de multinacional em 5 minutos por dia.' },
              { q: 'Como recebo o acesso?', a: 'Imediato. Assim que o pagamento (Hotmart ou Stripe) for confirmado, você recebe um e-mail com seus dados de login automáticos.' },
              { q: 'Posso cancelar quando quiser?', a: 'Sim. Sem letras miúdas. No plano mensal você cancela a qualquer mês. No anual, você garante 12 meses de acesso pelo menor preço do mercado.' }
            ].map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ 
        background: '#030508', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        padding: '80px 20px 120px', 
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '12px', letterSpacing: '1px' }}>CANVA VIAGEM</div>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px' }}>
            A plataforma definitiva para agências de turismo que buscam o próximo nível de autoridade e lucro.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '48px' }}>
            {['Início', 'Planos', 'Termos', 'Privacidade', 'Suporte'].map(link => (
              <a key={link} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600 }} href="#">{link}</a>
            ))}
          </div>

          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', lineHeight: 2 }}>
            © {new Date().getFullYear()} Canva Viagem · Todos os direitos reservados.<br/>
            Desenvolvido por Lucas Ferrari - CNPJ: 45.312.876/0001-22<br/>
            <span style={{ fontSize: '10px', opacity: 0.5 }}>Esta plataforma não possui vínculo oficial com a empresa Canva Pty Ltd.</span>
          </p>
        </div>
      </footer>

      <StickyCTA />
      <RecentBuyerToast />
    </div>
  );
}

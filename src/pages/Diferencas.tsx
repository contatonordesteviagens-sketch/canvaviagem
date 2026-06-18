import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, ChevronLeft, Zap, Star, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const THEME = {
  bg: '#050811',
  card: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  accent: '#00D4FF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
};

export default function Diferencas() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const comparison = [
    { feature: "Quantidade de Reels", pack: "150 Vídeos", platform: "250+ Vídeos (Crescendo)" },
    { feature: "Artes p/ Feed e Stories", pack: <X className="text-red-500" size={20} />, platform: "400+ Artes Editáveis" },
    { feature: "Atualizações", pack: "Pagamento Único", platform: "Novos conteúdos SEMANALMENTE" },
    { feature: "Inteligência Artificial", pack: <X className="text-red-500" size={20} />, platform: "11 Assistentes Especialistas" },
    { feature: "Calendário de Postagens", pack: <X className="text-red-500" size={20} />, platform: "Calendário Estratégico Mensal" },
    { feature: "Scripts de Venda", pack: <X className="text-red-500" size={20} />, platform: "Scripts p/ WhatsApp e DMs" },
    { feature: "Suporte", pack: "E-mail", platform: "Comunidade + WhatsApp VIP" },
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-white selection:bg-[#00D4FF] selection:text-[#050811] pb-20">
      {/* Header / Back Button */}
      <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <button 
          onClick={() => navigate("/inicio2")}
          className="flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} /> VOLTAR PARA PLANOS
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black tracking-widest mb-6 uppercase">
            Comparativo Oficial
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Por que o Canva Viagem é <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">
              muito mais que um Pack?
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Muitos clientes compram os nossos packs individuais em outras plataformas, mas a verdadeira escala do seu negócio acontece aqui dentro.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl"
        >
          <div className="grid grid-cols-3 bg-white/5 p-6 border-b border-white/10 text-center">
            <div className="text-left font-bold text-gray-500 text-xs uppercase tracking-widest">Recurso</div>
            <div className="font-bold text-gray-400">Pack 150 Reels</div>
            <div className="font-bold text-cyan-400 text-lg">Canva Viagem 🚀</div>
          </div>

          {comparison.map((item, i) => (
            <div key={i} className="grid grid-cols-3 p-6 border-b border-white/5 last:border-0 items-center hover:bg-white/5 transition-colors">
              <div className="text-sm font-bold text-gray-300">{item.feature}</div>
              <div className="text-center text-sm text-gray-500">{item.pack}</div>
              <div className="text-center text-sm font-black text-white flex justify-center items-center gap-2">
                {typeof item.platform === 'string' && <Check className="text-cyan-400" size={18} />}
                {item.platform}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Deep Dive Sections */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-4">O Problema do Pack Estático</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Quando você compra um pack avulso, você recebe uma pasta de arquivos. Com o tempo, esses conteúdos ficam saturados e você precisa gastar novamente para ter algo novo. Você fica "preso" ao que comprou no dia.
            </p>
          </div>

          <div className="bg-cyan-500/5 border border-cyan-500/20 p-8 rounded-3xl">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 text-cyan-400">
              <Zap />
            </div>
            <h3 className="text-xl font-bold mb-4 text-cyan-400">A Vantagem da Assinatura</h3>
            <p className="text-gray-300 leading-relaxed text-sm font-medium">
              O Canva Viagem é um ecossistema vivo. Toda semana nossa equipe de editores adiciona novos vídeos, novas artes de pacotes e novas inteligências artificiais. Você nunca mais precisará comprar outro pack na vida.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center bg-gradient-to-b from-transparent to-cyan-500/10 p-12 rounded-3xl border border-cyan-500/20">
          <div className="flex justify-center mb-6">
            <Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={32} />
          </div>
          <h2 className="text-3xl font-black mb-4">Pronto para o Próximo Nível?</h2>
          <p className="text-gray-400 mb-10 max-w-sm mx-auto">
            Comece agora e tenha acesso a tudo que vimos acima por menos de R$1/dia no plano anual.
          </p>
          <button 
            onClick={() => navigate("/inicio2")}
            className="bg-cyan-400 text-black font-black px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(0,212,255,0.3)] text-lg uppercase tracking-tight"
          >
            Escolher meu Plano agora →
          </button>
          <div className="mt-6 flex items-center justify-center gap-6 opacity-40">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"><Shield size={14} /> 7 Dias de Garantia</span>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"><Zap size={14} /> Ativação Instantânea</span>
          </div>
        </div>
      </div>
    </div>
  );
}

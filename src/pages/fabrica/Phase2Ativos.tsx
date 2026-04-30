import { useFabricaContext } from "@/hooks/useFabricaContext";
import { useContentItems, useCaptions } from "@/hooks/useContent";
import { getOfertasByNiche } from "@/data/fabrica-ofertas";
import { Copy, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const CHECKLIST_30: { week: string; tasks: { key: string; text: string }[] }[] = [
  {
    week: "Semana 1 — Bases",
    tasks: [
      { key: "s1-1", text: "Atualizar bio + foto de perfil + destaques" },
      { key: "s1-2", text: "Postar 1 carrossel apresentando a agência" },
      { key: "s1-3", text: "Gravar 1 Reels com gancho forte" },
    ],
  },
  {
    week: "Semana 2 — Provas e Ofertas",
    tasks: [
      { key: "s2-1", text: "Coletar e postar 3 depoimentos" },
      { key: "s2-2", text: "Lançar 1 oferta-âncora do nicho" },
      { key: "s2-3", text: "Postar 2 Reels (1 educativo + 1 emocional)" },
    ],
  },
  {
    week: "Semana 3 — Tráfego e Engajamento",
    tasks: [
      { key: "s3-1", text: "Subir 1 campanha de mensagens R$ 10/dia" },
      { key: "s3-2", text: "Postar 4x por semana + stories diários" },
      { key: "s3-3", text: "Responder TODOS comentários e DMs em até 1h" },
    ],
  },
  {
    week: "Semana 4 — Conversão",
    tasks: [
      { key: "s4-1", text: "Lançar oferta de 'última semana do mês'" },
      { key: "s4-2", text: "Coletar mais 3 depoimentos" },
      { key: "s4-3", text: "Análise: o que mais converteu? Replicar." },
    ],
  },
];

export const Phase2Ativos = ({ onNext, onBack }: Props) => {
  const { state, toggleChecklist } = useFabricaContext();
  const { data: videos = [] } = useContentItems(["video", "feed"]);
  const { data: captions = [] } = useCaptions();

  const userDestinos = state.destinos || [];
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Filtrar por destinos específicos do usuário (matching pelo título/destination)
  const matchesDestinos = (text: string) => {
    if (userDestinos.length === 0) return true;
    const t = normalize(text);
    return userDestinos.some((d) => {
      const nd = normalize(d);
      // pega primeira palavra (ex: "Maragogi - AL" -> match com "Maragogi")
      const main = nd.split(/[\s\-,]/)[0];
      return t.includes(main);
    });
  };

  const filteredVideos = userDestinos.length > 0
    ? videos.filter((v: any) => matchesDestinos(v.title || "")).slice(0, 12)
    : videos.slice(0, 8);

  const filteredCaptions = userDestinos.length > 0
    ? captions.filter((c: any) => matchesDestinos(c.destination || "") || matchesDestinos(c.text || "")).slice(0, 12)
    : captions.slice(0, 6);

  const ofertas = getOfertasByNiche(state.niche);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {userDestinos.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Filtrando conteúdo para</div>
          <div className="flex flex-wrap gap-1.5">
            {userDestinos.map((d) => (
              <span key={d} className="px-2.5 py-1 rounded-full text-[11px] font-bold text-black" style={{ background: state.primaryColor }}>{d}</span>
            ))}
          </div>
        </div>
      )}
      <FabricaCard title="🎬 Vídeos recomendados para seus destinos">
        {filteredVideos.length === 0 ? (
          <p className="text-white/50 text-sm">Carregando vídeos...</p>
        ) : (
          <div className="space-y-2">
            {filteredVideos.map((v: any, i: number) => (
              <a key={v.id} href={v.url} target="_blank" rel="noopener" className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 hover:border-white/20 transition-colors group">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0" style={{ background: `${state.primaryColor}33`, color: state.primaryColor }}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{v.title}</div>
                  <div className="text-[11px] text-white/50">{v.category || "Conteúdo"} • {v.type}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </FabricaCard>

      <FabricaCard title="✍️ Legendas prontas">
        {filteredCaptions.length === 0 ? (
          <p className="text-white/50 text-sm">Sem legendas disponíveis no momento.</p>
        ) : (
          <div className="space-y-3">
            {filteredCaptions.map((c: any) => (
              <div key={c.id} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: state.primaryColor }}>{c.destination}</div>
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed mb-3">{c.text}</p>
                {c.hashtags && <p className="text-xs text-white/40 mb-3">{c.hashtags}</p>}
                <button onClick={() => copy(`${c.text}\n\n${c.hashtags || ""}`)} className="text-xs px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors flex items-center gap-1.5">
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              </div>
            ))}
          </div>
        )}
      </FabricaCard>

      <FabricaCard title="🔥 Ofertas prontas para o seu nicho">
        <div className="space-y-3">
          {ofertas.map((o, i) => (
            <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
              <div className="text-sm font-bold text-white mb-2">{o.title}</div>
              <p className="text-sm text-white/75 whitespace-pre-wrap leading-relaxed mb-3">{o.text}</p>
              <button onClick={() => copy(`${o.title}\n\n${o.text}`)} className="text-xs px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors flex items-center gap-1.5">
                <Copy className="w-3 h-3" /> Copiar
              </button>
            </div>
          ))}
        </div>
      </FabricaCard>

      <FabricaCard title="📅 Plano de 30 dias">
        {CHECKLIST_30.map((wk) => (
          <div key={wk.week} className="mb-5 last:mb-0">
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: state.primaryColor }}>{wk.week}</div>
            <div className="space-y-1.5">
              {wk.tasks.map((t) => {
                const done = !!state.checklist30days[t.key];
                return (
                  <button key={t.key} onClick={() => toggleChecklist(t.key)} className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${done ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.03] border-white/[0.06] hover:border-white/15"}`}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${done ? "bg-emerald-500" : "border-2 border-white/20"}`}>
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-sm ${done ? "text-white/50 line-through" : "text-white/85"}`}>{t.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </FabricaCard>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 font-semibold hover:bg-white/[0.08] transition-colors">
          Voltar
        </button>
        <button onClick={onNext} className="flex-[2] py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:brightness-110" style={{ background: `linear-gradient(135deg, ${state.primaryColor}, #FCD34D)`, boxShadow: `0 8px 24px ${state.primaryColor}55` }}>
          Avançar para Destinos Ads <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const FabricaCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl">
    <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">{title}</h3>
    {children}
  </div>
);

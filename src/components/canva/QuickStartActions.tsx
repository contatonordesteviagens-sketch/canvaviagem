import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, Video, Wand2 } from "lucide-react";
import { useFabricaMetrics } from "@/hooks/useFabricaMetrics";

/**
 * Primeira tela do portal: em vez de 16 círculos e 5 banners, três caminhos claros
 * para quem acabou de entrar e não sabe por onde começar.
 */
export function QuickStartActions({ onReadyContent }: { onReadyContent: () => void }) {
  const navigate = useNavigate();
  const { newLeadsCount } = useFabricaMetrics();

  const actions = [
    {
      icon: Wand2,
      title: "Criar um anúncio",
      text: "Arte com sua marca e seu preço em 1 minuto",
      onClick: () => navigate("/fabrica/anuncio"),
      tone: "bg-violet-600 text-white",
    },
    {
      icon: Video,
      title: "Pegar um post pronto",
      text: "Vídeos e artes prontos para postar hoje",
      onClick: onReadyContent,
      tone: "bg-pink-500 text-white",
    },
    {
      icon: Users,
      title: newLeadsCount > 0 ? `Ver meus clientes (${newLeadsCount} novos)` : "Ver meus clientes",
      text: "Quem pediu orçamento no seu site",
      onClick: () => navigate("/fabrica/crm"),
      tone: "bg-emerald-500 text-white",
    },
  ];

  return (
    <div className="mx-auto mb-6 grid w-full max-w-4xl gap-3 sm:grid-cols-3">
      {actions.map(({ icon: Icon, title, text, onClick, tone }) => (
        <button
          key={title}
          type="button"
          onClick={onClick}
          className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
        >
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-foreground">{title}</span>
            <span className="block text-xs text-muted-foreground">{text}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </button>
      ))}
    </div>
  );
}

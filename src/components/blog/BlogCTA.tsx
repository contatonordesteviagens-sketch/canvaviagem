import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Gift, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCTAProps {
    type: "awareness" | "consideration" | "decision";
    className?: string;
}

export const BlogCTA = ({ type, className }: BlogCTAProps) => {
    const content = {
        awareness: {
            title: "💰 Transforme sua paixão em lucro",
            description: "Você sabia que pode faturar de R$ 2.000 a R$ 15.000/mês com turismo em casa? Conheça o modelo que mais cresce.",
            buttonText: "Ver como funciona",
            link: "/planos",
            icon: <Sparkles className="w-5 h-5" />,
            colors: "bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100",
        },
        consideration: {
            title: "🚀 O segredo das agências que vendem todo dia",
            description: "Não bata cabeça criando postagens. Tenha 250+ vídeos e artes prontas para postar agora no seu Instagram.",
            buttonText: "Acessar Biblioteca Pro",
            link: "/planos",
            icon: <Gift className="w-5 h-5" />,
            colors: "bg-zinc-950 text-white border-zinc-800 hover:bg-zinc-900",
        },
        decision: {
            title: "💎 Garanta seu acesso Premium",
            description: "Acesso completo à plataforma, 11 agentes de IA e atualizações semanais por apenas R$ 16,41/mês.",
            buttonText: "Assinar Agora - R$ 197/ano",
            link: "/planos",
            icon: <CreditCard className="w-5 h-5" />,
            colors: "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent hover:opacity-90 shadow-lg",
        },
    };

    const current = content[type];

    return (
        <div className={cn(
            "p-8 rounded-2xl border flex flex-col items-center text-center gap-4 transition-all duration-300 hover:shadow-xl",
            current.colors,
            className
        )}>
            <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black flex items-center justify-center gap-2">
                    {current.icon}
                    {current.title}
                </h3>
                <p className="text-base opacity-90 max-w-md mx-auto leading-relaxed">
                    {current.description}
                </p>
            </div>
            <Button asChild className="w-full sm:w-auto h-12 px-10 rounded-xl font-black gap-2 group text-base">
                <Link to={current.link}>
                    {current.buttonText}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </Button>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">
                Acesso imediato • 7 dias de garantia • Pagamento Seguro
            </p>
        </div>
    );
};

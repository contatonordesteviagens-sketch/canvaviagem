import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Gift, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCTAProps {
    type: "main" | "free" | "sale";
    className?: string;
}

export const BlogCTA = ({ type, className }: BlogCTAProps) => {
    const content = {
        main: {
            title: "🚀 Use a Ferramenta Principal",
            description: "Acesse agora a biblioteca completa de vídeos e artes para sua agência.",
            buttonText: "Acessar Canva Viagem",
            link: "/",
            icon: <Sparkles className="w-5 h-5" />,
            colors: "bg-zinc-950 text-white border-zinc-800 hover:bg-zinc-900",
        },
        free: {
            title: "🎁 Comece de Graça",
            description: "Teste nossas ferramentas de IA e alguns templates sem pagar nada.",
            buttonText: "Experimentar Versão Grátis",
            link: "/?category=free",
            icon: <Gift className="w-5 h-5" />,
            colors: "bg-white text-zinc-950 border-zinc-200 hover:bg-zinc-50",
        },
        sale: {
            title: "💎 Oferta Especial: Plano Anual",
            description: "Tenha acesso ilimitado por apenas R$ 16,41/mês (Total R$ 197/ano).",
            buttonText: "Assinar Agora e Economizar",
            link: "/planos",
            icon: <CreditCard className="w-5 h-5" />,
            colors: "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent hover:opacity-90 shadow-lg",
        },
    };

    const current = content[type];

    return (
        <div className={cn(
            "p-6 rounded-2xl border flex flex-col items-center text-center gap-4 transition-all duration-300 hover:shadow-xl",
            current.colors,
            className
        )}>
            <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black flex items-center justify-center gap-2">
                    {current.icon}
                    {current.title}
                </h3>
                <p className="text-sm opacity-80 max-w-sm mx-auto">
                    {current.description}
                </p>
            </div>
            <Button asChild className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold gap-2 group">
                <Link to={current.link}>
                    {current.buttonText}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </Button>
        </div>
    );
};

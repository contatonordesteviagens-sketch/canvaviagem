import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { PageSkeleton } from "@/components/skeletons/PageSkeleton";
import { useRef } from "react";
import { isLocalPreviewEnabled } from "@/lib/localPreview";
import { BLACK_FUNNEL_PATH } from "@/lib/black-funnel";
import { UpgradeEliteTela } from "@/components/UpgradeElite";

const SUPORTE_WHATSAPP = "https://wa.me/5585986411294?text=";

/**
 * Tela para quem ESTÁ logado mas não tem o acesso que a página pede.
 * Antes, essa pessoa ia direto para a página de vendas e achava que o link de acesso estava quebrado.
 */
function AvisoDeAcesso({ motivo, email }: { motivo: "sem_assinatura" | "precisa_elite"; email?: string | null }) {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const semAssinatura = motivo === "sem_assinatura";
    // assinante Start: em vez de só avisar, mostra o que o Elite libera e o botão de upgrade
    if (!semAssinatura) return <UpgradeEliteTela email={email} voltar={() => navigate("/", { replace: true })} />;
    const texto = encodeURIComponent(
        semAssinatura
            ? `Olá! Comprei o Canva Viagem mas não consigo acessar. Meu e-mail de login é ${email || ""}.`
            : `Olá! Sou assinante do Canva Viagem (${email || ""}) e quero liberar a Fábrica e o Gerador de vídeo.`,
    );
    const trocarEmail = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] p-5 text-white">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h1 className="text-[22px] font-black leading-tight">
                    {semAssinatura ? "Não encontramos uma assinatura neste e-mail" : "Este recurso é do plano Elite"}
                </h1>
                <p className="mt-3 text-[15px] leading-6 text-white/75">
                    {semAssinatura ? (
                        <>
                            Você entrou com <b className="text-white">{email || "este e-mail"}</b>, mas não há assinatura ativa ligada a ele.
                            Se você pagou com outro e-mail, entre com o e-mail usado na compra. Se não der certo, fale com a gente que liberamos na hora.
                        </>
                    ) : (
                        <>
                            Seu acesso está ativo e a biblioteca de vídeos, artes e legendas continua liberada.
                            A Fábrica e o Gerador de vídeo fazem parte do plano Elite.
                        </>
                    )}
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                    {semAssinatura ? (
                        <>
                            <button onClick={trocarEmail} className="min-h-12 rounded-2xl text-[15px] font-black text-black" style={{ background: "#F5F906" }}>
                                Entrar com o e-mail da compra
                            </button>
                            <a href={SUPORTE_WHATSAPP + texto} target="_blank" rel="noreferrer" className="grid min-h-12 place-items-center rounded-2xl bg-white/[0.08] text-[15px] font-bold">
                                Falar com o suporte no WhatsApp
                            </a>
                            <button onClick={() => navigate(BLACK_FUNNEL_PATH)} className="min-h-11 text-[14px] font-semibold text-white/60">
                                Ainda não assinei: ver os planos
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate("/", { replace: true })} className="min-h-12 rounded-2xl text-[15px] font-black text-black" style={{ background: "#F5F906" }}>
                                Ir para a minha biblioteca
                            </button>
                            <a href={SUPORTE_WHATSAPP + texto} target="_blank" rel="noreferrer" className="grid min-h-12 place-items-center rounded-2xl bg-white/[0.08] text-[15px] font-bold">
                                Quero liberar o Elite
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireSubscription?: boolean;
    requireElite?: boolean;
    requireAdmin?: boolean;
    allowExternalBlog?: boolean;
}

export const ProtectedRoute = ({
    children,
    requireSubscription = false,
    requireElite = false,
    requireAdmin = false,
    allowExternalBlog = false
}: ProtectedRouteProps) => {
    const location = useLocation();
    const { user, loading, isAdmin, subscription } = useAuth();
    const { can, loading: entitlementsLoading } = useEntitlements();
    // Quem já entrou nesta tela continua nela enquanto as permissões são reconferidas em segundo plano.
    // Antes, cada reconferência trocava a página pelo carregador e apagava o que estava em andamento
    // (ex.: os vídeos sendo gerados na Fábrica sumiam no meio).
    const liberadoPara = useRef<string | null>(null);

    // Liberar acesso público irrestrito ao Blog (/blog) e postagens para indexação e SEO do Google
    if (location.pathname.startsWith("/blog")) {
        return <>{children}</>;
    }

    const isFromInternal = (location.state as any)?.fromInternal === true;
    const localPreview = isLocalPreviewEnabled();

    const needsSubscriptionState = requireSubscription || requireElite;

    if (loading || (needsSubscriptionState && (entitlementsLoading || subscription.loading))) {
        if (user && liberadoPara.current === user.id) return <>{children}</>;
        return <PageSkeleton pathname={location.pathname} />;
    }

    // Special logic for Blog Posts:
    // Allow access if !user ONLY IF it's an external landing (not fromInternal)
    if (allowExternalBlog && !user && !isFromInternal) {
        return <>{children}</>;
    }



    // 1. Check Login
    if (!user && !localPreview) {
        // Página principal: quem não está logado vai para a página inicial de vendas, não para o login.
        const path = location.pathname.replace(/\/+$/, "") || "/";
        if (path === "/" || path === "/pt") return <Navigate to={`/inicio${location.search}`} replace />;
        if (path === "/es") return <Navigate to={`/es/inicio${location.search}`} replace />;

        // Redirect to auth, saving the location they tried to access
        // Mantém a query (ex.: /checkout?plano=annual&metodo=pix) para voltar ao mesmo lugar depois do login.
        return <Navigate to={`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`} replace />;
    }

    // 2. Check Admin (if required)
    if (requireAdmin && !isAdmin && !localPreview) {
        return <Navigate to="/" replace />;
    }

    // 3. Check Subscription (if required)
    // Note: Admins bypass subscription checks ensuring they can access everything
    if (requireSubscription && !can("library.premium.open") && !isAdmin && !localPreview) {
        // logado sem assinatura encontrada: explica e oferece trocar de e-mail ou suporte (antes: página de vendas)
        return <AvisoDeAcesso motivo="sem_assinatura" email={user?.email} />;
    }

    if (requireElite && !can("vendedor.use") && !isAdmin && !localPreview) {
        // assinante Start (ex.: Hotmart antigo) tentando abrir a Fábrica: explica em vez de mandar para vendas
        if (can("library.premium.open")) return <AvisoDeAcesso motivo="precisa_elite" email={user?.email} />;
        return <AvisoDeAcesso motivo="sem_assinatura" email={user?.email} />;
    }

    liberadoPara.current = user?.id ?? null;
    return <>{children}</>;
};

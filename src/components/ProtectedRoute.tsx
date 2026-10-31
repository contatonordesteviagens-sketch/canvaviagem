import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { Loader2 } from "lucide-react";
import { isLocalPreviewEnabled } from "@/lib/localPreview";

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

    // Liberar acesso público irrestrito ao Blog (/blog) e postagens para indexação e SEO do Google
    if (location.pathname.startsWith("/blog")) {
        return <>{children}</>;
    }

    const isFromInternal = (location.state as any)?.fromInternal === true;
    const localPreview = isLocalPreviewEnabled();

    const needsSubscriptionState = requireSubscription || requireElite;

    if (loading || (needsSubscriptionState && (entitlementsLoading || subscription.loading))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
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
        return <Navigate to="/inicio" replace />;
    }

    if (requireElite && !can("vendedor.use") && !isAdmin && !localPreview) {
        return <Navigate to="/inicio" replace />;
    }

    return <>{children}</>;
};

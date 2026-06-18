import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

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

    // Liberar acesso público irrestrito ao Blog (/blog) e postagens para indexação e SEO do Google
    if (location.pathname.startsWith("/blog")) {
        return <>{children}</>;
    }

    const { user, loading, subscription, isAdmin } = useAuth();
    const isFromInternal = (location.state as any)?.fromInternal === true;

    const needsSubscriptionState = requireSubscription || requireElite;

    if (loading || (needsSubscriptionState && subscription.loading)) {
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
    if (!user) {
        // Redirect to auth, saving the location they tried to access
        return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    // 2. Check Admin (if required)
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // 3. Check Subscription (if required)
    // Note: Admins bypass subscription checks ensuring they can access everything
    if (requireSubscription && !subscription.subscribed && !isAdmin) {
        return <Navigate to="/inicio2" replace />;
    }

    const isStart = subscription.subscribed && 
      (subscription.productId?.includes("smart") || 
       subscription.productId?.includes("start") || 
       subscription.productId?.includes("basic"));
    const isElite = subscription.subscribed && !isStart;

    if (requireElite && !isElite && !isAdmin) {
        return <Navigate to="/fabrica" replace />;
    }

    return <>{children}</>;
};

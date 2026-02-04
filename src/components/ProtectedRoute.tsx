import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireSubscription?: boolean;
    requireAdmin?: boolean;
}

export const ProtectedRoute = ({
    children,
    requireSubscription = false,
    requireAdmin = false
}: ProtectedRouteProps) => {
    const { user, loading, subscription, isAdmin } = useAuth();
    const location = useLocation();

    if (loading || (requireSubscription && subscription.loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
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
        return <Navigate to="/planos" replace />;
    }

    return <>{children}</>;
};

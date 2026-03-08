import { useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useContent";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Wrench,
  LogOut,
  Home,
  Loader2,
  TrendingUp,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/marketing", label: "Marketing", icon: TrendingUp },
  { path: "/admin/content", label: "Conteúdos", icon: FileText },
  { path: "/admin/captions", label: "Legendas", icon: MessageSquare },
  { path: "/admin/tools", label: "Ferramentas", icon: Wrench },
  { path: "/admin/hotmart", label: "Hotmart", icon: ShoppingBag },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false && user) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, user, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[hsl(220,15%,8%)] text-slate-200 flex">
      {/* Sidebar with Glassmorphism */}
      <aside className="w-64 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800 flex flex-col shadow-2xl">
        <div className="p-8 border-b border-slate-800/50">
          <h1 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            CANVA TRIP
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-1">
            Admin Management
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 pt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                location.pathname === item.path
                  ? "bg-gradient-to-r from-primary/20 to-accent/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                  : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-100"
              )}
            >
              {location.pathname === item.path && (
                <div className="absolute left-0 w-1 h-6 bg-primary rounded-full" />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                location.pathname === item.path ? "text-primary" : "text-slate-500"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50 space-y-2 pb-8">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/40 text-slate-400 hover:text-slate-100 transition-all group"
          >
            <Home className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
            <span className="text-sm">Ver Platforma</span>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-xl px-4"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Encerrar Sessão</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const location = useLocation();
  const { user, signOut, subscription } = useAuth();

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    } finally {
      setLoadingPortal(false);
    }
  };

  const navItems = [
    { to: "/", label: "Início", icon: "🏠" },
    { to: "/calendar", label: "Calendário", icon: "📅" },
    { to: "/planos", label: "Planos", icon: "💳" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <span className="text-xl">🎬</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline">Canva Viagens</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10"
              activeClassName="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          
          {user ? (
            <>
              {subscription.subscribed && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                  className="ml-2"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loadingPortal ? "Carregando..." : "Gerenciar Assinatura"}
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="ml-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="ml-2">
                <User className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-2 mt-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10"
                  activeClassName="bg-primary text-primary-foreground"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              
              {user ? (
                <>
                  {subscription.subscribed && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleManageSubscription();
                        setIsOpen(false);
                      }}
                      disabled={loadingPortal}
                      className="justify-start mt-4"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {loadingPortal ? "Carregando..." : "Gerenciar Assinatura"}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="justify-start mt-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full mt-4">
                    <User className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTrackUtm } from "@/hooks/useTrackUtm";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Auth from "./pages/Auth";
import Planos from "./pages/Planos";
import Sucesso from "./pages/Sucesso";
import Obrigado from "./pages/Obrigado";
import PosPagamento from "./pages/PosPagamento";
import NotFound from "./pages/NotFound";
import Gestao from "./pages/Gestao";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ContentManager from "./pages/admin/ContentManager";
import CaptionsManager from "./pages/admin/CaptionsManager";
import ToolsManager from "./pages/admin/ToolsManager";
import Marketing from "./pages/admin/Marketing";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import ProximoNivel from "./pages/ProximoNivel";
import AuthVerify from "./pages/AuthVerify";
import LanguageRedirect from "./components/LanguageRedirect";

const queryClient = new QueryClient();

// Componente para rastreamento de UTM
const UtmTracker = () => {
  useTrackUtm();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <UtmTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/verify" element={<AuthVerify />} />
                <Route path="/planos" element={<Planos />} />
                <Route path="/sucesso" element={<Sucesso />} />
                <Route path="/obrigado" element={<Obrigado />} />
                <Route path="/pos-pagamento" element={<PosPagamento />} />
                <Route path="/gestao" element={<Gestao />} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/proximo-nivel" element={<ProximoNivel />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="marketing" element={<Marketing />} />
                  <Route path="content" element={<ContentManager />} />
                  <Route path="captions" element={<CaptionsManager />} />
                  <Route path="tools" element={<ToolsManager />} />
                </Route>
                
                {/* Language Routes - Redirect with language setting */}
                <Route path="/es/*" element={<LanguageRedirect />} />
                <Route path="/pt/*" element={<LanguageRedirect />} />
                <Route path="/es" element={<LanguageRedirect />} />
                <Route path="/pt" element={<LanguageRedirect />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

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
import IndexES from "./pages/IndexES";
import Calendar from "./pages/Calendar";
import CalendarES from "./pages/CalendarES";
import Auth from "./pages/Auth";
import Planos from "./pages/Planos";
import PlanosES from "./pages/PlanosES";
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
import WhatsAppButton from "@/components/WhatsAppButton";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
              <WhatsAppButton />
              <Routes>
                {/* ROTAS PORTUGUÊS */}
                <Route path="/" element={<Index />} />
                <Route path="/pt" element={<Index />} />
                <Route path="/calendar" element={
                  <ProtectedRoute requireSubscription>
                    <Calendar />
                  </ProtectedRoute>
                } />
                <Route path="/pt/calendar" element={
                  <ProtectedRoute requireSubscription>
                    <Calendar />
                  </ProtectedRoute>
                } />
                <Route path="/planos" element={<Planos />} />
                <Route path="/pt/planos" element={<Planos />} />

                {/* ROTAS ESPANHOL - PÁGINAS INDEPENDENTES */}
                <Route path="/es" element={<IndexES />} />
                <Route path="/es/calendar" element={
                  <ProtectedRoute requireSubscription>
                    <CalendarES />
                  </ProtectedRoute>
                } />
                <Route path="/es/planos" element={<PlanosES />} />

                {/* Auth e outras rotas compartilhadas */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/verify" element={<AuthVerify />} />
                <Route path="/sucesso" element={<Sucesso />} />
                <Route path="/obrigado" element={<Obrigado />} />
                <Route path="/pos-pagamento" element={<PosPagamento />} />
                <Route path="/gestao" element={
                  <ProtectedRoute requireSubscription>
                    <Gestao />
                  </ProtectedRoute>
                } />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/proximo-nivel" element={
                  <ProtectedRoute requireSubscription>
                    <ProximoNivel />
                  </ProtectedRoute>
                } />
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="marketing" element={<Marketing />} />
                  <Route path="content" element={<ContentManager />} />
                  <Route path="captions" element={<CaptionsManager />} />
                  <Route path="tools" element={<ToolsManager />} />
                </Route>

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

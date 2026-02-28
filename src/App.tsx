import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTrackUtm } from "@/hooks/useTrackUtm";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Suspense, lazy } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";

// Lazy-loaded components for better performance
const Index = lazy(() => import("./pages/Index"));
const IndexES = lazy(() => import("./pages/IndexES"));
const Calendar = lazy(() => import("./pages/Calendar"));
const CalendarES = lazy(() => import("./pages/CalendarES"));
const Auth = lazy(() => import("./pages/Auth"));
const Planos = lazy(() => import("./pages/Planos"));
const PlanosES = lazy(() => import("./pages/PlanosES"));
const Sucesso = lazy(() => import("./pages/Sucesso"));
const Obrigado = lazy(() => import("./pages/Obrigado"));
const ObrigadoES = lazy(() => import("./pages/ObrigadoES"));
const PosPagamento = lazy(() => import("./pages/PosPagamento"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Gestao = lazy(() => import("./pages/Gestao"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ContentManager = lazy(() => import("./pages/admin/ContentManager"));
const CaptionsManager = lazy(() => import("./pages/admin/CaptionsManager"));
const ToolsManager = lazy(() => import("./pages/admin/ToolsManager"));
const Marketing = lazy(() => import("./pages/admin/Marketing"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const ProximoNivel = lazy(() => import("./pages/ProximoNivel"));
const Progresso = lazy(() => import("./pages/Progresso"));
const Sugestoes = lazy(() => import("./pages/Sugestoes"));
const AuthVerify = lazy(() => import("./pages/AuthVerify"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
  </div>
);

const queryClient = new QueryClient();

// Componente para rastreamento de UTM
const UtmTracker = () => {
  useTrackUtm();
  return null;
};

const App = () => (
  <HelmetProvider>
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

                <Suspense fallback={<PageLoader />}>
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
                    <Route path="/es/obrigado" element={<ObrigadoES />} />

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
                    <Route path="/progresso" element={
                      <ProtectedRoute>
                        <Progresso />
                      </ProtectedRoute>
                    } />
                    <Route path="/sugestoes" element={<Sugestoes />} />
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
                </Suspense>
              </BrowserRouter>
            </LanguageProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

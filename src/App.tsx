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
const HotmartManager = lazy(() => import("./pages/admin/HotmartManager"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const ProximoNivel = lazy(() => import("./pages/ProximoNivel"));
const Progresso = lazy(() => import("./pages/Progresso"));
const Sugestoes = lazy(() => import("./pages/Sugestoes"));
const AuthVerify = lazy(() => import("./pages/AuthVerify"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogPost2 = lazy(() => import("./pages/BlogPost2"));
const BlogPost3 = lazy(() => import("./pages/BlogPost3"));
const BlogPost4 = lazy(() => import("./pages/BlogPost4"));
const BlogPost5 = lazy(() => import("./pages/BlogPost5"));
const BlogPost6 = lazy(() => import("./pages/BlogPost6"));
const BlogPost7 = lazy(() => import("./pages/BlogPost7"));
const BlogPost8 = lazy(() => import("./pages/BlogPost8"));
const BlogPost9 = lazy(() => import("./pages/BlogPost9"));
const BlogPost10 = lazy(() => import("./pages/BlogPost10"));
const BlogPost11 = lazy(() => import("./pages/BlogPost11"));
const BlogPost12 = lazy(() => import("./pages/BlogPost12"));
const BlogPost13 = lazy(() => import("./pages/BlogPost13"));
const BlogPost14 = lazy(() => import("./pages/BlogPost14"));
const BlogPost15 = lazy(() => import("./pages/BlogPost15"));
const BlogPost16 = lazy(() => import("./pages/BlogPost16"));
const BlogPost17 = lazy(() => import("./pages/BlogPost17"));
const BlogPost18 = lazy(() => import("./pages/BlogPost18"));
const BlogPost19 = lazy(() => import("./pages/BlogPost19"));
const BlogPost20 = lazy(() => import("./pages/BlogPost20"));
const BlogPost21 = lazy(() => import("./pages/BlogPost21"));
const BlogPost22 = lazy(() => import("./pages/BlogPost22"));
const BlogPost23 = lazy(() => import("./pages/BlogPost23"));
const BlogPost24 = lazy(() => import("./pages/BlogPost24"));
const BlogPost25 = lazy(() => import("./pages/BlogPost25"));
const BlogPost26 = lazy(() => import("./pages/BlogPost26"));
const BlogPost27 = lazy(() => import("./pages/BlogPost27"));
const BlogPost28 = lazy(() => import("./pages/BlogPost28"));
const BlogPost29 = lazy(() => import("./pages/BlogPost29"));
const BlogPost30 = lazy(() => import("./pages/BlogPost30"));
const Blog = lazy(() => import("./pages/Blog"));

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
                      <Route path="hotmart" element={<HotmartManager />} />
                    </Route>

                    {/* ROTAS DO BLOG - Posts originais */}
                    <Route path="/blog/o-que-postar-no-instagram-agencia-de-viagem" element={<BlogPost />} />
                    <Route path="/blog/como-criar-conteudo-agencia-de-viagem-sem-gravar-video" element={<BlogPost2 />} />
                    <Route path="/blog/marketing-digital-para-agencia-de-viagem" element={<BlogPost3 />} />
                    <Route path="/blog/destinos-nacionais-tendencia-2026" element={<BlogPost4 />} />
                    <Route path="/blog/converter-seguidores-whatsapp" element={<BlogPost5 />} />
                    <Route path="/blog/fechar-vendas-grupos-viagem" element={<BlogPost6 />} />
                    <Route path="/blog/trafego-pago-agentes-viagem" element={<BlogPost7 />} />
                    <Route path="/blog/poder-nicho-turismo" element={<BlogPost8 />} />
                    <Route path="/blog/chatgpt-roteiros-viagem" element={<BlogPost9 />} />
                    <Route path="/blog/pos-venda-fidelizacao-turismo" element={<BlogPost10 />} />
                    {/* ROTAS DO BLOG - 20 Novos Posts SEO (Funil Completo) */}
                    <Route path="/blog/como-ganhar-dinheiro-extra-com-viagens" element={<BlogPost11 />} />
                    <Route path="/blog/como-se-tornar-agente-de-viagens" element={<BlogPost12 />} />
                    <Route path="/blog/quanto-ganha-agente-de-viagens" element={<BlogPost13 />} />
                    <Route path="/blog/instagram-para-agente-de-viagens" element={<BlogPost14 />} />
                    <Route path="/blog/destinos-internacionais-mais-vendem-agentes" element={<BlogPost15 />} />
                    <Route path="/blog/script-vendas-whatsapp-agente-viagens" element={<BlogPost16 />} />
                    <Route path="/blog/canva-para-agencia-de-viagem" element={<BlogPost17 />} />
                    <Route path="/blog/vender-pacotes-lua-de-mel-agente-viagem" element={<BlogPost18 />} />
                    <Route path="/blog/melhores-destinos-nacionais-familia-2026" element={<BlogPost19 />} />
                    <Route path="/blog/trabalhar-de-casa-com-turismo" element={<BlogPost20 />} />
                    <Route path="/blog/calendario-conteudo-agencia-de-viagem" element={<BlogPost21 />} />
                    <Route path="/blog/ia-para-agentes-de-viagem" element={<BlogPost22 />} />
                    <Route path="/blog/criar-grupo-viagem-lucrativo-whatsapp" element={<BlogPost23 />} />
                    <Route path="/blog/reels-agencia-de-viagem" element={<BlogPost24 />} />
                    <Route path="/blog/seguro-viagem-guia-agente-turismo" element={<BlogPost25 />} />
                    <Route path="/blog/roteiro-europa-brasileiros-2026" element={<BlogPost26 />} />
                    <Route path="/blog/cruzeiros-para-brasileiros-2026" element={<BlogPost27 />} />
                    <Route path="/blog/identidade-visual-agencia-de-viagem" element={<BlogPost28 />} />
                    <Route path="/blog/fidelizar-clientes-agencia-de-viagem" element={<BlogPost29 />} />
                    <Route path="/blog/primeiro-mes-agente-de-viagem" element={<BlogPost30 />} />
                    <Route path="/blog" element={<Blog />} />

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

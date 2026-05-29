import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTrackUtm } from "@/hooks/useTrackUtm";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";

// Lazy-loaded components for better performance
const Index = lazy(() => import("./pages/Index"));
const IndexES = lazy(() => import("./pages/IndexES"));
const Calendar = lazy(() => import("./pages/Calendar"));
const CalendarES = lazy(() => import("./pages/CalendarES"));
const Auth = lazy(() => import("./pages/Auth"));
const LiveStream = lazy(() => import("./pages/LiveStream"));


const PlanosES = lazy(() => import("./pages/PlanosES"));
const SalesPageES = lazy(() => import("./pages/SalesPageES"));
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
const LiveManager = lazy(() => import("./pages/admin/LiveManager"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const ExclusaoDados = lazy(() => import("./pages/ExclusaoDados"));
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
const BlogPost31 = lazy(() => import("./pages/BlogPost31"));
const BlogPost32 = lazy(() => import("./pages/BlogPost32"));
const BlogPost33 = lazy(() => import("./pages/BlogPost33"));
const BlogPost34 = lazy(() => import("./pages/BlogPost34"));
const BlogPost35 = lazy(() => import("./pages/BlogPost35"));
const BlogPost36 = lazy(() => import("./pages/BlogPost36"));
const BlogPost37 = lazy(() => import("./pages/BlogPost37"));
const BlogPost38 = lazy(() => import("./pages/BlogPost38"));
const BlogPost39 = lazy(() => import("./pages/BlogPost39"));
const BlogPost40 = lazy(() => import("./pages/BlogPost40"));
const BlogPost41 = lazy(() => import("./pages/BlogPost41"));
const BlogPost42 = lazy(() => import("./pages/BlogPost42"));
const BlogPost43 = lazy(() => import("./pages/BlogPost43"));
const BlogPost44 = lazy(() => import("./pages/BlogPost44"));
const BlogPost45 = lazy(() => import("./pages/BlogPost45"));
const BlogPost46 = lazy(() => import("./pages/BlogPost46"));
const BlogPost47 = lazy(() => import("./pages/BlogPost47"));
const BlogPost48 = lazy(() => import("./pages/BlogPost48"));
const BlogPost49 = lazy(() => import("./pages/BlogPost49"));
const BlogPost50 = lazy(() => import("./pages/BlogPost50"));
const Blog = lazy(() => import("./pages/Blog"));
const AulaSecreta = lazy(() => import("./pages/AulaSecreta"));
const Inicio = lazy(() => import("./pages/Inicio"));
const CanvaClone = lazy(() => import("./pages/CanvaClone"));
const SalesPage = lazy(() => import("./pages/SalesPage"));
const Diferencas = lazy(() => import("./pages/Diferencas"));
const MinhaConta = lazy(() => import("./pages/MinhaConta"));
const Fabrica = lazy(() => import("./pages/Fabrica"));
const FabricaES = lazy(() => import("./pages/FabricaES"));
const PainelMarketing = lazy(() => import("./pages/PainelMarketing"));
const SiteViewer = lazy(() => import("./pages/SiteViewer"));
const VendedorIA = lazy(() => import("./pages/vendedor-ia/VendedorIA"));

const RESERVED_CANVA_VIAGEM_SUBDOMAINS = new Set([
  "www",
  "app",
  "admin",
  "api",
  "painel",
  "blog",
]);

const getCanvaViagemSiteSlug = () => {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname.toLowerCase();
  const baseDomain = "canvaviagem.com";
  const sitesDomain = `sites.${baseDomain}`;
  const sitesSuffix = `.${sitesDomain}`;
  const suffix = `.${baseDomain}`;

  if (hostname.endsWith(sitesSuffix)) {
    const subdomain = hostname.slice(0, -sitesSuffix.length);
    if (!subdomain || subdomain.includes(".")) return null;
    if (RESERVED_CANVA_VIAGEM_SUBDOMAINS.has(subdomain)) return null;
    return subdomain;
  }

  if (!hostname.endsWith(suffix)) return null;

  const subdomain = hostname.slice(0, -suffix.length);
  if (!subdomain || subdomain.includes(".")) return null;
  if (RESERVED_CANVA_VIAGEM_SUBDOMAINS.has(subdomain)) return null;

  return subdomain;
};

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

const App = () => {
  const canvaViagemSiteSlug = getCanvaViagemSiteSlug();

  return (
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

                <Suspense fallback={<PageLoader />}>
                  {canvaViagemSiteSlug ? (
                    <SiteViewer forcedId={canvaViagemSiteSlug} />
                  ) : (
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
                    <Route path="/planos" element={<SalesPage />} />
                    <Route path="/pt/planos" element={<SalesPage />} />
                    <Route path="/inicio" element={<Inicio />} />
                    <Route path="/canva" element={<CanvaClone />} />
                    <Route path="/diferencas" element={<Diferencas />} />
                    <Route path="/imersao-ao-vivo" element={<AulaSecreta />} />
                    <Route path="/fabrica" element={<Fabrica />} />
                    <Route path="/vendedor-ia" element={
                      <ProtectedRoute requireSubscription>
                        <VendedorIA />
                      </ProtectedRoute>
                    } />
                    <Route path="/live-aovivo" element={<LiveStream />} />
                    <Route path="/painel-marketing" element={
                      <ProtectedRoute requireElite>
                        <PainelMarketing />
                      </ProtectedRoute>
                    } />
                    <Route path="/aula-secreta" element={<Navigate to="/imersao-ao-vivo" replace />} />

                    {/* ROTAS ESPANHOL - PÁGINAS INDEPENDENTES */}
                    <Route path="/es" element={<IndexES />} />
                    <Route path="/es/calendar" element={
                      <ProtectedRoute requireSubscription>
                        <CalendarES />
                      </ProtectedRoute>
                    } />
                    <Route path="/es/planos" element={<SalesPageES />} />
                    <Route path="/es/obrigado" element={<ObrigadoES />} />
                    <Route path="/es/fabrica" element={<FabricaES />} />

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
                    <Route path="/exclusao-de-dados" element={<ExclusaoDados />} />
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
                    <Route path="/minha-conta" element={
                      <ProtectedRoute>
                        <MinhaConta />
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
                      <Route path="hotmart" element={<HotmartManager />} />
                      <Route path="live" element={<LiveManager />} />
                    </Route>

                    {/* ROTAS DO BLOG - Posts originais */}
                    <Route path="/blog/o-que-postar-no-instagram-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost /></ProtectedRoute>} />
                    <Route path="/blog/como-criar-conteudo-agencia-de-viagem-sem-gravar-video" element={<ProtectedRoute allowExternalBlog><BlogPost2 /></ProtectedRoute>} />
                    <Route path="/blog/marketing-digital-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost3 /></ProtectedRoute>} />
                    <Route path="/blog/destinos-nacionais-tendencia-2026" element={<ProtectedRoute allowExternalBlog><BlogPost4 /></ProtectedRoute>} />
                    <Route path="/blog/converter-seguidores-whatsapp" element={<ProtectedRoute allowExternalBlog><BlogPost5 /></ProtectedRoute>} />
                    <Route path="/blog/fechar-vendas-grupos-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost6 /></ProtectedRoute>} />
                    <Route path="/blog/trafego-pago-agentes-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost7 /></ProtectedRoute>} />
                    <Route path="/blog/poder-nicho-turismo" element={<ProtectedRoute allowExternalBlog><BlogPost8 /></ProtectedRoute>} />
                    <Route path="/blog/chatgpt-roteiros-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost9 /></ProtectedRoute>} />
                    <Route path="/blog/pos-venda-fidelizacao-turismo" element={<ProtectedRoute allowExternalBlog><BlogPost10 /></ProtectedRoute>} />
                    {/* ROTAS DO BLOG - 20 Novos Posts SEO (Funil Completo) */}
                    <Route path="/blog/como-ganhar-dinheiro-extra-com-viagens" element={<ProtectedRoute allowExternalBlog><BlogPost11 /></ProtectedRoute>} />
                    <Route path="/blog/como-se-tornar-agente-de-viagens" element={<ProtectedRoute allowExternalBlog><BlogPost12 /></ProtectedRoute>} />
                    <Route path="/blog/quanto-ganha-agente-de-viagens" element={<ProtectedRoute allowExternalBlog><BlogPost13 /></ProtectedRoute>} />
                    <Route path="/blog/instagram-para-agente-de-viagens" element={<ProtectedRoute allowExternalBlog><BlogPost14 /></ProtectedRoute>} />
                    <Route path="/blog/destinos-internacionais-mais-vendem-agentes" element={<ProtectedRoute allowExternalBlog><BlogPost15 /></ProtectedRoute>} />
                    <Route path="/blog/script-vendas-whatsapp-agente-viagens" element={<ProtectedRoute allowExternalBlog><BlogPost16 /></ProtectedRoute>} />
                    <Route path="/blog/canva-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost17 /></ProtectedRoute>} />
                    <Route path="/blog/vender-pacotes-lua-de-mel-agente-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost18 /></ProtectedRoute>} />
                    <Route path="/blog/melhores-destinos-nacionais-familia-2026" element={<ProtectedRoute allowExternalBlog><BlogPost19 /></ProtectedRoute>} />
                    <Route path="/blog/trabalhar-de-casa-com-turismo" element={<ProtectedRoute allowExternalBlog><BlogPost20 /></ProtectedRoute>} />
                    <Route path="/blog/calendario-conteudo-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost21 /></ProtectedRoute>} />
                    <Route path="/blog/ia-para-agentes-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost22 /></ProtectedRoute>} />
                    <Route path="/blog/criar-grupo-viagem-lucrativo-whatsapp" element={<ProtectedRoute allowExternalBlog><BlogPost23 /></ProtectedRoute>} />
                    <Route path="/blog/reels-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost24 /></ProtectedRoute>} />
                    <Route path="/blog/seguro-viagem-guia-agente-turismo" element={<ProtectedRoute allowExternalBlog><BlogPost25 /></ProtectedRoute>} />
                    <Route path="/blog/roteiro-europa-brasileiros-2026" element={<ProtectedRoute allowExternalBlog><BlogPost26 /></ProtectedRoute>} />
                    <Route path="/blog/cruzeiros-para-brasileiros-2026" element={<ProtectedRoute allowExternalBlog><BlogPost27 /></ProtectedRoute>} />
                    <Route path="/blog/identidade-visual-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost28 /></ProtectedRoute>} />
                    <Route path="/blog/fidelizar-clientes-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost29 /></ProtectedRoute>} />
                    <Route path="/blog/primeiro-mes-agente-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost30 /></ProtectedRoute>} />

                    {/* ROTAS DO BLOG - Posts Webinar */}
                    <Route path="/blog/agencia-de-viagem-invisivel-instagram-2026" element={<ProtectedRoute allowExternalBlog><BlogPost31 /></ProtectedRoute>} />
                    <Route path="/blog/custo-real-postar-sem-estrategia-instagram" element={<ProtectedRoute allowExternalBlog><BlogPost32 /></ProtectedRoute>} />
                    <Route path="/blog/decolar-booking-concorrentes-agencia-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost33 /></ProtectedRoute>} />
                    <Route path="/blog/perigo-perfil-abandonado-instagram" element={<ProtectedRoute allowExternalBlog><BlogPost34 /></ProtectedRoute>} />
                    <Route path="/blog/agencia-de-viagem-negocio-ou-hobby" element={<ProtectedRoute allowExternalBlog><BlogPost35 /></ProtectedRoute>} />
                    <Route path="/blog/travamento-no-canva-agencia-de-viagem-solucao" element={<ProtectedRoute allowExternalBlog><BlogPost36 /></ProtectedRoute>} />
                    <Route path="/blog/agencia-vs-influenciador-engajamento-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost37 /></ProtectedRoute>} />
                    <Route path="/blog/perfil-agencia-premium-sem-designer" element={<ProtectedRoute allowExternalBlog><BlogPost38 /></ProtectedRoute>} />
                    <Route path="/blog/sinais-alerta-instagram-agencia-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost39 /></ProtectedRoute>} />
                    <Route path="/blog/mapa-agencia-viagem-5-estrelas" element={<ProtectedRoute allowExternalBlog><BlogPost40 /></ProtectedRoute>} />

                    {/* ROTAS DO BLOG - Série IA */}
                    <Route path="/blog/chatgpt-para-agencia-de-viagem-manual-completo" element={<ProtectedRoute allowExternalBlog><BlogPost41 /></ProtectedRoute>} />
                    <Route path="/blog/google-gemini-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost42 /></ProtectedRoute>} />
                    <Route path="/blog/claude-ia-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost43 /></ProtectedRoute>} />
                    <Route path="/blog/manus-ai-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost44 /></ProtectedRoute>} />
                    <Route path="/blog/perplexity-ai-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost45 /></ProtectedRoute>} />
                    <Route path="/blog/grok-ia-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost46 /></ProtectedRoute>} />
                    <Route path="/blog/google-veo-3-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost47 /></ProtectedRoute>} />
                    <Route path="/blog/google-notebooklm-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost48 /></ProtectedRoute>} />
                    <Route path="/blog/meta-ai-para-agencia-de-viagem" element={<ProtectedRoute allowExternalBlog><BlogPost49 /></ProtectedRoute>} />
                    <Route path="/blog/guia-definitivo-ia-para-agencia-de-viagem-2026" element={<ProtectedRoute allowExternalBlog><BlogPost50 /></ProtectedRoute>} />
                    <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="/view/:id" element={<SiteViewer />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  )}
                </Suspense>
              </BrowserRouter>
            </LanguageProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
  );
};

export default App;

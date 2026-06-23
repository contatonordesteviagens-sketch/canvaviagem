import { useState, useEffect, useMemo, Suspense, lazy } from "react";
// Build trigger: Freemium Transition - 2026-02-27
import { useNavigate, useLocation, Link } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { templates as localTemplates, feedTemplates as localFeedTemplates, storyTemplates as localStoryTemplates, weeklyStories as localWeeklyStories } from "@/data/templates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import SeoMetadata from "@/components/SeoMetadata";
const BottomNav = lazy(() => import("@/components/canva/BottomNav").then(module => ({ default: module.BottomNav })));
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));
import { Button } from "@/components/ui/button";
import { downloadLinks } from "@/data/downloads";
import { contentLibrary } from "@/data/content-library";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Loader2, Heart, Sparkles, LogOut, User, ArrowRight, Play, Download, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";

// Lazy load non-critical components
const PremiumGateModal = lazy(() => import("@/components/PremiumGateModal").then(module => ({ default: module.PremiumGateModal })));
const ResourceSection = lazy(() => import("@/components/ResourceSection").then(module => ({ default: module.ResourceSection })));
const BlogSection = () => {
  const posts = [
    {
      title: "Manual do ChatGPT Para Agência: Prompts",
      slug: "chatgpt-para-agencia-de-viagem-manual-completo"
    },
    {
      title: "Guia IA No Turismo 2026: O Que Funciona",
      slug: "guia-definitivo-ia-para-agencia-de-viagem-2026"
    },
    {
      title: "Google Gemini: Guia De Pesquisa",
      slug: "google-gemini-para-agencia-de-viagem"
    }
  ];

  return (
    <section className="py-6 border-t border-border/40 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Blog</h3>
            <div className="h-4 w-px bg-border hidden md:block" />
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {posts.map((post, i) => (
                <Link 
                  key={i} 
                  to={`/blog/${post.slug}`} 
                  state={{ fromInternal: true }} 
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                  {post.title}
                </Link>
              ))}
            </div>
          </div>
          <Button variant="link" size="sm" asChild className="h-auto p-0 text-muted-foreground font-normal text-xs">
            <Link to="/blog" state={{ fromInternal: true }} className="flex items-center gap-1">
              Acessar Blog completo <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

// Canva-style components
import { HeroBanner } from "@/components/canva/HeroBanner";
import { CategoryNav, CategoryType } from "@/components/canva/CategoryNav";
import { PremiumCard } from "@/components/canva/PremiumCard";
import { ContentFilterDropdown, ContentFilterType } from "@/components/canva/ContentFilterDropdown";
import { AccessFilter, AccessFilterType } from "@/components/canva/AccessFilter";
import { SectionHeader } from "@/components/canva/SectionHeader";
import { CaptionCard } from "@/components/canva/CaptionCard";
import { ToolCard } from "@/components/canva/ToolCard";
import { OfferCard } from "@/components/canva/OfferCard";

// Database hooks
import {
  useContentItems,
  useCaptions,
  useMarketingTools,
  useTrackClick,
  useFeaturedItems,
  useNewestItemIds,
  ContentItem,
  Caption,
} from "@/hooks/useContent";
import { useTrackPageView } from "@/hooks/useAdminDashboard";
import { useFavorites } from "@/hooks/useFavorites";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

// Static resources (downloads and resources that don't need DB management)
import { resources, videoDownloads } from "@/data/templates";
import { trackViewContent } from "@/lib/meta-pixel";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGamification } from "@/hooks/useGamification";
import { checkIfItemIsPremium } from "@/lib/premium-utils";



const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, subscription } = useAuth();
  const { setLanguage, t } = useLanguage();

  // Force PT language on this page
  useEffect(() => {
    document.documentElement.lang = 'pt';
    setLanguage('pt');
  }, [setLanguage]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllCaptions, setShowAllCaptions] = useState(false);
  const [contentFilters, setContentFilters] = useState<ContentFilterType[]>([]);
  const [accessFilters, setAccessFilters] = useState<AccessFilterType[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [redirectionTool, setRedirectionTool] = useState<string | null>(null);
  const [showFestaPopup, setShowFestaPopup] = useState(false);
  const [popupMutedActive, setPopupMutedActive] = useState(true);

  useEffect(() => {
    if (user) {
      const hasSeenPopup = localStorage.getItem("cv_festa_popup_seen_v3");
      if (!hasSeenPopup) {
        setShowFestaPopup(true);
      }
    }
  }, [user]);

  // Database hooks
  const { data: videoTemplates, isLoading: videosLoading } = useContentItems(['video', 'seasonal']);
  const { data: featuredVideos, isLoading: featuredLoading } = useFeaturedItems();
  const { data: feedTemplates, isLoading: feedLoading } = useContentItems('feed');
  const { data: storyTemplates, isLoading: storiesLoading } = useContentItems(['story', 'weekly-story']);
  const { data: captionsData, isLoading: captionsLoading } = useCaptions();
  const { data: toolsData, isLoading: toolsLoading } = useMarketingTools();
  const { data: offersData, isLoading: offersLoading } = useContentItems('offer');
  const { data: newestIds = [] } = useNewestItemIds();
  const { trackClick } = useTrackClick();
  const { trackPageView } = useTrackPageView();
  const { favorites, isFavorite, toggleFavorite, favoritesCount, MAX_FAVORITES } = useFavorites();
  const { trackActivity } = useGamification();

  // Track view content when user is logged in
  useEffect(() => {
    if (user) {
      trackViewContent('Plataforma Principal');
      trackPageView('/');
    }
  }, [user, trackPageView]);

  // Handle category navigation from Header (when coming from another page)
  useEffect(() => {
    const state = location.state as { category?: CategoryType } | null;
    if (state?.category) {
      setActiveCategory(state.category);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.state]);

  // 🔥 SCRIPT DE MIGRAÇÃO (Roda uma vez para sincronizar legendas locais com o Supabase)
  useEffect(() => {
    const migrate = async () => {
      const isMigrated = localStorage.getItem('migrated_templates_v2');
      if (isMigrated || !user) return;

      console.log('🔄 Iniciando migração para o Supabase...');
      const allLocalTemplates = [
        ...localTemplates,
        ...localFeedTemplates,
        ...localStoryTemplates,
        ...localWeeklyStories
      ];

      let updateCount = 0;
      const { data: dbItems, error: fetchError } = await supabase.from('content_items').select('id, title, description, drive_url');
      
      if (fetchError || !dbItems) {
        console.error('Erro ao buscar itens:', fetchError);
        return;
      }

      for (const item of dbItems) {
        const localMatch = allLocalTemplates.find(t => t.title === item.title);
        if (localMatch) {
          const updates: any = {};
          if (localMatch.description && localMatch.description !== item.description) {
            updates.description = localMatch.description;
          }
          if (localMatch.drive_url && localMatch.drive_url !== item.drive_url) {
            updates.drive_url = localMatch.drive_url;
          }

          if (Object.keys(updates).length > 0) {
            const { error } = await supabase.from('content_items').update(updates).eq('id', item.id);
            if (!error) {
              updateCount++;
              console.log(`✅ Atualizado: ${item.title}`);
            }
          }
        }
      }

      console.log(`🎉 Migração concluída! ${updateCount} itens atualizados.`);
      localStorage.setItem('migrated_templates_v2', 'true');
      toast.success(`Banco sincronizado! ${updateCount} legendas/links atualizados. Atualize a página para ver.`);
    };

    migrate();
  }, [user]);

  // Note: Removed blocking loader for better LCP. 
  // We handle loading states within individual components or sections.

  // Check if user is subscribed for showing premium content (logged in + active subscription)
  const isSubscribed = user && subscription.subscribed;

  // Function to get the premium required callback
  const getPremiumCallback = (category?: CategoryType, isItemPremiumOverride?: boolean, itemType?: string, itemTitle?: string, index?: number) => {
    // 1. Force LOGIN if not logged in at all
    if (!user) {
      return () => {
        toast.info("Faça login para acessar o conteúdo", {
          description: "Você será redirecionado para a página de login.",
        });
        setTimeout(() => navigate('/auth'), 1500);
      };
    }

    // 2. If logged in but not subscribed, check for premium gate
    if (isSubscribed) return undefined;

    // Check if item is premium using centralized logic or override
    const isPremium = isItemPremiumOverride || checkIfItemIsPremium(itemType || category || '', itemTitle, index);

    if (isPremium) return () => setShowPremiumGate(true);

    return undefined;
  };
  const destinosNacionais = [
    'Maragogi', 'Salvador', 'Trancoso', 'Jalapão', 'Foz do Iguaçu', 'Florianópolis',
    'Gramado', 'Natal', 'Fortaleza', 'Pantanal', 'Rio de Janeiro', 'Recife',
    'Balneário Camboriú', 'Alter do Chão', 'Arraial do Cabo', 'Rota das Emoções',
    'Maceió', 'Lençóis Maranhenses', 'Fernando de Noronha', 'Angra dos Reis',
    'Jericoacoara', 'Porto de Galinhas', 'Amazônia', 'Amazonas', 'Alagoas',
    'João Pessoa', 'Ouro Preto', 'Genipabu', '5 Praias Floripa', 'Bonito',
    'Chapada Diamantina', 'Curitiba', 'São Paulo', 'Belo Horizonte', 'Manaus'
  ];

  const allFeedTemplates = useMemo(() => {
    const fromDb = feedTemplates || [];
    return [...localFeedTemplates, ...fromDb];
  }, [feedTemplates]);

  const isNacional = (title: string, category?: string | null) => {
    if (category === 'nacional') return true;
    if (category === 'internacional') return false;
    return destinosNacionais.some(destino =>
      title.toLowerCase().includes(destino.toLowerCase())
    ) || title.includes('- AL') || title.includes('- BA') || title.includes('- CE') ||
      title.includes('- SC') || title.includes('- RN') || title.includes('- TO') ||
      title.includes('- PE') || title.includes('- PB') || title.includes('- MG') ||
      title.includes('- PR') || title.includes('- AM') || title.includes('- PA') ||
      title.includes('- MS');
  };

  // Removed local checkIfItemIsPremium implementation to use centralized utility

  const isInfluencer = (title: string, influencer: string) => {
    return title.toLowerCase().includes(influencer.toLowerCase());
  };

  const filterTemplates = (items: any[] | undefined): any[] => {
    if (!items) return [];
    let filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Aplicar filtro multi-select
    if (accessFilters.length > 0) {
      filtered = filtered.filter(item => {
        const isItemPremium = checkIfItemIsPremium(item.type, item.title);
        if (accessFilters.includes('premium') && isItemPremium) return true;
        if (accessFilters.includes('gratis') && !isItemPremium) return true;
        return false;
      });
    }

    if (contentFilters.length > 0) {
      filtered = filtered.filter(item => {
        const itemType = item.type;
        if (contentFilters.includes('artes') && itemType === 'feed') return true;
        if (contentFilters.includes('stories') && (itemType === 'story' || itemType === 'weekly-story')) return true;
        if (contentFilters.includes('nacionais') && isNacional(item.title, item.category)) return true;
        if (contentFilters.includes('internacionais') && !isNacional(item.title, item.category)) return true;
        return false;
      });
    }

    return filtered;
  };

  const filterCaptions = () => {
    if (!captionsData) return [];
    return captionsData.filter(caption =>
      caption.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caption.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getIcon = (type: string, icon?: string) => {
    if (icon) return icon;
    switch (type) {
      case "video": return "🎬";
      case "feed": return "🖼️";
      case "story": return "📱";
      default: return "✨";
    }
  };

  const handleCardClick = (item: ContentItem) => {
    trackClick(item.type, item.id);

    // Gamification tracking
    if (item.type === 'video' || item.type === 'seasonal') {
      trackActivity('video'); // +10 pts
    } else if (item.type === 'feed') {
      trackActivity('art'); // +5 pts
    } else if (item.type === 'story' || item.type === 'weekly-story') {
      trackActivity('art'); // +5 pts
    }

    // Nota: a abertura da aba agora é controlada pelo PremiumCard
    setRedirectionTool(item.title);
    setTimeout(() => setRedirectionTool(null), 6000);
  };

  const handleCaptionClick = (caption: Caption) => {
    trackClick('caption', caption.id);
  };

  const handleToggleFavorite = (contentType: "content_item" | "caption" | "marketing_tool", contentId: string) => {
    if (!user) {
      toast.error("Faça login para salvar favoritos");
      return;
    }
    toggleFavorite.mutate(
      { contentType, contentId },
      {
        onSuccess: (result) => {
          if (result.action === "added") {
            toast.success("Adicionado aos favoritos!");
          } else {
            toast.info("Removido dos favoritos");
          }
        },
        onError: () => {
          toast.error("Erro ao atualizar favoritos");
        },
      }
    );
  };

  const filteredVideos = useMemo(() => {
    return filterTemplates(videoTemplates).map(video => {
      if (video.drive_url) return video;
      const matchingLink = downloadLinks.find(link => 
        link.title.toLowerCase().trim() === video.title.toLowerCase().trim() ||
        link.title.toLowerCase().includes(video.title.toLowerCase()) ||
        video.title.toLowerCase().includes(link.title.toLowerCase())
      );
      if (matchingLink) {
        return { ...video, drive_url: matchingLink.url };
      }
      return video;
    });
  }, [videoTemplates, searchQuery, contentFilters, accessFilters]);
  const displayedVideos = showAllVideos ? filteredVideos : filteredVideos.slice(0, 8);

  const filteredCaptions = useMemo(() => filterCaptions(), [captionsData, searchQuery]);
  const displayedCaptions = showAllCaptions ? filteredCaptions : filteredCaptions.slice(0, 8);

  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredVideos]);

  const displayedSortedVideos = showAllVideos ? sortedVideos : sortedVideos.slice(0, 20);

  // Top-level preparation for LCP and Sections
  const coveredVideos = useMemo(() => {
    let videos = sortedVideos.filter(v => v.image_url);
    if (activeCategory === 'all') {
      const crossedOutTitles = [
        'japão mel', 'japão - mel',
        'bia pacotes',
        'maragogi - al',
        'eva - destinos feriados',
        'tipos de pasajeros', 'tipos de passageiros', 'types of passengers',
        'eva - destinos'
      ];
      videos = videos.filter(v => 
        !crossedOutTitles.some(title => v.title.toLowerCase().includes(title))
      );
    }
    return videos;
  }, [sortedVideos, activeCategory]);
  const uncoveredVideos = useMemo(() => sortedVideos.filter(v => !v.image_url), [sortedVideos]);
  const firstFourVideos = useMemo(() => coveredVideos.slice(0, 4), [coveredVideos]);

  // Performance: Get LCP image for preloading
  const lcpImage = useMemo(() => {
    if (activeCategory === 'all' && firstFourVideos.length > 0) {
      return firstFourVideos[0].image_url;
    }
    return null;
  }, [activeCategory, firstFourVideos]);

  const firstFourTools = useMemo(() => {
    if (!toolsData) return [];
    const prioritizedTitles = ["Corpo de Anúncios", "Narração de Ofertas de Viagens"];
    const tools = [...toolsData];
    const filteredTools = tools.filter(t => !t.title.includes("Mr. Beast") && !t.title.includes("Promessas Únicas") && !t.title.includes("9 Óticas"));
    return filteredTools.sort((a, b) => {
      const aIndex = prioritizedTitles.findIndex(t => a.title.toLowerCase().includes(t.toLowerCase()));
      const bIndex = prioritizedTitles.findIndex(t => b.title.toLowerCase().includes(t.toLowerCase()));
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    }).slice(0, 4);
  }, [toolsData]);

  // Get weekly stories from story templates
  const weeklyStories = storyTemplates?.filter(s => s.type === 'weekly-story') || [];
  const regularStories = storyTemplates?.filter(s => s.type === 'story') || [];

  // Loading skeletons for different types
  const VideoSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="aspect-[9/16] rounded-2xl shadow-canva" />
      ))}
    </div>
  );

  const ToolSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="aspect-[16/10] rounded-2xl shadow-canva" />
      ))}
    </div>
  );

  const FeedSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] rounded-2xl shadow-canva" />
      ))}
    </div>
  );

  const StorySkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="aspect-[9/16] rounded-2xl shadow-canva" />
      ))}
    </div>
  );

  // Content sections based on active category
  const renderContent = () => {
    switch (activeCategory) {
      case 'all': {
        // Split by cover: only videos WITH image_url shown in main display
        // Videos WITHOUT image_url go behind "Ver mais"
        // Performance: Reduce initial items on mobile (8 vs 20)
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const initialRemainingCount = isMobile ? 4 : 20;

        const remainingVideos = showAllVideos
          ? coveredVideos.slice(4)
          : coveredVideos.slice(4, initialRemainingCount);

        const initialCaptions = filteredCaptions.slice(0, 8);
        const initialOffers = (offersData || []).slice(0, 4);

        // Filter by access if selected
        const allFilterTools = (toolsData || []).filter(tool => {
          if (accessFilters.length === 0) return true;
          const isToolPremium = checkIfItemIsPremium('tool', tool.title);
          if (accessFilters.includes('premium') && isToolPremium) return true;
          if (accessFilters.includes('gratis') && !isToolPremium) return true;
          return false;
        });

        const showOnlyFree = accessFilters.includes('gratis');

        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Tudo"
              subtitle="Todo o conteúdo da plataforma em um lugar"
            />
            <div className="flex items-center mb-6 gap-4">
              <AccessFilter
                selectedFilters={accessFilters}
                onFiltersChange={setAccessFilters}
              />
            </div>

            {showOnlyFree ? (
              // Show only FREE AI Tools + Captions when gratis filter active
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ferramentas gratuitas disponíveis na plataforma. Para vídeos, artes e stories —{" "}
                  <button onClick={() => navigate("/inicio2")} className="underline font-semibold text-foreground">veja o plano Pro</button>.
                </p>
                {toolsLoading ? (
                  <ToolSkeleton />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allFilterTools.map(tool => {
                      const isToolPremium = checkIfItemIsPremium('tool', tool.title);
                      return (
                        <ToolCard
                          key={tool.id}
                          id={tool.id}
                          title={tool.title}
                          url={tool.url}
                          icon={tool.icon}
                          description={tool.description || "Ferramenta de IA para marketing"}
                          isNew={tool.is_new}
                          onClick={() => { 
                            trackClick('tool', tool.id); 
                            trackActivity('tool');
                            setRedirectionTool(tool.title);
                            setTimeout(() => setRedirectionTool(null), 6000);
                          }}
                          isFavorite={isFavorite("marketing_tool", tool.id)}
                          onToggleFavorite={() => handleToggleFavorite("marketing_tool", tool.id)}
                          onPremiumRequired={getPremiumCallback(activeCategory, checkIfItemIsPremium('tool', tool.title), 'tool', tool.title)}
                          isPremium={checkIfItemIsPremium('tool', tool.title)}
                        />
                      );
                    })}
                  </div>
                )}
                {/* Captions in free mode */}
                {!captionsLoading && initialCaptions.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Legendas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {initialCaptions.map(caption => (
                        <CaptionCard
                          key={caption.id}
                          id={caption.id}
                          destination={caption.destination}
                          text={caption.text}
                          hashtags={caption.hashtags}
                          isFavorite={isFavorite("caption", caption.id)}
                          onToggleFavorite={() => handleToggleFavorite("caption", caption.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* Free feed arts (first 2 are free) */}
                {!feedLoading && allFeedTemplates.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Arte para Agência de Viagens</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {allFeedTemplates.slice(0, 2).map((template: any, index: number) => (
                        <PremiumCard
                          key={template.id || `free-feed-${index}`}
                          id={template.id || `free-feed-${index}`}
                          title={template.title}
                          url={template.url} driveUrl={template.drive_url}
                          imageUrl={template.image_url}
                          category={template.category}
                          isNew={(template as any).isNew || (template as any).is_new}
                          icon={getIcon(template.type, template.icon)}
                          aspectRatio="4/5"
                          contentType={template.type}
                          description={template.description}
                          onClick={() => handleCardClick(template as ContentItem)}
                          isFavorite={template.id ? isFavorite("content_item", template.id) : false}
                          onToggleFavorite={() => template.id && handleToggleFavorite("content_item", template.id)}
                          isPremium={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Organized layout: 4 videos → 4 AI tools → remaining videos → 8 captions
              <div className="space-y-8">

                {/* Row 1: First 4 videos — 2 cols mobile, 4 cols desktop */}
                {videosLoading ? (
                  <VideoSkeleton />
                ) : firstFourVideos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {firstFourVideos.map((template, index) => (
                      <PremiumCard
                        key={template.id} id={template.id} title={template.title} url={template.url} driveUrl={template.drive_url}
                        isNew={newestIds.includes(template.id)} icon={getIcon(template.type, template.icon)}
                        imageUrl={template.image_url || undefined}
                        aspectRatio="9/16"
                        category={template.category}
                        contentType={template.type}
                        description={template.description}
                        // Performance: Prioritize first 2 items (especially on mobile)
                        loading={index < 2 ? "eager" : "lazy"}
                        fetchPriority={index < 2 ? "high" : "auto"}
                        onClick={() => handleCardClick(template)}
                        isFavorite={isFavorite("content_item", template.id)}
                        onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                        onPremiumRequired={getPremiumCallback(activeCategory, false, template.type, template.title)}
                        isPremium={checkIfItemIsPremium(template.type, template.title)}
                      />
                    ))}
                  </div>
                )}

                {/* Row 2: 4 AI Tools — 2 cols mobile, 4 cols desktop */}
                <Suspense fallback={<ToolSkeleton />}>
                  {!toolsLoading && firstFourTools.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {firstFourTools.map(tool => {
                        const isToolPremium = checkIfItemIsPremium('tool', tool.title);
                        return (
                          <ToolCard
                            key={tool.id} id={tool.id} title={tool.title} url={tool.url}
                            icon={tool.icon} description={tool.description || "Ferramenta de IA"}
                            isNew={tool.is_new}
                            onClick={() => { 
                              trackClick('tool', tool.id); 
                              trackActivity('tool');
                              setRedirectionTool(tool.title);
                              setTimeout(() => setRedirectionTool(null), 6000);
                            }}
                            isFavorite={isFavorite("marketing_tool", tool.id)}
                            onToggleFavorite={() => handleToggleFavorite("marketing_tool", tool.id)}
                            onPremiumRequired={getPremiumCallback(activeCategory, isToolPremium, 'tool', tool.title)}
                            isPremium={isToolPremium}
                          />
                        );
                      })}
                    </div>
                  )}
                </Suspense>

                {/* Artes para Agência de Viagens (Feed) — 2 cols mobile, 4 cols desktop */}
                {!feedLoading && feedTemplates.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground pt-2">Artes para Agência de Viagens</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      {feedTemplates.slice(0, 4).map((template, index) => (
                        <PremiumCard
                          key={template.id || `home-feed-${index}`}
                          id={template.id || `home-feed-${index}`}
                          title={template.title}
                          url={template.url} driveUrl={template.drive_url}
                          imageUrl={template.image_url}
                          category={template.category}
                          isNew={(template as any).isNew || (template as any).is_new}
                          icon={getIcon(template.type, template.icon)}
                          aspectRatio="4/5"
                          contentType={template.type}
                          description={(template as any).description}
                          onClick={() => handleCardClick(template as ContentItem)}
                          isFavorite={template.id ? isFavorite("content_item", template.id) : false}
                          onToggleFavorite={() => template.id && handleToggleFavorite("content_item", template.id)}
                          onPremiumRequired={getPremiumCallback('feed', false, template.type, template.title, index)}
                          isPremium={checkIfItemIsPremium(template.type, template.title, index)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Remaining videos — 2 cols mobile, 4 cols desktop */}
                {!videosLoading && remainingVideos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {remainingVideos.map((template, index) => (
                      <PremiumCard
                        key={template.id} id={template.id} title={template.title} url={template.url} driveUrl={template.drive_url}
                        isNew={newestIds.includes(template.id)} icon={getIcon(template.type, template.icon)}
                        imageUrl={template.image_url || undefined}
                        aspectRatio={template.image_url ? "9/16" : "1/1"}
                        category={template.category}
                        contentType={template.type}
                        description={template.description}
                        onClick={() => handleCardClick(template)}
                        isFavorite={isFavorite("content_item", template.id)}
                        onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                        onPremiumRequired={getPremiumCallback(activeCategory, false, template.type, template.title)}
                        isPremium={checkIfItemIsPremium(template.type, template.title)}
                      />
                    ))}
                  </div>
                )}

                {/* Ver mais vídeos — aparece quando há sem capa ou muitos cobertos */}
                {(uncoveredVideos.length > 0 || coveredVideos.length > 20) && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveCategory('videos');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="gap-2 rounded-full px-6"
                    >
                      <>Ver todos os vídeos Reels</>
                    </Button>
                  </div>
                )}

                {/* 8 Legendas — 1 col mobile, 2 cols desktop */}
                <Suspense fallback={<div className="h-48 bg-muted/10 animate-pulse rounded-2xl" />}>
                  {!captionsLoading && initialCaptions.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground pt-2">Legendas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {initialCaptions.map((caption, index) => (
                          <div key={caption.id} onClick={() => handleCaptionClick(caption)}>
                            <CaptionCard
                              id={caption.id}
                              destination={caption.destination}
                              text={caption.text}
                              hashtags={caption.hashtags}
                              isFavorite={isFavorite("caption", caption.id)}
                              onToggleFavorite={() => handleToggleFavorite("caption", caption.id)}
                              onPremiumRequired={getPremiumCallback('all', false, 'caption', caption.destination, index)}
                              isPremium={checkIfItemIsPremium('caption', caption.destination, index)}
                            />
                          </div>
                        ))}
                      </div>
                      {filteredCaptions.length > 8 && (
                        <div className="flex justify-center pt-2">
                          <Button variant="outline" onClick={() => setShowAllCaptions(!showAllCaptions)} className="gap-2 rounded-full px-6">
                            {showAllCaptions
                              ? <><ChevronUp className="h-4 w-4" />Mostrar menos</>
                              : <><ChevronDown className="h-4 w-4" />Ver mais</>}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Suspense>

                {/* Seção de Ofertas Validadas na Home */}
                <Suspense fallback={<div className="h-48 bg-muted/10 animate-pulse rounded-2xl" />}>
                  {!offersLoading && initialOffers.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground pt-2">Ofertas Validadas</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80"
                          onClick={() => {
                            setActiveCategory('offers');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Ver todas
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {initialOffers.map(offer => (
                          <OfferCard
                            key={offer.id}
                            id={offer.id}
                            title={offer.title}
                            text={offer.description || ""}
                            isFavorite={isFavorite("content_item", offer.id)}
                            onToggleFavorite={() => handleToggleFavorite("content_item", offer.id)}
                            onPremiumRequired={getPremiumCallback('offers', true, 'offer', offer.title)}
                            isPremium={checkIfItemIsPremium(offer.type, offer.title)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Suspense>
              </div>
            )}
          </section>
        );
      }

      case 'videos':
        return (
          <section className="animate-fade-in">
            {/* Highlights Section - Show at top if there are highlighted items */}
            {featuredVideos && featuredVideos.length > 0 && (
              <div className="mb-8">
                <SectionHeader
                  title="Destaques da Semana"
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredVideos.map(item => (
                    <Card key={item.id} className="overflow-hidden border-primary/30 shadow-lg hover:shadow-xl transition-shadow">
                      {/* Animated Media (GIF or Video) */}
                      {item.media_url ? (
                        <div className={['video', 'seasonal', 'story', 'weekly-story'].includes(item.type) ? "aspect-[9/16] bg-muted" : item.type === 'feed' ? "aspect-square bg-muted" : "aspect-video bg-muted"}>
                          {item.media_type === 'gif' ? (
                            <img
                              src={item.media_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <video
                              src={item.media_url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      ) : item.image_url ? (
                        <div className={['video', 'seasonal', 'story', 'weekly-story'].includes(item.type) ? "aspect-[9/16] bg-muted" : item.type === 'feed' ? "aspect-square bg-muted" : "aspect-video bg-muted"}>
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className={`${['video', 'seasonal', 'story', 'weekly-story'].includes(item.type) ? "aspect-[9/16]" : item.type === 'feed' ? "aspect-square" : "aspect-video"} bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center`}>
                          <span className="text-4xl">{item.icon || "✨"}</span>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <Badge className="mb-2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                          Destaque
                        </Badge>
                        <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <Button
                            className="col-span-2"
                            onClick={() => {
                              trackClick(item.type, item.id);
                              window.open(item.url, '_blank');
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Editar
                          </Button>

                          {item.description && (
                            <Button
                              variant="outline"
                              className="col-span-2"
                              onClick={() => {
                                navigator.clipboard.writeText(item.description!);
                                toast.success("Legenda copiada para a área de transferência!");
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Legenda
                            </Button>
                          )}

                          {item.drive_url && (
                            <Button
                              variant="secondary"
                              className="col-span-2"
                              onClick={() => {
                                navigator.clipboard.writeText(item.drive_url!);
                                toast.success("Link do Drive copiado! Cole no seu navegador Chrome/Safari.");
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <SectionHeader
              title="Vídeos Reels Editáveis"
              subtitle="Templates prontos para editar no Canva e publicar"
            />

            <div className="flex items-center mb-6 gap-4">
              <AccessFilter
                selectedFilters={accessFilters}
                onFiltersChange={(newFilters) => {
                  if (newFilters.length === 0) {
                    setAccessFilters([]);
                  } else {
                    const last = newFilters[newFilters.length - 1];
                    setAccessFilters(accessFilters.includes(last as AccessFilterType) ? [] : [last as AccessFilterType]);
                  }
                }}
              />
            </div>

            {videosLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[9/16] rounded-2xl shadow-canva" />
                ))}
              </div>
            ) : (
              <>
                {/* Grid unificado: 5 colunas desktop, 2 mobile */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                  {displayedSortedVideos.map((template, index) => (
                    <PremiumCard
                      key={template.id}
                      id={template.id}
                      title={template.title}
                      url={template.url} driveUrl={template.drive_url}
                      isNew={newestIds.includes(template.id)}
                      icon={getIcon(template.type, template.icon)}
                      imageUrl={index < 6 && template.image_url ? template.image_url : undefined}
                      aspectRatio="9/16"
                      category={template.category}
                      contentType={template.type}
                      description={template.description}
                      onClick={() => handleCardClick(template)}
                      isFavorite={isFavorite("content_item", template.id)}
                      onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                      onPremiumRequired={getPremiumCallback(activeCategory, false, template.type)}
                      isPremium={checkIfItemIsPremium(template.type, template.title)}
                    />
                  ))}
                </div>

                {sortedVideos.length > 10 && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllVideos(!showAllVideos)}
                      className="gap-2 rounded-full px-6"
                    >
                      {showAllVideos ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Ver mais vídeos ({sortedVideos.length - 10} restantes)
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Floating minimize button when expanded */}
                {showAllVideos && (
                  <Button
                    onClick={() => setShowAllVideos(false)}
                    className="fixed bottom-24 md:bottom-8 right-4 z-50 rounded-full shadow-xl gap-2"
                    size="lg"
                  >
                    <ChevronUp className="h-5 w-5" />
                    Minimizar
                  </Button>
                )}
              </>
            )}
          </section>
        );

      case 'feed':
        return (
          <section className="space-y-12 animate-fade-in">
            {/* Artes para Agência de Viagens */}
            <div>
              <SectionHeader
                title="Arte para Feed e Stories"
                subtitle="Posts prontos para engajar seu público"
              />

              {feedLoading ? (
                <FeedSkeleton />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filterTemplates(allFeedTemplates).map((template, index) => (
                    <PremiumCard
                      key={template.id || `local-${index}`}
                      id={template.id || `local-${index}`}
                      title={template.title}
                      url={template.url} driveUrl={template.drive_url}
                      imageUrl={template.image_url}
                      category={template.category}
                      isNew={(template as any).isNew || (template as any).is_new}
                      icon={getIcon(template.type, template.icon)}
                      aspectRatio="4/5"
                      contentType={template.type}
                      description={template.description}
                      onClick={() => handleCardClick(template as ContentItem)}
                      isFavorite={template.id ? isFavorite("content_item", template.id) : false}
                      onToggleFavorite={() => template.id && handleToggleFavorite("content_item", template.id)}
                      onPremiumRequired={getPremiumCallback(activeCategory, false, template.type, template.title, index)}
                      isPremium={checkIfItemIsPremium(template.type, template.title, index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Stories Semanais */}
            {storiesLoading ? (
              <StorySkeleton />
            ) : (
              <>
                {weeklyStories.length > 0 && (
                  <div>
                    <SectionHeader
                      title="Stories Semanais"
                      subtitle="Planejamento semanal de conteúdo"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
                      {weeklyStories.sort((a, b) => a.title.localeCompare(b.title)).map((story) => (
                        <PremiumCard
                          key={story.id}
                          id={story.id}
                          title={story.title.replace('Stories Semanais - ', '')}
                          url={story.url}
                          icon="📅"
                          aspectRatio="1/1"
                          contentType={story.type}
                          description={story.description}
                          onClick={() => handleCardClick(story)}
                          isFavorite={isFavorite("content_item", story.id)}
                          onToggleFavorite={() => handleToggleFavorite("content_item", story.id)}
                          onPremiumRequired={getPremiumCallback(activeCategory)}
                          isPremium={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Templates de Stories */}
                <div>
                  <SectionHeader
                    title="Templates de Stories"
                    subtitle="Artes individuais para stories"
                  />

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filterTemplates(regularStories).map((template) => (
                      <PremiumCard
                        key={template.id}
                        id={template.id}
                        title={template.title}
                        url={template.url} driveUrl={template.drive_url}
                        isNew={newestIds.includes(template.id)}
                        icon={getIcon(template.type, template.icon)}
                        aspectRatio="9/16"
                        contentType={template.type}
                        description={template.description}
                        onClick={() => handleCardClick(template)}
                        isFavorite={isFavorite("content_item", template.id)}
                        onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                        onPremiumRequired={getPremiumCallback(activeCategory)}
                        isPremium={true}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        );

      // removed stories case

      case 'downloads':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Downloads de Vídeos"
              subtitle="Acesse vídeos prontos para usar"
            />

            <div className="max-w-2xl mx-auto bg-card rounded-3xl shadow-canva p-6">
              <ResourceSection
                title="📥 Biblioteca de Vídeos"
                resources={videoDownloads.map(r => ({
                  ...r,
                  onPremiumRequired: getPremiumCallback('downloads', true, 'resource', r.name)
                }))}
                description="Vídeos prontos organizados por categoria"
                locked={!isSubscribed}
                onLockedClick={() => setShowPremiumGate(true)}
              />
            </div>
          </section>
        );

      case 'tools':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Ferramentas de Marketing"
              subtitle="Robôs de IA e recursos para agências"
            />

            <h3 className="font-bold text-foreground mb-5 text-xl">
              Robôs de IA para Marketing
            </h3>

            {toolsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                {toolsData?.map((tool) => {
                  const isToolPremium = checkIfItemIsPremium('tool', tool.title);
                  return (
                    <ToolCard
                      key={tool.id}
                      id={tool.id}
                      title={tool.title}
                      url={tool.url}
                      icon={tool.icon}
                      description={tool.description || "Ferramenta de IA para marketing"}
                      isNew={tool.is_new}
                      onClick={() => {
                        trackClick('tool', tool.id);
                        trackActivity('tool'); // +20 pts
                      }}
                      isFavorite={isFavorite("marketing_tool", tool.id)}
                      onToggleFavorite={() => handleToggleFavorite("marketing_tool", tool.id)}
                      onPremiumRequired={getPremiumCallback(activeCategory, checkIfItemIsPremium('tool', tool.title), 'tool', tool.title)}
                      isPremium={checkIfItemIsPremium('tool', tool.title)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        );

      case 'offers': {
        const offerCounts = {
          offer: contentLibrary.filter(i => i.category === 'offer').length,
          ranking: contentLibrary.filter(i => i.category === 'ranking').length,
          script: contentLibrary.filter(i => i.category === 'script').length,
          cta: contentLibrary.filter(i => i.category === 'cta').length,
        };
        return (
          <section className="space-y-12 animate-fade-in">
            {/* Ofertas */}
            <div>
              <SectionHeader
                title="Ofertas Validadas"
                subtitle="Ofertas, destinos em alta, scripts e frases de impacto"
              />

              <Tabs defaultValue="offer" className="w-full">
                <TabsList className="flex w-full overflow-x-auto no-scrollbar mb-6 gap-1 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="offer" className="flex-1 min-w-[80px] text-xs md:text-sm gap-1.5 whitespace-nowrap">
                    📢 Ofertas <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{offerCounts.offer}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="ranking" className="flex-1 min-w-[80px] text-xs md:text-sm gap-1.5 whitespace-nowrap">
                    📊 Destinos <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{offerCounts.ranking}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="script" className="flex-1 min-w-[80px] text-xs md:text-sm gap-1.5 whitespace-nowrap">
                    📋 Scripts <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{offerCounts.script}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="cta" className="flex-1 min-w-[80px] text-xs md:text-sm gap-1.5 whitespace-nowrap">
                    🔥 Frases <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{offerCounts.cta}</Badge>
                  </TabsTrigger>
                </TabsList>

                {(['offer', 'ranking', 'script', 'cta'] as const).map((cat) => (
                  <TabsContent key={cat} value={cat}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contentLibrary
                        .filter(item => item.category === cat)
                        .map((item) => (
                          <OfferCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            text={item.text}
                            fullText={item.fullText}
                            isFavorite={isFavorite("content_item", item.id)}
                            onToggleFavorite={() => handleToggleFavorite("content_item", item.id)}
                            onPremiumRequired={getPremiumCallback('offers', item.isPremium)}
                            isPremium={item.isPremium}
                          />
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Legendas */}
            <div>
              <SectionHeader
                title="Legendas Prontas"
                subtitle="Copie e cole legendas profissionais para seus posts"
              />

              {captionsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedCaptions.map((caption, index) => (
                      <div key={caption.id} onClick={() => handleCaptionClick(caption)}>
                        <CaptionCard
                          id={caption.id}
                          destination={caption.destination}
                          text={caption.text}
                          hashtags={caption.hashtags}
                          isFavorite={isFavorite("caption", caption.id)}
                          onToggleFavorite={() => handleToggleFavorite("caption", caption.id)}
                          onPremiumRequired={getPremiumCallback(activeCategory, false, 'caption', caption.destination, index)}
                          isPremium={checkIfItemIsPremium('caption', caption.destination, index)}
                        />
                      </div>
                    ))}
                  </div>

                  {filteredCaptions.length > 8 && (
                    <div className="flex justify-center mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllCaptions(!showAllCaptions)}
                        className="gap-2 rounded-full px-6"
                      >
                        {showAllCaptions ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Mostrar menos
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Ver mais legendas
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Resources and Downloads — lazy loaded, merged for component compatibility */}
                  <Suspense fallback={<div className="h-48 bg-muted/10 animate-pulse rounded-2xl" />}>
                    <ResourceSection
                      title="Recursos e Downloads"
                      resources={[...resources, ...videoDownloads].map(r => ({
                        ...r,
                        onPremiumRequired: getPremiumCallback('all', true, 'resource', r.name)
                      }))}
                      locked={!isSubscribed}
                      onLockedClick={() => setShowPremiumGate(true)}
                    />
                  </Suspense>
                </>
              )}
            </div>
          </section>
        );
      }

      case 'contracts':
        return (
          <section className="animate-fade-in text-center py-12">
            <SectionHeader
              title="Modelos de Contratos"
              subtitle="Documentos jurídicos para sua agência de viagens"
            />
            <div className="bg-muted/30 rounded-3xl p-12 border-2 border-dashed border-muted-foreground/20">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold mb-2">Em breve</h3>
              <p className="text-muted-foreground">
                Estamos preparando modelos de contratos profissionais para você utilizar na sua agência.
              </p>
            </div>
          </section>
        );

      case 'videoaula':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Videoaulas"
              subtitle="Aprenda a criar conteúdo profissional"
            />

            <div className="space-y-6">
              <div className="bg-card rounded-3xl shadow-canva p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>🎓</span>
                  Como Usar a Plataforma
                </h3>
                <div className="aspect-video w-full rounded-2xl overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/1Or9QJPn6OA"
                    title="Como Usar a Plataforma - Videoaula"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </section>
        );

      case 'favorites':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Meus Favoritos"
              subtitle="Itens salvos para acesso rápido"
            />
            <div className="space-y-8">
              {/* Favorite Videos */}
              {(() => {
                const favoriteVideos = videoTemplates?.filter(v => isFavorite("content_item", v.id)) || [];
                if (favoriteVideos.length === 0) return null;
                return (
                  <div>
                    <h3 className="font-bold text-foreground mb-4 text-lg">🎬 Vídeos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {favoriteVideos.map((template) => (
                        <PremiumCard
                          key={template.id}
                          id={template.id}
                          title={template.title}
                          url={template.url} driveUrl={template.drive_url}
                          icon={getIcon(template.type, template.icon)}
                          aspectRatio="9/16"
                          contentType={template.type}
                          description={template.description}
                          onClick={() => handleCardClick(template)}
                          isFavorite={true}
                          onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                          onPremiumRequired={getPremiumCallback(activeCategory)}
                          isPremium={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Favorite Feed */}
              {(() => {
                const favoriteFeed = feedTemplates?.filter(f => isFavorite("content_item", f.id)) || [];
                if (favoriteFeed.length === 0) return null;
                return (
                  <div>
                    <h3 className="font-bold text-foreground mb-4 text-lg">🖼️ Artes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {favoriteFeed.map((template) => (
                        <PremiumCard
                          key={template.id}
                          id={template.id}
                          title={template.title}
                          url={template.url} driveUrl={template.drive_url}
                          icon={getIcon(template.type, template.icon)}
                          aspectRatio="4/5"
                          contentType={template.type}
                          description={template.description}
                          onClick={() => handleCardClick(template)}
                          isFavorite={true}
                          onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                          onPremiumRequired={getPremiumCallback(activeCategory)}
                          isPremium={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Favorite Stories */}
              {(() => {
                const favoriteStories = storyTemplates?.filter(s => isFavorite("content_item", s.id)) || [];
                if (favoriteStories.length === 0) return null;
                return (
                  <div>
                    <h3 className="font-bold text-foreground mb-4 text-lg">📱 Stories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {favoriteStories.map((template) => (
                        <PremiumCard
                          key={template.id}
                          id={template.id}
                          title={template.title}
                          url={template.url} driveUrl={template.drive_url}
                          icon={getIcon(template.type, template.icon)}
                          aspectRatio="9/16"
                          contentType={template.type}
                          description={template.description}
                          onClick={() => handleCardClick(template)}
                          isFavorite={true}
                          onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                          onPremiumRequired={getPremiumCallback(activeCategory)}
                          isPremium={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Favorite Legendas */}
              {(() => {
                const favoriteCaptions = captionsData?.filter(c => isFavorite("caption", c.id)) || [];
                if (favoriteCaptions.length === 0) return null;
                return (
                  <div>
                    <h3 className="font-bold text-foreground mb-4 text-lg">✍️ Legendas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favoriteCaptions.map((caption) => (
                        <CaptionCard
                          key={caption.id}
                          id={caption.id}
                          destination={caption.destination}
                          text={caption.text}
                          hashtags={caption.hashtags}
                          isFavorite={true}
                          onToggleFavorite={() => handleToggleFavorite("caption", caption.id)}
                          onPremiumRequired={getPremiumCallback('videos')}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Favorite Tools */}
              {(() => {
                const favoriteTools = toolsData?.filter(t => isFavorite("marketing_tool", t.id)) || [];
                if (favoriteTools.length === 0) return null;
                return (
                  <div>
                    <h3 className="font-bold text-foreground mb-4 text-lg">🤖 Ferramentas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {favoriteTools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          id={tool.id}
                          title={tool.title}
                          url={tool.url}
                          icon={tool.icon}
                          description={tool.description || ""}
                          isFavorite={true}
                          onToggleFavorite={() => handleToggleFavorite("marketing_tool", tool.id)}
                          onPremiumRequired={getPremiumCallback('tools', checkIfItemIsPremium('tool', tool.title), 'tool', tool.title)}
                          onClick={() => {
                            trackClick('marketing_tool', tool.id);
                            trackActivity('tool');
                            setRedirectionTool(tool.title);
                            setTimeout(() => setRedirectionTool(null), 6000);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Favorite Offers */}
              {(() => {
                const favoriteOffers = offersData?.filter(o => isFavorite("content_item", o.id)) || [];
                const favoriteLocalOffers = contentLibrary.filter(o => isFavorite("content_item", o.id));
                const allFavOffers = [...favoriteOffers, ...favoriteLocalOffers];
                if (allFavOffers.length === 0) return null;
                return (
                  <div>
                    <h3 className="font-bold text-foreground mb-4 text-lg">📢 Ofertas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allFavOffers.map((offer: any) => (
                        <OfferCard
                          key={offer.id}
                          id={offer.id}
                          title={offer.title}
                          text={offer.description || offer.text || ""}
                          isFavorite={true}
                          onToggleFavorite={() => handleToggleFavorite("content_item", offer.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Empty state */}
              {favorites.length === 0 && (
                <div className="bg-muted/30 rounded-3xl p-12 text-center border-2 border-dashed border-muted-foreground/20">
                  <div className="text-5xl mb-4">❤️</div>
                  <h3 className="text-xl font-bold mb-2">Nenhum favorito ainda</h3>
                  <p className="text-muted-foreground">Clique no coração ❤️ em qualquer conteúdo para salvar aqui.</p>
                </div>
              )}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  const mainContent = (
    <>
      <HeroBanner
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          if (val.trim() !== '' && activeCategory === 'all') {
            setActiveCategory('videos');
          }
        }}
      />

      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          if (cat === 'fabrica') {
            navigate('/fabrica');
          } else {
            setActiveCategory(cat);
          }
        }}
        showFavorites={!!user}
      />

      {renderContent()}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        {lcpImage && <link rel="preload" as="image" href={lcpImage} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Canva Viagem — IA e Marketing para Agências de Viagens",
          "description": "Plataforma com IA para anúncios, páginas de venda, conteúdos prontos, vídeos, artes, legendas e CRM para agências de viagens.",
          "image": ["https://canvaviagem.com/meta_app_icon_1024.png"],
          "brand": { "@type": "Brand", "name": "Canva Viagem" },
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "49.85", "highPrice": "97.00", "priceCurrency": "BRL", "offerCount": "2",
            "offers": [
              { "@type": "Offer", "name": "Plano Anual", "price": "482.00", "priceCurrency": "BRL", "availability": "https://schema.org/InStock", "url": "https://canvaviagem.com/planos", "priceValidUntil": "2026-12-31" },
              { "@type": "Offer", "name": "Plano Mensal", "price": "29.00", "priceCurrency": "BRL", "availability": "https://schema.org/InStock", "url": "https://canvaviagem.com/planos", "priceValidUntil": "2026-12-31" }
            ]
          },
          "seller": { "@type": "Organization", "name": "Canva Viagem" }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "O que é o Canva Viagem?", "acceptedAnswer": { "@type": "Answer", "text": "Plataforma com 250+ vídeos prontos para agências de viagem postarem no Instagram. Editáveis no Canva. Planos a partir de R$29/mês." } },
            { "@type": "Question", "name": "Preciso saber editar vídeo?", "acceptedAnswer": { "@type": "Answer", "text": "Não. Os vídeos já estão prontos e editáveis no Canva, que é gratuito e fácil de usar." } },
            { "@type": "Question", "name": "Funcionam para qual rede social?", "acceptedAnswer": { "@type": "Answer", "text": "Instagram (Reels, Feed e Stories), TikTok e YouTube Shorts." } },
            { "@type": "Question", "name": "Qual o preço?", "acceptedAnswer": { "@type": "Answer", "text": "Plano Anual R$482 (12x R$49,85) ou Mensal a partir de R$29." } }
          ]
        })}</script>
      </Helmet>
      <SeoMetadata
        title="Canva Viagem | IA e Marketing para Agências de Viagens"
        description="Crie anúncios com IA, páginas de venda, vídeos, artes, legendas e organize leads em uma plataforma feita para agências de viagens venderem mais."
        keywords="marketing para agência de viagens, IA para agência de viagens, conteúdo para Instagram turismo, CRM para agência de viagens, páginas de venda turismo"
      />
      <Header onCategoryChange={setActiveCategory} />

      <main className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
        {mainContent}
      </main>

      <BlogSection />
      <Suspense fallback={<div className="h-20" />}>
        <Footer />
      </Suspense>

      {showAllVideos && activeCategory === 'all' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            variant="outline"
            onClick={() => { setShowAllVideos(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="gap-2 rounded-full px-6 py-3 shadow-2xl bg-background border border-border"
          >
            <ChevronUp className="h-4 w-4" />
            Mostrar menos
          </Button>
        </div>
      )}

      <Suspense fallback={null}>
        <BottomNav
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </Suspense>

      <Suspense fallback={null}>
        <PremiumGateModal
          isOpen={showPremiumGate}
          onClose={() => setShowPremiumGate(false)}
        />
      </Suspense>

      {/* Redirection Feedback Overlay */}
      <AnimatePresence>
        {redirectionTool && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-80 z-[100]"
          >
            <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-sm">Ferramenta Aberta!</h4>
                  <p className="text-gray-400 text-xs leading-relaxed mt-1">
                    "{redirectionTool}" abriu em uma nova guia. Navegue lá e volte aqui quando precisar de mais.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                  <Info className="w-3 h-3" />
                  Sessão Ativa
                </div>
                <button 
                  onClick={() => setRedirectionTool(null)}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  Entendi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Startup Announcement Popup for subscribers */}
      <AnimatePresence>
        {showFestaPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#050D1A] border border-cyan-500/20 rounded-3xl overflow-hidden max-w-2xl w-full relative shadow-2xl shadow-cyan-500/10 flex flex-col"
            >
              {/* Close Button floating over video */}
              <button 
                onClick={() => {
                  localStorage.setItem("cv_festa_popup_seen_v3", "true");
                  setShowFestaPopup(false);
                }}
                className="absolute top-4 right-4 text-white/70 hover:text-white text-lg transition-colors cursor-pointer z-50 bg-black/50 hover:bg-black/80 rounded-full w-8 h-8 flex items-center justify-center border border-white/10"
              >
                ✕
              </button>

              {/* YouTube Video Player Embed at the VERY TOP */}
              <div className="relative w-full aspect-video bg-black">
                {popupMutedActive ? (
                  <>
                    <iframe 
                      className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                      src="https://www.youtube.com/embed/Xqcw-NpPz08?autoplay=1&mute=1&controls=0&loop=1&playlist=Xqcw-NpPz08&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0"
                      title="Fábrica de Anúncios Canva Viagem"
                      allow="autoplay; encrypted-media"
                    />
                    
                    {/* Silent Overlay */}
                    <div 
                      onClick={() => setPopupMutedActive(false)}
                      className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-black/30 transition-all"
                    >
                      <div className="absolute top-4 bg-black/85 border border-cyan-500/25 rounded-full px-4 py-1.5 text-[10px] font-black text-cyan-400 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                        ASSISTIR COM SOM (CLIQUE PARA ATIVAR)
                      </div>

                      <div className="hover:scale-105 active:scale-95 transition-all animate-bounce flex items-center gap-2 bg-cyan-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-full shadow-lg shadow-cyan-400/40">
                        <Play size={12} fill="#050D1A" />
                        ATIVAR ÁUDIO DO VÍDEO
                      </div>
                    </div>
                  </>
                ) : (
                  <iframe 
                    className="absolute inset-0 w-full h-full border-0"
                    src="https://www.youtube.com/embed/Xqcw-NpPz08?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0"
                    title="Fábrica de Anúncios Canva Viagem"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Clean, minimal title and closing instruction at bottom */}
              <div className="p-6 text-center bg-[#03070F] border-t border-white/5 space-y-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    A Fábrica de Anúncios Liberou! 🚀🤖
                  </h2>
                  <p className="text-gray-400 text-xs mt-1.5 max-w-lg mx-auto leading-relaxed">
                    A ferramenta mais poderosa do mercado de turismo agora está disponível. Digite a sua oferta e receba seu anúncio pronto com fotos profissionais, preços e o seu logotipo em 5 segundos!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                  <Button
                    onClick={() => {
                      localStorage.setItem("cv_festa_popup_seen_v3", "true");
                      setShowFestaPopup(false);
                      navigate("/inicio2");
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold px-8 py-6 rounded-xl text-xs transition-all uppercase tracking-wider border-0"
                  >
                    Conhecer os Planos (Ativar Fábrica) →
                  </Button>
                  <button 
                    onClick={() => {
                      localStorage.setItem("cv_festa_popup_seen_v3", "true");
                      setShowFestaPopup(false);
                    }}
                    className="text-xs text-white/40 hover:text-white font-bold transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    Permanecer na Página Atual
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;

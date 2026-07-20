import { aiTools } from "@/data/templates";
import { useState, useEffect, useMemo, Suspense, lazy } from "react";
// Build trigger: Freemium Transition - 2026-02-27
import { useNavigate, useLocation, Link } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { templates as localTemplates, feedTemplates as localFeedTemplates, storyTemplates as localStoryTemplates, weeklyStories as localWeeklyStories } from "@/data/templates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { SidebarNav } from "@/components/SidebarNav";
import SeoMetadata from "@/components/SeoMetadata";
const BottomNav = lazy(() => import("@/components/canva/BottomNav").then(module => ({ default: module.BottomNav })));
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));
import { WelcomeTutorialPopup } from "@/components/WelcomeTutorialPopup";
import { TutorialSection } from "@/components/TutorialSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadLinks } from "@/data/downloads";
import { contentLibrary } from "@/data/content-library";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Loader2, Heart, Sparkles, LogOut, User, ArrowRight, Play, Download, Copy, Search, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, Bot, Image, Video, Zap, ShieldCheck, Layout } from "lucide-react";
import { ELITE_OFFER } from "@/lib/eliteOffer";

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
  const [showAllDownloads, setShowAllDownloads] = useState(false);
  const [downloadSearch, setDownloadSearch] = useState("");
  const [contentFilters, setContentFilters] = useState<ContentFilterType[]>([]);
  const [accessFilters, setAccessFilters] = useState<AccessFilterType[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [redirectionTool, setRedirectionTool] = useState<string | null>(null);
  const [showFestaPopup, setShowFestaPopup] = useState(false);

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
  const toolsData = aiTools;
  const toolsLoading = false;
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

  const normalizeText = (text?: string | null) => {
    return (text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const filterTemplates = (items: any[] | undefined): any[] => {
    if (!items) return [];
    const query = normalizeText(searchQuery);

    let filtered = items;
    if (query) {
      filtered = filtered.filter(item => {
        const titleMatch = normalizeText(item.title).includes(query);
        const descMatch = normalizeText(item.description).includes(query);
        const catMatch = normalizeText(item.category).includes(query);
        const tagsMatch = Array.isArray(item.tags) && item.tags.some((tag: string) => normalizeText(tag).includes(query));
        return titleMatch || descMatch || catMatch || tagsMatch;
      });
    }

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
    const query = normalizeText(searchQuery);
    if (!query) return captionsData;
    return captionsData.filter(caption =>
      normalizeText(caption.destination).includes(query) ||
      normalizeText(caption.text).includes(query) ||
      normalizeText(caption.hashtags).includes(query)
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

  const allVideoTemplates = useMemo(() => {
    const fromDb = videoTemplates || [];
    const dbTitles = new Set(fromDb.map(item => (item.title || "").toLowerCase().trim()));
    const uniqueLocal = localTemplates.filter(item => !dbTitles.has((item.title || "").toLowerCase().trim()));
    return [...fromDb, ...uniqueLocal];
  }, [videoTemplates]);

  const filteredVideos = useMemo(() => {
    return filterTemplates(allVideoTemplates).map(video => {
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
  }, [allVideoTemplates, searchQuery, contentFilters, accessFilters]);
  const displayedVideos = (showAllVideos || searchQuery.trim() !== "") ? filteredVideos : filteredVideos.slice(0, 8);

  const filteredCaptions = useMemo(() => filterCaptions(), [captionsData, searchQuery]);
  const displayedCaptions = showAllCaptions ? filteredCaptions : filteredCaptions.slice(0, 8);

  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredVideos]);

  const displayedSortedVideos = (showAllVideos || searchQuery.trim() !== "") ? sortedVideos : sortedVideos.slice(0, 20);

  // Top-level preparation for LCP and Sections
  const coveredVideos = useMemo(() => {
    let videos = searchQuery.trim() !== "" ? sortedVideos : sortedVideos.filter(v => v.image_url);
    if (activeCategory === 'all' && !searchQuery.trim()) {
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
  }, [sortedVideos, activeCategory, searchQuery]);
  const uncoveredVideos = useMemo(() => searchQuery.trim() !== "" ? [] : sortedVideos.filter(v => !v.image_url), [sortedVideos, searchQuery]);
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
    const prioritizedTitles = ["IA Vendedor de Viagens", "Narração de Ofertas de Viagens"];
    const tools = [...toolsData];
    const filteredTools = tools;
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
                  <button onClick={() => navigate("/inicio")} className="underline font-semibold text-foreground">veja o plano Pro</button>.
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
                          isNew={(tool as any).is_new}
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
                            isNew={(tool as any).is_new}
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
            {/* Highlights Section - Show at top if there are highlighted items and no search active */}
            {featuredVideos && featuredVideos.length > 0 && !searchQuery.trim() && (
              <div className="mb-8">
                <SectionHeader
                  title="Destaques: Férias & Alta Temporada ☀️"
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
              title={searchQuery.trim() ? `Resultados para "${searchQuery}"` : "Vídeos Reels Editáveis"}
              subtitle={searchQuery.trim() ? `${displayedSortedVideos.length} vídeo(s) encontrado(s)` : "Templates prontos para editar no Canva e publicar"}
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
                {displayedSortedVideos.length === 0 ? (
                  <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border my-4">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum vídeo encontrado para "{searchQuery}"</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                      Tente pesquisar por outros termos como "Paris", "Maragogi", "Maldivas" ou limpe o filtro atual.
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>
                      Limpar busca
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                    {displayedSortedVideos.map((template, index) => (
                      <PremiumCard
                        key={template.id || `video-${index}`}
                        id={template.id || `video-${index}`}
                        title={template.title}
                        url={template.url} driveUrl={template.drive_url}
                        isNew={template.id ? newestIds.includes(template.id) : (template as any).is_new}
                        icon={getIcon(template.type, template.icon)}
                        imageUrl={template.image_url || undefined}
                        aspectRatio="9/16"
                        category={template.category}
                        contentType={template.type}
                        description={template.description}
                        onClick={() => handleCardClick(template)}
                        isFavorite={template.id ? isFavorite("content_item", template.id) : false}
                        onToggleFavorite={() => template.id && handleToggleFavorite("content_item", template.id)}
                        onPremiumRequired={getPremiumCallback(activeCategory, false, template.type, template.title, index)}
                        isPremium={checkIfItemIsPremium(template.type, template.title, index)}
                      />
                    ))}
                  </div>
                )}

                {!searchQuery.trim() && sortedVideos.length > 20 && (
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

      case 'downloads':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Downloads de Vídeos"
              subtitle="Acesse vídeos prontos para usar"
            />

            <div className="max-w-2xl mx-auto bg-card rounded-3xl shadow-canva p-6">
              <ResourceSection
                title="🗂️ Biblioteca de Vídeos"
                resources={videoDownloads.map(r => ({
                  ...r,
                  onPremiumRequired: getPremiumCallback('downloads', true, 'resource', r.name)
                }))}
                description="Vídeos prontos organizados por categoria"
                locked={!isSubscribed}
                onLockedClick={() => setShowPremiumGate(true)}
              />

              {/* Downloads Individuais */}
              {downloadLinks.length > 0 && (
                <div className="mt-8">
                  <div className="bg-card/50 border border-border/50 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          Downloads Individuais por Destino
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">Baixe os vídeos originais direto do Google Drive.</p>
                      </div>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar destino..."
                          value={downloadSearch}
                          onChange={(e) => setDownloadSearch(e.target.value)}
                          className="pl-9 rounded-full bg-background/50 border-muted"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {downloadLinks
                        .filter(link => link.title.toLowerCase().includes(downloadSearch.toLowerCase()))
                        .slice(0, showAllDownloads ? undefined : 12)
                        .map((link, idx) => {
                          const isLocked = !isSubscribed;
                          if (isLocked) {
                            return (
                              <Button
                                key={idx}
                                variant="outline"
                                className="h-auto py-3 px-2 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-2xl relative overflow-hidden group"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setShowPremiumGate(true);
                                }}
                              >
                                <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm p-1 rounded-full shadow-sm">
                                  <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                                </div>
                                <div className="flex flex-col items-center justify-center w-full h-full gap-2 text-center cursor-pointer opacity-60">
                                  <span className="text-3xl sm:text-4xl grayscale">📥</span>
                                  <span className="text-[10px] sm:text-xs font-medium line-clamp-2 leading-tight w-full px-1">{link.title}</span>
                                </div>
                              </Button>
                            );
                          }
                          return (
                            <Button
                              key={idx}
                              variant="outline"
                              asChild
                              className="h-auto py-3 px-2 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-2xl relative overflow-hidden group"
                              onClick={() => {
                                const cb = getPremiumCallback('all', true, 'resource', link.title);
                                if (cb) cb();
                              }}
                            >
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-full h-full gap-2 text-center">
                                <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">📥</span>
                                <span className="text-[10px] sm:text-xs font-medium line-clamp-2 leading-tight w-full px-1">{link.title}</span>
                              </a>
                            </Button>
                          );
                        })}
                    </div>
                    
                    {downloadLinks.filter(link => link.title.toLowerCase().includes(downloadSearch.toLowerCase())).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum destino encontrado para "{downloadSearch}"
                      </div>
                    )}

                    {downloadLinks.filter(link => link.title.toLowerCase().includes(downloadSearch.toLowerCase())).length > 12 && (
                      <div className="flex justify-center mt-6">
                        <Button
                          variant="ghost"
                          onClick={() => setShowAllDownloads(!showAllDownloads)}
                          className="gap-2 rounded-full px-6 hover:bg-muted/50"
                        >
                          {showAllDownloads ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Mostrar menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Ver todos os destinos
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                      isNew={(tool as any).is_new}
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
          <section className="animate-fade-in pt-4">
            <TutorialSection />
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
      <SidebarNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <Header onCategoryChange={setActiveCategory} />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="container mx-auto px-4 py-4 md:py-6 max-w-7xl flex-1">
          {mainContent}
        </main>

        <BlogSection />
        <Suspense fallback={<div className="h-20" />}>
          <Footer />
        </Suspense>
      </div>

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

      {/* Startup Announcement Popup for subscribers - Mobile First */}
      <AnimatePresence>
        {showFestaPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#F8FAFC] border border-slate-200 rounded-3xl overflow-y-auto max-h-[92vh] w-[calc(100vw-24px)] max-w-[740px] relative shadow-2xl flex flex-col text-slate-900"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  localStorage.setItem("cv_festa_popup_seen_v3", "true");
                  setShowFestaPopup(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-50 bg-white hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center border border-slate-200 shadow-sm font-bold"
              >
                ✕
              </button>

              <div className="p-5 sm:p-7 md:p-8">
                {/* Top Header / Title */}
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-3.5 py-1 shadow-sm">
                    <Crown className="h-3.5 w-3.5 text-purple-700" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-900">Ecossistema #1 do Turismo</span>
                  </div>

                  <h2 className="mt-3 text-2xl sm:text-3xl font-black leading-tight tracking-tight text-slate-900">
                    A Fábrica de Anúncios Liberou! <span className="text-purple-600">🚀⚡</span>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                    A ferramenta mais poderosa do mercado está pronta. Digite o destino e receba seu anúncio pronto em <strong className="text-slate-900 font-bold">5 segundos</strong>.
                  </p>
                </div>

                {/* Prévia dos Entregáveis (O que você recebe no Plano Completo) */}
                <div className="mt-6">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                    <Sparkles className="h-4 w-4 text-purple-600 fill-purple-600" />
                    <span>O que você recebe no Plano Completo:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mt-0.5">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Fábrica de Anúncios IA</h4>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Gerador instantâneo de cards de oferta, fotos e preço com sua logo em 5s.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 mt-0.5">
                        <Image className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">+3.000 Artes Editáveis</h4>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Maior acervo VIP do turismo para Feed, Stories, Reels e WhatsApp.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mt-0.5">
                        <Layout className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Construtor de Sites</h4>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Páginas de pacote de viagem prontas, editáveis e de alta conversão.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Canva Viagem Completo</h4>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Vídeos Reels, Vozes IA, roteiros automáticos e CRM de leads incluso.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Valores do Plano Completo */}
                <div className="mt-6">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                    <span>💳 Escolha seu plano de acesso:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Plano Anual */}
                    <div 
                      onClick={() => {
                        localStorage.setItem("cv_festa_popup_seen_v3", "true");
                        setShowFestaPopup(false);
                        navigate("/inicio");
                      }}
                      className="relative rounded-2xl bg-white border-2 border-[#7C3AED] p-4.5 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Melhor Valor • Mais Popular
                      </div>
                      
                      <div className="pt-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Elite Anual</span>
                        <div className="flex items-baseline gap-1 mt-1 text-[#7C3AED]">
                          <span className="text-sm font-bold">12x</span>
                          <span className="text-3xl font-black tracking-tight">{ELITE_OFFER.annualMonthlyEquivalent}</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 block mt-0.5">ou {ELITE_OFFER.annualPrice} à vista por 1 ano</span>
                      </div>

                      <div className="mt-3.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] p-2 text-[11px] font-bold text-[#15803D] text-center">
                        Economia de {ELITE_OFFER.annualSavings} + 3 dias grátis
                      </div>
                    </div>

                    {/* Plano Mensal */}
                    <div 
                      onClick={() => {
                        localStorage.setItem("cv_festa_popup_seen_v3", "true");
                        setShowFestaPopup(false);
                        navigate("/inicio");
                      }}
                      className="rounded-2xl bg-white border border-slate-200 p-4.5 shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Elite Mensal</span>
                        <div className="flex items-baseline gap-1 mt-1 text-slate-900">
                          <span className="text-3xl font-black tracking-tight">{ELITE_OFFER.monthlyPrice}</span>
                          <span className="text-xs font-bold text-slate-500">/mês</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">Acesso contínuo ao sistema</span>
                      </div>

                      <div className="mt-3.5 rounded-xl bg-slate-100 border border-slate-200 p-2 text-[11px] font-semibold text-slate-600 text-center">
                        Recorrente, sem fidelidade. Cancele quando quiser.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-7 space-y-3">
                  <Button
                    onClick={() => {
                      localStorage.setItem("cv_festa_popup_seen_v3", "true");
                      setShowFestaPopup(false);
                      navigate("/inicio");
                    }}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 border-0 transition-all active:scale-[0.99]"
                  >
                    <span>🔥 CONHECER OS PLANOS (ATIVAR FÁBRICA) →</span>
                  </Button>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-200/80 text-[11px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Garantia incondicional de 7 dias</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem("cv_festa_popup_seen_v3", "true");
                        setShowFestaPopup(false);
                      }}
                      className="text-slate-400 hover:text-slate-700 font-bold transition-colors underline underline-offset-2 cursor-pointer bg-transparent border-0"
                    >
                      Permanecer na página atual
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <WelcomeTutorialPopup />
    </div>
  );
};

export default Index;

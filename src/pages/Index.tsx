import { useState, useEffect, useMemo, Suspense, lazy } from "react";
// Build trigger: Freemium Transition - 2026-02-27
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import SeoMetadata from "@/components/SeoMetadata";
const BottomNav = lazy(() => import("@/components/canva/BottomNav").then(module => ({ default: module.BottomNav })));
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));
import { Button } from "@/components/ui/button";
import { contentLibrary } from "@/data/content-library";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Loader2, Heart, Sparkles, LogOut, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

// Lazy load non-critical components
const PremiumGateModal = lazy(() => import("@/components/PremiumGateModal").then(module => ({ default: module.PremiumGateModal })));
const ResourceSection = lazy(() => import("@/components/ResourceSection").then(module => ({ default: module.ResourceSection })));

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
  useHighlightedItems,
  ContentItem,
  Caption,
} from "@/hooks/useContent";
import { useTrackPageView } from "@/hooks/useAdminDashboard";
import { useFavorites } from "@/hooks/useFavorites";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

// Static resources (downloads and resources that don't need DB management)
import { resources, videoDownloads, feedTemplates as localFeedTemplates } from "@/data/templates";
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

  // Database hooks
  const { data: videoTemplates, isLoading: videosLoading } = useContentItems(['video', 'seasonal']);
  const { data: featuredVideos, isLoading: featuredLoading } = useFeaturedItems();
  const { data: feedTemplates, isLoading: feedLoading } = useContentItems('feed');
  const { data: storyTemplates, isLoading: storiesLoading } = useContentItems(['story', 'weekly-story']);
  const { data: captionsData, isLoading: captionsLoading } = useCaptions();
  const { data: toolsData, isLoading: toolsLoading } = useMarketingTools();
  const { data: offersData, isLoading: offersLoading } = useContentItems('offer');
  const { data: newestIds = [] } = useNewestItemIds();
  const { data: highlightedItems, isLoading: highlightsLoading } = useHighlightedItems();
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

  // Note: Removed blocking loader for better LCP. 
  // We handle loading states within individual components or sections.

  // Check if user is subscribed for showing premium content (logged in + active subscription)
  const isSubscribed = user && subscription.subscribed;

  // Function to get the premium required callback
  const getPremiumCallback = (category?: CategoryType, isItemPremiumOverride?: boolean, itemType?: string, itemTitle?: string, index?: number) => {
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

  const filteredVideos = useMemo(() => filterTemplates(videoTemplates), [videoTemplates, searchQuery, contentFilters, accessFilters]);
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
  const coveredVideos = useMemo(() => sortedVideos.filter(v => v.image_url), [sortedVideos]);
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
    const prioritizedTitles = ["Corpo de Anúncios", "9 Óticas de Hooks"];
    const tools = [...toolsData];
    const filteredTools = tools.filter(t => !t.title.includes("Mr. Beast") && !t.title.includes("Promessas Únicas"));
    return filteredTools.sort((a, b) => {
      const aIndex = prioritizedTitles.findIndex(t => a.title.includes(t));
      const bIndex = prioritizedTitles.findIndex(t => b.title.includes(t));
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
          ? [...coveredVideos.slice(4), ...uncoveredVideos]
          : coveredVideos.slice(4, initialRemainingCount);

        const initialCaptions = filteredCaptions.slice(0, 8);
        const initialOffers = (offersData || []).slice(0, 4);

        // Filter by access if selected
        const allFilterTools = (toolsData || []).filter(tool => {
          if (accessFilters.length === 0) return true;
          const isToolPremium = tool.title.toLowerCase().includes('vendedor') || tool.title.toLowerCase().includes('viaje');
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
            <div className="flex justify-between items-center mb-6 gap-4">
              <AccessFilter
                selectedFilters={accessFilters}
                onFiltersChange={setAccessFilters}
              />
              <ContentFilterDropdown
                selectedFilters={contentFilters}
                onFiltersChange={setContentFilters}
              />
            </div>

            {showOnlyFree ? (
              // Show only FREE AI Tools + Captions when gratis filter active
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ferramentas gratuitas disponíveis na plataforma. Para vídeos, artes e stories —{" "}
                  <button onClick={() => setAccessFilters([])} className="underline font-semibold text-foreground">veja o plano Pro</button>.
                </p>
                {toolsLoading ? (
                  <ToolSkeleton />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allFilterTools.map(tool => {
                      const isToolPremium = tool.title.toLowerCase().includes('vendedor') || tool.title.toLowerCase().includes('viaje');
                      return (
                        <ToolCard
                          key={tool.id}
                          id={tool.id}
                          title={tool.title}
                          url={tool.url}
                          icon={tool.icon}
                          description={tool.description || "Ferramenta de IA para marketing"}
                          isNew={tool.is_new}
                          onClick={() => { trackClick('tool', tool.id); trackActivity('tool'); }}
                          isFavorite={isFavorite("marketing_tool", tool.id)}
                          onToggleFavorite={() => handleToggleFavorite("marketing_tool", tool.id)}
                          onPremiumRequired={getPremiumCallback(activeCategory, isToolPremium, 'tool', tool.title)}
                          isPremium={isToolPremium}
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
                          url={template.url}
                          imageUrl={template.image_url}
                          category={template.category}
                          isNew={(template as any).isNew || (template as any).is_new}
                          icon={getIcon(template.type, template.icon)}
                          aspectRatio="4/5"
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
                        key={template.id} id={template.id} title={template.title} url={template.url}
                        isNew={newestIds.includes(template.id)} icon={getIcon(template.type, template.icon)}
                        imageUrl={template.image_url || undefined}
                        aspectRatio="9/16"
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
                        const isToolPremium = tool.title.toLowerCase().includes('vendedor') || tool.title.toLowerCase().includes('viaje');
                        return (
                          <ToolCard
                            key={tool.id} id={tool.id} title={tool.title} url={tool.url}
                            icon={tool.icon} description={tool.description || "Ferramenta de IA"}
                            isNew={tool.is_new}
                            onClick={() => { trackClick('tool', tool.id); trackActivity('tool'); }}
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

                {/* Remaining videos — 2 cols mobile, 4 cols desktop */}
                {!videosLoading && remainingVideos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {remainingVideos.map((template, index) => (
                      <PremiumCard
                        key={template.id} id={template.id} title={template.title} url={template.url}
                        isNew={newestIds.includes(template.id)} icon={getIcon(template.type, template.icon)}
                        // Performance: Only load images for the first few remaining items to save 75MB+ payload
                        imageUrl={(index < 4 || template.is_featured) ? (template.image_url || undefined) : undefined}
                        aspectRatio={template.image_url ? "9/16" : "1/1"}
                        contentType={template.type}
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
                        if (showAllVideos) {
                          setShowAllVideos(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          setShowAllVideos(true);
                        }
                      }}
                      className="gap-2 rounded-full px-6"
                    >
                      {showAllVideos
                        ? <><ChevronUp className="h-4 w-4" />Mostrar menos</>
                        : <><ChevronDown className="h-4 w-4" />Ver mais vídeos</>}
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
            {highlightedItems && highlightedItems.length > 0 && (
              <div className="mb-8">
                <SectionHeader
                  title="✨ Destaques da Semana"
                  subtitle="Conteúdos em destaque selecionados para você"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {highlightedItems.map(item => (
                    <Card key={item.id} className="overflow-hidden border-primary/30 shadow-lg hover:shadow-xl transition-shadow">
                      {/* Animated Media (GIF or Video) */}
                      {item.media_url ? (
                        <div className="aspect-video bg-muted">
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
                        <div className="aspect-video bg-muted">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
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
                        <Button
                          className="w-full mt-3"
                          onClick={() => {
                            trackClick(item.type, item.id);
                            window.open(item.url, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Editar no Canva
                        </Button>
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

            <div className="flex justify-between items-center mb-6 gap-4">
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
              <ContentFilterDropdown
                selectedFilters={contentFilters}
                onFiltersChange={setContentFilters}
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
                      url={template.url}
                      isNew={newestIds.includes(template.id)}
                      icon={getIcon(template.type, template.icon)}
                      // Performance: Limit images to first 6 items in category view
                      imageUrl={index < 6 && template.image_url ? template.image_url : undefined}
                      aspectRatio="9/16"
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
          <section className="animate-fade-in">
            <SectionHeader
              title="Arte para Agência de Viagens"
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
                    url={template.url}
                    imageUrl={template.image_url}
                    category={template.category}
                    isNew={(template as any).isNew || (template as any).is_new}
                    icon={getIcon(template.type, template.icon)}
                    aspectRatio="4/5"
                    onClick={() => handleCardClick(template as ContentItem)}
                    isFavorite={template.id ? isFavorite("content_item", template.id) : false}
                    onToggleFavorite={() => template.id && handleToggleFavorite("content_item", template.id)}
                    onPremiumRequired={getPremiumCallback(activeCategory, false, template.type, template.title, index)}
                    isPremium={checkIfItemIsPremium(template.type, template.title, index)}
                  />
                ))}
              </div>
            )}
          </section>
        );

      case 'stories':
        return (
          <section className="space-y-12 animate-fade-in">
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
                        url={template.url}
                        isNew={newestIds.includes(template.id)}
                        icon={getIcon(template.type, template.icon)}
                        aspectRatio="9/16"
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

      case 'offers':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Ofertas Validadas"
              subtitle="Textos persuasivos prontos para você copiar e vender mais"
            />

            {offersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(offersData || []).map((offer) => (
                    <OfferCard
                      key={offer.id}
                      id={offer.id}
                      title={offer.title}
                      text={offer.description || ""}
                      isFavorite={isFavorite("content_item", offer.id)}
                      onToggleFavorite={() => handleToggleFavorite("content_item", offer.id)}
                      onPremiumRequired={getPremiumCallback(activeCategory, true, 'offer', offer.title)}
                      isPremium={checkIfItemIsPremium(offer.type, offer.title)}
                    />
                  ))}
                </div>

                {!offersLoading && (!offersData || offersData.length === 0) && (
                  <div className="bg-muted/30 rounded-3xl p-12 text-center border-2 border-dashed border-muted-foreground/20 mt-8">
                    <div className="text-6xl mb-4">📢</div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">Novas Ofertas em Breve</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Estamos validando novas ofertas de alta conversão. Em breve você terá acesso a textos matadores aqui.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        );

      case 'captions':
        return (
          <section className="animate-fade-in">
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
                  const isToolPremium = tool.title.toLowerCase().includes('vendedor') || tool.title.toLowerCase().includes('viaje');
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
                      onPremiumRequired={getPremiumCallback(activeCategory, isToolPremium)}
                      isPremium={isToolPremium}
                    />
                  );
                })}
              </div>
            )}
          </section>
        );

      case 'offers':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Central de Conteúdo"
              subtitle="Ofertas, Rankings e Scripts validados para sua agência"
            />

            <Tabs defaultValue="offer" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="offer">Ofertas</TabsTrigger>
                <TabsTrigger value="ranking">Rankings</TabsTrigger>
                <TabsTrigger value="script">Scripts</TabsTrigger>
                <TabsTrigger value="cta">Frases</TabsTrigger>
              </TabsList>

              {['offer', 'ranking', 'script', 'cta'].map((cat) => (
                <TabsContent key={cat} value={cat}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contentLibrary
                      .filter(item => item.category === cat)
                      .map((item) => (
                        <OfferCard
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          text={item.text}
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
          </section>
        );

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
                          url={template.url}
                          icon={getIcon(template.type, template.icon)}
                          aspectRatio="9/16"
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
                          url={template.url}
                          icon={getIcon(template.type, template.icon)}
                          aspectRatio="4/5"
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
                          url={template.url}
                          icon={getIcon(template.type, template.icon)}
                          aspectRatio="9/16"
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

              {/* Favorite Captions */}
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
                          onPremiumRequired={getPremiumCallback('tools')}
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
        onSearchChange={setSearchQuery}
      />

      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        showFavorites={!!user}
      />

      {renderContent()}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        {lcpImage && <link rel="preload" as="image" href={lcpImage} />}
      </Helmet>
      <SeoMetadata
        title="Início"
        description="Acesse centenas de templates de vídeos Reels e artes para agências de viagens. Conteúdo premium pronto para editar no Canva."
        keywords="templates canva viagens, reels turismo, artes agência de viagens, marketing turístico"
      />
      <Header onCategoryChange={setActiveCategory} />

      <main className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
        {mainContent}
      </main>

      <Suspense fallback={<div className="h-20 bg-muted/20 animate-pulse" />}>
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
    </div>
  );
};

export default Index;

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PremiumGateModal } from "@/components/PremiumGateModal";
import { ResourceSection } from "@/components/ResourceSection";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2, Heart, Sparkles, LogOut, User, ArrowRight, Play, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SpanishPixel } from "@/components/SpanishPixel";

// Canva-style components
import { HeroBanner } from "@/components/canva/HeroBanner";
import { CategoryNav, CategoryType } from "@/components/canva/CategoryNav";
import { PremiumCard } from "@/components/canva/PremiumCard";
import { ContentFilterDropdown, ContentFilterType } from "@/components/canva/ContentFilterDropdown";
import { AccessFilter, AccessFilterType } from "@/components/canva/AccessFilter";
import { SectionHeader } from "@/components/canva/SectionHeader";
import { CaptionCard } from "@/components/canva/CaptionCard";
import { ToolCard } from "@/components/canva/ToolCard";
import { BottomNav } from "@/components/canva/BottomNav";
import { OfferCard } from "@/components/canva/OfferCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SeoMetadata from "@/components/SeoMetadata";

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
import { contentLibraryES } from "@/data/content-library-es";

// ⭐ FORCE SPANISH LANGUAGE ⭐
const FORCED_LANGUAGE = 'es' as const;

// VideoFilter type removed - ES version shows all content without filters

const IndexES = () => {
  const navigate = useNavigate();
  const { user, loading, subscription } = useAuth();
  const { setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllCaptions, setShowAllCaptions] = useState(false);
  const [contentFilters, setContentFilters] = useState<ContentFilterType[]>([]);
  const [accessFilters, setAccessFilters] = useState<AccessFilterType[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  // ⭐ Set document language and context on mount ⭐
  useEffect(() => {
    document.documentElement.lang = 'es';
    setLanguage('es');
  }, [setLanguage]);

  // Video filters removed for ES version - show all content directly

  // ⭐ ALL HOOKS FORCED TO 'es' ⭐
  const { data: videoTemplates, isLoading: videosLoading } = useContentItems(['video', 'seasonal'], undefined, FORCED_LANGUAGE);
  const { data: featuredVideos, isLoading: featuredLoading } = useFeaturedItems(FORCED_LANGUAGE);
  const { data: feedTemplates, isLoading: feedLoading } = useContentItems('feed', undefined, FORCED_LANGUAGE);
  const { data: storyTemplates, isLoading: storiesLoading } = useContentItems(['story', 'weekly-story'], undefined, FORCED_LANGUAGE);
  const { data: captionsData, isLoading: captionsLoading } = useCaptions(undefined, FORCED_LANGUAGE);
  const { data: toolsData, isLoading: toolsLoading } = useMarketingTools(FORCED_LANGUAGE);
  const { data: newestIds = [] } = useNewestItemIds();
  const { data: highlightedItems, isLoading: highlightsLoading } = useHighlightedItems(FORCED_LANGUAGE);
  const { trackClick } = useTrackClick();
  const { trackPageView } = useTrackPageView();
  const { favorites, isFavorite, toggleFavorite, favoritesCount, MAX_FAVORITES } = useFavorites();

  // Track view content when user is logged in
  useEffect(() => {
    if (user) {
      trackViewContent('Plataforma Principal ES');
      trackPageView('/es');
    }
  }, [user, trackPageView]);

  // Note: Removed blocking loader for subscription.loading for better LCP.
  // Free content renders immediately; premium gates update when subscription resolves.

  // Check if user is subscribed for showing premium content (logged in + active subscription)
  const isSubscribed = user && subscription.subscribed;

  // Function to get the premium required callback
  const getPremiumCallback = (category?: CategoryType, isItemPremiumOverride?: boolean, itemType?: string, itemTitle?: string, index?: number) => {
    // 1. Force LOGIN if not logged in at all
    if (!user) {
      return () => {
        toast.info("Inicia sesión para acceder al contenido", {
          description: "Serás redireccionado a la página de inicio de sesión.",
        });
        setTimeout(() => navigate('/auth'), 1500);
      };
    }

    if (isSubscribed) return undefined;

    // Si el elemento es explícitamente premium (ex: ferramenta específica ou override)
    if (isItemPremiumOverride) return () => setShowPremiumGate(true);

    // Biblioteca de vídeos y Reels son SIEMPRE premium
    const premiumTypes = ['video', 'seasonal', 'reel', 'story', 'weekly-story', 'feed'];
    if (itemType && premiumTypes.includes(itemType)) return () => setShowPremiumGate(true);

    // Si la categoría es premium (fallback)
    const isPremium = checkIfItemIsPremium(itemType || category || '', itemTitle, index);
    if (isPremium) return () => setShowPremiumGate(true);

    return undefined;
  };

  const checkIfItemIsPremium = (type: string, title?: string, index?: number) => {
    const itemTitle = title?.toLowerCase() || '';

    // Captions: only first 3 are free
    if (type === 'caption') {
      if (typeof index === 'number') return index >= 3;
      return false;
    }

    // Feed: first 2 are free
    if (type === 'feed') {
      if (typeof index === 'number') return index >= 2;
      return true;
    }

    // Explicit FREE keywords in title override everything
    if (itemTitle.includes('(grátis)') || itemTitle.includes('(gratis)') || itemTitle.includes('gratuito')) {
      return false;
    }

    // AI Tools and Videos are always Premium (per user request)
    if (type === 'video' || type === 'seasonal') return true;

    if (type === 'tool' || type === 'marketing_tool') {
      const freeKeywords = ['anúncio', 'anuncio', 'narração', 'narración'];
      return !freeKeywords.some(keyword => itemTitle.includes(keyword));
    }

    // Weekly stories and heavy resources are premium
    if (type === 'weekly-story' || type === 'resource') return true;

    // Default: Feed and Story templates are free (unless specified premium in title/category later)
    // This ensures "Grátis" filter shows content.
    if (type === 'feed' || type === 'story') return false;

    return true;
  };

  const filterTemplates = (items: ContentItem[] | undefined) => {
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
        if (contentFilters.includes('nacionais') && item.category === 'nacional') return true;
        if (contentFilters.includes('internacionais') && item.category === 'internacional') return true;
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
  };

  const handleCaptionClick = (caption: Caption) => {
    trackClick('caption', caption.id);
  };

  const handleToggleFavorite = (contentType: "content_item" | "caption" | "marketing_tool", contentId: string) => {
    if (!user) {
      toast.error("Inicia sesión para guardar favoritos");
      return;
    }
    toggleFavorite.mutate(
      { contentType, contentId },
      {
        onSuccess: (result) => {
          if (result.action === "added") {
            toast.success("¡Agregado a favoritos!");
          } else {
            toast.info("Eliminado de favoritos");
          }
        },
        onError: () => {
          toast.error("Error al actualizar favoritos");
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

  const displayedSortedVideos = showAllVideos ? sortedVideos : sortedVideos.slice(0, 10);

  // Get weekly stories from story templates
  const weeklyStories = storyTemplates?.filter(s => s.type === 'weekly-story') || [];
  const regularStories = storyTemplates?.filter(s => s.type === 'story') || [];

  const esOffers = useMemo(() => contentLibraryES.filter(item => item.category === 'offer'), []);
  const esRankings = useMemo(() => contentLibraryES.filter(item => item.category === 'ranking'), []);
  const esScripts = useMemo(() => contentLibraryES.filter(item => item.category === 'script'), []);
  const esCtas = useMemo(() => contentLibraryES.filter(item => item.category === 'cta'), []);

  // Loading skeletons for different types
  const ContentSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="aspect-[9/16] rounded-xl" />
      ))}
    </div>
  );

  // Content sections based on active category
  const renderContent = () => {
    switch (activeCategory) {
      case 'all': {
        const firstFourTools = toolsData?.slice(0, 4) || [];
        const coveredVideos = sortedVideos.filter(v => {
          if (!v.image_url) return false;
          const crossedOutTitles = [
            'japão mel', 'japão - mel',
            'bia pacotes',
            'maragogi - al',
            'eva - destinos feriados',
            'tipos de pasajeros', 'tipos de passageiros', 'types of passengers',
            'eva - destinos'
          ];
          return !crossedOutTitles.some(title => v.title.toLowerCase().includes(title));
        });
        const remainingVideos = showAllVideos ? coveredVideos.slice(10) : coveredVideos.slice(10, 20);
        const initialCaptions = captionsData?.slice(0, 8) || [];
        const initialOffers = contentLibraryES.filter(item => item.category === 'offer').slice(0, 2);

        return (
          <section className="animate-fade-in space-y-8">
            <div className="flex items-center mb-6 gap-4">
              <AccessFilter selectedFilters={accessFilters} onFiltersChange={setAccessFilters} />
            </div>

            <div className="space-y-10">
              {/* Row 1: Featured Videos — 2 cols mobile, 5 cols desktop */}
              {coveredVideos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                  {coveredVideos.slice(0, 10).map((template, idx) => (
                    <PremiumCard
                      key={template.id} id={template.id} title={template.title} url={template.url} driveUrl={template.drive_url}
                      isNew={newestIds.includes(template.id)} icon={getIcon(template.type, template.icon)}
                      imageUrl={template.image_url || undefined} aspectRatio="9/16"
                      onClick={() => handleCardClick(template)}
                      isFavorite={isFavorite("content_item", template.id)}
                      onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                      onPremiumRequired={getPremiumCallback('all', false, template.type)}
                      isPremium={checkIfItemIsPremium(template.type, template.title)}
                    />
                  ))}
                </div>
              )}

              {/* Row 2: AI Tools — 2 cols mobile, 4 cols desktop */}
              {!toolsLoading && firstFourTools.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {firstFourTools.map(tool => {
                    const isToolPremium = checkIfItemIsPremium('tool', tool.title);
                    return (
                      <ToolCard
                        key={tool.id} id={tool.id} title={tool.title} url={tool.url}
                        icon={tool.icon} description={tool.description || "IA Tool"}
                        isNew={tool.is_new} onClick={() => trackClick('tool', tool.id)}
                        isFavorite={isFavorite("marketing_tool", tool.id)}
                        onToggleFavorite={() => handleToggleFavorite("marketing_tool", tool.id)}
                        onPremiumRequired={getPremiumCallback('all', isToolPremium, 'tool', tool.title)}
                        isPremium={isToolPremium}
                      />
                    );
                  })}
                </div>
              )}

              {/* Artes para Agencia de Viajes (Feed) — 2 cols mobile, 4 cols desktop */}
              {!feedLoading && localFeedTemplates.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground pt-2">Artes para Agencia de Viajes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {localFeedTemplates.slice(0, 4).map((template, index) => (
                      <PremiumCard
                        key={template.id || `home-feed-es-${index}`}
                        id={template.id || `home-feed-es-${index}`}
                        title={template.title}
                        url={template.url} driveUrl={template.drive_url}
                        imageUrl={template.image_url}
                        category={template.category}
                        isNew={template.is_new}
                        icon={getIcon(template.type, template.icon)}
                        aspectRatio="4/5"
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

              {/* Remaining content */}
              {!videosLoading && remainingVideos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                  {remainingVideos.map((template, index) => (
                    <PremiumCard
                      key={template.id} id={template.id} title={template.title} url={template.url} driveUrl={template.drive_url}
                      isNew={newestIds.includes(template.id)} icon={getIcon(template.type, template.icon)}
                      imageUrl={template.image_url || undefined}
                      aspectRatio="9/16" onClick={() => handleCardClick(template)}
                      isFavorite={isFavorite("content_item", template.id)}
                      onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                      onPremiumRequired={getPremiumCallback('all', false, template.type)}
                      isPremium={checkIfItemIsPremium(template.type, template.title)}
                    />
                  ))}
                </div>
              )}

              {/* Show more button */}
              {(coveredVideos.length > 20) && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => { setActiveCategory('videos'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="gap-2 rounded-full px-6">
                    <>Ver todos los videos Reels</>
                  </Button>
                </div>
              )}

              {/* Preview Captions and Offers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Subtítulos</h3>
                  <div className="space-y-3">
                    {initialCaptions.map((caption, index) => (
                      <div key={caption.id} onClick={() => handleCaptionClick(caption)}>
                        <CaptionCard
                          id={caption.id} destination={caption.destination} text={caption.text}
                          hashtags={caption.hashtags} isFavorite={isFavorite("caption", caption.id)}
                          onToggleFavorite={() => handleToggleFavorite("caption", caption.id)}
                          onPremiumRequired={getPremiumCallback('all', false, 'caption', caption.destination, index)}
                          isPremium={checkIfItemIsPremium('caption', caption.destination, index)}
                        />
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full text-primary" onClick={() => setActiveCategory('captions')}>Ver todos</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Ofertas Validadas</h3>
                  <div className="space-y-3">
                    {initialOffers.map(offer => (
                      <OfferCard
                        key={offer.id} id={offer.id} title={offer.title} text={offer.text}
                        isFavorite={isFavorite("content_item", offer.id)}
                        onToggleFavorite={() => handleToggleFavorite("content_item", offer.id)}
                        onPremiumRequired={getPremiumCallback('offers', true, 'offer')}
                        isPremium={offer.isPremium}
                      />
                    ))}
                    <Button variant="ghost" className="w-full text-primary" onClick={() => setActiveCategory('offers')}>Ver todas</Button>
                  </div>
                </div>
              </div>
            </div>
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
                  title="✨ Destacados de la Semana"
                  subtitle="Contenidos destacados seleccionados para ti"
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
                          Destacado
                        </Badge>
                        <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            className="flex-1"
                            onClick={() => {
                              trackClick(item.type, item.id);
                              window.open(item.url, '_blank');
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          {item.drive_url && (
                            <Button
                              variant="secondary"
                              className="flex-1"
                              onClick={() => window.open(item.drive_url, '_blank')}
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
              title="Videos Reels Editables"
              subtitle="Plantillas listas para editar en Canva y publicar"
            />

            <div className="flex items-center mb-6 gap-4">
              <AccessFilter
                selectedFilters={accessFilters}
                onFiltersChange={setAccessFilters}
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
                      // Os 10 primeiros (featured) podem ter imagem personalizada
                      imageUrl={index < 10 && template.image_url ? template.image_url : undefined}
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
                          Ver más videos ({sortedVideos.length - 10} restantes)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        );

      case 'feed':
        const allFeedTemplates = [...localFeedTemplates, ...(feedTemplates || [])];
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Arte para Agencia de Viajes"
              subtitle="Posts listos para enganchar a tu público"
            />

            {feedLoading ? (
              <ContentSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allFeedTemplates.map((template, index) => (
                  <PremiumCard
                    key={template.id || `local-${index}`}
                    id={template.id || `local-${index}`}
                    title={template.title}
                    url={template.url} driveUrl={template.drive_url}
                    imageUrl={template.image_url}
                    category={template.category}
                    isNew={template.is_new}
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

      case 'offers':
        return (
          <section className="animate-fade-in space-y-8">
            <SectionHeader
              title="Central de Contenido"
              subtitle="Ofertas, Rankings y Scripts listos para tu Agencia"
            />

            <Tabs defaultValue="ofertas" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="ofertas">Ofertas</TabsTrigger>
                <TabsTrigger value="rankings">Rankings</TabsTrigger>
                <TabsTrigger value="scripts">Scripts</TabsTrigger>
                <TabsTrigger value="frases">Frases</TabsTrigger>
              </TabsList>

              <TabsContent value="ofertas" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {esOffers.map((offer) => (
                    <OfferCard
                      key={offer.id} id={offer.id} title={offer.title} text={offer.text}
                      isFavorite={isFavorite("content_item", offer.id)}
                      onToggleFavorite={() => handleToggleFavorite("content_item", offer.id)}
                      onPremiumRequired={getPremiumCallback('offers', offer.isPremium, 'offer')}
                      isPremium={offer.isPremium}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rankings" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {esRankings.map((ranking) => (
                    <OfferCard
                      key={ranking.id} id={ranking.id} title={ranking.title} text={ranking.text}
                      isFavorite={isFavorite("content_item", ranking.id)}
                      onToggleFavorite={() => handleToggleFavorite("content_item", ranking.id)}
                      onPremiumRequired={getPremiumCallback('offers', ranking.isPremium, 'offer')}
                      isPremium={ranking.isPremium}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="scripts" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {esScripts.map((script) => (
                    <OfferCard
                      key={script.id} id={script.id} title={script.title} text={script.text}
                      isFavorite={isFavorite("content_item", script.id)}
                      onToggleFavorite={() => handleToggleFavorite("content_item", script.id)}
                      onPremiumRequired={getPremiumCallback('offers', script.isPremium, 'offer')}
                      isPremium={script.isPremium}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="frases" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {esCtas.map((cta) => (
                    <OfferCard
                      key={cta.id} id={cta.id} title={cta.title} text={cta.text}
                      isFavorite={isFavorite("content_item", cta.id)}
                      onToggleFavorite={() => handleToggleFavorite("content_item", cta.id)}
                      onPremiumRequired={getPremiumCallback('offers', cta.isPremium, 'offer')}
                      isPremium={cta.isPremium}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        );

      case 'stories':
        return (
          <section className="space-y-12 animate-fade-in">
            {storiesLoading ? (
              <ContentSkeleton />
            ) : (
              <>
                {weeklyStories.length > 0 && (
                  <div>
                    <SectionHeader
                      title="Stories Semanales"
                      subtitle="Planificación semanal de contenido"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {weeklyStories.map((story) => (
                        <PremiumCard
                          key={story.id}
                          id={story.id}
                          title={story.title}
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
                    title="Plantillas de Stories"
                    subtitle="Artes individuales para stories"
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
                        onClick={() => handleCardClick(template)}
                        isFavorite={isFavorite("content_item", template.id)}
                        onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                        onPremiumRequired={getPremiumCallback(activeCategory, false, template.type)}
                        isPremium={checkIfItemIsPremium(template.type, template.title)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        );

      case 'captions':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Subtítulos Listos"
              subtitle="Copia y pega subtítulos profesionales para tus posts"
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
                          Ver más subtítulos
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        );

      case 'downloads':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Descargas de Videos"
              subtitle="Accede a videos listos para usar"
            />

            <div className="max-w-2xl mx-auto bg-card rounded-3xl shadow-canva p-6">
              <ResourceSection
                title="📥 Biblioteca de Videos"
                resources={videoDownloads.map(r => ({
                  ...r,
                  onPremiumRequired: getPremiumCallback('downloads', true, 'resource')
                }))}
                description="Videos listos organizados por categoría"
              />
            </div>
          </section>
        );

      case 'tools':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Herramientas de Marketing"
              subtitle="Robots de IA y recursos para agencias"
            />

            <h3 className="font-bold text-foreground mb-5 text-xl">
              Robots de IA para Marketing
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
                      description={tool.description || "Herramienta de IA para marketing"}
                      isNew={tool.is_new}
                      onClick={() => trackClick('tool', tool.id)}
                      isFavorite={isFavorite("marketing_tool", tool.id)}
                      onToggleFavorite={() => handleToggleFavorite("marketing_tool", tool.id)}
                      onPremiumRequired={getPremiumCallback(activeCategory, isToolPremium, 'tool', tool.title)}
                      isPremium={isToolPremium}
                    />
                  );
                })}
              </div>
            )}

            <div className="bg-card rounded-3xl shadow-canva p-6">
              <ResourceSection
                title="📚 Materiales y Recursos"
                resources={resources.map(r => ({
                  ...r,
                  onPremiumRequired: getPremiumCallback('tools', true, 'resource')
                }))}
                description="PDFs, comunidad y calendario editorial"
              />
            </div>
          </section>
        );

      case 'contracts':
        return (
          <section className="animate-fade-in text-center py-12">
            <SectionHeader
              title="Modelos de Contratos"
              subtitle="Documentos jurídicos para tu agencia de viajes"
            />
            <div className="bg-muted/30 rounded-3xl p-12 border-2 border-dashed border-muted-foreground/20">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold mb-2">Próximamente</h3>
              <p className="text-muted-foreground">
                Estamos preparando modelos de contratos profesionales para que los utilices en tu agencia.
              </p>
            </div>
          </section>
        );

      case 'videoaula':
        return (
          <section className="animate-fade-in">
            <SectionHeader
              title="Videoclases"
              subtitle="Aprende a crear contenido profesional"
            />

            <div className="space-y-6">
              <div className="bg-card rounded-3xl shadow-canva p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>🎓</span>
                  Cómo Usar la Plataforma
                </h3>
                <div className="aspect-video w-full rounded-2xl overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/1Or9QJPn6OA"
                    title="Cómo Usar la Plataforma - Videoclase"
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
              title="Mis Favoritos"
              subtitle="Elementos guardados para acceso rápido"
            />

            {favorites.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">Aún no tienes favoritos</p>
                <p className="text-sm">Haz clic en el corazón de los elementos para guardarlos aquí</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Favorite Videos */}
                {(() => {
                  const favoriteVideos = videoTemplates?.filter(v => isFavorite("content_item", v.id)) || [];
                  if (favoriteVideos.length === 0) return null;
                  return (
                    <div>
                      <h3 className="font-bold text-foreground mb-4 text-lg">🎬 Videos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {favoriteVideos.map((template) => (
                          <PremiumCard
                            key={template.id}
                            id={template.id}
                            title={template.title}
                            url={template.url} driveUrl={template.drive_url}
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
                            url={template.url} driveUrl={template.drive_url}
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
                            url={template.url} driveUrl={template.drive_url}
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
                      <h3 className="font-bold text-foreground mb-4 text-lg">✍️ Subtítulos</h3>
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
                            onPremiumRequired={getPremiumCallback(activeCategory)}
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
                      <h3 className="font-bold text-foreground mb-4 text-lg">🤖 Herramientas</h3>
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
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  const mainContent = (
    <>
      {/* Hero Banner with Search */}
      <HeroBanner
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          if (val.trim() !== '' && activeCategory === 'all') {
            setActiveCategory('videos');
          }
        }}
      />

      {/* Category Navigation - Horizontal scroll with icons */}
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          if (cat === 'fabrica') {
            navigate('/es/fabrica');
          } else {
            setActiveCategory(cat);
          }
        }}
        showFavorites={!!user}
      />

      {/* Dynamic Content based on category */}
      {renderContent()}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoMetadata title="Videos para Agencias de Viajes" description="Videos y diseños listos para agencias de viajes. Contenido para Instagram editable en Canva." url="https://canvaviagem.com/es" />
      <SpanishPixel />
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
        {mainContent}
      </main>

      <Footer />

      {/* Bottom Navigation - Mobile only */}
      <BottomNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Premium Gate Modal - triggered by action */}
      <PremiumGateModal
        isOpen={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
      />

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
    </div>
  );
};

export default IndexES;

import { useState, useEffect, useMemo } from "react";
// Build trigger: Freemium Transition - 2026-02-27
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import SeoMetadata from "@/components/SeoMetadata";
import { Footer } from "@/components/Footer";
import { PremiumGateModal } from "@/components/PremiumGateModal";
import { ResourceSection } from "@/components/ResourceSection";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2, Heart, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
import { resources, videoDownloads } from "@/data/templates";
import { trackViewContent } from "@/lib/meta-pixel";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGamification } from "@/hooks/useGamification";
import { checkIfItemIsPremium } from "@/lib/premium-utils";



const Index = () => {
  const navigate = useNavigate();
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
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  // Database hooks
  const { data: videoTemplates, isLoading: videosLoading } = useContentItems(['video', 'seasonal']);
  const { data: featuredVideos, isLoading: featuredLoading } = useFeaturedItems();
  const { data: feedTemplates, isLoading: feedLoading } = useContentItems('feed');
  const { data: storyTemplates, isLoading: storiesLoading } = useContentItems(['story', 'weekly-story']);
  const { data: captionsData, isLoading: captionsLoading } = useCaptions();
  const { data: toolsData, isLoading: toolsLoading } = useMarketingTools();
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

  // Show loading while checking auth
  if (loading || subscription.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is subscribed for showing premium content (logged in + active subscription)
  const isSubscribed = user && subscription.subscribed;

  // Function to get the premium required callback
  const getPremiumCallback = (category?: CategoryType, isItemPremiumOverride?: boolean, itemType?: string, itemTitle?: string) => {
    if (isSubscribed) return undefined;

    // Check if item is premium using centralized logic or override
    const isPremium = isItemPremiumOverride || checkIfItemIsPremium(itemType || category || '', itemTitle);

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

  // Get weekly stories from story templates
  const weeklyStories = storyTemplates?.filter(s => s.type === 'weekly-story') || [];
  const regularStories = storyTemplates?.filter(s => s.type === 'story') || [];

  // Loading skeleton for content
  const ContentSkeleton = () => (
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
        const coveredVideos = sortedVideos.filter(v => v.image_url);
        const uncoveredVideos = sortedVideos.filter(v => !v.image_url);

        const firstFourVideos = coveredVideos.slice(0, 4);
        // After AI tools: remaining covered (always shown) — uncovered only when expanded
        const remainingVideos = showAllVideos
          ? [...coveredVideos.slice(4), ...uncoveredVideos]
          : coveredVideos.slice(4, 20);

        const firstFourTools = (toolsData || []).slice(0, 4);
        const initialCaptions = filteredCaptions.slice(0, 8);

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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                  </div>
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
                          onPremiumRequired={getPremiumCallback(activeCategory, isToolPremium, tool.type || 'tool', tool.title)}
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
              </div>
            ) : (
              // Organized layout: 4 videos → 4 AI tools → remaining videos → 8 captions
              <div className="space-y-8">

                {/* Row 1: First 4 videos — 2 cols mobile, 4 cols desktop */}
                {videosLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[9/16] rounded-2xl" />)}
                  </div>
                ) : firstFourVideos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {firstFourVideos.map((template) => (
                      <PremiumCard
                        key={template.id} id={template.id} title={template.title} url={template.url}
                        isNew={newestIds.includes(template.id)} icon={getIcon(template.type, template.icon)}
                        imageUrl={template.image_url || undefined}
                        aspectRatio="9/16"
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
                          onPremiumRequired={getPremiumCallback(activeCategory, isToolPremium, tool.type || 'tool', tool.title)}
                          isPremium={isToolPremium}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Remaining videos — 2 cols mobile, 4 cols desktop */}
                {!videosLoading && remainingVideos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {remainingVideos.map((template) => (
                      <PremiumCard
                        key={template.id} id={template.id} title={template.title} url={template.url}
                        isNew={newestIds.includes(template.id)} icon={getIcon(template.type, template.icon)}
                        imageUrl={template.image_url || undefined}
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
                {!captionsLoading && initialCaptions.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground pt-2">Legendas</h3>
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
              <ContentSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterTemplates(feedTemplates).map((template) => (
                  <PremiumCard
                    key={template.id}
                    id={template.id}
                    title={template.title}
                    url={template.url}
                    imageUrl={template.image_url}
                    category={template.category}
                    isNew={template.is_new}
                    icon={getIcon(template.type, template.icon)}
                    aspectRatio="4/5"
                    onClick={() => handleCardClick(template)}
                    isFavorite={isFavorite("content_item", template.id)}
                    onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                    onPremiumRequired={getPremiumCallback(activeCategory, false, template.type)}
                    isPremium={checkIfItemIsPremium(template.type, template.title)}
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
              <ContentSkeleton />
            ) : (
              <>
                {weeklyStories.length > 0 && (
                  <div>
                    <SectionHeader
                      title="Stories Semanais"
                      subtitle="Planejamento semanal de conteúdo"
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
                  {displayedCaptions.map((caption) => (
                    <div key={caption.id} onClick={() => handleCaptionClick(caption)}>
                      <CaptionCard
                        id={caption.id}
                        destination={caption.destination}
                        text={caption.text}
                        hashtags={caption.hashtags}
                        isFavorite={isFavorite("caption", caption.id)}
                        onToggleFavorite={() => handleToggleFavorite("caption", caption.id)}
                        onPremiumRequired={getPremiumCallback(activeCategory)}
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
                resources={videoDownloads}
                description="Vídeos prontos organizados por categoria"
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

            <div className="bg-card rounded-3xl shadow-canva p-6">
              <ResourceSection
                title="📚 Materiais e Recursos"
                resources={resources.map(r =>
                  r.name === "Calendário Editorial"
                    ? { ...r, onPremiumRequired: getPremiumCallback('videos') }
                    : r
                )}
                description="PDFs, comunidade e calendário editorial"
              />
            </div>
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
              {/* Primeira Videoaula */}
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

            {favorites.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">Nenhum favorito ainda</p>
                <p className="text-sm">Clique no coração nos itens para salvá-los aqui</p>
              </div>
            ) : (
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
        onSearchChange={setSearchQuery}
      />

      {/* Category Navigation - Horizontal scroll with icons */}
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        showFavorites={!!user}
      />

      {/* Dynamic Content based on category */}
      {renderContent()}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoMetadata
        title="Início"
        description="Acesse centenas de templates de vídeos Reels e artes para agências de viagens. Conteúdo premium pronto para editar no Canva."
        keywords="templates canva viagens, reels turismo, artes agência de viagens, marketing turístico"
      />
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
        {mainContent}
      </main>

      <Footer />

      {/* Floating 'Mostrar menos' button — fixed bottom center when expanded */}
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
    </div>
  );
};

export default Index;

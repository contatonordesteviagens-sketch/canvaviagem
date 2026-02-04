import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PremiumGateModal } from "@/components/PremiumGateModal";
import { ResourceSection } from "@/components/ResourceSection";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2, Heart, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SpanishPixel } from "@/components/SpanishPixel";

// Canva-style components
import { HeroBanner } from "@/components/canva/HeroBanner";
import { CategoryNav, CategoryType } from "@/components/canva/CategoryNav";
import { PremiumCard } from "@/components/canva/PremiumCard";
// FilterChips removed for ES version
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
  // Filters removed for ES - showing all content
  const [activeCategory, setActiveCategory] = useState<CategoryType>('videos');
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

  // Function to get the premium required callback (only for non-subscribers)
  const getPremiumCallback = () => {
    if (isSubscribed) return undefined;
    return () => setShowPremiumGate(true);
  };

  const filterTemplates = (items: ContentItem[] | undefined) => {
    if (!items) return [];
    let filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Para ES, mostrar todo o conteúdo (sem filtro de nacionais)
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

  const filteredVideos = filterTemplates(videoTemplates);
  const displayedVideos = showAllVideos ? filteredVideos : filteredVideos.slice(0, 8);

  const filteredCaptions = filterCaptions();
  const displayedCaptions = showAllCaptions ? filteredCaptions : filteredCaptions.slice(0, 8);

  // Get weekly stories from story templates
  const weeklyStories = storyTemplates?.filter(s => s.type === 'weekly-story') || [];
  const regularStories = storyTemplates?.filter(s => s.type === 'story') || [];

  // Loading skeleton for content
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
      case 'videos':
        // Ordenar: featured primeiro, depois por data (mais recente primeiro)
        const sortedVideos = [...filteredVideos].sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          // Ordenar por data - mais recente primeiro
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        const displayedSortedVideos = showAllVideos ? sortedVideos : sortedVideos.slice(0, 10);
        
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
                        <Button 
                          className="w-full mt-3" 
                          onClick={() => {
                            trackClick(item.type, item.id);
                            window.open(item.url, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Editar en Canva
                        </Button>
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
            
            {/* FilterChips removed - ES version shows all content without filters */}
            
            {videosLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[9/16] rounded-xl" />
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
                      onPremiumRequired={getPremiumCallback()}
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
                {filterTemplates(feedTemplates).map((template) => (
                  <PremiumCard
                    key={template.id}
                    id={template.id}
                    title={template.title}
                    url={template.url}
                    isNew={newestIds.includes(template.id)}
                    icon={getIcon(template.type, template.icon)}
                    aspectRatio="4/5"
                    onClick={() => handleCardClick(template)}
                    isFavorite={isFavorite("content_item", template.id)}
                    onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                    onPremiumRequired={getPremiumCallback()}
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
                          onPremiumRequired={getPremiumCallback()}
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
                        url={template.url}
                        isNew={newestIds.includes(template.id)}
                        icon={getIcon(template.type, template.icon)}
                        aspectRatio="9/16"
                        onClick={() => handleCardClick(template)}
                        isFavorite={isFavorite("content_item", template.id)}
                        onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                        onPremiumRequired={getPremiumCallback()}
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
                  {displayedCaptions.map((caption) => (
                    <div key={caption.id} onClick={() => handleCaptionClick(caption)}>
                      <CaptionCard
                        id={caption.id}
                        destination={caption.destination}
                        text={caption.text}
                        hashtags={caption.hashtags}
                        isFavorite={isFavorite("caption", caption.id)}
                        onToggleFavorite={() => handleToggleFavorite("caption", caption.id)}
                        onPremiumRequired={getPremiumCallback()}
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
                resources={videoDownloads}
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
                {toolsData?.map((tool) => (
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
                    onPremiumRequired={getPremiumCallback()}
                  />
                ))}
              </div>
            )}
            
            <div className="bg-card rounded-3xl shadow-canva p-6">
              <ResourceSection
                title="📚 Materiales y Recursos"
                resources={resources}
                description="PDFs, comunidad y calendario editorial"
              />
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
                            url={template.url}
                            icon={getIcon(template.type, template.icon)}
                            aspectRatio="9/16"
                            onClick={() => handleCardClick(template)}
                            isFavorite={true}
                            onToggleFavorite={() => handleToggleFavorite("content_item", template.id)}
                            onPremiumRequired={getPremiumCallback()}
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
                            onPremiumRequired={getPremiumCallback()}
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
                            onPremiumRequired={getPremiumCallback()}
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
                            onPremiumRequired={getPremiumCallback()}
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
                            onPremiumRequired={getPremiumCallback()}
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SpanishPixel />
      <Header onCategoryChange={setActiveCategory} />
      
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
    </div>
  );
};

export default IndexES;

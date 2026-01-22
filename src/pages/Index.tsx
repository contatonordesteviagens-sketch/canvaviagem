import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PremiumGate } from "@/components/PremiumGate";
import { ResourceSection } from "@/components/ResourceSection";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

// Canva-style components
import { HeroBanner } from "@/components/canva/HeroBanner";
import { CategoryNav, CategoryType } from "@/components/canva/CategoryNav";
import { PremiumCard } from "@/components/canva/PremiumCard";
import { FilterChips } from "@/components/canva/FilterChips";
import { SectionHeader } from "@/components/canva/SectionHeader";
import { CaptionCard } from "@/components/canva/CaptionCard";
import { ToolCard } from "@/components/canva/ToolCard";
import { BottomNav } from "@/components/canva/BottomNav";

import { 
  templates, 
  feedTemplates, 
  storyTemplates, 
  weeklyStories,
  aiTools,
  narracaoTool,
  iaVendedorTool,
  resources,
  videoDownloads 
} from "@/data/templates";
import { captions } from "@/data/captions";
import { trackViewContent } from "@/lib/meta-pixel";

type VideoFilter = 'todos' | 'nacionais' | 'internacionais' | 'eva' | 'mel' | 'bia';

const videoFilters = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'nacionais' as const, label: 'Nacionais' },
  { id: 'internacionais' as const, label: 'Internacionais' },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, subscription } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllCaptions, setShowAllCaptions] = useState(false);
  const [videoFilter, setVideoFilter] = useState<VideoFilter>('todos');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('videos');

  // Track view content when user is logged in
  useEffect(() => {
    if (user) {
      trackViewContent('Plataforma Principal');
    }
  }, [user]);

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

  // Destinos nacionais conhecidos
  const destinosNacionais = [
    'Maragogi', 'Salvador', 'Trancoso', 'Jalapão', 'Foz do Iguaçu', 'Florianópolis',
    'Gramado', 'Natal', 'Fortaleza', 'Pantanal', 'Rio de Janeiro', 'Recife',
    'Balneário Camboriú', 'Alter do Chão', 'Arraial do Cabo', 'Rota das Emoções',
    'Maceió', 'Lençóis Maranhenses', 'Fernando de Noronha', 'Angra dos Reis',
    'Jericoacoara', 'Porto de Galinhas', 'Amazônia', 'Amazonas', 'Alagoas',
    'João Pessoa', 'Ouro Preto', 'Genipabu', '5 Praias Floripa', 'Bonito',
    'Chapada Diamantina', 'Curitiba', 'São Paulo', 'Belo Horizonte', 'Manaus'
  ];

  const isNacional = (title: string) => {
    return destinosNacionais.some(destino => 
      title.toLowerCase().includes(destino.toLowerCase())
    ) || title.includes('- AL') || title.includes('- BA') || title.includes('- CE') || 
    title.includes('- SC') || title.includes('- RN') || title.includes('- TO') ||
    title.includes('- PE') || title.includes('- PB') || title.includes('- MG') ||
    title.includes('- PR') || title.includes('- AM') || title.includes('- PA') ||
    title.includes('- MS');
  };

  const isInfluencer = (title: string, influencer: string) => {
    return title.toLowerCase().includes(influencer.toLowerCase());
  };

  const filterTemplates = (items: typeof templates) => {
    let filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Aplicar filtro de categoria
    if (videoFilter === 'nacionais') {
      filtered = filtered.filter(item => isNacional(item.title));
    } else if (videoFilter === 'internacionais') {
      filtered = filtered.filter(item => !isNacional(item.title) && item.type === 'video');
    } else if (videoFilter === 'eva') {
      filtered = filtered.filter(item => isInfluencer(item.title, 'Eva'));
    } else if (videoFilter === 'mel') {
      filtered = filtered.filter(item => isInfluencer(item.title, 'Mel'));
    } else if (videoFilter === 'bia') {
      filtered = filtered.filter(item => isInfluencer(item.title, 'Bia'));
    }

    return filtered;
  };

  const filterCaptions = () => {
    return captions.filter(caption =>
      caption.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caption.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return "🎬";
      case "feed": return "🖼️";
      case "story": return "📱";
      default: return "✨";
    }
  };

  const filteredVideos = filterTemplates(templates);
  const displayedVideos = showAllVideos ? filteredVideos : filteredVideos.slice(0, 8);

  const filteredCaptions = filterCaptions();
  const displayedCaptions = showAllCaptions ? filteredCaptions : filteredCaptions.slice(0, 8);

  // Combinar ferramentas com IA Vendedor no início (marcado como novo)
  const allTools = [
    { title: iaVendedorTool.title, url: iaVendedorTool.url, icon: iaVendedorTool.icon, isNew: iaVendedorTool.isNew, description: "Crie pacotes e roteiros personalizados em segundos" },
    { title: narracaoTool.title, url: narracaoTool.url, icon: narracaoTool.icon, description: "Gere áudios envolventes para suas promoções" },
    ...aiTools.map(tool => ({ ...tool, description: "Ferramentas de IA para marketing" }))
  ];

  // Content sections based on active category
  const renderContent = () => {
    switch (activeCategory) {
      case 'videos':
        return (
          <section className="animate-fade-in">
            <SectionHeader 
              title="Vídeos Reels Editáveis" 
              subtitle="Templates prontos para editar no Canva e publicar"
            />
            
            <FilterChips<VideoFilter>
              filters={videoFilters}
              activeFilter={videoFilter}
              onFilterChange={(filter) => setVideoFilter(filter)}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayedVideos.map((template, index) => (
                <PremiumCard
                  key={index}
                  title={template.title}
                  url={template.url}
                  category="Vídeos Reels"
                  isNew={template.isNew}
                  icon={getIcon(template.type)}
                  aspectRatio="9/16"
                />
              ))}
            </div>
            
            {filteredVideos.length > 8 && (
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
                      Ver mais vídeos ({filteredVideos.length - 8} restantes)
                    </>
                  )}
                </Button>
              </div>
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterTemplates(feedTemplates).map((template, index) => (
                <PremiumCard
                  key={index}
                  title={template.title}
                  url={template.url}
                  icon={getIcon(template.type)}
                  aspectRatio="4/5"
                />
              ))}
            </div>
          </section>
        );

      case 'stories':
        return (
          <section className="space-y-12 animate-fade-in">
            <div>
              <SectionHeader 
                title="Stories Semanais" 
                subtitle="Planejamento semanal de conteúdo"
              />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {weeklyStories.map((story, index) => (
                  <PremiumCard
                    key={index}
                    title={story.title}
                    url={story.url}
                    icon="📅"
                    aspectRatio="1/1"
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionHeader 
                title="Templates de Stories" 
                subtitle="Artes individuais para stories"
              />
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterTemplates(storyTemplates).map((template, index) => (
                  <PremiumCard
                    key={index}
                    title={template.title}
                    url={template.url}
                    icon={getIcon(template.type)}
                    aspectRatio="9/16"
                  />
                ))}
              </div>
            </div>
          </section>
        );

      case 'captions':
        return (
          <section className="animate-fade-in">
            <SectionHeader 
              title="Legendas Prontas" 
              subtitle="Copie e cole legendas profissionais para seus posts"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedCaptions.map((caption, index) => (
                <CaptionCard
                  key={index}
                  destination={caption.destination}
                  text={caption.text}
                  hashtags={caption.hashtags}
                />
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {allTools.map((tool, index) => (
                <ToolCard
                  key={index}
                  title={tool.title}
                  url={tool.url}
                  icon={tool.icon}
                  description={tool.description}
                  isNew={(tool as any).isNew}
                />
              ))}
            </div>
            
            <div className="bg-card rounded-3xl shadow-canva p-6">
              <ResourceSection
                title="📚 Materiais e Recursos"
                resources={resources}
                description="PDFs, comunidade e calendário editorial"
              />
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
            
            <div className="bg-card rounded-3xl shadow-canva p-8 text-center">
              <span className="text-6xl mb-4 block">🎓</span>
              <h3 className="text-xl font-bold mb-2">Em breve!</h3>
              <p className="text-muted-foreground">
                Novas videoaulas sendo preparadas para você.
              </p>
            </div>
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
      />
      
      {/* Dynamic Content based on category */}
      {renderContent()}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
        {isSubscribed ? mainContent : <PremiumGate>{mainContent}</PremiumGate>}
      </main>
      
      <Footer />
      
      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
};

export default Index;

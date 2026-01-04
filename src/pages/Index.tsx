import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { TemplateCard } from "@/components/TemplateCard";
import { ResourceSection } from "@/components/ResourceSection";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { 
  templates, 
  feedTemplates, 
  storyTemplates, 
  weeklyStories,
  aiTools,
  narracaoTool,
  resources,
  videoDownloads 
} from "@/data/templates";
import { captions } from "@/data/captions";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllCaptions, setShowAllCaptions] = useState(false);

  const filterTemplates = (items: typeof templates) => {
    return items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  // Combinar narracaoTool no início dos aiTools
  const allTools = [
    { title: narracaoTool.title, url: narracaoTool.url, icon: narracaoTool.icon },
    ...aiTools
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Hero />
        
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery}
          placeholder="Buscar destinos, templates, materiais..." 
        />

        <Tabs defaultValue="videos" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto gap-2 bg-muted/50 p-2 rounded-xl">
            <TabsTrigger value="videos" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🎬 Vídeos Reels
            </TabsTrigger>
            <TabsTrigger value="feed" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🖼️ Arte Agência
            </TabsTrigger>
            <TabsTrigger value="stories" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📱 Stories
            </TabsTrigger>
            <TabsTrigger value="captions" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📝 Legendas
            </TabsTrigger>
            <TabsTrigger value="downloads" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📥 Downloads
            </TabsTrigger>
            <TabsTrigger value="tools" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🤖 Ferramentas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Vídeos Reels Editáveis</h2>
              <p className="text-muted-foreground">Templates prontos para editar no Canva e publicar</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayedVideos.map((template, index) => (
                <TemplateCard
                  key={index}
                  title={template.title}
                  url={template.url}
                  icon={getIcon(template.type)}
                  category={template.category}
                />
              ))}
            </div>
            {filteredVideos.length > 8 && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllVideos(!showAllVideos)}
                  className="gap-2"
                >
                  {showAllVideos ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Ver tudo ({filteredVideos.length} vídeos)
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="feed" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Arte para Agência de Viagens</h2>
              <p className="text-muted-foreground">Posts prontos para engajar seu público</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filterTemplates(feedTemplates).map((template, index) => (
                <TemplateCard
                  key={index}
                  title={template.title}
                  url={template.url}
                  icon={getIcon(template.type)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold">Stories Semanais</h2>
                <p className="text-muted-foreground">Planejamento semanal de conteúdo</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {weeklyStories.map((story, index) => (
                  <TemplateCard
                    key={index}
                    title={story.title}
                    url={story.url}
                    icon="📅"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6 mt-12">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold">Templates de Stories</h2>
                <p className="text-muted-foreground">Artes individuais para stories</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filterTemplates(storyTemplates).map((template, index) => (
                  <TemplateCard
                    key={index}
                    title={template.title}
                    url={template.url}
                    icon={getIcon(template.type)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="captions" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Legendas Prontas</h2>
              <p className="text-muted-foreground">Copie e cole legendas profissionais para seus posts</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {displayedCaptions.map((caption, index) => (
                <Card key={index} className="p-4 md:p-6 space-y-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-primary">{caption.destination}</h3>
                    <span className="text-2xl">✍️</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">{caption.text}</p>
                  <p className="text-xs text-accent font-medium">{caption.hashtags}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(`${caption.text}\n\n${caption.hashtags}`);
                    }}
                  >
                    📋 Copiar Legenda
                  </Button>
                </Card>
              ))}
            </div>
            {filteredCaptions.length > 8 && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllCaptions(!showAllCaptions)}
                  className="gap-2"
                >
                  {showAllCaptions ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Ver tudo ({filteredCaptions.length} legendas)
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Downloads de Vídeos</h2>
              <p className="text-muted-foreground">Acesse vídeos prontos para usar</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <ResourceSection
                title="📥 Biblioteca de Vídeos"
                resources={videoDownloads}
                description="Vídeos prontos organizados por categoria"
              />
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Ferramentas de Marketing</h2>
              <p className="text-muted-foreground">Robôs de IA e recursos para agências</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <ResourceSection
                title="🤖 Robôs de IA para Marketing"
                resources={allTools.map(tool => ({ name: tool.title, url: tool.url, icon: tool.icon }))}
                description="Ferramentas de Inteligência Artificial para criar conteúdo"
              />
              
              <ResourceSection
                title="📚 Materiais e Recursos"
                resources={resources}
                description="PDFs, comunidade e calendário editorial"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;

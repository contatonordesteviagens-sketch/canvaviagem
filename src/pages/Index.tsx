import { useState } from "react";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { TemplateCard } from "@/components/TemplateCard";
import { ResourceSection } from "@/components/ResourceSection";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  templates, 
  feedTemplates, 
  storyTemplates, 
  weeklyStories,
  aiTools,
  resources,
  videoDownloads 
} from "@/data/templates";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filterTemplates = (items: typeof templates) => {
    return items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Hero />
        
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery}
          placeholder="Buscar destinos, templates, materiais..." 
        />

        <Tabs defaultValue="videos" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2 bg-muted/50 p-2 rounded-xl">
            <TabsTrigger value="videos" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🎬 Vídeos Reels
            </TabsTrigger>
            <TabsTrigger value="feed" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🖼️ Artes Feed
            </TabsTrigger>
            <TabsTrigger value="stories" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📱 Stories
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterTemplates(templates).map((template, index) => (
                <TemplateCard
                  key={index}
                  title={template.title}
                  url={template.url}
                  icon={getIcon(template.type)}
                  category={template.category}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="feed" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Artes para Feed</h2>
              <p className="text-muted-foreground">Posts prontos para engajar seu público</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                resources={aiTools}
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

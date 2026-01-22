import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Image, BookOpen, FileText, Wrench, Download } from "lucide-react";
import { EditableCard } from "./EditableCard";
import { CaptionCard } from "./CaptionCard";
import { ContentItem, Caption, MarketingTool } from "@/hooks/useContent";

type EditableItem = {
  id: string;
  title: string;
  url: string;
  is_active?: boolean;
};

type EditableCaption = {
  id: string;
  destination: string;
  text: string;
  hashtags: string;
  is_active?: boolean;
};

interface ContentSectionProps {
  contentItems: ContentItem[];
  captions: Caption[];
  tools: MarketingTool[];
  onEditItem: (item: EditableItem) => void;
  onEditCaption: (caption: EditableCaption) => void;
}

export const ContentSection = ({
  contentItems,
  captions,
  tools,
  onEditItem,
  onEditCaption,
}: ContentSectionProps) => {
  // Filter content by type
  const videoItems = contentItems.filter(item => ['video', 'seasonal'].includes(item.type));
  const feedItems = contentItems.filter(item => item.type === 'feed');
  const storyItems = contentItems.filter(item => ['story', 'weekly-story'].includes(item.type));
  const resourceItems = contentItems.filter(item => ['resource', 'download'].includes(item.type));

  const nacionalCaptions = captions.filter(c => c.category === 'nacional');
  const internacionalCaptions = captions.filter(c => c.category === 'internacional');

  return (
    <Tabs defaultValue="videos" className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-2 bg-muted/50 p-2">
        <TabsTrigger value="videos" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Vídeos ({videoItems.length})
        </TabsTrigger>
        <TabsTrigger value="artes" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Artes ({feedItems.length})
        </TabsTrigger>
        <TabsTrigger value="stories" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Stories ({storyItems.length})
        </TabsTrigger>
        <TabsTrigger value="legendas-nac" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Legendas Nac. ({nacionalCaptions.length})
        </TabsTrigger>
        <TabsTrigger value="legendas-int" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Legendas Int. ({internacionalCaptions.length})
        </TabsTrigger>
        <TabsTrigger value="ferramentas" className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Ferramentas ({tools.length})
        </TabsTrigger>
        <TabsTrigger value="recursos" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Recursos ({resourceItems.length})
        </TabsTrigger>
      </TabsList>

      {/* Videos Tab */}
      <TabsContent value="videos" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videoItems.map((item) => (
            <EditableCard
              key={item.id}
              id={item.id}
              title={item.title}
              url={item.url}
              icon={item.icon}
              isActive={item.is_active}
              isNew={item.is_new}
              onEdit={onEditItem}
            />
          ))}
        </div>
      </TabsContent>

      {/* Artes Tab */}
      <TabsContent value="artes" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {feedItems.map((item) => (
            <EditableCard
              key={item.id}
              id={item.id}
              title={item.title}
              url={item.url}
              icon={item.icon}
              isActive={item.is_active}
              isNew={item.is_new}
              onEdit={onEditItem}
            />
          ))}
        </div>
      </TabsContent>

      {/* Stories Tab */}
      <TabsContent value="stories" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {storyItems.map((item) => (
            <EditableCard
              key={item.id}
              id={item.id}
              title={item.title}
              url={item.url}
              icon={item.icon}
              isActive={item.is_active}
              isNew={item.is_new}
              onEdit={onEditItem}
            />
          ))}
        </div>
      </TabsContent>

      {/* Legendas Nacionais Tab */}
      <TabsContent value="legendas-nac" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nacionalCaptions.map((caption) => (
            <CaptionCard
              key={caption.id}
              id={caption.id}
              destination={caption.destination}
              text={caption.text}
              hashtags={caption.hashtags}
              isActive={caption.is_active}
              onEdit={onEditCaption}
            />
          ))}
        </div>
      </TabsContent>

      {/* Legendas Internacionais Tab */}
      <TabsContent value="legendas-int" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internacionalCaptions.map((caption) => (
            <CaptionCard
              key={caption.id}
              id={caption.id}
              destination={caption.destination}
              text={caption.text}
              hashtags={caption.hashtags}
              isActive={caption.is_active}
              onEdit={onEditCaption}
            />
          ))}
        </div>
      </TabsContent>

      {/* Ferramentas Tab */}
      <TabsContent value="ferramentas" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <EditableCard
              key={tool.id}
              id={tool.id}
              title={tool.title}
              url={tool.url}
              icon={tool.icon}
              isActive={tool.is_active}
              isNew={tool.is_new}
              onEdit={onEditItem}
            />
          ))}
        </div>
      </TabsContent>

      {/* Recursos Tab */}
      <TabsContent value="recursos" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resourceItems.map((item) => (
            <EditableCard
              key={item.id}
              id={item.id}
              title={item.title}
              url={item.url}
              icon={item.icon}
              isActive={item.is_active}
              isNew={item.is_new}
              onEdit={onEditItem}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

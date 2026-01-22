import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Image, BookOpen, FileText, Wrench, Download, Plus, ArrowUpDown, Clock, ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import { EditableCard } from "./EditableCard";
import { CaptionCard } from "./CaptionCard";
import { SortableCard } from "./SortableCard";
import { CreateItemModal } from "./CreateItemModal";
import { CreateCaptionModal } from "./CreateCaptionModal";
import { FeaturedCard } from "./FeaturedCard";
import { SelectFeaturedModal } from "./SelectFeaturedModal";
import { ContentItem, Caption, MarketingTool, useCreateContentItem, useCreateCaption, useCreateMarketingTool, useUpdateDisplayOrder, useUpdateContentItem } from "@/hooks/useContent";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

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
  onDeleteItem?: (id: string, title: string) => void;
  onDeleteCaption?: (id: string, title: string) => void;
  onDeleteTool?: (id: string, title: string) => void;
}

type SortOrder = "recent" | "oldest" | "custom";

export const ContentSection = ({
  contentItems,
  captions,
  tools,
  onEditItem,
  onEditCaption,
  onDeleteItem,
  onDeleteCaption,
  onDeleteTool,
}: ContentSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCaptionModalOpen, setCreateCaptionModalOpen] = useState(false);
  const [selectFeaturedModalOpen, setSelectFeaturedModalOpen] = useState(false);
  const [createType, setCreateType] = useState<"content" | "tool">("content");
  const [currentTab, setCurrentTab] = useState("videos");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");

  const createContentItem = useCreateContentItem();
  const createCaption = useCreateCaption();
  const createMarketingTool = useCreateMarketingTool();
  const updateDisplayOrder = useUpdateDisplayOrder();
  const updateContentItem = useUpdateContentItem();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort function
  const sortItems = <T extends { created_at?: string }>(items: T[]): T[] => {
    if (sortOrder === "custom") return items;
    return [...items].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });
  };

  // Filter and sort content by type
  const videoItems = useMemo(() => 
    sortItems(contentItems.filter(item => ['video', 'seasonal'].includes(item.type))),
    [contentItems, sortOrder]
  );
  const feedItems = useMemo(() => 
    sortItems(contentItems.filter(item => item.type === 'feed')),
    [contentItems, sortOrder]
  );
  const storyItems = useMemo(() => 
    sortItems(contentItems.filter(item => ['story', 'weekly-story'].includes(item.type))),
    [contentItems, sortOrder]
  );
  const resourceItems = useMemo(() => 
    sortItems(contentItems.filter(item => ['resource', 'download'].includes(item.type))),
    [contentItems, sortOrder]
  );

  // Featured items (videos with is_featured = true)
  const featuredItems = useMemo(() => 
    contentItems.filter(item => item.is_featured && ['video', 'seasonal'].includes(item.type)),
    [contentItems]
  );

  // Available videos for featuring (not already featured)
  const availableForFeatured = useMemo(() => 
    videoItems.filter(item => !item.is_featured),
    [videoItems]
  );

  const nacionalCaptions = useMemo(() => 
    sortItems(captions.filter(c => c.category === 'nacional')),
    [captions, sortOrder]
  );
  const internacionalCaptions = useMemo(() => 
    sortItems(captions.filter(c => c.category === 'internacional')),
    [captions, sortOrder]
  );

  const sortedTools = useMemo(() => sortItems(tools), [tools, sortOrder]);

  // Sort filter component
  const SortFilter = () => (
    <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
      <SelectTrigger className="w-48">
        <ArrowUpDown className="w-4 h-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recent">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Mais recentes
          </div>
        </SelectItem>
        <SelectItem value="oldest">
          <div className="flex items-center gap-2">
            <ArrowUp className="w-4 h-4" />
            Mais antigos
          </div>
        </SelectItem>
        <SelectItem value="custom">
          <div className="flex items-center gap-2">
            <ArrowDown className="w-4 h-4" />
            Ordem manual (drag)
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );

  const handleDragEnd = (event: DragEndEvent, items: { id: string }[], table: "content_items" | "captions" | "marketing_tools") => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        const updates = newItems.map((item, index) => ({
          id: item.id,
          display_order: index,
        }));

        updateDisplayOrder.mutate(
          { table, items: updates },
          {
            onSuccess: () => {
              toast({
                title: "Ordem atualizada",
                description: "A nova ordem foi salva com sucesso.",
              });
            },
            onError: () => {
              toast({
                title: "Erro",
                description: "Não foi possível salvar a nova ordem.",
                variant: "destructive",
              });
            },
          }
        );
      }
    }
  };

  const handleCreateContent = async (data: any) => {
    try {
      if (createType === "tool") {
        await createMarketingTool.mutateAsync({
          title: data.title,
          url: data.url,
          icon: data.icon,
          is_new: data.is_new,
          is_active: data.is_active,
        });
      } else {
        await createContentItem.mutateAsync(data);
      }
      toast({
        title: "Item criado",
        description: "O novo item foi adicionado com sucesso.",
      });
      setCreateModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o item.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCaption = async (data: any) => {
    try {
      await createCaption.mutateAsync(data);
      toast({
        title: "Legenda criada",
        description: "A nova legenda foi adicionada com sucesso.",
      });
      setCreateCaptionModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a legenda.",
        variant: "destructive",
      });
    }
  };

  const openCreateModal = (type: "content" | "tool") => {
    setCreateType(type);
    setCreateModalOpen(true);
  };

  // Featured handling
  const handleSelectFeatured = async (id: string) => {
    try {
      await supabase
        .from("content_items")
        .update({ is_featured: true })
        .eq("id", id);
      
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      toast({
        title: "Destaque adicionado",
        description: "O vídeo foi marcado como destaque.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar como destaque.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromFeatured = async (id: string) => {
    try {
      await supabase
        .from("content_items")
        .update({ is_featured: false })
        .eq("id", id);
      
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      toast({
        title: "Destaque removido",
        description: "O vídeo foi removido dos destaques.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover dos destaques.",
        variant: "destructive",
      });
    }
  };

  const handleUploadFeaturedImage = async (id: string, file: File) => {
    try {
      // Generate unique filename
      const ext = file.name.split('.').pop();
      const fileName = `featured/${id}_${Date.now()}.${ext}`;
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(fileName);
      
      // Update content_item with new image_url
      const { error: updateError } = await supabase
        .from("content_items")
        .update({ image_url: urlData.publicUrl })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      toast({
        title: "Imagem atualizada",
        description: "A imagem do destaque foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const renderItemGrid = (items: ContentItem[], table: "content_items") => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => handleDragEnd(event, items, table)}
    >
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <SortableCard key={item.id} id={item.id}>
              <EditableCard
                id={item.id}
                title={item.title}
                url={item.url}
                icon={item.icon}
                isActive={item.is_active}
                isNew={item.is_new}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  const renderCaptionGrid = (captionList: Caption[], table: "captions") => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => handleDragEnd(event, captionList, table)}
    >
      <SortableContext items={captionList.map(c => c.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {captionList.map((caption) => (
            <SortableCard key={caption.id} id={caption.id}>
              <CaptionCard
                id={caption.id}
                destination={caption.destination}
                text={caption.text}
                hashtags={caption.hashtags}
                isActive={caption.is_active}
                onEdit={onEditCaption}
                onDelete={onDeleteCaption}
              />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  const renderToolGrid = (toolList: MarketingTool[]) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => handleDragEnd(event, toolList, "marketing_tools")}
    >
      <SortableContext items={toolList.map(t => t.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {toolList.map((tool) => (
            <SortableCard key={tool.id} id={tool.id}>
              <EditableCard
                id={tool.id}
                title={tool.title}
                url={tool.url}
                icon={tool.icon}
                isActive={tool.is_active}
                isNew={tool.is_new}
                onEdit={onEditItem}
                onDelete={onDeleteTool}
              />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  return (
    <>
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-2 bg-muted/50 p-2">
          <TabsTrigger value="destaque" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Destaque ({featuredItems.length}/10)
          </TabsTrigger>
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

        {/* Destaque Tab */}
        <TabsContent value="destaque" className="mt-6">
          <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Mídias em Destaque
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Estas {featuredItems.length}/10 mídias aparecem com imagens personalizadas na plataforma.
                As demais mídias usam apenas ícones.
              </p>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredItems.map(item => (
              <FeaturedCard
                key={item.id}
                item={item}
                onUploadImage={handleUploadFeaturedImage}
                onRemoveFromFeatured={handleRemoveFromFeatured}
                onEdit={onEditItem}
              />
            ))}
            
            {/* Slot to add new featured item (if < 10) */}
            {featuredItems.length < 10 && (
              <Button
                variant="outline"
                className="aspect-[9/16] h-auto border-dashed flex flex-col items-center justify-center gap-2"
                onClick={() => setSelectFeaturedModalOpen(true)}
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm">Adicionar</span>
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Button onClick={() => openCreateModal("content")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Vídeo
            </Button>
            <SortFilter />
          </div>
          {renderItemGrid(videoItems, "content_items")}
        </TabsContent>

        {/* Artes Tab */}
        <TabsContent value="artes" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Button onClick={() => openCreateModal("content")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Arte
            </Button>
            <SortFilter />
          </div>
          {renderItemGrid(feedItems, "content_items")}
        </TabsContent>

        {/* Stories Tab */}
        <TabsContent value="stories" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Button onClick={() => openCreateModal("content")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Story
            </Button>
            <SortFilter />
          </div>
          {renderItemGrid(storyItems, "content_items")}
        </TabsContent>

        {/* Legendas Nacionais Tab */}
        <TabsContent value="legendas-nac" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Button onClick={() => setCreateCaptionModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Legenda
            </Button>
            <SortFilter />
          </div>
          {renderCaptionGrid(nacionalCaptions, "captions")}
        </TabsContent>

        {/* Legendas Internacionais Tab */}
        <TabsContent value="legendas-int" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Button onClick={() => setCreateCaptionModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Legenda
            </Button>
            <SortFilter />
          </div>
          {renderCaptionGrid(internacionalCaptions, "captions")}
        </TabsContent>

        {/* Ferramentas Tab */}
        <TabsContent value="ferramentas" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Button onClick={() => openCreateModal("tool")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Ferramenta
            </Button>
            <SortFilter />
          </div>
          {renderToolGrid(sortedTools)}
        </TabsContent>

        {/* Recursos Tab */}
        <TabsContent value="recursos" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Button onClick={() => openCreateModal("content")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Recurso
            </Button>
            <SortFilter />
          </div>
          {renderItemGrid(resourceItems, "content_items")}
        </TabsContent>
      </Tabs>

      <CreateItemModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateContent}
        isSaving={createContentItem.isPending || createMarketingTool.isPending}
        itemType={createType}
      />

      <CreateCaptionModal
        isOpen={createCaptionModalOpen}
        onClose={() => setCreateCaptionModalOpen(false)}
        onSave={handleCreateCaption}
        isSaving={createCaption.isPending}
      />

      <SelectFeaturedModal
        isOpen={selectFeaturedModalOpen}
        onClose={() => setSelectFeaturedModalOpen(false)}
        availableVideos={availableForFeatured}
        onSelect={handleSelectFeatured}
      />
    </>
  );
};

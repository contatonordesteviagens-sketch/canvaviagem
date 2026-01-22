import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Video, Image, BookOpen, FileText, Wrench, Download, Plus } from "lucide-react";
import { EditableCard } from "./EditableCard";
import { CaptionCard } from "./CaptionCard";
import { SortableCard } from "./SortableCard";
import { CreateItemModal } from "./CreateItemModal";
import { CreateCaptionModal } from "./CreateCaptionModal";
import { ContentItem, Caption, MarketingTool, useCreateContentItem, useCreateCaption, useCreateMarketingTool, useUpdateDisplayOrder } from "@/hooks/useContent";
import { useToast } from "@/hooks/use-toast";
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
  verticalListSortingStrategy,
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
}

export const ContentSection = ({
  contentItems,
  captions,
  tools,
  onEditItem,
  onEditCaption,
}: ContentSectionProps) => {
  const { toast } = useToast();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCaptionModalOpen, setCreateCaptionModalOpen] = useState(false);
  const [createType, setCreateType] = useState<"content" | "tool">("content");
  const [currentTab, setCurrentTab] = useState("videos");

  const createContentItem = useCreateContentItem();
  const createCaption = useCreateCaption();
  const createMarketingTool = useCreateMarketingTool();
  const updateDisplayOrder = useUpdateDisplayOrder();

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

  // Filter content by type
  const videoItems = contentItems.filter(item => ['video', 'seasonal'].includes(item.type));
  const feedItems = contentItems.filter(item => item.type === 'feed');
  const storyItems = contentItems.filter(item => ['story', 'weekly-story'].includes(item.type));
  const resourceItems = contentItems.filter(item => ['resource', 'download'].includes(item.type));

  const nacionalCaptions = captions.filter(c => c.category === 'nacional');
  const internacionalCaptions = captions.filter(c => c.category === 'internacional');

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
          <div className="mb-4">
            <Button onClick={() => openCreateModal("content")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Vídeo
            </Button>
          </div>
          {renderItemGrid(videoItems, "content_items")}
        </TabsContent>

        {/* Artes Tab */}
        <TabsContent value="artes" className="mt-6">
          <div className="mb-4">
            <Button onClick={() => openCreateModal("content")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Arte
            </Button>
          </div>
          {renderItemGrid(feedItems, "content_items")}
        </TabsContent>

        {/* Stories Tab */}
        <TabsContent value="stories" className="mt-6">
          <div className="mb-4">
            <Button onClick={() => openCreateModal("content")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Story
            </Button>
          </div>
          {renderItemGrid(storyItems, "content_items")}
        </TabsContent>

        {/* Legendas Nacionais Tab */}
        <TabsContent value="legendas-nac" className="mt-6">
          <div className="mb-4">
            <Button onClick={() => setCreateCaptionModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Legenda
            </Button>
          </div>
          {renderCaptionGrid(nacionalCaptions, "captions")}
        </TabsContent>

        {/* Legendas Internacionais Tab */}
        <TabsContent value="legendas-int" className="mt-6">
          <div className="mb-4">
            <Button onClick={() => setCreateCaptionModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Legenda
            </Button>
          </div>
          {renderCaptionGrid(internacionalCaptions, "captions")}
        </TabsContent>

        {/* Ferramentas Tab */}
        <TabsContent value="ferramentas" className="mt-6">
          <div className="mb-4">
            <Button onClick={() => openCreateModal("tool")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Ferramenta
            </Button>
          </div>
          {renderToolGrid(tools)}
        </TabsContent>

        {/* Recursos Tab */}
        <TabsContent value="recursos" className="mt-6">
          <div className="mb-4">
            <Button onClick={() => openCreateModal("content")} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Recurso
            </Button>
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
    </>
  );
};

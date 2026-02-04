import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Video, Image, BookOpen, FileText, Wrench, Download, Plus, ArrowUpDown, Clock, ArrowDown, ArrowUp, Sparkles, ChevronDown, FileStack, Globe } from "lucide-react";
import { EditableCard } from "./EditableCard";
import { CaptionCard } from "./CaptionCard";
import { SortableCard } from "./SortableCard";
import { CreateItemModal } from "./CreateItemModal";
import { CreateCaptionModal } from "./CreateCaptionModal";
import { FeaturedCard } from "./FeaturedCard";
import { SelectFeaturedModal } from "./SelectFeaturedModal";
import { BulkAddModal } from "./BulkAddModal";
import { ContentFilters } from "./ContentFilters";
import { ContentItem, Caption, MarketingTool, useCreateContentItem, useCreateCaption, useCreateMarketingTool, useUpdateDisplayOrder, useUpdateContentItem } from "@/hooks/useContent";
import { useInvalidateContent } from "@/hooks/useInvalidateContent";
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
  description?: string | null;
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
  const [bulkAddModalOpen, setBulkAddModalOpen] = useState(false);
  const [createType, setCreateType] = useState<"content" | "tool">("content");
  const [currentTab, setCurrentTab] = useState("videos");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent"); // Default to recent
  const [languageFilter, setLanguageFilter] = useState<"all" | "pt" | "es">("all");
  const [featuredLanguageTab, setFeaturedLanguageTab] = useState<"pt" | "es">("pt");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const createContentItem = useCreateContentItem();
  const createCaption = useCreateCaption();
  const createMarketingTool = useCreateMarketingTool();
  const updateDisplayOrder = useUpdateDisplayOrder();
  const updateContentItem = useUpdateContentItem();
  const { invalidateAll } = useInvalidateContent();

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

  // Apply search and category filters
  const filterItems = <T extends { title?: string; category?: string | null }>(items: T[]): T[] => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  // Filter and sort content by type
  const videoItems = useMemo(() => {
    let filtered = contentItems.filter(item => ['video', 'seasonal'].includes(item.type));
    
    // Apply language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter(item => {
        const itemLang = item.language || 'pt';
        return itemLang === languageFilter;
      });
    }
    
    return sortItems(filterItems(filtered));
  }, [contentItems, sortOrder, searchQuery, categoryFilter, languageFilter]);
  const feedItems = useMemo(() => 
    sortItems(filterItems(contentItems.filter(item => item.type === 'feed'))),
    [contentItems, sortOrder, searchQuery, categoryFilter]
  );
  const storyItems = useMemo(() => 
    sortItems(filterItems(contentItems.filter(item => ['story', 'weekly-story'].includes(item.type)))),
    [contentItems, sortOrder, searchQuery, categoryFilter]
  );
  const resourceItems = useMemo(() => 
    sortItems(filterItems(contentItems.filter(item => ['resource', 'download'].includes(item.type)))),
    [contentItems, sortOrder, searchQuery, categoryFilter]
  );

  // Featured items separated by language
  const featuredPT = useMemo(() => 
    contentItems.filter(item => 
      item.is_featured && 
      ['video', 'seasonal'].includes(item.type) &&
      (item.language === 'pt' || !item.language)
    ),
    [contentItems]
  );

  const featuredES = useMemo(() => 
    contentItems.filter(item => 
      item.is_featured && 
      ['video', 'seasonal'].includes(item.type) &&
      item.language === 'es'
    ),
    [contentItems]
  );

  // Legacy: total featured items for backwards compatibility
  const featuredItems = useMemo(() => 
    [...featuredPT, ...featuredES],
    [featuredPT, featuredES]
  );

  // Available videos for featuring (filtered by active language tab)
  const availableForFeaturedByLanguage = useMemo(() => {
    const lang = featuredLanguageTab;
    return videoItems.filter(item => 
      !item.is_featured && 
      (lang === 'pt' 
        ? (item.language === 'pt' || !item.language) 
        : item.language === 'es'
      )
    );
  }, [videoItems, featuredLanguageTab]);

  // Filter captions
  const filterCaptions = (captionList: Caption[]): Caption[] => {
    return captionList.filter(caption => {
      const matchesSearch = !searchQuery || 
        caption.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caption.text?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const nacionalCaptions = useMemo(() => 
    sortItems(filterCaptions(captions.filter(c => c.category === 'nacional'))),
    [captions, sortOrder, searchQuery]
  );
  const internacionalCaptions = useMemo(() => 
    sortItems(filterCaptions(captions.filter(c => c.category === 'internacional'))),
    [captions, sortOrder, searchQuery]
  );

  const sortedTools = useMemo(() => {
    const filtered = tools.filter(tool => {
      const matchesSearch = !searchQuery || 
        tool.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    return sortItems(filtered);
  }, [tools, sortOrder, searchQuery]);

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

        // Determine query key based on table
        const queryKey = table === "content_items" 
          ? ["all-content-items"] 
          : table === "captions" 
          ? ["all-captions"] 
          : ["all-marketing-tools"];

        // OPTIMISTIC UPDATE - update cache immediately
        queryClient.setQueryData(queryKey, (old: any[] | undefined) => {
          if (!old) return old;
          const updated = [...old];
          updates.forEach((update) => {
            const itemIndex = updated.findIndex(i => i.id === update.id);
            if (itemIndex !== -1) {
              updated[itemIndex] = { ...updated[itemIndex], display_order: update.display_order };
            }
          });
          return updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        });

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
              // Revert on error by refetching
              queryClient.invalidateQueries({ queryKey });
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

  // Bulk add handler
  const handleBulkAdd = async (items: { title: string; url: string; type: string; category: string | null; icon: string }[]) => {
    try {
      for (const item of items) {
        await createContentItem.mutateAsync({
          title: item.title,
          url: item.url,
          type: item.type,
          category: item.category,
          icon: item.icon,
          is_new: false,
          is_active: true,
        });
      }
      toast({
        title: "Importação concluída",
        description: `${items.length} item(s) foram adicionados com sucesso.`,
      });
      setBulkAddModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível importar alguns itens.",
        variant: "destructive",
      });
    }
  };

  // Featured handling
  const handleSelectFeatured = async (id: string) => {
    try {
      await supabase
        .from("content_items")
        .update({ is_featured: true })
        .eq("id", id);
      
      invalidateAll(); // Invalidate all caches for immediate sync
      toast({
        title: "Prévia adicionada",
        description: "O vídeo foi adicionado à prévia.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar à prévia.",
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
      
      invalidateAll(); // Invalidate all caches for immediate sync
      toast({
        title: "Prévia removida",
        description: "O vídeo foi removido da prévia.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover da prévia.",
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
      
      invalidateAll(); // Invalidate all caches for immediate sync
      toast({
        title: "Imagem atualizada",
        description: "A imagem da prévia foi atualizada com sucesso.",
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

  const handleUpdateImageUrl = async (id: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from("content_items")
        .update({ image_url: imageUrl })
        .eq("id", id);
      
      if (error) throw error;
      
      invalidateAll(); // Invalidate all caches for immediate sync
      toast({
        title: "Imagem atualizada",
        description: "A URL da imagem foi salva com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a imagem.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const item = contentItems.find(i => i.id === id);
    if (!item) return;
    
    // Check if marking as featured and limit is reached per language
    const itemLanguage = item.language || 'pt';
    const featuredForLanguage = itemLanguage === 'es' ? featuredES : featuredPT;
    
    if (!item.is_featured && featuredForLanguage.length >= 10) {
      toast({
        title: "Limite atingido",
        description: `Você já possui 10 itens de prévia em ${itemLanguage === 'es' ? 'Espanhol' : 'Português'}. Remova um para adicionar outro.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      await supabase
        .from("content_items")
        .update({ is_featured: !item.is_featured })
        .eq("id", id);
      
      invalidateAll(); // Invalidate all caches for immediate sync
      toast({
        title: item.is_featured ? "Prévia removida" : "Prévia adicionada",
        description: item.is_featured 
          ? "O vídeo foi removido da prévia." 
          : "O vídeo foi adicionado à prévia.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a prévia.",
        variant: "destructive",
      });
    }
  };

  const renderVideoGrid = (items: ContentItem[], table: "content_items") => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => handleDragEnd(event, items, table)}
    >
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <SortableCard key={item.id} id={item.id} disabled={sortOrder !== "custom"}>
              <EditableCard
                id={item.id}
                title={item.title}
                url={item.url}
                icon={item.icon}
                description={item.description}
                hasCaption={!!item.description?.trim()}
                isActive={item.is_active}
                isNew={item.is_new}
                isFeatured={item.is_featured}
                onToggleFeatured={handleToggleFeatured}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  const renderItemGrid = (items: ContentItem[], table: "content_items") => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => handleDragEnd(event, items, table)}
    >
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <SortableCard key={item.id} id={item.id} disabled={sortOrder !== "custom"}>
              <EditableCard
                id={item.id}
                title={item.title}
                url={item.url}
                icon={item.icon}
                description={item.description}
                hasCaption={!!item.description?.trim()}
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
            <SortableCard key={caption.id} id={caption.id} disabled={sortOrder !== "custom"}>
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
            <SortableCard key={tool.id} id={tool.id} disabled={sortOrder !== "custom"}>
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
            Prévia (PT: {featuredPT.length} | ES: {featuredES.length})
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
                Prévia de Mídias por Idioma
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie até 10 itens de prévia para cada idioma. Os usuários verão apenas os itens do idioma selecionado.
              </p>
            </CardHeader>
          </Card>
          
          {/* Sub-tabs by language */}
          <Tabs value={featuredLanguageTab} onValueChange={(v) => setFeaturedLanguageTab(v as "pt" | "es")}>
            <TabsList className="mb-4">
              <TabsTrigger value="pt" className="flex items-center gap-2">
                🇧🇷 Prévia PT ({featuredPT.length}/10)
              </TabsTrigger>
              <TabsTrigger value="es" className="flex items-center gap-2">
                🇪🇸 Prévia ES ({featuredES.length}/10)
              </TabsTrigger>
            </TabsList>
            
            {/* PT Content */}
            <TabsContent value="pt">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {featuredPT.map(item => (
                  <FeaturedCard
                    key={item.id}
                    item={item}
                    onUploadImage={handleUploadFeaturedImage}
                    onUpdateImageUrl={handleUpdateImageUrl}
                    onRemoveFromFeatured={handleRemoveFromFeatured}
                    onEdit={onEditItem}
                  />
                ))}
                
                {/* Slot to add new featured item (if < 10) */}
                {featuredPT.length < 10 && (
                  <Button
                    variant="outline"
                    className="aspect-[9/16] h-auto border-dashed flex flex-col items-center justify-center gap-2"
                    onClick={() => setSelectFeaturedModalOpen(true)}
                  >
                    <Plus className="h-8 w-8" />
                    <span className="text-sm">Adicionar</span>
                    <span className="text-xs text-muted-foreground">({featuredPT.length}/10)</span>
                  </Button>
                )}
                
                {featuredPT.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma prévia em Português</p>
                    <p className="text-sm">Clique em "Adicionar" para selecionar um vídeo.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* ES Content */}
            <TabsContent value="es">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {featuredES.map(item => (
                  <FeaturedCard
                    key={item.id}
                    item={item}
                    onUploadImage={handleUploadFeaturedImage}
                    onUpdateImageUrl={handleUpdateImageUrl}
                    onRemoveFromFeatured={handleRemoveFromFeatured}
                    onEdit={onEditItem}
                  />
                ))}
                
                {/* Slot to add new featured item (if < 10) */}
                {featuredES.length < 10 && (
                  <Button
                    variant="outline"
                    className="aspect-[9/16] h-auto border-dashed flex flex-col items-center justify-center gap-2"
                    onClick={() => setSelectFeaturedModalOpen(true)}
                  >
                    <Plus className="h-8 w-8" />
                    <span className="text-sm">Adicionar</span>
                    <span className="text-xs text-muted-foreground">({featuredES.length}/10)</span>
                  </Button>
                )}
                
                {featuredES.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma prévia em Espanhol</p>
                    <p className="text-sm">Clique em "Adicionar" para selecionar um vídeo.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="mt-6">
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => openCreateModal("content")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Adicionar Individual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setBulkAddModalOpen(true)}>
                    <FileStack className="h-4 w-4 mr-2" />
                    Adicionar em Massa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <SortFilter />
            </div>
            <ContentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              languageFilter={languageFilter}
              onLanguageChange={(v) => setLanguageFilter(v as "all" | "pt" | "es")}
              showTypeFilter={false}
              showLanguageFilter={true}
            />
          </div>
          {renderVideoGrid(videoItems, "content_items")}
        </TabsContent>

        {/* Artes Tab */}
        <TabsContent value="artes" className="mt-6">
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => openCreateModal("content")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Adicionar Individual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setBulkAddModalOpen(true)}>
                    <FileStack className="h-4 w-4 mr-2" />
                    Adicionar em Massa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <SortFilter />
            </div>
            <ContentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              showTypeFilter={false}
            />
          </div>
          {renderItemGrid(feedItems, "content_items")}
        </TabsContent>

        {/* Stories Tab */}
        <TabsContent value="stories" className="mt-6">
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => openCreateModal("content")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Adicionar Individual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setBulkAddModalOpen(true)}>
                    <FileStack className="h-4 w-4 mr-2" />
                    Adicionar em Massa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <SortFilter />
            </div>
            <ContentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              showTypeFilter={false}
            />
          </div>
          {renderItemGrid(storyItems, "content_items")}
        </TabsContent>

        {/* Legendas Nacionais Tab */}
        <TabsContent value="legendas-nac" className="mt-6">
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={() => setCreateCaptionModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Legenda
              </Button>
              <SortFilter />
            </div>
            <ContentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              showTypeFilter={false}
            />
          </div>
          {renderCaptionGrid(nacionalCaptions, "captions")}
        </TabsContent>

        {/* Legendas Internacionais Tab */}
        <TabsContent value="legendas-int" className="mt-6">
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={() => setCreateCaptionModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Legenda
              </Button>
              <SortFilter />
            </div>
            <ContentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              showTypeFilter={false}
            />
          </div>
          {renderCaptionGrid(internacionalCaptions, "captions")}
        </TabsContent>

        {/* Ferramentas Tab */}
        <TabsContent value="ferramentas" className="mt-6">
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={() => openCreateModal("tool")} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Ferramenta
              </Button>
              <SortFilter />
            </div>
            <ContentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              showTypeFilter={false}
            />
          </div>
          {renderToolGrid(sortedTools)}
        </TabsContent>

        {/* Recursos Tab */}
        <TabsContent value="recursos" className="mt-6">
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => openCreateModal("content")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Adicionar Individual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setBulkAddModalOpen(true)}>
                    <FileStack className="h-4 w-4 mr-2" />
                    Adicionar em Massa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <SortFilter />
            </div>
            <ContentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              showTypeFilter={false}
            />
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
        availableVideos={availableForFeaturedByLanguage}
        onSelect={handleSelectFeatured}
        language={featuredLanguageTab}
      />

      <BulkAddModal
        isOpen={bulkAddModalOpen}
        onClose={() => setBulkAddModalOpen(false)}
        onSave={handleBulkAdd}
        isSaving={createContentItem.isPending}
      />
    </>
  );
};

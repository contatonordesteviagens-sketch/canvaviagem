import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Video, FileText, Wrench, Image, BookOpen, Download } from "lucide-react";
import { EditableCard } from "@/components/gestao/EditableCard";
import { CaptionCard } from "@/components/gestao/CaptionCard";
import { EditModal } from "@/components/gestao/EditModal";
import { CaptionEditModal } from "@/components/gestao/CaptionEditModal";
import {
  useAllContentItems,
  useAllCaptions,
  useAllMarketingTools,
  useUpdateContentItem,
  useUpdateCaption,
  useUpdateMarketingTool,
} from "@/hooks/useContent";
import { toast } from "sonner";

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

const Gestao = () => {
  const { user, loading, isAdmin } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [captionModalOpen, setCaptionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EditableItem | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<EditableCaption | null>(null);

  const { data: contentItems, isLoading: loadingContent } = useAllContentItems();
  const { data: captions, isLoading: loadingCaptions } = useAllCaptions();
  const { data: tools, isLoading: loadingTools } = useAllMarketingTools();

  const updateContent = useUpdateContentItem();
  const updateCaption = useUpdateCaption();
  const updateTool = useUpdateMarketingTool();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Filter content by type
  const videoItems = contentItems?.filter(item => ['video', 'seasonal'].includes(item.type)) || [];
  const feedItems = contentItems?.filter(item => item.type === 'feed') || [];
  const storyItems = contentItems?.filter(item => ['story', 'weekly-story'].includes(item.type)) || [];
  const resourceItems = contentItems?.filter(item => ['resource', 'download'].includes(item.type)) || [];

  const nacionalCaptions = captions?.filter(c => c.category === 'nacional') || [];
  const internacionalCaptions = captions?.filter(c => c.category === 'internacional') || [];

  const handleEditItem = (item: EditableItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleEditCaption = (caption: EditableCaption) => {
    setSelectedCaption(caption);
    setCaptionModalOpen(true);
  };

  const handleSaveItem = (id: string, data: { title: string; url: string; is_active: boolean }) => {
    updateContent.mutate(
      { id, ...data },
      {
        onSuccess: () => {
          toast.success("Item atualizado com sucesso!");
          setEditModalOpen(false);
        },
        onError: (error) => {
          toast.error("Erro ao atualizar item");
          console.error(error);
        },
      }
    );
  };

  const handleSaveTool = (id: string, data: { title: string; url: string; is_active: boolean }) => {
    updateTool.mutate(
      { id, ...data },
      {
        onSuccess: () => {
          toast.success("Ferramenta atualizada com sucesso!");
          setEditModalOpen(false);
        },
        onError: (error) => {
          toast.error("Erro ao atualizar ferramenta");
          console.error(error);
        },
      }
    );
  };

  const handleSaveCaption = (id: string, data: { destination: string; text: string; hashtags: string; is_active: boolean }) => {
    updateCaption.mutate(
      { id, ...data },
      {
        onSuccess: () => {
          toast.success("Legenda atualizada com sucesso!");
          setCaptionModalOpen(false);
        },
        onError: (error) => {
          toast.error("Erro ao atualizar legenda");
          console.error(error);
        },
      }
    );
  };

  const isLoadingData = loadingContent || loadingCaptions || loadingTools;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Gestão do Canvatrip</h1>
          <p className="text-muted-foreground">Gerencie todo o conteúdo da plataforma</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
                Legendas Nacionais ({nacionalCaptions.length})
              </TabsTrigger>
              <TabsTrigger value="legendas-int" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Legendas Int. ({internacionalCaptions.length})
              </TabsTrigger>
              <TabsTrigger value="ferramentas" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Ferramentas ({tools?.length || 0})
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
                    onEdit={handleEditItem}
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
                    onEdit={handleEditItem}
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
                    onEdit={handleEditItem}
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
                    onEdit={handleEditCaption}
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
                    onEdit={handleEditCaption}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Ferramentas Tab */}
            <TabsContent value="ferramentas" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tools?.map((tool) => (
                  <EditableCard
                    key={tool.id}
                    id={tool.id}
                    title={tool.title}
                    url={tool.url}
                    icon={tool.icon}
                    isActive={tool.is_active}
                    isNew={tool.is_new}
                    onEdit={(item) => {
                      setSelectedItem(item);
                      setEditModalOpen(true);
                    }}
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
                    onEdit={handleEditItem}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit Modals */}
      <EditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        item={selectedItem}
        onSave={(id, data) => {
          // Detect if it's a tool or content item based on where it came from
          const isTool = tools?.some(t => t.id === id);
          if (isTool) {
            handleSaveTool(id, data);
          } else {
            handleSaveItem(id, data);
          }
        }}
        isSaving={updateContent.isPending || updateTool.isPending}
      />

      <CaptionEditModal
        open={captionModalOpen}
        onOpenChange={setCaptionModalOpen}
        item={selectedCaption}
        onSave={handleSaveCaption}
        isSaving={updateCaption.isPending}
      />
    </div>
  );
};

export default Gestao;

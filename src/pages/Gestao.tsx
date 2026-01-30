import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LayoutDashboard, FolderOpen, Upload, StickyNote, Eye, History, Users } from "lucide-react";
import {
  useAllContentItems,
  useAllCaptions,
  useAllMarketingTools,
  useUpdateContentItem,
  useUpdateCaption,
  useUpdateMarketingTool,
  useDeleteContentItem,
  useDeleteCaption,
  useDeleteMarketingTool,
  useIsAdmin,
} from "@/hooks/useContent";
import { toast } from "sonner";

// Components
import { ContentSection } from "@/components/gestao/ContentSection";
import { ImportSection } from "@/components/gestao/ImportSection";
import { NotesSection } from "@/components/gestao/NotesSection";
import { PreviewSection } from "@/components/gestao/PreviewSection";
import { DashboardSection } from "@/components/gestao/DashboardSection";
import { HistorySection } from "@/components/gestao/HistorySection";
import { UsersSection } from "@/components/gestao/UsersSection";
import { EditModal } from "@/components/gestao/EditModal";
import { CaptionEditModal } from "@/components/gestao/CaptionEditModal";
import { DeleteConfirmDialog } from "@/components/gestao/DeleteConfirmDialog";

type EditableItem = {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  is_active?: boolean;
  language?: string | null;
};

type EditableCaption = {
  id: string;
  destination: string;
  text: string;
  hashtags: string;
  is_active?: boolean;
};

const Gestao = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [captionModalOpen, setCaptionModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EditableItem | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<EditableCaption | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string; type: "content" | "caption" | "tool" } | null>(null);

  const { data: contentItems, isLoading: loadingContent } = useAllContentItems();
  const { data: captions, isLoading: loadingCaptions } = useAllCaptions();
  const { data: tools, isLoading: loadingTools } = useAllMarketingTools();

  const updateContent = useUpdateContentItem();
  const updateCaption = useUpdateCaption();
  const updateTool = useUpdateMarketingTool();
  const deleteContent = useDeleteContentItem();
  const deleteCaptionMutation = useDeleteCaption();
  const deleteTool = useDeleteMarketingTool();

  // Loading state - wait for both auth and admin check
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated - go to admin login
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Redirect if not admin (only after loading is complete)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleEditItem = (item: EditableItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleEditCaption = (caption: EditableCaption) => {
    setSelectedCaption(caption);
    setCaptionModalOpen(true);
  };

  const handleDeleteItem = (id: string, title: string, type: "content" | "caption" | "tool") => {
    setItemToDelete({ id, title, type });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    const { id, type } = itemToDelete;
    const mutation = type === "content" ? deleteContent : type === "caption" ? deleteCaptionMutation : deleteTool;

    mutation.mutate(id, {
      onSuccess: () => {
        toast.success("Item excluído com sucesso!");
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      },
      onError: (error) => {
        toast.error("Erro ao excluir item");
        console.error(error);
      },
    });
  };

  const handleSaveItem = (id: string, data: { title: string; url: string; description: string; is_active: boolean; language: string }) => {
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

  const handleSaveTool = (id: string, data: { title: string; url: string; description: string; is_active: boolean; language: string }) => {
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
          <p className="text-muted-foreground">Painel administrativo completo</p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-2 bg-muted/50 p-2 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 flex-1 min-w-[120px]">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 flex-1 min-w-[120px]">
              <FolderOpen className="h-4 w-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2 flex-1 min-w-[120px]">
              <Upload className="h-4 w-4" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2 flex-1 min-w-[120px]">
              <StickyNote className="h-4 w-4" />
              Notas
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2 flex-1 min-w-[120px]">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 flex-1 min-w-[120px]">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 flex-1 min-w-[120px]">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-0">
            <DashboardSection />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-0">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ContentSection
                contentItems={contentItems || []}
                captions={captions || []}
                tools={tools || []}
                onEditItem={handleEditItem}
                onEditCaption={handleEditCaption}
                onDeleteItem={(id, title) => handleDeleteItem(id, title, "content")}
                onDeleteCaption={(id, title) => handleDeleteItem(id, title, "caption")}
                onDeleteTool={(id, title) => handleDeleteItem(id, title, "tool")}
              />
            )}
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="mt-0">
            <ImportSection />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-0">
            <NotesSection />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-0">
            <PreviewSection />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            <HistorySection />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-0">
            <UsersSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modals */}
      <EditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        item={selectedItem}
        onSave={(id, data) => {
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={itemToDelete?.title || ""}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteContent.isPending || deleteCaptionMutation.isPending || deleteTool.isPending}
      />
    </div>
  );
};

export default Gestao;

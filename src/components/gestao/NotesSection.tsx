import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminNotes, useSaveAdminNote, AdminNote } from "@/hooks/useAdminDashboard";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Check } from "lucide-react";

export const NotesSection = () => {
  const { data: note, isLoading } = useAdminNotes();
  const saveNote = useSaveAdminNote();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize content when note loads
  useEffect(() => {
    if (note?.content !== undefined) {
      setContent(note.content);
    }
  }, [note?.content]);

  // Auto-save after 3 seconds of inactivity
  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      await saveNote(content, note?.id);
      setLastSaved(new Date());
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["admin-notes"] });
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
    } finally {
      setIsSaving(false);
    }
  }, [content, note?.id, hasChanges, saveNote, queryClient]);

  useEffect(() => {
    if (!hasChanges) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [content, hasChanges, handleSave]);

  const handleChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const noteData = note as AdminNote | null;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">📝 Bloco de Notas</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : hasChanges ? (
              <>
                <Save className="h-4 w-4" />
                <span>Alterações pendentes</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="h-4 w-4 text-primary" />
                <span>Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            ) : noteData?.updated_at ? (
              <span>
                Última atualização: {new Date(noteData.updated_at).toLocaleDateString('pt-BR')}
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Escreva suas anotações aqui...

Ideias:
- Lista de tarefas
- Lembretes
- Ideias para novos conteúdos
- Links importantes"
          className="min-h-[500px] resize-none font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-2">
          As alterações são salvas automaticamente após 3 segundos de inatividade.
        </p>
      </CardContent>
    </Card>
  );
};

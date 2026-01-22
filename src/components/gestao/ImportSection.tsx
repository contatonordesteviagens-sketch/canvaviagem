import { useState, useCallback } from "react";
import { useImportContent, ContentType, ParsedItem, getDefaultIconByType } from "@/hooks/useImportContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Loader2, Trash2, Check, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Icon options by category
const iconsByCategory: Record<ContentType, { value: string; label: string }[]> = {
  video: [
    { value: "🎬", label: "🎬 Vídeo" },
    { value: "🎥", label: "🎥 Câmera" },
    { value: "📹", label: "📹 Filmadora" },
    { value: "🎞️", label: "🎞️ Filme" },
    { value: "▶️", label: "▶️ Play" },
  ],
  feed: [
    { value: "🖼️", label: "🖼️ Quadro" },
    { value: "🎨", label: "🎨 Arte" },
    { value: "📸", label: "📸 Foto" },
    { value: "✨", label: "✨ Destaque" },
    { value: "🌅", label: "🌅 Paisagem" },
  ],
  story: [
    { value: "📱", label: "📱 Celular" },
    { value: "📲", label: "📲 Mobile" },
    { value: "👆", label: "👆 Toque" },
    { value: "💫", label: "💫 Magic" },
    { value: "🔥", label: "🔥 Fire" },
  ],
  tool: [
    { value: "🤖", label: "🤖 Robô" },
    { value: "⚙️", label: "⚙️ Engrenagem" },
    { value: "🔧", label: "🔧 Ferramenta" },
    { value: "💡", label: "💡 Ideia" },
    { value: "🚀", label: "🚀 Foguete" },
  ],
  resource: [
    { value: "📥", label: "📥 Download" },
    { value: "📦", label: "📦 Pacote" },
    { value: "📁", label: "📁 Pasta" },
    { value: "💾", label: "💾 Salvar" },
    { value: "📚", label: "📚 Livros" },
  ],
  caption: [
    { value: "📝", label: "📝 Nota" },
    { value: "✍️", label: "✍️ Escrita" },
    { value: "💬", label: "💬 Balão" },
    { value: "📄", label: "📄 Documento" },
    { value: "🏷️", label: "🏷️ Tag" },
  ],
};

interface EditableItem extends ParsedItem {
  icon: string;
}

export const ImportSection = () => {
  const [selectedType, setSelectedType] = useState<ContentType>('video');
  const [dragActive, setDragActive] = useState(false);
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [bulkIcon, setBulkIcon] = useState<string>("");
  
  const {
    parseFile,
    clearParsedItems,
    isParsingFile,
    importContent,
    isImporting,
  } = useImportContent();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      try {
        const defaultIcon = getDefaultIconByType(selectedType);
        for (const file of files) {
          const items = await parseFile(file);
          const itemsWithIcons = items.map(item => ({
            ...item,
            icon: item.icon || defaultIcon,
          }));
          setEditableItems(prev => [...prev, ...itemsWithIcons]);
        }
        toast.success(`${files.length} arquivo(s) processado(s) com sucesso!`);
      } catch (error) {
        toast.error("Erro ao processar arquivo(s)");
        console.error(error);
      }
    }
  }, [parseFile, selectedType]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      try {
        const defaultIcon = getDefaultIconByType(selectedType);
        for (const file of files) {
          const items = await parseFile(file);
          const itemsWithIcons = items.map(item => ({
            ...item,
            icon: item.icon || defaultIcon,
          }));
          setEditableItems(prev => [...prev, ...itemsWithIcons]);
        }
        toast.success(`${files.length} arquivo(s) processado(s) com sucesso!`);
      } catch (error) {
        toast.error("Erro ao processar arquivo(s)");
        console.error(error);
      }
    }
    // Reset input
    e.target.value = "";
  };

  const handleTypeChange = (newType: ContentType) => {
    setSelectedType(newType);
    const defaultIcon = getDefaultIconByType(newType);
    // Update all items without custom icons to the new default
    setEditableItems(prev => prev.map(item => ({
      ...item,
      icon: defaultIcon,
    })));
  };

  const updateItemField = (index: number, field: keyof EditableItem, value: string) => {
    setEditableItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveItem = (index: number) => {
    setEditableItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setEditableItems([]);
    clearParsedItems();
  };

  const applyIconToAll = () => {
    if (!bulkIcon) return;
    setEditableItems(prev => prev.map(item => ({
      ...item,
      icon: bulkIcon,
    })));
    toast.success("Ícone aplicado a todos os itens!");
  };

  const handleImport = () => {
    if (editableItems.length === 0) {
      toast.error("Nenhum item para importar");
      return;
    }

    // Validate all items have title and url
    const invalidItems = editableItems.filter(item => !item.title.trim() || !item.url.trim());
    if (invalidItems.length > 0) {
      toast.error(`${invalidItems.length} item(s) sem título ou URL`);
      return;
    }

    importContent(
      { items: editableItems, type: selectedType },
      {
        onSuccess: () => {
          toast.success(`${editableItems.length} itens importados com sucesso!`);
          setEditableItems([]);
        },
        onError: (error) => {
          toast.error("Erro ao importar itens");
          console.error(error);
        },
      }
    );
  };

  const typeOptions = [
    { value: 'video', label: '🎬 Vídeo Reels' },
    { value: 'feed', label: '🖼️ Arte Feed' },
    { value: 'story', label: '📱 Story' },
    { value: 'caption', label: '📝 Legenda' },
    { value: 'tool', label: '🤖 Ferramenta' },
    { value: 'resource', label: '📚 Recurso' },
  ];

  const currentIcons = iconsByCategory[selectedType] || iconsByCategory.video;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedType === option.value ? 'default' : 'outline'}
                onClick={() => handleTypeChange(option.value as ContentType)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isParsingFile ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Processando arquivo(s) com IA...</p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Suporta múltiplos arquivos: TXT, CSV, XLSX, PDF
                </p>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button asChild>
                    <span>
                      <FileText className="h-4 w-4 mr-2" />
                      Selecionar Arquivos
                    </span>
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".txt,.csv,.xlsx,.xls,.pdf"
                    onChange={handleFileChange}
                    multiple
                  />
                </Label>
              </>
            )}
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Formato esperado:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>TXT/CSV:</strong> Uma linha por item, formato "Título | URL" ou "Título; URL"</li>
              <li>• <strong>PDF/XLSX:</strong> A IA extrai automaticamente títulos e URLs</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Editable Preview Table */}
      {editableItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Editar Itens ({editableItems.length})</CardTitle>
              <div className="flex flex-wrap gap-2">
                {/* Bulk Icon Selector */}
                <div className="flex items-center gap-2">
                  <Select value={bulkIcon} onValueChange={setBulkIcon}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Ícone" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentIcons.map(icon => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={applyIconToAll}
                    disabled={!bulkIcon}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Aplicar a Todos
                  </Button>
                </div>

                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Salvar {editableItems.length} Itens
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-20">Ícone</TableHead>
                    <TableHead className="min-w-[200px]">Nome</TableHead>
                    <TableHead className="min-w-[300px]">Link</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editableItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={item.icon} 
                          onValueChange={(v) => updateItemField(index, 'icon', v)}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currentIcons.map(icon => (
                              <SelectItem key={icon.value} value={icon.value}>
                                {icon.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.title} 
                          onChange={(e) => updateItemField(index, 'title', e.target.value)}
                          placeholder="Título do item..."
                          className={!item.title.trim() ? 'border-destructive' : ''}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.url} 
                          onChange={(e) => updateItemField(index, 'url', e.target.value)}
                          placeholder="https://..."
                          className={!item.url.trim() ? 'border-destructive' : ''}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
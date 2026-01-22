import { useState, useCallback } from "react";
import { useImportContent, ContentType, ParsedItem, getDefaultIconByType } from "@/hooks/useImportContent";
import { useCreateContentItem } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Loader2, Trash2, Check, X, Sparkles, Globe, MapPin, Users } from "lucide-react";
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

// Category filter options
const influencerOptions = [
  { value: "", label: "Nenhum" },
  { value: "influencer-eva", label: "Eva" },
  { value: "influencer-mel", label: "Mel" },
  { value: "influencer-bia", label: "Bia" },
];

const locationOptions = [
  { value: "", label: "Nenhum" },
  { value: "nacional", label: "Nacional" },
  { value: "internacional", label: "Internacional" },
];

const languageOptions = [
  { value: "pt", label: "🇧🇷 Português" },
  { value: "es", label: "🇪🇸 Espanhol" },
  { value: "en", label: "🇺🇸 Inglês" },
];

interface EditableItem extends ParsedItem {
  icon: string;
  category?: string;
  language?: string;
}

export const ImportSection = () => {
  const [selectedType, setSelectedType] = useState<ContentType>('video');
  const [dragActive, setDragActive] = useState(false);
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [bulkIcon, setBulkIcon] = useState<string>("");
  const [bulkCategory, setBulkCategory] = useState<string>("");
  const [bulkLanguage, setBulkLanguage] = useState<string>("pt");
  
  // Category filters
  const [influencer, setInfluencer] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [language, setLanguage] = useState<string>("pt");
  
  // Quick import text
  const [quickImportText, setQuickImportText] = useState<string>("");
  
  const createContentItem = useCreateContentItem();
  
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
        const selectedCategory = influencer || location || undefined;
        
        for (const file of files) {
          const items = await parseFile(file);
          const itemsWithExtras = items.map(item => ({
            ...item,
            icon: item.icon || defaultIcon,
            category: selectedCategory,
            language: language,
          }));
          setEditableItems(prev => [...prev, ...itemsWithExtras]);
        }
        toast.success(`${files.length} arquivo(s) processado(s) com sucesso!`);
      } catch (error) {
        toast.error("Erro ao processar arquivo(s)");
        console.error(error);
      }
    }
  }, [parseFile, selectedType, influencer, location, language]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      try {
        const defaultIcon = getDefaultIconByType(selectedType);
        const selectedCategory = influencer || location || undefined;
        
        for (const file of files) {
          const items = await parseFile(file);
          const itemsWithExtras = items.map(item => ({
            ...item,
            icon: item.icon || defaultIcon,
            category: selectedCategory,
            language: language,
          }));
          setEditableItems(prev => [...prev, ...itemsWithExtras]);
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

  const applyCategoryToAll = () => {
    setEditableItems(prev => prev.map(item => ({
      ...item,
      category: bulkCategory || undefined,
    })));
    toast.success("Categoria aplicada a todos os itens!");
  };

  const applyLanguageToAll = () => {
    if (!bulkLanguage) return;
    setEditableItems(prev => prev.map(item => ({
      ...item,
      language: bulkLanguage,
    })));
    toast.success("Idioma aplicado a todos os itens!");
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

  // Quick import from text - handles blocks separated by empty lines
  // Format: Title (one or more lines) followed by Canva URL, separated by empty lines
  const handleQuickImport = async () => {
    if (!quickImportText.trim()) {
      toast.error("Cole o texto com os links do Canva");
      return;
    }

    // Split into blocks using one or more empty lines as delimiter
    const blocks = quickImportText.trim().split(/\n\s*\n+/);
    const items: { title: string; url: string }[] = [];

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      // Find the line with Canva URL
      let urlLine: string | null = null;
      const titleLines: string[] = [];

      for (const line of lines) {
        if (line.match(/https?:\/\/(?:www\.)?canva\.com/i)) {
          // Extract only the URL (may have text before/after)
          const urlMatch = line.match(/(https?:\/\/(?:www\.)?canva\.com\/[^\s]+)/i);
          if (urlMatch) {
            urlLine = urlMatch[1];
            // If there's text before the URL on the same line, it's part of title
            const beforeUrl = line.substring(0, line.indexOf(urlMatch[0])).trim();
            if (beforeUrl) {
              titleLines.push(beforeUrl);
            }
          }
        } else {
          // Line without URL - it's part of the title
          titleLines.push(line);
        }
      }

      if (urlLine && titleLines.length > 0) {
        // Join title lines and clean up
        const title = titleLines.join(' ')
          .replace(/[|,.\-:]{2,}/g, ' ')  // Remove repeated punctuation
          .replace(/^\s*[|,.\-:]+\s*/g, '')  // Remove leading punctuation
          .replace(/\s*[|,.\-:]+\s*$/g, '')  // Remove trailing punctuation
          .replace(/\s+/g, ' ')  // Normalize spaces
          .trim();

        if (title) {
          // Capitalize first letter of each word for consistency
          const capitalizedTitle = title
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          items.push({ title: capitalizedTitle, url: urlLine });
        }
      }
    }

    if (items.length === 0) {
      toast.error("Nenhum item válido encontrado. Verifique o formato (título seguido de link Canva).");
      return;
    }

    // Create items in database
    let successCount = 0;
    for (const item of items) {
      try {
        await createContentItem.mutateAsync({
          title: item.title,
          url: item.url,
          type: selectedType,
          icon: getDefaultIconByType(selectedType),
          category: influencer || location || null,
          language: language,
          is_active: true,
        });
        successCount++;
      } catch (error) {
        console.error("Error creating item:", error);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} item(s) importado(s) com sucesso!`);
      setQuickImportText("");
    } else {
      toast.error("Erro ao importar itens. Tente novamente.");
    }
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

  // Combined category options for the table dropdown
  const allCategoryOptions = [
    { value: "", label: "Nenhum" },
    ...influencerOptions.filter(o => o.value),
    ...locationOptions.filter(o => o.value),
  ];

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

      {/* Category and Language Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Categorias e Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Influencer */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Influencer
              </Label>
              <Select value={influencer || "none"} onValueChange={(v) => setInfluencer(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {influencerOptions.map(opt => (
                    <SelectItem key={opt.value || "none"} value={opt.value || "none"}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localização
              </Label>
              <Select value={location || "none"} onValueChange={(v) => setLocation(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map(opt => (
                    <SelectItem key={opt.value || "none"} value={opt.value || "none"}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Idioma
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Import via Text */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importação Rápida via Texto
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cole o texto com títulos e links do Canva. Aceita título na linha acima do link ou na mesma linha.
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={"Istambul\nhttps://canva.com/design/xxx...\n\nVancouver\nhttps://canva.com/design/yyy...\n\nDubai\nhttps://canva.com/design/zzz..."}
            value={quickImportText}
            onChange={(e) => setQuickImportText(e.target.value)}
            rows={6}
            className="font-mono text-sm"
          />
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={handleQuickImport} 
              disabled={!quickImportText.trim() || createContentItem.isPending}
            >
              {createContentItem.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Processar e Importar
            </Button>
            <Button variant="outline" onClick={() => setQuickImportText("")}>
              Limpar
            </Button>
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
              <li>• <strong>Dica:</strong> O nome do lugar antes do link Canva é usado como título</li>
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
            {/* Bulk Actions */}
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
              {/* Bulk Icon */}
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
                  Aplicar Ícone
                </Button>
              </div>

              {/* Bulk Category */}
              <div className="flex items-center gap-2">
                <Select value={bulkCategory || "none"} onValueChange={(v) => setBulkCategory(v === "none" ? "" : v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategoryOptions.map(opt => (
                      <SelectItem key={opt.value || "none"} value={opt.value || "none"}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={applyCategoryToAll}>
                  Aplicar Categoria
                </Button>
              </div>

              {/* Bulk Language */}
              <div className="flex items-center gap-2">
                <Select value={bulkLanguage} onValueChange={setBulkLanguage}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={applyLanguageToAll}>
                  Aplicar Idioma
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-20">Ícone</TableHead>
                    <TableHead className="min-w-[180px]">Nome</TableHead>
                    <TableHead className="min-w-[200px]">Link</TableHead>
                    <TableHead className="w-28">Categoria</TableHead>
                    <TableHead className="w-24">Idioma</TableHead>
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
                        <Select 
                          value={item.category || "none"} 
                          onValueChange={(v) => updateItemField(index, 'category', v === "none" ? "" : v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allCategoryOptions.map(opt => (
                              <SelectItem key={opt.value || "none"} value={opt.value || "none"}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={item.language || "pt"} 
                          onValueChange={(v) => updateItemField(index, 'language', v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languageOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

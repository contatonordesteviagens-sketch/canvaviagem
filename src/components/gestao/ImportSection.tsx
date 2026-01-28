import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useImportContent, ContentType, ParsedItem, getDefaultIconByType } from "@/hooks/useImportContent";
import { useCreateContentItem } from "@/hooks/useContent";
import { useScheduleContent } from "@/hooks/useCalendarEntries";
import { useImportCaptions } from "@/hooks/useImportCaptions";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Loader2, Trash2, Check, X, Sparkles, Globe, MapPin, Users, Calendar, Wand2, Image, Video, Star } from "lucide-react";
import { toast } from "sonner";
import { CaptionMatchTable } from "@/components/gestao/CaptionMatchTable";

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
  
  // Quick import text (bulk mode)
  const [quickImportText, setQuickImportText] = useState<string>("");
  
  // Quick import single mode (separated fields)
  const [quickTitle, setQuickTitle] = useState<string>("");
  const [quickUrl, setQuickUrl] = useState<string>("");
  const [quickCaption, setQuickCaption] = useState<string>("");
  const [autoSchedule, setAutoSchedule] = useState<boolean>(true);
  const [importMode, setImportMode] = useState<"single" | "bulk">("single");
  
  // Media and automation options
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"gif" | "video" | null>(null);
  const [autoFavorite, setAutoFavorite] = useState<boolean>(false);
  const [autoHighlight, setAutoHighlight] = useState<boolean>(false);
  
  // Bulk captions import
  const [bulkCaptionsText, setBulkCaptionsText] = useState<string>("");
  const [includeWithCaption, setIncludeWithCaption] = useState<boolean>(false);
  
  const { user } = useAuth();
  const { toggleFavorite, MAX_FAVORITES, favoritesCount } = useFavorites();
  
  const queryClient = useQueryClient();
  const createContentItem = useCreateContentItem();
  const scheduleContent = useScheduleContent();
  
  // Hook for AI caption matching
  const {
    matches: captionMatches,
    stats: captionStats,
    isProcessing: isProcessingCaptions,
    isApplying: isApplyingCaptions,
    processText: processCaptionsText,
    toggleVideoSelection,
    toggleDestinationVideos,
    updateVideoCaption,
    updateDestinationCaption,
    applyMatches: applyCaptionMatches,
    getSelectionStats,
    clearMatches,
  } = useImportCaptions();
  
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

  // State for quick import loading
  const [isQuickImporting, setIsQuickImporting] = useState(false);

  // Quick import from text - handles blocks separated by empty lines
  // Format: Title (one or more lines) followed by Canva URL, separated by empty lines
  const handleQuickImport = async () => {
    if (!quickImportText.trim()) {
      toast.error("Cole o texto com os links do Canva");
      return;
    }

    if (isQuickImporting) {
      toast.error("Aguarde, importação em andamento...");
      return;
    }

    setIsQuickImporting(true);
    toast.info("Processando texto...");

    try {
      // Split into blocks using one or more empty lines as delimiter
      const blocks = quickImportText.trim().split(/\n\s*\n+/);
      const items: { title: string; url: string }[] = [];

      console.log("Blocks found:", blocks.length, blocks);

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

        console.log("Block parsed:", { titleLines, urlLine });

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

      console.log("Items to import:", items);

      if (items.length === 0) {
        toast.error("Nenhum item válido encontrado. Verifique o formato (título seguido de link Canva).");
        setIsQuickImporting(false);
        return;
      }

      toast.info(`${items.length} item(s) encontrado(s). Importando...`);

      // Create items in database
      let successCount = 0;
      let errorCount = 0;
      let scheduledCount = 0;

      for (const item of items) {
        try {
          // Create the content item and get the ID
          const { data: createdItem } = await supabase
            .from("content_items")
            .insert({
              title: item.title,
              url: item.url,
              type: selectedType,
              icon: getDefaultIconByType(selectedType),
              category: influencer || location || null,
              language: language,
              is_active: true,
            })
            .select("id")
            .single();

          if (createdItem) {
            successCount++;
            console.log("Item created:", item.title, createdItem.id);

            // Auto-schedule to calendar if enabled
            if (autoSchedule && selectedType === 'video') {
              try {
                const result = await scheduleContent.mutateAsync({
                  contentItemId: createdItem.id,
                  caption: quickCaption || undefined,
                });
                if (result.scheduled) {
                  scheduledCount++;
                  console.log("Scheduled for day:", result.day);
                }
              } catch (scheduleError) {
                console.error("Error scheduling:", scheduleError);
              }
            }
          }
        } catch (error) {
          errorCount++;
          console.error("Error creating item:", item.title, error);
        }
      }

      if (successCount > 0) {
        let message = `${successCount} item(s) importado(s) com sucesso!`;
        if (scheduledCount > 0) {
          message += ` ${scheduledCount} agendado(s) no calendário.`;
        }
        toast.success(message);
        setQuickImportText("");
        setQuickCaption("");
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["content-items"] });
        queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} item(s) falharam ao importar.`);
      }
      
      if (successCount === 0 && errorCount === 0) {
        toast.error("Nenhum item foi processado. Verifique o formato.");
      }
    } catch (error) {
      console.error("Quick import error:", error);
      toast.error("Erro ao processar importação.");
    } finally {
      setIsQuickImporting(false);
    }
  };

  // Single item import with separate fields (Title, URL, Caption, Media, Automation)
  const handleSingleImport = async () => {
    if (!quickTitle.trim() || !quickUrl.trim()) {
      toast.error("Preencha o título e o link do vídeo");
      return;
    }

    if (isQuickImporting) {
      toast.error("Aguarde, importação em andamento...");
      return;
    }

    setIsQuickImporting(true);

    try {
      // Create the content item with new media fields
      const { data: createdItem, error } = await supabase
        .from("content_items")
        .insert({
          title: quickTitle.trim(),
          url: quickUrl.trim(),
          description: quickCaption.trim() || null,
          type: selectedType,
          icon: getDefaultIconByType(selectedType),
          category: influencer || location || null,
          language: language,
          is_active: true,
          media_url: mediaUrl.trim() || null,
          media_type: mediaType,
          is_highlighted: autoHighlight,
        })
        .select("id")
        .single();

      if (error) throw error;

      let actions: string[] = [];

      // Auto-schedule to calendar if enabled
      if (autoSchedule && selectedType === 'video' && createdItem) {
        try {
          const result = await scheduleContent.mutateAsync({
            contentItemId: createdItem.id,
            caption: quickCaption.trim() || undefined,
          });
          if (result.scheduled) {
            actions.push("agendado");
          }
        } catch (scheduleError) {
          console.error("Error scheduling:", scheduleError);
        }
      }

      // Auto-favorite if enabled
      if (autoFavorite && createdItem && user) {
        try {
          await toggleFavorite.mutateAsync({
            contentType: "content_item",
            contentId: createdItem.id,
          });
          actions.push("favoritado");
        } catch (favoriteError) {
          console.error("Error favoriting:", favoriteError);
        }
      }

      // Build success message
      let successMessage = `"${quickTitle}" importado com sucesso`;
      if (actions.length > 0) {
        successMessage += ` (${actions.join(", ")})`;
      }
      if (autoHighlight) {
        successMessage += " ✨";
      }
      toast.success(successMessage + "!");
      
      // Clear fields
      setQuickTitle("");
      setQuickUrl("");
      setQuickCaption("");
      setMediaUrl("");
      setMediaType(null);
      setAutoFavorite(false);
      setAutoHighlight(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["highlighted-items"] });
    } catch (error) {
      console.error("Single import error:", error);
      toast.error("Erro ao importar vídeo.");
    } finally {
      setIsQuickImporting(false);
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
    <Tabs defaultValue="content" className="space-y-6 max-w-5xl mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="content" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar Conteúdo
        </TabsTrigger>
        <TabsTrigger value="bulk-captions" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Legendas em Massa
        </TabsTrigger>
      </TabsList>

      {/* TAB: Bulk Captions Import with AI */}
      <TabsContent value="bulk-captions" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Importar Legendas com IA
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cole o texto com legendas e a IA vai associar automaticamente aos vídeos existentes.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cole aqui o texto com legendas</Label>
              <Textarea
                placeholder={"Cole o conteúdo do arquivo de legendas aqui...\n\nExemplo:\n\nJericoacoara - CE\nRelaxe em Jericoacoara, um dos destinos mais charmosos do Brasil!\n#Jericoacoara #Viagem\n\nMaragogi - AL\nDescubra as maravilhas de Maragogi!\n#Maragogi #Nordeste"}
                value={bulkCaptionsText}
                onChange={(e) => setBulkCaptionsText(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {bulkCaptionsText.length} caracteres
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Switch
                  id="include-with-caption"
                  checked={includeWithCaption}
                  onCheckedChange={setIncludeWithCaption}
                />
                <Label htmlFor="include-with-caption" className="text-sm cursor-pointer">
                  Incluir vídeos que já têm legenda
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => processCaptionsText(bulkCaptionsText, includeWithCaption)}
                disabled={!bulkCaptionsText.trim() || isProcessingCaptions}
              >
                {isProcessingCaptions ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                {isProcessingCaptions ? "Processando com IA..." : "Processar com IA"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setBulkCaptionsText("")}
                disabled={isProcessingCaptions}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <CaptionMatchTable
          matches={captionMatches}
          stats={captionStats}
          isApplying={isApplyingCaptions}
          onToggleVideo={toggleVideoSelection}
          onToggleDestination={toggleDestinationVideos}
          onUpdateCaption={updateVideoCaption}
          onUpdateDestinationCaption={updateDestinationCaption}
          onApply={applyCaptionMatches}
          onClear={clearMatches}
          getSelectionStats={getSelectionStats}
        />
      </TabsContent>

      {/* TAB: Content Import (existing functionality) */}
      <TabsContent value="content" className="space-y-6">
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
            Importação Rápida
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Adicione vídeos rapidamente - individualmente ou em massa.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selector */}
          <div className="flex gap-2">
            <Button
              variant={importMode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setImportMode("single")}
            >
              Item Único
            </Button>
            <Button
              variant={importMode === "bulk" ? "default" : "outline"}
              size="sm"
              onClick={() => setImportMode("bulk")}
            >
              Múltiplos Itens
            </Button>
          </div>

          {importMode === "single" ? (
            /* Single Item Mode - Separated Fields */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título do Vídeo *</Label>
                <Input
                  placeholder="Ex: Istambul - Turquia"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Link do Canva *</Label>
                <Input
                  placeholder="https://canva.com/design/..."
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Legenda do Vídeo (Opcional)
                </Label>
                <Textarea
                  placeholder="Digite a legenda que será usada no calendário..."
                  value={quickCaption}
                  onChange={(e) => setQuickCaption(e.target.value)}
                  rows={3}
                />
              </div>

              {/* External Media Section */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Mídia de Destaque (Opcional)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Adicione um GIF ou vídeo curto para aparecer na seção de destaques
                </p>
                
                <Tabs defaultValue="gif" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="gif" className="text-xs">
                      <Image className="h-3 w-3 mr-1" />
                      GIF Animado
                    </TabsTrigger>
                    <TabsTrigger value="video" className="text-xs">
                      <Video className="h-3 w-3 mr-1" />
                      Vídeo Curto
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="gif" className="mt-2">
                    <Input 
                      placeholder="Link do GIF (Giphy, Tenor...)"
                      value={mediaType === "gif" ? mediaUrl : ""}
                      onChange={(e) => { setMediaUrl(e.target.value); setMediaType("gif"); }}
                    />
                  </TabsContent>
                  <TabsContent value="video" className="mt-2">
                    <Input 
                      placeholder="Link do vídeo (máx 30s)"
                      value={mediaType === "video" ? mediaUrl : ""}
                      onChange={(e) => { setMediaUrl(e.target.value); setMediaType("video"); }}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Automation Options */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <Label className="text-base font-medium">Ações Automáticas</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="auto-favorite" 
                    checked={autoFavorite} 
                    onCheckedChange={(checked) => setAutoFavorite(checked === true)}
                  />
                  <Label htmlFor="auto-favorite" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    Adicionar aos Favoritos ({favoritesCount}/{MAX_FAVORITES})
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="auto-highlight" 
                    checked={autoHighlight} 
                    onCheckedChange={(checked) => setAutoHighlight(checked === true)}
                  />
                  <Label htmlFor="auto-highlight" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Marcar como Destaque na Tela Principal
                  </Label>
                </div>
              </div>
            </div>
          ) : (
            /* Bulk Mode - Original Text Area */
            <div className="space-y-4">
              <Textarea
                placeholder={"Istambul\nhttps://canva.com/design/xxx...\n\nVancouver\nhttps://canva.com/design/yyy...\n\nDubai\nhttps://canva.com/design/zzz..."}
                value={quickImportText}
                onChange={(e) => setQuickImportText(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              
              {/* Campo de Legenda para bulk */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Legenda Padrão (Opcional)
                </Label>
                <Textarea
                  placeholder="Legenda que será aplicada a todos os vídeos importados..."
                  value={quickCaption}
                  onChange={(e) => setQuickCaption(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          {/* Toggle de agendamento automático */}
          {selectedType === 'video' && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Agendar automaticamente no calendário</p>
                  <p className="text-xs text-muted-foreground">
                    O vídeo será agendado no primeiro dia livre dos próximos 7 dias
                  </p>
                </div>
              </div>
              <Switch
                checked={autoSchedule}
                onCheckedChange={setAutoSchedule}
              />
            </div>
          )}
          
          <div className="flex gap-2">
            {importMode === "single" ? (
              <>
                <Button 
                  onClick={handleSingleImport} 
                  disabled={!quickTitle.trim() || !quickUrl.trim() || isQuickImporting}
                >
                  {isQuickImporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isQuickImporting ? "Importando..." : "Importar Vídeo"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setQuickTitle(""); 
                    setQuickUrl(""); 
                    setQuickCaption(""); 
                    setMediaUrl(""); 
                    setMediaType(null);
                    setAutoFavorite(false);
                    setAutoHighlight(false);
                  }} 
                  disabled={isQuickImporting}
                >
                  Limpar
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleQuickImport} 
                  disabled={!quickImportText.trim() || isQuickImporting}
                >
                  {isQuickImporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isQuickImporting ? "Importando..." : "Processar e Importar"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setQuickImportText(""); setQuickCaption(""); }} 
                  disabled={isQuickImporting}
                >
                  Limpar
                </Button>
              </>
            )}
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
      </TabsContent>
    </Tabs>
  );
};

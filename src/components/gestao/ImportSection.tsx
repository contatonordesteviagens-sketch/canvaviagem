import { useState, useCallback } from "react";
import { useImportContent, ContentType, ParsedItem } from "@/hooks/useImportContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Loader2, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

export const ImportSection = () => {
  const [selectedType, setSelectedType] = useState<ContentType>('video');
  const [dragActive, setDragActive] = useState(false);
  
  const {
    parseFile,
    parsedItems,
    setParsedItems,
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

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      try {
        await parseFile(files[0]);
        toast.success(`${files[0].name} processado com sucesso!`);
      } catch (error) {
        toast.error("Erro ao processar arquivo");
        console.error(error);
      }
    }
  }, [parseFile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await parseFile(file);
        toast.success(`${file.name} processado com sucesso!`);
      } catch (error) {
        toast.error("Erro ao processar arquivo");
        console.error(error);
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = () => {
    if (parsedItems.length === 0) {
      toast.error("Nenhum item para importar");
      return;
    }

    importContent(
      { items: parsedItems, type: selectedType },
      {
        onSuccess: () => {
          toast.success(`${parsedItems.length} itens importados com sucesso!`);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
                onClick={() => setSelectedType(option.value as ContentType)}
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
          <CardTitle>Upload de Arquivo</CardTitle>
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
                <p className="text-muted-foreground">Processando arquivo com IA...</p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Arraste um arquivo aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Formatos suportados: TXT, CSV, XLSX, PDF
                </p>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button asChild>
                    <span>
                      <FileText className="h-4 w-4 mr-2" />
                      Selecionar Arquivo
                    </span>
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".txt,.csv,.xlsx,.xls,.pdf"
                    onChange={handleFileChange}
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

      {/* Preview Table */}
      {parsedItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview ({parsedItems.length} itens)</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearParsedItems}>
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
                  Importar Todos
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {item.url}
                        </a>
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

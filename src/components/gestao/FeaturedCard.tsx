import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Pencil, X, ImagePlus, Download, Link, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContentItem } from "@/hooks/useContent";
import { toast } from "sonner";

type EditableItem = {
  id: string;
  title: string;
  url: string;
  is_active?: boolean;
};

interface FeaturedCardProps {
  item: ContentItem;
  onUploadImage: (id: string, file: File) => void;
  onUpdateImageUrl: (id: string, url: string) => void;
  onRemoveFromFeatured: (id: string) => void;
  onEdit: (item: EditableItem) => void;
}

export const FeaturedCard = ({ 
  item, 
  onUploadImage, 
  onUpdateImageUrl,
  onRemoveFromFeatured, 
  onEdit 
}: FeaturedCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [htmlEmbed, setHtmlEmbed] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(item.id, file);
      setImageModalOpen(false);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      toast.error("Digite uma URL válida");
      return;
    }
    
    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      toast.error("URL inválida");
      return;
    }
    
    onUpdateImageUrl(item.id, imageUrl.trim());
    setImageUrl("");
    setImageModalOpen(false);
  };

  const handleHtmlExtract = () => {
    if (!htmlEmbed.trim()) {
      toast.error("Cole o código HTML");
      return;
    }
    
    // Extract src from img tags or other common patterns
    const imgMatch = htmlEmbed.match(/src=["']([^"']+)["']/i);
    const urlMatch = htmlEmbed.match(/(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp|svg))/i);
    
    const extractedUrl = imgMatch?.[1] || urlMatch?.[1];
    
    if (extractedUrl) {
      onUpdateImageUrl(item.id, extractedUrl);
      setHtmlEmbed("");
      setImageModalOpen(false);
    } else {
      toast.error("Não foi possível encontrar uma imagem no HTML");
    }
  };

  const handleDownloadImage = async () => {
    if (!item.image_url) return;
    
    try {
      const response = await fetch(item.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.title.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success("Download iniciado!");
    } catch (error) {
      toast.error("Erro ao baixar imagem");
      console.error(error);
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden group">
        {/* Language Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="text-xs">
            {item.language === 'es' ? '🇪🇸' : '🇧🇷'}
          </Badge>
        </div>
        
        {/* Image or Placeholder */}
        <div className="aspect-[9/16] relative">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 flex items-center justify-center">
              <ImagePlus className="h-12 w-12 text-amber-400" />
            </div>
          )}
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => setImageModalOpen(true)}
            >
              <ImagePlus className="h-4 w-4 mr-1" />
              Imagem
            </Button>
            {item.image_url && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleDownloadImage}
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit({
                id: item.id,
                title: item.title,
                url: item.url,
                is_active: item.is_active,
              })}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onRemoveFromFeatured(item.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Remover
            </Button>
          </div>
          
          {/* Hidden file input for upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        
        {/* Title */}
        <div className="p-2 bg-card">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">{item.icon}</p>
        </div>
      </Card>

      {/* Image Options Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Imagem</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-1">
                <Upload className="h-3 w-3" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-1">
                <Link className="h-3 w-3" />
                URL
              </TabsTrigger>
              <TabsTrigger value="html" className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                HTML
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Faça upload de uma imagem do seu computador.
              </p>
              <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input 
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <Button onClick={handleUrlSubmit} className="w-full">
                <Link className="h-4 w-4 mr-2" />
                Salvar URL
              </Button>
            </TabsContent>
            
            <TabsContent value="html" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Código HTML/Embed</Label>
                <Textarea
                  placeholder={'<img src="https://exemplo.com/imagem.jpg" />'}
                  value={htmlEmbed}
                  onChange={(e) => setHtmlEmbed(e.target.value)}
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
              <Button onClick={handleHtmlExtract} className="w-full">
                <Code className="h-4 w-4 mr-2" />
                Extrair Imagem
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
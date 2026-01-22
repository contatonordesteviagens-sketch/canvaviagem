import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ExternalLink, Monitor, Smartphone } from "lucide-react";

export const PreviewSection = () => {
  const [key, setKey] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [simulateUser, setSimulateUser] = useState<'subscriber' | 'free'>('subscriber');

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  const previewUrl = `/?preview=admin&simulate=${simulateUser}&t=${key}`;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Visualização:</span>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="rounded-none"
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="rounded-none"
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Simular:</span>
              <Select value={simulateUser} onValueChange={(v: 'subscriber' | 'free') => setSimulateUser(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscriber">Assinante Premium</SelectItem>
                  <SelectItem value="free">Usuário Gratuito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button variant="outline" size="sm" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir em nova aba
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview iframe */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4 bg-muted/50">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-2 text-muted-foreground font-normal">
              canvatrip.lovable.app
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-muted/30">
          <div 
            className={`mx-auto transition-all duration-300 ${
              viewMode === 'mobile' ? 'max-w-[390px]' : 'w-full'
            }`}
          >
            <iframe
              key={key}
              src={previewUrl}
              className={`w-full border-0 bg-white ${
                viewMode === 'mobile' ? 'h-[844px] rounded-[40px] shadow-2xl my-4' : 'h-[800px]'
              }`}
              title="Preview da plataforma"
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Esta é uma visualização em tempo real da plataforma. Alterações feitas na gestão aparecem imediatamente.
      </p>
    </div>
  );
};

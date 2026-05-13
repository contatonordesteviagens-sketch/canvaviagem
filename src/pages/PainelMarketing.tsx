import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDiagnosticos, useDeleteDiagnostico } from "@/hooks/useFabricaDiagnosticos";
import { generateDiagnosticoPDF } from "@/lib/fabrica-pdf";
import { Factory, FileDown, Trash2, ExternalLink, Plus, Sparkles } from "lucide-react";

export default function PainelMarketing() {
  const navigate = useNavigate();

  const { data: diagnosticos = [], isLoading } = useDiagnosticos();
  const deleteDiag = useDeleteDiagnostico();

  const continueWith = (snapshot: unknown) => {
    // Persiste no localStorage para a /fabrica carregar automaticamente
    try {
      localStorage.setItem("fabrica-context-v1", JSON.stringify(snapshot));
    } catch {
      // ignore
    }
    navigate("/fabrica");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Factory className="h-6 w-6 text-primary" />
              Painel de Marketing
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Histórico das suas agências, pacotes e diagnósticos da Fábrica de Anúncios.
            </p>
          </div>
          <Button onClick={() => navigate("/fabrica")} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo pacote / oferta
          </Button>
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Aqui ficam salvos todos os diagnósticos, perfis de agência, destinos e ofertas que você gera na Fábrica.
            </p>
            <p>
              <strong className="text-foreground">Os dados nunca são apagados</strong> — você pode voltar a qualquer momento, complementar destinos,
              adicionar novos pacotes e gerar quantas variações de anúncios precisar.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Diagnósticos salvos ({diagnosticos.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && diagnosticos.length === 0 && (
              <div className="text-center py-10">
                <Factory className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">Você ainda não salvou nenhum diagnóstico.</p>
                <Button onClick={() => navigate("/fabrica")} className="gap-2">
                  <Plus className="h-4 w-4" /> Criar primeiro diagnóstico
                </Button>
              </div>
            )}

            {diagnosticos.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">{d.agency_name}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      Score {d.digital_score}/100
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      Nível {d.level} {d.level_name ? `· ${d.level_name}` : ""}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atualizado em {new Date(d.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => continueWith(d.state_snapshot)} title="Continuar editando">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => generateDiagnosticoPDF(d.state_snapshot as any)} title="Baixar PDF">
                    <FileDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Remover diagnóstico de ${d.agency_name}?`)) deleteDiag.mutate(d.id);
                    }}
                    className="text-destructive hover:text-destructive"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
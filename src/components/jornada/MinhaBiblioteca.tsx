import { useEffect, useState } from "react";
import { Download, Share2, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { FabricaLibrary } from "@/pages/fabrica/FabricaLibrary";
import { listarVideos, removerVideo, type VideoSalvo } from "@/lib/biblioteca-videos";

/** Tudo que a pessoa já gerou: vídeos (neste aparelho) e artes/fotos (na conta), com Remover. */
export function MinhaBiblioteca() {
  const [videos, setVideos] = useState<VideoSalvo[]>([]);
  const [subTab, setSubTab] = useState<"ofertas" | "galeria">("ofertas");
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    listarVideos().then(setVideos);
  }, []);

  useEffect(() => {
    const novas: Record<string, string> = {};
    videos.forEach((v) => (novas[v.id] = URL.createObjectURL(v.blob)));
    setUrls(novas);
    return () => Object.values(novas).forEach((u) => URL.revokeObjectURL(u));
  }, [videos]);

  async function remover(v: VideoSalvo) {
    if (!confirm(`Remover o vídeo de ${v.destino}? Não dá para desfazer.`)) return;
    await removerVideo(v.id);
    setVideos((l) => l.filter((x) => x.id !== v.id));
    toast.success("Vídeo removido.");
  }

  async function compartilhar(v: VideoSalvo) {
    const file = new File([v.blob], v.nome, { type: "video/mp4" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    try {
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Pacote ${v.destino}` });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    const a = document.createElement("a");
    a.href = urls[v.id];
    a.download = v.nome;
    a.click();
  }

  const quando = (ms: number) => new Date(ms).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div className="space-y-6 pb-12 text-white">
      <section>
        <h2 className="flex items-center gap-2 text-base font-black">
          <Video className="h-5 w-5 text-amber-400" /> Meus vídeos
          <span className="text-xs font-semibold text-white/40">({videos.length})</span>
        </h2>
        <p className="mt-0.5 text-xs text-white/50">Ficam guardados neste aparelho. Se trocar de celular, gere de novo em 1 minuto.</p>
        {videos.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/50">
            Você ainda não gerou nenhum vídeo aqui.
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {videos.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <video src={urls[v.id]} poster={v.capa} controls playsInline muted className="aspect-[9/16] w-full bg-black" />
                <div className="p-2">
                  <p className="truncate text-sm font-bold">{v.destino}</p>
                  <p className="text-[11px] text-white/45">Estilo {v.estilo} · {quando(v.criadoEm)}</p>
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    <button onClick={() => compartilhar(v)} className="grid min-h-10 place-items-center rounded-lg bg-green-600 text-white" aria-label="Compartilhar" title="Compartilhar">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <a href={urls[v.id]} download={v.nome} className="grid min-h-10 place-items-center rounded-lg bg-white/10" aria-label="Baixar" title="Baixar">
                      <Download className="h-4 w-4" />
                    </a>
                    <button onClick={() => remover(v)} className="grid min-h-10 place-items-center rounded-lg bg-red-500/15 text-red-300" aria-label="Remover" title="Remover">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-1 text-center text-[10px] text-white/45">
                    <span>Enviar</span><span>Baixar</span><span>Remover</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-black">Minhas artes e fotos</h2>
        <p className="mb-3 mt-0.5 text-xs text-white/50">Ficam na sua conta e aparecem em qualquer aparelho.</p>
        <FabricaLibrary subTab={subTab} setSubTab={setSubTab} />
      </section>
    </div>
  );
}

import { useFabricaContext } from "@/hooks/useFabricaContext";
import { Download, Trash2, Library, FolderOpen, AlertCircle, ImageIcon, Sparkles, Camera } from "lucide-react";
import { toast } from "sonner";

interface Props {
  subTab: "ofertas" | "galeria";
  setSubTab: (tab: "ofertas" | "galeria") => void;
}

export const FabricaLibrary = ({ subTab, setSubTab }: Props) => {
  const { state, update } = useFabricaContext();

  const getAdImages = () => state.allGeneratedAdImages || [];
  const getGalleryImages = () => {
    const ads = new Set(state.allGeneratedAdImages || []);
    return (state.siteContent?.galleryImages || []).filter((img) => !ads.has(img));
  };

  // Download robusto: converte qualquer URL para Blob antes de baixar
  // Isso garante que data:base64 e URLs externas façam download real (não abrem em nova aba)
  const handleDownload = async (imgUrl: string, filename: string) => {
    try {
      let blobUrl: string;

      if (imgUrl.startsWith("data:")) {
        // data: URL — converte para blob diretamente
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        blobUrl = URL.createObjectURL(blob);
      } else {
        // URL externa — faz fetch com mode no-cors fallback
        try {
          const res = await fetch(imgUrl);
          const blob = await res.blob();
          blobUrl = URL.createObjectURL(blob);
        } catch {
          // Se CORS bloquear, abre em nova aba com dica manual
          window.open(imgUrl, "_blank");
          toast.info("Imagem aberta em nova aba — clique com o botão direito para salvar.");
          return;
        }
      }

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      toast.success("Download iniciado!");
    } catch (err) {
      toast.error("Não foi possível baixar o arquivo.");
    }
  };

  const handleDelete = (index: number) => {
    if (subTab === "ofertas") {
      const updated = getAdImages().filter((_, i) => i !== index);
      update({ allGeneratedAdImages: updated });
      toast.success("Arte removida da sua biblioteca!");
    } else {
      const updated = getGalleryImages().filter((_, i) => i !== index);
      update({
        siteContent: {
          ...state.siteContent,
          galleryImages: updated,
        },
      });
      toast.success("Foto removida da sua biblioteca!");
    }
  };

  const activeImages = subTab === "ofertas" ? getAdImages() : getGalleryImages();

  return (
    <div className="space-y-6 animate-fadeIn max-w-[1280px] mx-auto pb-12">
      {/* Header Info */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F0F11] to-[#0A0A0B] border border-white/5 p-6 backdrop-blur-xl shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Minha Biblioteca de Ativos 📚
          </h2>
          <p className="text-xs text-white/50 leading-relaxed max-w-xl">
            Acesse suas artes publicitárias geradas e as fotos de destinos selecionadas — cada uma em sua aba separada. Baixe qualquer imagem direto para o dispositivo!
          </p>
        </div>

        {/* Subtabs Bar */}
        <div className="flex gap-2 mt-6 border-t border-white/5 pt-6 relative z-10 select-none">
          <button
            onClick={() => setSubTab("ofertas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              subTab === "ofertas"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                : "bg-white/[0.02] border border-white/5 text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Minhas Artes & Anúncios ({getAdImages().length})
          </button>
          <button
            onClick={() => setSubTab("galeria")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              subTab === "galeria"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/10"
                : "bg-white/[0.02] border border-white/5 text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Banco de Fotos Selecionadas ({getGalleryImages().length})
          </button>
        </div>
      </div>


      {/* Grid of Images */}
      {activeImages.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.01] border border-white/5 border-dashed rounded-3xl space-y-4">
          <ImageIcon className="w-12 h-12 mx-auto opacity-10 text-white animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Biblioteca Vazia</h3>
            <p className="text-xs text-white/30 max-w-[320px] mx-auto leading-normal">
              {subTab === "ofertas"
                ? "Você ainda não gerou nenhum anúncio. Vá para o Gerador de Imagens (F3) e crie sua primeira arte!"
                : "Nenhuma foto limpa salva ainda. Gere anúncios no modo Foto Real (F3) — as fotos de fundo são salvas automaticamente aqui."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeImages.map((imgUrl, idx) => (
            <div
              key={`${subTab}-${idx}`}
              className="group relative aspect-[3/4] sm:aspect-square bg-[#0F0F11] border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/30 transition-all duration-300"
            >
              {/* Tab badge */}
              <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                subTab === "ofertas"
                  ? "bg-amber-500/90 text-black"
                  : "bg-emerald-500/90 text-black"
              }`}>
                {subTab === "ofertas" ? "Arte" : "Foto"}
              </div>

              {/* Main Image */}
              <img
                src={imgUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt=""
                loading="lazy"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2.5">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(imgUrl, `fabrica-${subTab === "ofertas" ? "arte" : "foto"}-${idx + 1}.png`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="w-9 h-9 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Excluir da biblioteca"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

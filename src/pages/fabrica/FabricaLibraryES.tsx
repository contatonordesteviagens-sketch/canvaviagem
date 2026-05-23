import { useFabricaContext } from "@/hooks/useFabricaContext";
import { Download, Trash2, Library, FolderOpen, AlertCircle, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  subTab: "ofertas" | "galeria";
  setSubTab: (tab: "ofertas" | "galeria") => void;
}

export const FabricaLibraryES = ({ subTab, setSubTab }: Props) => {
  const { state, update } = useFabricaContext();

  const getAdImages = () => state.allGeneratedAdImages || [];
  const getGalleryImages = () => state.siteContent?.galleryImages || [];

  const handleDownload = (imgUrl: string, filename: string) => {
    try {
      const link = document.createElement("a");
      link.href = imgUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("¡Descarga iniciada!");
    } catch (err) {
      toast.error("No se pudo descargar el archivo directamente.");
    }
  };

  const handleDelete = (index: number) => {
    if (subTab === "ofertas") {
      const updated = getAdImages().filter((_, i) => i !== index);
      update({ allGeneratedAdImages: updated });
      toast.success("¡Anuncio eliminado de tu biblioteca!");
    } else {
      const updated = getGalleryImages().filter((_, i) => i !== index);
      update({
        siteContent: {
          ...state.siteContent,
          galleryImages: updated,
        },
      });
      toast.success("¡Foto eliminada de tu biblioteca!");
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
            Mi Biblioteca de Recursos 📚
          </h2>
          <p className="text-xs text-white/50 leading-relaxed max-w-xl">
            Accede a todas las piezas publicitarias que has generado y a las fotos de destinos que has seleccionado. ¡Descarga las imágenes para tus redes sociales o vincúlalas a tus paquetes comerciales!
          </p>
        </div>

        {/* Subtabs Bar */}
        <div className="flex gap-2 mt-6 border-t border-white/5 pt-6 relative z-10 select-none font-sans">
          <button
            onClick={() => setSubTab("ofertas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              subTab === "ofertas"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                : "bg-white/[0.02] border border-white/5 text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Mis Diseños y Anuncios ({getAdImages().length})
          </button>
          <button
            onClick={() => setSubTab("galeria")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              subTab === "galeria"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                : "bg-white/[0.02] border border-white/5 text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            Banco de Fotos Seleccionadas ({getGalleryImages().length})
          </button>
        </div>
      </div>

      {/* Database Guard Notice */}
      <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-[11px] text-blue-200 leading-normal font-sans">
        <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          💡 <strong>Tecnología de Almacenamiento Local:</strong> Para proteger los recursos de tu base de datos, mantenemos todas tus imágenes guardadas en un caché local ilimitado de alto rendimiento. Solo las 10 piezas más recientes de cada pestaña se sincronizan con Supabase de manera comprimida para garantizar que tu sitio web permanezca rápido y estable.
        </div>
      </div>

      {/* Grid of Images */}
      {activeImages.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.01] border border-white/5 border-dashed rounded-3xl space-y-4 font-sans">
          <ImageIcon className="w-12 h-12 mx-auto opacity-10 text-white animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Biblioteca Vacía</h3>
            <p className="text-xs text-white/30 max-w-[320px] mx-auto leading-normal">
              {subTab === "ofertas" 
                ? "Aún no has generado ningún anuncio promocional. ¡Ve al Generador de Imágenes (F1) y crea tu primera pieza gráfica!"
                : "Aún no has guardado ninguna foto limpia en la galería. Utiliza las fases de generación para guardar y reutilizar tus mejores recursos."}
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
              {/* Main Image */}
              <img 
                src={imgUrl} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="" 
                loading="lazy"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2.5 font-sans">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownload(imgUrl, `fabrica-${subTab}-${idx}.png`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </button>
                  <button 
                    onClick={() => handleDelete(idx)}
                    className="w-9 h-9 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Eliminar de la biblioteca"
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

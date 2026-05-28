import { useState, useRef } from "react";
import { Sparkles, Link as LinkIcon, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const BusinessExtractor = ({ onExtract }: { onExtract: (data: any) => void }) => {
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  
  const extractFromAPI = async (type: "text" | "pdf" | "image", content: string) => {
    try {
      setLoading(true);
      toast.info(`Iniciando extração inteligente via IA...`, { duration: 3000 });
      
      const { data, error } = await supabase.functions.invoke("fabrica-extract-business-info", {
        body: { type, content }
      });
      
      if (error) throw new Error(error.message || "Erro ao comunicar com a inteligência artificial");
      
      onExtract(data);
      toast.success("Extração concluída com sucesso! 🎉");
      setUrlInput("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro durante a extração. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error("Insira o link do site");
      return;
    }
    extractFromAPI("text", urlInput.trim());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. O limite é 5MB para extração.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const type = file.type === "application/pdf" ? "pdf" : "image";
      extractFromAPI(type, base64);
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gradient-to-r from-violet-500/10 to-amber-500/10 border border-violet-500/20 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_40px_rgba(139,92,246,0.1)]">
      {/* Decorações visuais */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
        {/* Lado Esquerdo: Textos */}
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">Inteligência Artificial</span>
          </div>
          <h3 className="text-xl font-black text-white leading-tight">
            Extrair Agência Magic <span className="text-violet-400">AI</span>
          </h3>
          <p className="text-xs text-white/60 leading-relaxed max-w-md">
            Já tem um site ou PDF de apresentação? Deixe a IA ler o seu material e criar todos os seus pacotes, roteiros e preços automaticamente aqui na Fábrica em poucos segundos.
          </p>
        </div>

        {/* Lado Direito: Inputs */}
        <div className="flex flex-col gap-3 w-full md:w-auto min-w-[300px]">
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                disabled={loading}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Cole o link do seu site..." 
                className="w-full bg-white/[0.04] border border-white/10 hover:border-violet-500/50 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all disabled:opacity-50"
              />
            </div>
            <button 
              onClick={handleUrlSubmit}
              disabled={loading || !urlInput.trim()}
              className="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-500/50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 whitespace-nowrap flex items-center justify-center min-w-[80px]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Extrair"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">OU ENVIE UM ARQUIVO</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button 
            disabled={loading}
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 px-4 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 border-dashed hover:border-amber-500/50 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-white/70 hover:text-amber-400 transition-all disabled:opacity-50 group"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <>
                <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                Upload PDF ou Imagem (Máx 5MB)
              </>
            )}
          </button>
          <input 
            type="file" 
            ref={fileRef} 
            onChange={handleFileUpload} 
            accept="application/pdf,image/*" 
            className="hidden" 
          />

        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function SiteViewer() {
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRender = async () => {
      if (!id) {
        setError("ID da Agência não fornecido na URL.");
        return;
      }

      try {
        // 1. Carrega o arquivo "oculto" da Supabase Storage independentemente do mime-type real
        const { data, error: fetchErr } = await supabase.storage
          .from("thumbnails")
          .download(`sites/${id}.html`);

        if (fetchErr || !data) {
          console.error("Supabase download fail:", fetchErr);
          setError("Site não encontrado ou ainda não foi publicado. Verifique o painel administrativo.");
          return;
        }

        // 2. Lê o conteúdo original codificado
        const htmlContent = await data.text();

        if (!htmlContent || htmlContent.length < 50) {
           throw new Error("Conteúdo inválido ou corrompido.");
        }

        // 3. EXECUÇÃO MÁXIMA: Limpa a DOM e injeta o site original integralmente!
        document.open();
        document.write(htmlContent);
        document.close();

      } catch (e) {
        console.error("Critical Render Error:", e);
        setError("Falha de conexão ao renderizar o site da agência.");
      }
    };

    fetchAndRender();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-zinc-900 border border-red-900/50 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-xl font-black text-white mb-2">Ops! Algo deu errado</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{error}</p>
          <a href="/" className="inline-block bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-all text-xs">
            Voltar ao Início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
       <div className="relative flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-white/10 rounded-full animate-spin" />
          <div className="text-center space-y-1">
             <p className="text-emerald-400 font-black tracking-widest text-xs uppercase">Carregando Ambiente</p>
             <p className="text-white/40 text-[10px]">Conectando à Agência segura...</p>
          </div>
       </div>
    </div>
  );
}

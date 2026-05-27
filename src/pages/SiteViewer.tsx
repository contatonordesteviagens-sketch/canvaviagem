import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function SiteViewer({ forcedId }: { forcedId?: string } = {}) {
  const { id: paramId } = useParams();
  const id = forcedId || paramId;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    
    const loadSite = async () => {
      if (!id) {
        setError("ID Inválido.");
        setLoading(false);
        return;
      }

      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient('https://zdjtcwtakgizbsbbwtgc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs');

        const { data, error } = await supabase
          .from('public_sites')
          .select('html')
          .eq('id', id)
          .single();
        
        if (error || !data) {
          throw new Error("Site não encontrado ou aguardando processamento.");
        }

        const html = data.html;

        if (isSubscribed) {
          setHtmlContent(html);
          setLoading(false);
        }

      } catch (err: any) {
        if (isSubscribed) {
          console.error("Sync Error:", err);
          setError(err.message || "Erro de conexão.");
          setLoading(false);
        }
      }
    };

    loadSite();
    return () => { isSubscribed = false; };
  }, [id]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-xs bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-white font-black text-lg mb-2">Aguardando Ativação</h2>
          <p className="text-zinc-500 text-[11px] mb-6 leading-relaxed">Seu site está sendo preparado. Se já ativou, aguarde alguns segundos e atualize esta página.</p>
          <a href="/fabrica" className="inline-block px-6 py-2 bg-white text-black font-extrabold text-xs rounded-lg hover:bg-zinc-200 transition-all">
            Ir ao Painel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 overflow-hidden flex items-center justify-center">
       {loading || !htmlContent ? (
         <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white/30" />
            <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">Carregando Instância...</span>
         </div>
       ) : (
         <iframe 
           srcDoc={htmlContent} 
           title="Ambiente da Agência"
           className="w-full h-full border-0 m-0 p-0"
           style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }}
           sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
         />
       )}
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function SiteViewer() {
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadSite = async () => {
      if (!id) {
        setError("Identificador inválido.");
        return;
      }

      try {
        // 1. RAW FETCH DIRETO DA URL PÚBLICA - SEM INTERMEDIÁRIOS DA SUPABASE
        const publicUrl = `https://zdjtcwtakgizbsbbwtgc.supabase.co/storage/v1/object/public/thumbnails/sites/${id}.html`;
        
        // Adicionamos cache bust temporário para garantir que pegue a versão NOVA!
        const response = await fetch(`${publicUrl}?t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error("O arquivo do site ainda não foi gerado ou não está acessível.");
        }

        const htmlContent = await response.text();

        if (htmlContent.includes('{"statusCode":"404"}') || htmlContent.includes('Object not found')) {
           throw new Error("Site aguardando ativação no painel.");
        }

        setLoading(false);

        // 2. INJEÇÃO VIA IFRAME - O MÉTODO MAIS SEGURO E BLINDADO DO MUNDO!
        // Resolvemos TODOS os conflitos de CSS e Scripts de uma vez por todas!
        setTimeout(() => {
           const iframe = iframeRef.current;
           if (iframe && iframe.contentWindow) {
              const doc = iframe.contentWindow.document;
              doc.open();
              doc.write(htmlContent);
              doc.close();
           }
        }, 50);

      } catch (err: any) {
        console.error("Visualizer Error:", err);
        setError(err.message || "Falha ao conectar com o servidor da agência.");
        setLoading(false);
      }
    };

    loadSite();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md bg-zinc-900 border border-red-900/30 p-8 rounded-3xl shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Site Não Encontrado</h2>
          <p className="text-zinc-400 text-xs mb-6">Você precisa entrar no Painel e clicar no botão verde "ATIVAR SITE AGORA" pelo menos uma vez antes de acessar este link.</p>
          <a href="/fabrica" className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-emerald-500 transition-all text-xs inline-block">
            Ir Para o Painel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
       {loading ? (
         <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-white/60 text-xs tracking-widest animate-pulse uppercase font-bold">Iniciando Ambiente...</p>
         </div>
       ) : (
         <iframe 
           ref={iframeRef} 
           title="Agency Site"
           className="w-full h-full border-0"
           style={{ width: '100%', height: '100%', border: 'none' }}
           sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
         />
       )}
    </div>
  );
}

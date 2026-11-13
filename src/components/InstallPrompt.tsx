import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Funil de venda e páginas públicas: o popup nunca aparece aqui (atrapalhava o checkout).
const FUNNEL_PATHS = ['/inicio', '/inicio2', '/es/inicio', '/onboarding', '/es/onboarding', '/checkout', '/pix', '/login', '/auth', '/planos', '/obrigado'];
const SEEN_FLAG = 'install_prompt_seen';

/**
 * "Adicione um atalho na sua tela inicial": uma única vez por usuário, no celular,
 * só para assinante e só dentro da plataforma. A marca fica no user_metadata da conta
 * (vale em qualquer aparelho) e no localStorage (não pisca enquanto a conta atualiza).
 */
export function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const { user, subscription } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!user || subscription.loading || !subscription.subscribed) return;
    if (FUNNEL_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const storageKey = `installPromptSeen_${user.id}`;
    let seenLocally = false;
    try { seenLocally = localStorage.getItem(storageKey) === '1'; } catch { /* sem storage */ }
    if (seenLocally || user.user_metadata?.[SEEN_FLAG]) return;

    // Espera a pessoa chegar e ver a ferramenta antes de interromper.
    const timer = setTimeout(() => {
      setOpen(true);
      try { localStorage.setItem(storageKey, '1'); } catch { /* sem storage */ }
      supabase.auth.updateUser({ data: { [SEEN_FLAG]: true } }).catch(() => undefined);
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, subscription.loading, subscription.subscribed, pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[90%] sm:max-w-md text-center rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mt-2 mb-1">Adicione um atalho na sua tela inicial</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-2">
          <img 
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3NpdDMxczVoYzJyYmlkNjhjanA1Nzk4NzhmMG1wM2cwbmpicWg2NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/19BPF5yJOd2XD07itu/giphy.gif" 
            alt="Tutorial adicionar à tela inicial" 
            className="w-full max-w-[220px] rounded-xl shadow-md mb-6"
          />
          
          <DialogDescription className="text-base font-medium text-slate-700 dark:text-slate-300 text-center px-2">
            <span className="font-extrabold text-primary text-xl block mb-2">1</span> 
            clique em opções ou nos 3 pontinhos e clique em <span className="font-bold text-slate-900 dark:text-white">adicionar a tela inicial</span>
          </DialogDescription>
        </div>

        <div className="flex justify-center mt-2 pb-2">
          <Button 
            onClick={() => setOpen(false)} 
            className="w-full max-w-[200px] font-bold rounded-xl h-12"
          >
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

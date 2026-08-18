import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

export function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only show to logged in users
    if (!user) return;

    // Check if mobile (iOS and Android)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Check how many times it was shown for this user
    const storageKey = `installPromptCount_${user.id}`;
    const count = parseInt(localStorage.getItem(storageKey) || '0', 10);
    
    // Limit to 2 times per account
    if (count >= 2) return;

    // Show popup after a short delay so it doesn't interrupt immediate navigation
    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(storageKey, (count + 1).toString());
    }, 2500);

    return () => clearTimeout(timer);
  }, [user]);

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

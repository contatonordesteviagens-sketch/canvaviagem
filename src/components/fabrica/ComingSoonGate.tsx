import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Rocket, Lock } from "lucide-react";

const STORAGE_KEY = "fabrica-unlocked";
const PASSWORD = "rickbread";

export const isFabricaUnlocked = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export const unlockFabrica = () => {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // ignore
  }
};

interface ComingSoonGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful password unlock (e.g. to navigate to the gated route). */
  onUnlock?: () => void;
}

/**
 * "Em breve" modal with hidden password unlock for internal testing.
 * Password stored client-side in localStorage — not real security, just curiosity gate.
 */
export const ComingSoonGate = ({ open, onOpenChange, onUnlock }: ComingSoonGateProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toLowerCase() === PASSWORD) {
      unlockFabrica();
      setError(false);
      setPassword("");
      onUnlock?.();
    } else {
      setError(true);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setShowPassword(false);
      setPassword("");
      setError(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-border bg-background">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <Rocket className="w-8 h-8 text-primary-foreground" />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-2xl font-black tracking-tight">
              Em breve 🚀
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground max-w-sm">
              Estamos finalizando os últimos ajustes da <strong className="text-foreground">Fábrica de Anúncios</strong>.
              Em breve disponível para todos os assinantes.
            </DialogDescription>
          </div>

          <Button
            variant="default"
            className="w-full mt-2"
            onClick={() => handleClose(false)}
          >
            Entendi, voltar
          </Button>

          {!showPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1.5 mt-1"
            >
              <Lock className="w-3 h-3" />
              Acesso interno
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-2 mt-2 pt-3 border-t border-border">
              <p className="text-[11px] text-muted-foreground text-left">
                Digite a senha de acesso interno:
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="••••••••"
                  className={error ? "border-destructive" : ""}
                  autoFocus
                />
                <Button type="submit" size="default">
                  Acessar
                </Button>
              </div>
              {error && (
                <p className="text-[11px] text-destructive text-left">Senha incorreta.</p>
              )}
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

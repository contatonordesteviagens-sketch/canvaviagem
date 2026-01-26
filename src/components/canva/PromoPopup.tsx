import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check, Gift } from "lucide-react";

const CHECKOUT_URL = "https://pay.hotmart.com/X100779687E?off=1b820216&checkoutMode=10";
const STORAGE_KEY = "promoPopup_lastClosed";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem(STORAGE_KEY);
    const oneDayAgo = Date.now() - ONE_DAY_MS;

    if (!lastClosed || parseInt(lastClosed) < oneDayAgo) {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-b from-zinc-900 to-black border border-yellow-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-500">
            <Gift className="w-6 h-6" />
            Oportunidade Exclusiva
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Pare de sofrer com:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-red-400">
              <X className="w-4 h-4" /> Baixas vendas
            </li>
            <li className="flex items-center gap-2 text-red-400">
              <X className="w-4 h-4" /> Depender de indicações
            </li>
            <li className="flex items-center gap-2 text-red-400">
              <X className="w-4 h-4" /> Ver agências piores vendendo mais
            </li>
          </ul>

          <p className="text-gray-300 text-sm pt-2">
            Com o Agente Lucrativo você recebe:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" /> Curso de tráfego pago para viagens
            </li>
            <li className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" /> Robô Chat Viagens (IA para roteiros)
            </li>
            <li className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" /> Pack 150 vídeos + artes + legendas
            </li>
          </ul>

          <div className="text-center pt-4">
            <p className="text-gray-500 text-sm line-through">De R$297</p>
            <p className="text-3xl font-bold text-yellow-500">R$ 97</p>
            <p className="text-gray-400 text-xs">ou 12x de R$10</p>
          </div>

          <Button
            asChild
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 rounded-xl"
          >
            <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
              Quero Vender Mais Viagens
            </a>
          </Button>

          <p className="text-center text-gray-500 text-xs">
            Garantia de 7 dias - Risco Zero
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

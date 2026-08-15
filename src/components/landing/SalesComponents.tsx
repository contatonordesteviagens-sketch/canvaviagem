import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  ShoppingCart, 
  User, 
  Play, 
  MessageSquare, 
  X,
  ChevronRight,
  ChevronLeft,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AutoplayLoopVideo from '@/components/travel-agency-content/AutoplayLoopVideo';

// --- 1. URGENCY BAR (CORREÇÃO 1 & MOBILE 2) ---
export const UrgencyBar = () => {
    const [timeLeft, setTimeLeft] = useState("");
    const [slots, setSlots] = useState(38);

    useEffect(() => {
        let target: number;
        try {
            const saved = localStorage.getItem("urgency_target");
            if (saved) {
                target = parseInt(saved);
            } else {
                target = Date.now() + 23.5 * 60 * 60 * 1000;
                localStorage.setItem("urgency_target", target.toString());
            }
        } catch (e) {
            target = Date.now() + 23.5 * 60 * 60 * 1000;
        }

        const timer = setInterval(() => {
            const now = Date.now();
            const diff = target - now;
            if (diff <= 0) {
                const newTarget = Date.now() + 24 * 60 * 60 * 1000;
                localStorage.setItem("urgency_target", newTarget.toString());
                return;
            }
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-[#450a0a] text-white py-2 md:py-3 px-4 border-b border-red-500/30 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 relative z-10 text-center">
                <div className="flex items-center gap-2 md:gap-3">
                    <Zap className="w-4 h-4 text-[#00D4FF] fill-[#00D4FF] animate-bounce" />
                    <span className="text-[11px] md:text-[14px] font-[950] uppercase tracking-tighter md:tracking-widest whitespace-nowrap">
                        Oferta de lançamento: <span className="text-[#00D4FF]">42% OFF</span> — Apenas <span className="font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10">{timeLeft}</span> restantes
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] md:text-[13px] font-black uppercase text-white/80 whitespace-nowrap hidden sm:inline">12 vagas disponíveis</span>
                    <div className="w-[60px] md:w-[120px] h-2 md:h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10 flex items-center">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "76%" }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="h-full bg-[#00D4FF] shadow-[0_0_15px_#00D4FF]"
                        />
                    </div>
                    <span className="text-[10px] md:text-[12px] font-black opacity-60">38/50</span>
                </div>
            </div>
        </div>
    );
};

// --- 2. BEFORE/AFTER SLIDER (CORREÇÃO 5 & MOBILE 3) ---
export const BeforeAfterSlider = ({ beforeImg, afterImg }: { beforeImg: string; afterImg: string }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [isOscillating, setIsOscillating] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => setIsOscillating(false), 3000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div 
            className="relative w-full aspect-[16/10] md:aspect-video rounded-[24px] md:rounded-[40px] overflow-hidden group cursor-ew-resize border border-white/10 shadow-3xl select-none touch-none"
            onMouseMove={(e) => {
                if (!isOscillating) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    setSliderPos(Math.min(Math.max(x, 2), 98));
                }
            }}
            onTouchMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const touch = e.touches[0];
                const x = ((touch.clientX - rect.left) / rect.width) * 100;
                setSliderPos(Math.min(Math.max(x, 2), 98));
            }}
        >
            {/* After Image (Full background) */}
            <div className="absolute inset-0">
                <img src={afterImg} alt="Depois" className="w-full h-full object-cover" />
                <div className="absolute top-6 right-6 bg-[#064e3b]/80 backdrop-blur-md border border-emerald-500/30 text-white text-[11px] md:text-[13px] font-black px-5 py-2 rounded-full shadow-2xl z-10 whitespace-nowrap flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00D4FF]" /> ✅ DEPOIS — Feed Profissional
                </div>
            </div>

            {/* Before Image (Clipping mask) */}
            <div 
                className="absolute inset-0 z-10" 
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <div className="absolute inset-0 w-full h-full bg-zinc-900">
                   <img src={beforeImg} alt="Antes" className="w-full h-full object-cover opacity-80 grayscale-[0.8] blur-[4px] contrast-75" />
                </div>
                <div className="absolute top-6 left-6 bg-[#450a0a]/80 backdrop-blur-md border border-red-500/30 text-white text-[11px] md:text-[13px] font-black px-5 py-2 rounded-full shadow-2xl z-20 whitespace-nowrap flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" /> ❌ ANTES — Feed Amador
                </div>
            </div>

            <div 
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-30 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] flex items-center justify-center">
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-4 bg-[#00D4FF] rounded-full animate-pulse" />
                        <div className="w-1.5 h-4 bg-[#00D4FF] rounded-full animate-pulse delay-75" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3. RECENT ACTIVITY ---
export const RecentActivity = () => {
    const [visible, setVisible] = useState(false);
    const [current, setCurrent] = useState({ name: 'Rafael S.', city: 'São Paulo, SP', time: 'há 7 minutos' });
    
    const activities = [
      { name: "Carla M.", city: "Fortaleza, CE", time: "há 4 minutos" },
      { name: "Rafael S.", city: "São Paulo, SP", time: "há 7 minutos" },
      { name: "Patricia O.", city: "Curitiba, PR", time: "há 12 minutos" },
      { name: "Diego L.", city: "Recife, PE", time: "há 18 minutos" },
      { name: "Fernanda C.", city: "Belo Horizonte, MG", time: "há 23 minutos" },
      { name: "Thiago R.", city: "Florianópolis, SC", time: "há 31 minutos" },
      { name: "Amanda V.", city: "Salvador, BA", time: "há 45 minutos" },
      { name: "Bruno K.", city: "Porto Alegre, RS", time: "há 52 minutos" }
    ];

    useEffect(() => {
        let intervalId: any;
        const initialDelay = setTimeout(() => {
          const runCycle = () => {
            const next = activities[Math.floor(Math.random() * activities.length)];
            setCurrent(next);
            setVisible(true);
            setTimeout(() => setVisible(false), 5000);
          };
          
          runCycle();
          intervalId = setInterval(runCycle, 60000 + Math.random() * 30000);
        }, 10000);
        
        return () => {
          clearTimeout(initialDelay);
          if (intervalId) clearInterval(intervalId);
        };
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 20, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="fixed bottom-24 md:bottom-10 left-0 z-[100] bg-[#1a1a2e]/95 backdrop-blur-xl rounded-[20px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-5 border-l-[3px] border-[#00D4FF] border-y border-r border-white/5 min-w-[320px] hidden md:flex"
                >
                    <div className="w-12 h-12 rounded-full bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] shrink-0 border border-[#00D4FF]/20">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ShoppingCart className="w-6 h-6" />
                        </motion.div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[14px] text-white/95 font-black leading-tight tracking-tight">
                            <span className="text-[#00D4FF]">🟢 {current.name}</span> de {current.city}
                        </p>
                        <p className="text-[12px] text-white/70 font-bold">acabou de assinar o plano anual</p>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{current.time}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- 4. IPHONE MOCKUP (CSS BASED - NO CHECKBOARD) ---
export const IPhoneMockup = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("relative mx-auto", className)}>
      {/* Outer Glow */}
      <div className="absolute -inset-4 bg-[#00D4FF]/20 blur-[60px] rounded-[60px] z-0 opacity-50" />
      
      {/* Device Frame */}
      <div className="relative z-10 w-full aspect-[9/19.5] bg-[#0A0A0A] rounded-[55px] p-[12px] border-[6px] border-[#1A1A1A] shadow-[0_0_0_2px_#333,0_30px_60px_-15px_rgba(0,0,0,0.8)]">
        {/* Screen Content */}
        <div className="relative w-full h-full rounded-[43px] overflow-hidden bg-zinc-900 shadow-inner">
           {children}
        </div>
        
        {/* Dynamic Island */}
        <div className="absolute top-[35px] left-1/2 -translate-x-1/2 w-[110px] h-[30px] bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full mr-1" />
            <div className="w-3 h-[3px] bg-[#1a1a1a] rounded-full" />
        </div>
        
        {/* Side Buttons */}
        <div className="absolute -left-[8px] top-[140px] w-[3px] h-[40px] bg-[#1A1A1A] rounded-r-sm" />
        <div className="absolute -left-[8px] top-[195px] w-[3px] h-[60px] bg-[#1A1A1A] rounded-r-sm" />
        <div className="absolute -left-[8px] top-[265px] w-[3px] h-[60px] bg-[#1A1A1A] rounded-r-sm" />
        <div className="absolute -right-[8px] top-[195px] w-[3px] h-[90px] bg-[#1A1A1A] rounded-l-sm" />
      </div>
    </div>
  );
};

// --- 5. REEL CARD ---
export const ReelCard = ({ destination, videoUrl }: { destination: string; videoUrl: string }) => {
    return (
        <div className="shrink-0 w-[240px] md:w-[300px] aspect-[9/16] rounded-[40px] overflow-hidden relative group bg-black border-4 border-zinc-800 shadow-2xl transition-all duration-500 hover:border-[#00D4FF]/40">
            {videoUrl && videoUrl.toLowerCase().endsWith('.gif') ? (
                <img 
                    src={videoUrl} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" 
                    alt={destination}
                />
            ) : videoUrl ? (
                <AutoplayLoopVideo
                    src={videoUrl} 
                    label={`Vídeo de ${destination}`}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" 
                />
            ) : (
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                    <Play className="w-12 h-12 text-zinc-700" />
                </div>
            )}
            
            {/* Instagram Style Overlays */}
            <div className="absolute right-3 bottom-24 flex flex-col gap-6 text-white/90 z-20">
                <motion.div whileHover={{ scale: 1.2 }} className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-6 h-6 fill-white text-[#0A0A0A]" />
                    <span className="text-[10px] font-black tracking-tighter">2.4k</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.2 }} className="flex flex-col items-center gap-1">
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-[10px] font-black tracking-tighter">184</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.2 }} className="flex flex-col items-center gap-1">
                    <ShoppingCart className="w-6 h-6" />
                </motion.div>
            </div>

            <div className="absolute top-5 right-5 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest z-20">
                4K UHD
            </div>

            <div className="absolute bottom-8 left-8 right-8 z-20">
                <span className="inline-block bg-[#00D4FF] text-[#0A0A0A] text-[13px] font-[900] px-5 py-1.5 rounded-full mb-4 uppercase tracking-tighter shadow-lg">
                   {destination}
                </span>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-700/50 border border-white/10 overflow-hidden backdrop-blur-md"><User className="w-full h-full p-2" /></div>
                    <span className="text-white text-[13px] font-black tracking-tight">Sua Agência</span>
                </div>
            </div>
            
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </div>
    );
};

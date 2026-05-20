import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Clock, 
  User, 
  Check, 
  AlertCircle,
  AlertTriangle,
  FileText,
  Download,
  Video,
  ShoppingBag,
  Eye,
  Settings2,
  Tag,
  Sparkles,
  Link as LinkIcon,
  Zap,
  HelpCircle,
  Layers,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Percent,
  Activity,
  CloudUpload,
  Save
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { DEFAULT_SCHEDULED_COMMENTS, ScheduledComment } from "@/data/scheduledComments";

// Preset Single Comments Data
interface CommentPreset {
  category: "social" | "purchase" | "question";
  username: string;
  message: string;
  label: string;
}

const SINGLE_COMMENT_PRESETS: CommentPreset[] = [
  // Prova Social / Elogios
  { category: "social", label: "Uso todo dia", username: "GiseleDestinos", message: "Assino o canva viagem uso todo dia me salva demais!" },
  { category: "social", label: "Suporte Incrível", username: "DuduPeloMundo", message: "Esse suporte do elite é de outro planeta!" },
  { category: "social", label: "Feed Premium", username: "KarinaViagens", message: "Já mudei meu feed com o Canva Viagem, clientes amando!" },
  { category: "social", label: "Velocidade I.A", username: "AlinePeloMundo", message: "Chocada com a velocidade q gera as fotos com preco!" },
  
  // Compra Confirmada (FOMO)
  { category: "purchase", label: "COMPRADO! Acesso Ok", username: "PedroViagens", message: "COMPRADO! Já chegou meu acesso no e-mail, muito rápido!" },
  { category: "purchase", label: "Assinei agora", username: "AnaPeloMundo", message: "Assinei agora mesmo! Ansiosa para começar!" },
  { category: "purchase", label: "Garantido com Desconto", username: "DiegoExpedicoes", message: "Consegui assinar com desconto! Cupom funcionou perfeito!" },
  { category: "purchase", label: "Já sou Aluna", username: "CarlaTurismo", message: "Já sou aluna do Elite, melhor investimento que fiz!" },

  // Dúvidas / Preço
  { category: "question", label: "Funciona celular?", username: "RafaDeFerias", message: "Tem q ter notebook ou dá pra fazer tudo pelo celular?" },
  { category: "question", label: "Como assinar?", username: "MariEmJericoacoara", message: "Como faz pra assinar? Libera o link logo Lucas!" },
  { category: "question", label: "Formato Reels?", username: "RobertoTrilhas", message: "Lucas, os criativos já vem no formato de reels e stories?" },
  { category: "question", label: "Limites diários", username: "ValdirTur", message: "Quais os limites de geração diária na Fábrica I.A?" },
];

// Preset Packages Data
interface PresetPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  comments: Omit<ScheduledComment, "time">[];
}

const PRESET_PACKS: PresetPack[] = [
  {
    id: "pack_purchase",
    name: "🔥 Pack Compra Confirmada (Gera FOMO e Pressão)",
    description: "Injeta 5 comentários de compra confirmada simulando alta conversão após liberação do link.",
    icon: "ShoppingBag",
    comments: [
      { username: "PedroViagens", message: "COMPRADO! Acesso liberado no e-mail super rápido!" },
      { username: "AnaPeloMundo", message: "Assinei! O cupom de desconto da live funcionou perfeito!" },
      { username: "DiegoExpedicoes", message: "Garantido! Ansioso pra mexer na fábrica de anúncios hoje!" },
      { username: "SandraRoteiros", message: "Consegui assinar! O suporte já me mandou os bônus no whats!" },
      { username: "MuriloTrilhas", message: "Acabei de fechar o plano anual, melhor investimento!" }
    ]
  },
  {
    id: "pack_social",
    name: "⭐ Pack Prova Social (Aquece a Audiência)",
    description: "Injeta 5 comentários elogiando o Canva Viagem e a Fábrica I.A.",
    icon: "Sparkles",
    comments: [
      { username: "GiseleDestinos", message: "Uso o canva viagem todo dia, me economiza horas de postagem!" },
      { username: "CarlaTurismo", message: "O suporte do Elite responde em minutos, é surreal de bom!" },
      { username: "DuduPeloMundo", message: "Esse gerador de anúncios é o futuro, facilidade extrema!" },
      { username: "KarinaViagens", message: "Meus anúncios agora parecem feitos por agência de R$ 5k!" },
      { username: "PatriciaLemos", message: "O melhor de tudo é que dá pra colocar nossa logo e cores!" }
    ]
  },
  {
    id: "pack_questions",
    name: "❓ Pack Dúvidas (Prepara Venda)",
    description: "Injeta 5 perguntas comuns de clientes interessados para justificar suas respostas.",
    icon: "HelpCircle",
    comments: [
      { username: "Jr99", message: "Qual vai ser o preço do Canva Viagem na live de hoje?" },
      { username: "MariEmJericoacoara", message: "Lucas, libera o link de inscrição logo por favor!" },
      { username: "RafaDeFerias", message: "Consigo criar anúncios e mexer em tudo pelo celular?" },
      { username: "RobertoTrilhas", message: "Já vem com os textos e hashtags prontas também?" },
      { username: "AmandaTurismo", message: "Tem templates para destinos internacionais e nacionais?" }
    ]
  }
];

export const LiveCommentsSection = () => {
  const [comments, setComments] = useState<ScheduledComment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Video Settings State
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/watch?v=Xqcw-NpPz08");

  // Pre-Play Comments State
  const [prePlayComments, setPrePlayComments] = useState([
    { id: "pre-1", username: "Fabiotravell", message: "aguardando começar...", time: "19:28" },
    { id: "pre-2", username: "Jr99", message: "to esperando a live! bora", time: "19:29" },
    { id: "pre-3", username: "AnaPeloMundo", message: "esperando aqui, ansiosa demais!", time: "19:30" },
  ]);
  
  // Offer Settings State
  const [offerStatus, setOfferStatus] = useState<"hidden" | "visible" | "scheduled">("scheduled");
  const [offerTime, setOfferTime] = useState("50:00");
  const [offerTitle, setOfferTitle] = useState("🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!");
  const [offerDesc, setOfferDesc] = useState("Adquira o Canva Viagem Vitalício + Fábrica de Anúncios I.A com Desconto!");
  const [offerPrice, setOfferPrice] = useState("Apenas 12x de R$ 29,70 ou R$ 297 à vista");
  const [offerCheckoutUrl, setOfferCheckoutUrl] = useState("/planos");
  const [offerBannerUrl, setOfferBannerUrl] = useState("");

  // Dialog State for Comments
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formTime, setFormTime] = useState("");

  // Bulk Pack Settings
  const [selectedPackId, setSelectedPackId] = useState("pack_purchase");
  const [packStartTime, setPackStartTime] = useState("50:00");
  const [packInterval, setPackInterval] = useState(15); // 15 seconds spacing

  // Custom Presets State
  interface CustomCommentPreset {
    id: string;
    time: string;
    username: string;
    message: string;
    label: string;
  }
  const [customPresets, setCustomPresets] = useState<CustomCommentPreset[]>([]);
  const [presetLabel, setPresetLabel] = useState("");
  const [presetTime, setPresetTime] = useState("");
  const [presetUsername, setPresetUsername] = useState("");
  const [presetMessage, setPresetMessage] = useState("");
  const [saveAsPresetCheckbox, setSaveAsPresetCheckbox] = useState(false);
  const [presetScheduleImmediately, setPresetScheduleImmediately] = useState(false);
  const [activePresetTab, setActivePresetTab] = useState<"standard" | "custom">("standard");

  // Sub-abas de gestão da live
  const [activeSubTab, setActiveSubTab] = useState<"comments" | "leads" | "metrics">("comments");
  const [isSyncing, setIsSyncing] = useState(false);

  // Leads / Contatos State
  interface Lead {
    id: string;
    name: string;
    phone: string;
    registeredAt: string;
    entryCount?: number;
    watchTime?: number;
    clickedOffer?: boolean;
    lastActiveAt?: number;
    lastPlaybackTime?: number;
    comments?: Array<{
      time: string;
      message: string;
      timestamp: number;
      answered?: boolean;
    }>;
  }
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Audio chime synthesizer via Web Audio API
  const playChime = (type: "new-lead" | "clicked-buy" | "new-comment") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === "new-lead") {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, start);
          gainNode.gain.setValueAtTime(0.15, start);
          gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(1046.50, ctx.currentTime, 0.4); // C6
        playTone(1318.51, ctx.currentTime + 0.15, 0.5); // E6
      } else if (type === "clicked-buy") {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
        });
      } else if (type === "new-comment") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880.00, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Falha ao inicializar chime sintetizado:", e);
    }
  };

  // Memoized unanswered comments tracking across all leads
  const unansweredComments = useMemo(() => {
    const list: Array<{ leadId: string; leadName: string; leadPhone: string; commentIndex: number; time: string; message: string; timestamp: number }> = [];
    leads.forEach((l) => {
      if (l.comments && Array.isArray(l.comments)) {
        l.comments.forEach((c: any, idx: number) => {
          if (!c.answered) {
            list.push({
              leadId: l.id,
              leadName: l.name,
              leadPhone: l.phone,
              commentIndex: idx,
              time: c.time,
              message: c.message,
              timestamp: c.timestamp || Date.now(),
            });
          }
        });
      }
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [leads]);

  // Mark specific comment as answered in local state & remote database
  const handleMarkCommentAnswered = async (leadId: string, commentIdx: number) => {
    try {
      const idx = leads.findIndex((l) => l.id === leadId);
      if (idx === -1) return;
      
      const updatedLead = { ...leads[idx] };
      const updatedComments = [...(updatedLead.comments || [])];
      if (updatedComments[commentIdx]) {
        updatedComments[commentIdx] = {
          ...updatedComments[commentIdx],
          answered: true
        };
      }
      updatedLead.comments = updatedComments;
      
      // Local state update
      setLeads((prev) => {
        const next = [...prev];
        const i = next.findIndex((l) => l.id === leadId);
        if (i !== -1) {
          next[i] = updatedLead;
        }
        return next;
      });
      
      // Remote Supabase update
      const nextSource = {
        sourceType: "live",
        entryCount: updatedLead.entryCount,
        watchTime: updatedLead.watchTime,
        lastPlaybackTime: updatedLead.lastPlaybackTime,
        clickedOffer: updatedLead.clickedOffer,
        comments: updatedComments,
        lastActiveAt: Date.now()
      };
      
      await supabase
        .from("webinar_leads")
        .update({
          source: JSON.stringify(nextSource)
        })
        .eq("id", leadId);
        
      toast.success("Comentário marcado como respondido!");
    } catch (e) {
      console.error("Erro ao marcar comentário como respondido:", e);
      toast.error("Erro ao salvar resposta no banco de dados.");
    }
  };

  // Função para semear dados demonstrativos ultra realistas na live
  const seedMockData = () => {
    const mockNames = [
      "Roberto Almeida", "Patrícia Lemos", "Ana Julia Silva", "Carlos Eduardo", "Sandra Regina",
      "Tiago Santos", "Gabriela Costa", "Marcos Vinicius", "Juliana Mendes", "Felipe Souza",
      "Fernanda Roteiros", "Lucas Viagens", "Amanda Nogueira", "Bruno Lima", "Gisele Araujo",
      "Valdir Teixeira", "Carla Dias", "Mariana Jeri", "Ricardo Gomes", "Aline Barbosa",
      "Rodrigo Carvalho", "Beatriz Rocha", "Guilherme Santos", "Larissa Cruz", "Marcelo Pereira",
      "Vanessa Castro", "Thiago Martins", "Letícia Pires", "Diego Ribeiro", "Sofia Ramos",
      "Daniel Faria", "Renata Vasconcellos", "Murilo Reis", "Isabela Mundo", "Pedro Tur"
    ];

    const mockPhones = [
      "(11) 98765-4321", "(21) 99876-5432", "(85) 99765-1122", "(31) 98877-6655", "(41) 99112-2334",
      "(71) 98223-4455", "(51) 99334-5566", "(81) 98445-6677", "(98) 98556-7788", "(61) 99667-8899",
      "(19) 98778-9900", "(84) 99889-0011", "(47) 98990-1122", "(62) 99112-3344", "(27) 99223-4455",
      "(92) 99334-5566", "(12) 99445-6677", "(83) 99556-7788", "(16) 99667-8899", "(54) 99778-9900",
      "(32) 98889-0011", "(86) 98990-1122", "(34) 99112-2233", "(73) 99223-3344", "(65) 99334-4455",
      "(91) 99445-5566", "(79) 99556-6677", "(48) 99667-7788", "(82) 99778-8899", "(55) 99889-9900",
      "(15) 98112-2334", "(24) 98223-3445", "(37) 98334-4556", "(43) 98445-5667", "(88) 98556-6778"
    ];

    const seededLeads: Lead[] = [];
    const now = new Date();
    
    for (let i = 0; i < mockNames.length; i++) {
      const daysAgo = Math.floor(Math.random() * 8); // 0 a 7 dias atrás
      const leadDate = new Date();
      leadDate.setDate(now.getDate() - daysAgo);
      leadDate.setHours(Math.floor(Math.random() * 5) + 18, Math.floor(Math.random() * 60)); // Entre 18:00 e 23:00

      const entryCount = Math.random() > 0.85 ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 1; // 15% recorrente (>= 3)
      const watchTime = Math.floor(Math.random() * 4200) + 60; // 1 a 71 min
      const clickedOffer = watchTime > 2400 ? Math.random() > 0.45 : Math.random() > 0.88;
      
      const isCurrentlyActive = i < 3; 
      const lastActiveAt = isCurrentlyActive 
        ? Date.now() - Math.floor(Math.random() * 8000) 
        : leadDate.getTime() + watchTime * 1000;

      seededLeads.push({
        id: `mock_${i}_${Date.now()}`,
        name: mockNames[i],
        phone: mockPhones[i],
        registeredAt: leadDate.toLocaleString("pt-BR"),
        entryCount,
        watchTime,
        clickedOffer,
        lastActiveAt,
        lastPlaybackTime: watchTime
      });
    }

    localStorage.setItem("live_stream_leads", JSON.stringify(seededLeads));
    
    // Configura estatísticas
    const totalSessions = seededLeads.reduce((acc, l) => acc + (l.entryCount || 1), 0);
    const totalOfferClicks = seededLeads.filter(l => l.clickedOffer).length;
    
    const exitIntervals = {
      "0-5min": 0,
      "5-15min": 0,
      "15-30min": 0,
      "30-60min": 0,
      "60min+": 0
    };

    seededLeads.forEach(l => {
      const minutes = (l.watchTime || 0) / 60;
      if (minutes < 5) exitIntervals["0-5min"]++;
      else if (minutes < 15) exitIntervals["5-15min"]++;
      else if (minutes < 30) exitIntervals["15-30min"]++;
      else if (minutes < 60) exitIntervals["30-60min"]++;
      else exitIntervals["60min+"]++;
    });

    const dailyEntries: Record<string, number> = {};
    for (let d = 0; d < 8; d++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - d);
      const dateStr = targetDate.toLocaleDateString("pt-BR").split("/").reverse().join("-");
      dailyEntries[dateStr] = seededLeads.filter(l => {
        const parts = l.registeredAt.split(" ")[0].split("/");
        const lDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        return lDateStr === dateStr;
      }).length;
    }

    const stats = {
      totalSessions,
      totalOfferClicks,
      exitIntervals,
      dailyEntries
    };

    localStorage.setItem("live_stream_analytics_stats", JSON.stringify(stats));
    setLeads(seededLeads);
    toast.success("Dados simulados de Leads e Métricas semeados com sucesso para visualização!");
  };

  // Funções auxiliares para o dashboard de métricas e leads
  const parseRegisteredDate = (dateStr: string) => {
    try {
      if (!dateStr) return new Date();
      // Formato esperado: "DD/MM/YYYY, HH:MM:SS" ou "DD/MM/YYYY HH:MM:SS"
      const cleanStr = dateStr.replace(",", "");
      const [datePart, timePart] = cleanStr.trim().split(" ");
      const [day, month, year] = datePart.split("/").map(Number);
      
      if (timePart) {
        const [hours, minutes, seconds] = timePart.split(":").map(Number);
        return new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);
      }
      return new Date(year, month - 1, day);
    } catch (e) {
      return new Date();
    }
  };

  const formatWatchTime = (seconds: number = 0) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const formatPhoneNumber = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, "");
    if (digits.startsWith("55") && digits.length === 13) {
      return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
    }
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phoneStr;
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const digits = phone.replace(/\D/g, "");
    // Prepara número brasileiro para o link (garantindo DDI 55)
    const cleanPhone = digits.startsWith("55") ? digits : `55${digits}`;
    const text = encodeURIComponent(`Olá ${name}, vi que você está assistindo à nossa aula ao vivo sobre a Fábrica de Anúncios! Tem alguma dúvida?`);
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  // Load settings on mount and listen to Supabase realtime events
  useEffect(() => {
    // 1. Comments & perform proactive cache validation to clean up old complaining comments
    const savedComments = localStorage.getItem("live_stream_comments");
    if (savedComments) {
      try {
        const parsed = JSON.parse(savedComments);
        if (
          !Array.isArray(parsed) || 
          parsed.length === 0 || 
          parsed.some((c: any) => 
            c.message && (
              c.message.toLowerCase().includes("travando") || 
              c.message.toLowerCase().includes("travou") ||
              c.message.toLowerCase().includes("melhorou")
            )
          )
        ) {
          setComments([...DEFAULT_SCHEDULED_COMMENTS]);
          localStorage.setItem("live_stream_comments", JSON.stringify(DEFAULT_SCHEDULED_COMMENTS));
        } else {
          setComments(parsed);
        }
      } catch (e) {
        console.error("Error parsing saved comments, using default", e);
        setComments([...DEFAULT_SCHEDULED_COMMENTS]);
        localStorage.setItem("live_stream_comments", JSON.stringify(DEFAULT_SCHEDULED_COMMENTS));
      }
    } else {
      setComments([...DEFAULT_SCHEDULED_COMMENTS]);
      localStorage.setItem("live_stream_comments", JSON.stringify(DEFAULT_SCHEDULED_COMMENTS));
    }

    // 2. Video URL
    const savedVideo = localStorage.getItem("live_stream_video_url");
    if (savedVideo) {
      setVideoUrl(savedVideo);
    }

    // 3. Offer Settings
    const savedOffer = localStorage.getItem("live_stream_offer_settings");
    if (savedOffer) {
      try {
        const parsed = JSON.parse(savedOffer);
        setOfferStatus(parsed.status || "scheduled");
        setOfferTime(parsed.time || "50:00");
        setOfferTitle(parsed.title || "🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!");
        setOfferDesc(parsed.description || "Adquira o Canva Viagem Vitalício + Fábrica de Anúncios I.A com Desconto!");
        setOfferPrice(parsed.price || "Apenas 12x de R$ 29,70 ou R$ 297 à vista");
        setOfferCheckoutUrl(parsed.checkoutUrl || "/planos");
        setOfferBannerUrl(parsed.bannerUrl || "");
      } catch (e) {
        console.error("Error parsing saved offer settings", e);
      }
    }

    // 4. Custom Presets
    const savedCustomPresets = localStorage.getItem("live_stream_custom_presets");
    if (savedCustomPresets) {
      try {
        setCustomPresets(JSON.parse(savedCustomPresets));
      } catch (e) {
        console.error("Error parsing saved custom presets", e);
      }
    } else {
      const defaultCustom: CustomCommentPreset[] = [
        { id: "preset_1", label: "Boas-vindas Fábio", time: "00:18", username: "Fabiotravell", message: "opa cheguei" },
        { id: "preset_2", label: "Boas-vindas Jr99", time: "00:26", username: "Jr99", message: "boraaa" },
        { id: "preset_3", label: "Cidade Sorocaba", time: "00:47", username: "PedroViagens", message: "São Paulo Sorocaba" },
        { id: "preset_4", label: "Elogio Canva Viagem", time: "01:29", username: "GiseleDestinos", message: "Assino o canva viagem uso todo dia me salva demais" }
      ];
      setCustomPresets(defaultCustom);
      localStorage.setItem("live_stream_custom_presets", JSON.stringify(defaultCustom));
    }

    // 5. Pre-Play Comments
    const savedPrePlay = localStorage.getItem("live_stream_pre_play_comments");
    if (savedPrePlay) {
      try {
        const parsed = JSON.parse(savedPrePlay);
        const cleaned = parsed.map((c: any) => ({
          ...c,
          message: c.message.replace(" 🙌", "").replace("🙌", "")
        }));
        setPrePlayComments(cleaned);
      } catch (e) {
        console.error("Error loading preplay comments", e);
      }
    }

    // 6. Fetch initial leads from Supabase and register realtime subscriber
    const initSupabaseLeads = async () => {
      try {
        // PROATIVE SYNC: Fetch global settings from Supabase to ensure Gestão is up-to-date across devices
        const { data: globalData } = await supabase
          .from("webinar_leads")
          .select("source")
          .eq("whatsapp", "global_live_settings")
          .maybeSingle();

        if (globalData && globalData.source) {
          const globalSettings = typeof globalData.source === "string" ? JSON.parse(globalData.source) : globalData.source;
          
          if (globalSettings.videoUrl) {
            setVideoUrl(globalSettings.videoUrl);
            localStorage.setItem("live_stream_video_url", globalSettings.videoUrl);
          }
          if (globalSettings.offerSettings) {
            setOfferStatus(globalSettings.offerSettings.status || "scheduled");
            setOfferTime(globalSettings.offerSettings.time || "50:00");
            setOfferTitle(globalSettings.offerSettings.title || "🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!");
            setOfferDesc(globalSettings.offerSettings.description || "Adquira o Canva Viagem Vitalício + Fábrica de Anúncios I.A com Desconto!");
            setOfferPrice(globalSettings.offerSettings.price || "Apenas 12x de R$ 29,70 ou R$ 297 à vista");
            setOfferCheckoutUrl(globalSettings.offerSettings.checkoutUrl || "/planos");
            setOfferBannerUrl(globalSettings.offerSettings.bannerUrl || "");
            localStorage.setItem("live_stream_offer_settings", JSON.stringify(globalSettings.offerSettings));
          }
          if (globalSettings.scheduledComments && Array.isArray(globalSettings.scheduledComments)) {
            setComments(globalSettings.scheduledComments);
            localStorage.setItem("live_stream_comments", JSON.stringify(globalSettings.scheduledComments));
          }
          if (globalSettings.prePlayComments && Array.isArray(globalSettings.prePlayComments)) {
            setPrePlayComments(globalSettings.prePlayComments);
            localStorage.setItem("live_stream_pre_play_comments", JSON.stringify(globalSettings.prePlayComments));
          }
        }

        const { data: dbLeads, error } = await supabase
          .from("webinar_leads")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (dbLeads && dbLeads.length > 0) {
          const formattedLeads = dbLeads.map((l: any) => {
            let parsedSource: any = {};
            try {
              parsedSource = l.source ? JSON.parse(l.source) : {};
            } catch (e) {
              parsedSource = {};
            }
            
            return {
              id: l.id,
              name: l.name,
              phone: l.whatsapp,
              registeredAt: new Date(l.created_at).toLocaleString("pt-BR"),
              entryCount: parsedSource.entryCount || 1,
              watchTime: parsedSource.watchTime || 0,
              clickedOffer: parsedSource.clickedOffer || false,
              lastActiveAt: parsedSource.lastActiveAt || null,
              lastPlaybackTime: parsedSource.lastPlaybackTime || 0,
              comments: parsedSource.comments || [],
            };
          });
          setLeads(formattedLeads);
        } else {
          // Empty DB? Semeia fallback/mock data localmente
          const savedLeads = localStorage.getItem("live_stream_leads");
          if (savedLeads && JSON.parse(savedLeads).length > 0) {
            setLeads(JSON.parse(savedLeads));
          } else {
            seedMockData();
            const freshLeads = localStorage.getItem("live_stream_leads");
            if (freshLeads) {
              setLeads(JSON.parse(freshLeads));
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar leads iniciais:", err);
      }
    };
    
    initSupabaseLeads();

    // 7. Supabase Realtime Postgres Changes Subscription
    const channel = supabase
      .channel("gestao-db-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "webinar_leads",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new;
            let parsedSource: any = {};
            try {
              parsedSource = newRow.source ? JSON.parse(newRow.source) : {};
            } catch (e) {
              parsedSource = {};
            }
            
            const newLead = {
              id: newRow.id,
              name: newRow.name,
              phone: newRow.whatsapp,
              registeredAt: new Date(newRow.created_at).toLocaleString("pt-BR"),
              entryCount: parsedSource.entryCount || 1,
              watchTime: parsedSource.watchTime || 0,
              clickedOffer: parsedSource.clickedOffer || false,
              lastActiveAt: parsedSource.lastActiveAt || null,
              lastPlaybackTime: parsedSource.lastPlaybackTime || 0,
              comments: parsedSource.comments || [],
            };
            
            setLeads((prev) => {
              if (prev.some((l) => l.id === newLead.id || l.phone === newLead.phone)) return prev;
              return [newLead, ...prev];
            });
            
            playChime("new-lead");
            toast.success(`✨ Novo Lead conectado: ${newLead.name}!`);
          } else if (payload.eventType === "UPDATE") {
            const updatedRow = payload.new;
            let parsedSource: any = {};
            try {
              parsedSource = updatedRow.source ? JSON.parse(updatedRow.source) : {};
            } catch (e) {
              parsedSource = {};
            }
            
            setLeads((prev) => {
              const idx = prev.findIndex((l) => l.id === updatedRow.id || l.phone === updatedRow.whatsapp);
              if (idx === -1) return prev;
              
              const oldLead = prev[idx];
              const nextLead = {
                ...oldLead,
                name: updatedRow.name,
                entryCount: parsedSource.entryCount || 1,
                watchTime: parsedSource.watchTime || 0,
                clickedOffer: parsedSource.clickedOffer || false,
                lastActiveAt: parsedSource.lastActiveAt || null,
                lastPlaybackTime: parsedSource.lastPlaybackTime || 0,
                comments: parsedSource.comments || [],
              };
              
              // Trigger sound & visual alerts based on dynamic changes
              if (nextLead.clickedOffer && !oldLead.clickedOffer) {
                playChime("clicked-buy");
                toast.success(`🔥 ${nextLead.name} clicou em comprar na oferta!`);
              } else if (nextLead.comments && oldLead.comments && nextLead.comments.length > oldLead.comments.length) {
                playChime("new-comment");
                const newText = nextLead.comments[nextLead.comments.length - 1]?.message || "";
                toast.info(`💬 Novo comentário de ${nextLead.name}: "${newText}"`);
              }
              
              const nextList = [...prev];
              nextList[idx] = nextLead;
              return nextList;
            });
          } else if (payload.eventType === "DELETE") {
            const deletedRow = payload.old;
            setLeads((prev) => prev.filter((l) => l.id !== deletedRow.id));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const syncGlobalSettingsToSupabase = async () => {
    try {
      const savedVideo = localStorage.getItem("live_stream_video_url") || "Xqcw-NpPz08";
      const savedOffer = localStorage.getItem("live_stream_offer_settings");
      const savedComments = localStorage.getItem("live_stream_comments");
      const savedPrePlay = localStorage.getItem("live_stream_pre_play_comments");

      const offerData = savedOffer ? JSON.parse(savedOffer) : {
        status: "scheduled",
        time: "60:00",
        title: "🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!",
        description: "Adquira o Canva Viagem Vitalício + Fábrica de Anúncios I.A com Desconto!",
        price: "Apenas 12x de R$ 28,91 ou R$ 347 à vista",
        checkoutUrl: "https://buy.stripe.com/fZu14ogGugreeH9bF28so0d",
        bannerUrl: ""
      };

      const scheduledComments = savedComments ? JSON.parse(savedComments) : DEFAULT_SCHEDULED_COMMENTS;
      const prePlayCommentsList = savedPrePlay ? JSON.parse(savedPrePlay) : [
        { id: "pre-1", username: "Fabiotravell", message: "aguardando começar...", time: "19:28" },
        { id: "pre-2", username: "Jr99", message: "to esperando a live! bora", time: "19:29" },
        { id: "pre-3", username: "AnaPeloMundo", message: "esperando aqui, ansiosa demais!", time: "19:30" },
      ];

      const globalSettings = {
        videoUrl: savedVideo,
        offerSettings: offerData,
        scheduledComments,
        prePlayComments: prePlayCommentsList,
        updatedAt: Date.now()
      };

      const { data: existing, error: fetchError } = await supabase
        .from("webinar_leads")
        .select("*")
        .eq("whatsapp", "global_live_settings")
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        const { error } = await supabase
          .from("webinar_leads")
          .update({
            name: "Global Live Settings",
            source: JSON.stringify(globalSettings)
          })
          .eq("whatsapp", "global_live_settings");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("webinar_leads")
          .insert({
            name: "Global Live Settings",
            whatsapp: "global_live_settings",
            source: JSON.stringify(globalSettings)
          });
        if (error) throw error;
      }
      return true;
    } catch (e: any) {
      console.error("Erro ao sincronizar configurações com o Supabase:", e);
      throw e;
    }
  };

  const handleSyncWithCloud = async () => {
    setIsSyncing(true);
    const loadingToast = toast.loading("Salvando e sincronizando comentários na Live...");
    try {
      localStorage.setItem("live_stream_comments", JSON.stringify(comments));
      await syncGlobalSettingsToSupabase();
      toast.dismiss(loadingToast);
      toast.success("Comentários salvos e aplicados na Live com sucesso! Todos os clientes e celulares verão a lista atualizada.");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Sync error:", error);
      toast.error(`Erro ao salvar na nuvem: ${error.message || "Verifique a conexão ou permissões no Supabase."}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const savePrePlay = async () => {
    localStorage.setItem("live_stream_pre_play_comments", JSON.stringify(prePlayComments));
    await syncGlobalSettingsToSupabase();
    toast.success("Comentários de espera salvos com sucesso!");
  };

  // Funções de gerenciamento dos contatos/leads capturados
  const handleClearLeads = () => {
    if (window.confirm("Tem certeza que deseja apagar TODOS os leads/contatos capturados? Esta ação não pode ser desfeita.")) {
      setLeads([]);
      localStorage.removeItem("live_stream_leads");
      toast.success("Lista de leads limpa com sucesso!");
    }
  };

  const handleDeleteLead = (id: string) => {
    const updated = leads.filter(lead => lead.id !== id);
    setLeads(updated);
    localStorage.setItem("live_stream_leads", JSON.stringify(updated));
    toast.success("Lead removido com sucesso!");
  };

  const handleExportLeadsCSV = () => {
    if (leads.length === 0) {
      toast.error("Nenhum lead capturado para exportar.");
      return;
    }
    
    let csvContent = "\uFEFF"; // UTF-8 BOM para forçar UTF-8 no Excel do Windows
    csvContent += "Data de Inscrição;Nome;Telefone\n";
    
    leads.forEach(lead => {
      const escapedName = lead.name.replace(/;/g, ",").replace(/"/g, '""');
      const escapedPhone = lead.phone.replace(/;/g, ",").replace(/"/g, '""');
      csvContent += `${lead.registeredAt};${escapedName};${escapedPhone}\n`;
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads-live-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Lista de contatos (CSV/Excel) baixada com sucesso!");
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const nameMatch = lead.name.toLowerCase().includes(leadsSearch.toLowerCase());
      const phoneMatch = lead.phone.toLowerCase().includes(leadsSearch.toLowerCase());
      const dateMatch = lead.registeredAt.toLowerCase().includes(leadsSearch.toLowerCase());
      return nameMatch || phoneMatch || dateMatch;
    });
  }, [leads, leadsSearch]);

  // ── CONTADORES & ANÁLISE DE MÉTRICAS (MEMOIZADO) ────────────────────
  const metricsStats = useMemo(() => {
    const totalLeads = leads.length;
    
    // Cliques no CTA de compra
    const totalClicks = leads.filter(l => l.clickedOffer).length;
    const ctr = totalLeads > 0 ? ((totalClicks / totalLeads) * 100).toFixed(1) : "0.0";
    
    // Tempo Médio Assistido
    const totalSeconds = leads.reduce((acc, l) => acc + (l.watchTime || 0), 0);
    const avgSeconds = totalLeads > 0 ? totalSeconds / totalLeads : 0;
    
    // Retenção Qualificada (>15 min)
    const qualifiedLeadsCount = leads.filter(l => (l.watchTime || 0) > 900).length;
    const qualifiedPct = totalLeads > 0 ? ((qualifiedLeadsCount / totalLeads) * 100).toFixed(1) : "0.0";
    
    // Leads nos últimos 3 dias e últimos 7 dias
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    
    const leadsLast3Days = leads.filter(l => {
      const d = parseRegisteredDate(l.registeredAt);
      return now - d.getTime() < threeDaysMs;
    }).length;
    
    const leadsLast7Days = leads.filter(l => {
      const d = parseRegisteredDate(l.registeredAt);
      return now - d.getTime() < sevenDaysMs;
    }).length;
    
    // Taxa de crescimento: últimos 3 dias vs 3 dias anteriores (dias 4 a 6)
    const leadsDays4to6 = leads.filter(l => {
      const d = parseRegisteredDate(l.registeredAt);
      const diff = now - d.getTime();
      return diff >= threeDaysMs && diff < 2 * threeDaysMs;
    }).length;
    
    let growthRate = 0;
    if (leadsDays4to6 > 0) {
      growthRate = Math.round(((leadsLast3Days - leadsDays4to6) / leadsDays4to6) * 100);
    } else if (leadsLast3Days > 0) {
      growthRate = 100;
    }

    return {
      totalLeads,
      totalClicks,
      ctr,
      avgSeconds,
      qualifiedPct,
      leadsLast3Days,
      leadsLast7Days,
      growthRate
    };
  }, [leads]);

  // Drop-off de Retenção
  const retentionChartData = useMemo(() => {
    const total = Math.max(1, leads.length);
    const counts = { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0 };
    
    leads.forEach(l => {
      const mins = (l.watchTime || 0) / 60;
      if (mins < 5) counts.t1++;
      else if (mins < 15) counts.t2++;
      else if (mins < 30) counts.t3++;
      else if (mins < 60) counts.t4++;
      else counts.t5++;
    });

    return [
      { 
        label: "0-5 min (Abandono Inicial)", 
        desc: "Usuários que saíram nos primeiros minutos da live",
        count: counts.t1, 
        pct: Math.round((counts.t1 / total) * 100), 
        color: "bg-red-500", 
        border: "border-red-500/20 bg-red-500/5 text-red-400" 
      },
      { 
        label: "5-15 min (Abandono Precoce)", 
        desc: "Usuários que perderam o interesse antes do conteúdo principal",
        count: counts.t2, 
        pct: Math.round((counts.t2 / total) * 100), 
        color: "bg-orange-500", 
        border: "border-orange-500/20 bg-orange-500/5 text-orange-400" 
      },
      { 
        label: "15-30 min (Engajados)", 
        desc: "Assistiram o conteúdo prático intermediário",
        count: counts.t3, 
        pct: Math.round((counts.t3 / total) * 100), 
        color: "bg-yellow-500", 
        border: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400" 
      },
      { 
        label: "30-60 min (Momento da Oferta)", 
        desc: "Permaneceram até o anúncio e detalhes dos planos",
        count: counts.t4, 
        pct: Math.round((counts.t4 / total) * 100), 
        color: "bg-cyan-500", 
        border: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" 
      },
      { 
        label: "60+ min (Fidelizados / Final)", 
        desc: "Assistiram até o encerramento completo (público super quente)",
        count: counts.t5, 
        pct: Math.round((counts.t5 / total) * 100), 
        color: "bg-emerald-500", 
        border: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" 
      }
    ];
  }, [leads]);

  // Análise de Zona de Perigo de Drop-off
  const dangerZoneAnalysis = useMemo(() => {
    // 5-minute intervals up to 70 minutes (14 intervals)
    const intervalExits = Array(14).fill(0);
    const intervalNames = [
      "0-5 min", "5-10 min", "10-15 min", "15-20 min", "20-25 min", "25-30 min",
      "30-35 min", "35-40 min", "40-45 min", "45-50 min", "50-55 min", "55-60 min",
      "60-65 min", "65-70 min"
    ];
    
    let totalOffline = 0;
    
    leads.forEach(l => {
      const isOnline = l.lastActiveAt ? (Date.now() - l.lastActiveAt < 10000) : false;
      if (!isOnline) {
        totalOffline++;
        const exitTime = l.lastPlaybackTime !== undefined ? l.lastPlaybackTime : (l.watchTime || 0);
        const minutes = exitTime / 60;
        const intervalIndex = Math.min(13, Math.floor(minutes / 5));
        intervalExits[intervalIndex]++;
      }
    });
    
    let maxExits = 0;
    let dangerIndex = -1;
    for (let i = 0; i < intervalExits.length; i++) {
      if (intervalExits[i] > maxExits) {
        maxExits = intervalExits[i];
        dangerIndex = i;
      }
    }
    
    return {
      dangerIntervalName: dangerIndex !== -1 ? intervalNames[dangerIndex] : "Nenhum",
      dangerExits: maxExits,
      totalOffline,
      dangerIndex,
      allExits: intervalExits.map((count, i) => ({
        interval: intervalNames[i],
        count,
        pct: totalOffline > 0 ? Math.round((count / totalOffline) * 100) : 0
      })).filter(item => item.count > 0)
    };
  }, [leads]);

  // Calendário de Inscrição Diária (Últimos 7 dias)
  const calendarDailyData = useMemo(() => {
    const list = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toLocaleDateString("pt-BR"); // "DD/MM/YYYY"
      const dateLabel = d.toLocaleDateString("pt-BR", { day: 'numeric', month: 'short' }); // "20 mai."
      
      const dayLeads = leads.filter(l => l.registeredAt.startsWith(dateString));
      const total = dayLeads.length;
      const uniques = dayLeads.filter(l => (l.entryCount || 1) === 1).length;
      const recurrents = dayLeads.filter(l => (l.entryCount || 1) > 1).length;
      const highlyRecurrent = dayLeads.filter(l => (l.entryCount || 1) >= 3).length; // Alerta de > 3 entradas

      list.push({
        dateLabel,
        dateString,
        total,
        uniques,
        recurrents,
        highlyRecurrent
      });
    }
    return list;
  }, [leads]);

  // Sync comments to localStorage
  const saveComments = async (newComments: ScheduledComment[]) => {
    const sorted = [...newComments].sort((a, b) => {
      const parseTimeToSeconds = (t: string) => {
        const parts = t.split(":");
        if (parts.length !== 2) return 0;
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        return minutes * 60 + seconds;
      };
      return parseTimeToSeconds(a.time) - parseTimeToSeconds(b.time);
    });

    setComments(sorted);
    localStorage.setItem("live_stream_comments", JSON.stringify(sorted));
    await syncGlobalSettingsToSupabase();
  };

  // Save Video settings
  const handleSaveVideoSettings = async () => {
    if (!videoUrl.trim()) {
      toast.error("O link ou ID do vídeo não pode estar em branco.");
      return;
    }
    localStorage.setItem("live_stream_video_url", videoUrl.trim());
    await syncGlobalSettingsToSupabase();
    toast.success("Link do vídeo da transmissão atualizado com sucesso!");
  };

  // Save Offer Settings
  const handleSaveOfferSettings = async () => {
    if (offerStatus === "scheduled") {
      const timeRegex = /^[0-9]{1,3}:[0-5][0-9]$/;
      if (!timeRegex.test(offerTime)) {
        toast.error("O tempo de vídeo deve estar no formato MM:SS (ex: 50:00).");
        return;
      }
    }
    if (!offerTitle.trim()) {
      toast.error("O título da oferta é obrigatório.");
      return;
    }
    if (!offerCheckoutUrl.trim()) {
      toast.error("O link de checkout/compra é obrigatório.");
      return;
    }

    const settings = {
      status: offerStatus,
      time: offerTime,
      title: offerTitle.trim(),
      description: offerDesc.trim(),
      price: offerPrice.trim(),
      checkoutUrl: offerCheckoutUrl.trim(),
      bannerUrl: offerBannerUrl.trim()
    };

    localStorage.setItem("live_stream_offer_settings", JSON.stringify(settings));
    await syncGlobalSettingsToSupabase();
    toast.success("Configurações da oferta salvas com sucesso!");
  };

  // Filtered comments based on search
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const usernameMatch = comment.username.toLowerCase().includes(searchQuery.toLowerCase());
      const messageMatch = comment.message.toLowerCase().includes(searchQuery.toLowerCase());
      const timeMatch = comment.time.includes(searchQuery);
      return usernameMatch || messageMatch || timeMatch;
    });
  }, [comments, searchQuery]);

  // Open Dialog for Add
  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormUsername("");
    setFormMessage("");
    setFormTime("");
    setSaveAsPresetCheckbox(false);
    setDialogOpen(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (index: number, comment: ScheduledComment) => {
    setEditingIndex(index);
    setFormUsername(comment.username);
    setFormMessage(comment.message);
    setFormTime(comment.time);
    setSaveAsPresetCheckbox(false);
    setDialogOpen(true);
  };

  // Delete Comment
  const handleDelete = (index: number) => {
    const commentToDelete = filteredComments[index];
    const actualIndex = comments.findIndex(
      (c) => c.time === commentToDelete.time && 
             c.username === commentToDelete.username && 
             c.message === commentToDelete.message
    );

    if (actualIndex !== -1) {
      const updated = [...comments];
      updated.splice(actualIndex, 1);
      saveComments(updated);
      toast.success("Comentário excluído com sucesso!");
    }
  };

  // Restore Default 107 Comments
  const handleRestoreDefault = () => {
    if (window.confirm("Tem certeza que deseja restaurar a lista padrão de 107 comentários da live? Isso apagará suas alterações personalizadas.")) {
      saveComments(DEFAULT_SCHEDULED_COMMENTS);
      toast.success("Comentários restaurados para o padrão original!");
    }
  };

  // Form Validation and Submit for Comments
  const handleSaveComment = () => {
    if (!formUsername.trim()) {
      toast.error("O campo @usuario é obrigatório.");
      return;
    }
    if (!formMessage.trim()) {
      toast.error("O campo comentário é obrigatório.");
      return;
    }
    
    const timeRegex = /^[0-9]{1,3}:[0-5][0-9]$/;
    if (!timeRegex.test(formTime)) {
      toast.error("O tempo de vídeo deve estar no formato MM:SS (ex: 00:18 ou 68:20).");
      return;
    }

    const cleanUsername = formUsername.trim().replace(/^@/, ""); 
    const newCommentItem: ScheduledComment = {
      time: formTime,
      username: cleanUsername,
      message: formMessage.trim()
    };

    let updated = [...comments];

    if (editingIndex !== null) {
      const commentToEdit = filteredComments[editingIndex];
      const actualIndex = comments.findIndex(
        (c) => c.time === commentToEdit.time && 
               c.username === commentToEdit.username && 
               c.message === commentToEdit.message
      );

      if (actualIndex !== -1) {
        updated[actualIndex] = newCommentItem;
        toast.success("Comentário atualizado!");
      }
    } else {
      updated.push(newCommentItem);
      toast.success("Comentário adicionado!");
    }

    // Save as Custom Preset if checkbox is checked
    if (saveAsPresetCheckbox) {
      const newPreset: CustomCommentPreset = {
        id: `custom_preset_${Date.now()}`,
        label: `Predef. - ${cleanUsername}`,
        time: formTime,
        username: cleanUsername,
        message: formMessage.trim()
      };
      const updatedPresets = [...customPresets, newPreset];
      setCustomPresets(updatedPresets);
      localStorage.setItem("live_stream_custom_presets", JSON.stringify(updatedPresets));
      setSaveAsPresetCheckbox(false); // Reset checkbox
      toast.success("Comentário também foi salvo como predefinição!");
    }

    saveComments(updated);
    setDialogOpen(false);
  };

  // Custom Preset Helpers
  const handleSaveCustomPreset = () => {
    if (!presetLabel.trim()) {
      toast.error("O campo identificador da predefinição é obrigatório.");
      return;
    }
    if (!presetUsername.trim()) {
      toast.error("O campo @usuario é obrigatório.");
      return;
    }
    if (!presetMessage.trim()) {
      toast.error("O campo comentário é obrigatório.");
      return;
    }
    
    const timeRegex = /^[0-9]{1,3}:[0-5][0-9]$/;
    if (!timeRegex.test(presetTime)) {
      toast.error("O tempo de vídeo deve estar no formato MM:SS (ex: 00:18 ou 68:20).");
      return;
    }

    const cleanUsername = presetUsername.trim().replace(/^@/, "");
    const newPreset: CustomCommentPreset = {
      id: `custom_preset_${Date.now()}`,
      label: presetLabel.trim(),
      time: presetTime.trim(),
      username: cleanUsername,
      message: presetMessage.trim()
    };

    const updatedPresets = [...customPresets, newPreset];
    setCustomPresets(updatedPresets);
    localStorage.setItem("live_stream_custom_presets", JSON.stringify(updatedPresets));
    
    // Schedule immediately if checkbox is checked
    if (presetScheduleImmediately) {
      const newCommentItem: ScheduledComment = {
        time: presetTime.trim(),
        username: cleanUsername,
        message: presetMessage.trim()
      };

      const duplicate = comments.some(
        c => c.time === newCommentItem.time && 
             c.username === newCommentItem.username && 
             c.message === newCommentItem.message
      );

      if (!duplicate) {
        saveComments([...comments, newCommentItem]);
        toast.success(`Comentário agendado para o tempo ${newCommentItem.time}!`);
      } else {
        toast.warning(`Comentário de @${cleanUsername} já está agendado em ${newCommentItem.time}.`);
      }
      setPresetScheduleImmediately(false); // Reset checkbox
    }

    // Clear inputs
    setPresetLabel("");
    setPresetTime("");
    setPresetUsername("");
    setPresetMessage("");
    
    toast.success("Nova predefinição salva com sucesso!");
  };

  const handleDeleteCustomPreset = (id: string) => {
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem("live_stream_custom_presets", JSON.stringify(updated));
    toast.success("Predefinição excluída da biblioteca.");
  };

  const handleApplyCustomPreset = (preset: CustomCommentPreset) => {
    const newCommentItem: ScheduledComment = {
      time: preset.time,
      username: preset.username,
      message: preset.message
    };

    const duplicate = comments.some(
      c => c.time === preset.time && 
           c.username === preset.username && 
           c.message === preset.message
    );

    if (duplicate) {
      toast.warning(`Este comentário já está agendado em ${preset.time}.`);
      return;
    }

    const updated = [...comments, newCommentItem];
    saveComments(updated);
    toast.success(`Comentário de @${preset.username} agendado para o tempo ${preset.time}!`);
  };

  // Preset 1-Click Fill handler
  const handleSelectPreset = (preset: CommentPreset) => {
    setEditingIndex(null);
    setFormUsername(preset.username);
    setFormMessage(preset.message);
    
    // Guess next time logic: use the time of the last comment + 10s, or "50:00"
    let suggestedTime = "50:00";
    if (comments.length > 0) {
      const lastComment = comments[comments.length - 1];
      const parts = lastComment.time.split(":");
      if (parts.length === 2) {
        let mins = parseInt(parts[0], 10) || 0;
        let secs = parseInt(parts[1], 10) || 0;
        secs += 10;
        if (secs >= 60) {
          mins += Math.floor(secs / 60);
          secs = secs % 60;
        }
        suggestedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }
    
    setFormTime(suggestedTime);
    setDialogOpen(true);
    toast.success(`Predefinição de @${preset.username} carregada com sucesso!`);
  };

  // Bulk Inject preset pack handler
  const handleInjectPack = () => {
    const timeRegex = /^[0-9]{1,3}:[0-5][0-9]$/;
    if (!timeRegex.test(packStartTime)) {
      toast.error("O tempo inicial de injeção deve estar no formato MM:SS (ex: 50:00).");
      return;
    }

    const pack = PRESET_PACKS.find(p => p.id === selectedPackId);
    if (!pack) return;

    // Calculate time sequences
    const parts = packStartTime.split(":");
    let mins = parseInt(parts[0], 10) || 0;
    let secs = parseInt(parts[1], 10) || 0;
    let totalSecs = mins * 60 + secs;

    const newComments: ScheduledComment[] = [];

    pack.comments.forEach((c, i) => {
      const currentTotalSecs = totalSecs + (i * packInterval);
      const currentMins = Math.floor(currentTotalSecs / 60);
      const currentSecs = currentTotalSecs % 60;
      const formattedTime = `${String(currentMins).padStart(2, '0')}:${String(currentSecs).padStart(2, '0')}`;
      
      newComments.push({
        time: formattedTime,
        username: c.username,
        message: c.message
      });
    });

    const updated = [...comments, ...newComments];
    saveComments(updated);
    toast.success(`Pacote "${pack.name}" com 5 comentários injetado e ordenado com sucesso!`);
  };

  // Export JSON for backup
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(comments, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `comentarios-live-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Backup dos comentários baixado com sucesso!");
  };

  return (
    <div className="space-y-6">
      
      {/* SELETOR DE ABAS PRINCIPAIS - GESTÃO PREMIUM */}
      <div className="flex flex-wrap border-b border-muted-foreground/15 pb-2 mb-6 gap-2">
        <button
          onClick={() => setActiveSubTab("comments")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 border ${
            activeSubTab === "comments"
              ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_4px_20px_rgba(6,182,212,0.25)] font-extrabold"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40 font-bold"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Comentários e Oferta
        </button>
        
        <button
          onClick={() => setActiveSubTab("leads")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 border ${
            activeSubTab === "leads"
              ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.25)] font-extrabold"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40 font-bold"
          }`}
        >
          <Users className="w-4 h-4" />
          Contatos Capturados (Leads)
          {leads.length > 0 && (
            <Badge className="bg-black text-white text-[10px] px-1.5 py-0.2 rounded font-black border border-white/10 ml-1">
              {leads.length}
            </Badge>
          )}
        </button>
        
        <button
          onClick={() => setActiveSubTab("metrics")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 border ${
            activeSubTab === "metrics"
              ? "bg-purple-500 text-white border-purple-500 shadow-[0_4px_20px_rgba(168,85,247,0.25)] font-extrabold"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40 font-bold"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Métricas e Calendário
        </button>
      </div>

      {activeSubTab === "comments" && (
        <div className="space-y-6 animate-fadeIn">
      
      {/* SEÇÃO 1: BIBLIOTECA DE PREDEFINIÇÕES & INSERÇÃO RÁPIDA (SOLICITADA PELO USUÁRIO) */}
      <Card className="border border-cyan-500/20 bg-card/65 backdrop-blur-sm shadow-[0_4px_20px_rgba(6,182,212,0.05)]">
        <CardHeader className="border-b border-muted-foreground/10 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            Biblioteca de Comentários Predefinidos
          </CardTitle>
          <CardDescription>
            Agilize a criação da live! Use predefinições de alta conversão para preencher o formulário com um clique ou criar predefinições customizadas de tempo, nome e comentário.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* SELETOR DE ABAS */}
          <div className="flex gap-2 p-1 bg-muted/30 border border-muted-foreground/10 rounded-lg w-fit">
            <button
              onClick={() => setActivePresetTab("standard")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all duration-300 flex items-center gap-1.5 ${
                activePresetTab === "standard"
                  ? "bg-cyan-500 text-black shadow-[0_2px_10px_rgba(6,182,212,0.15)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Padrão & Pacotes
            </button>
            <button
              onClick={() => setActivePresetTab("custom")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all duration-300 flex items-center gap-1.5 ${
                activePresetTab === "custom"
                  ? "bg-cyan-500 text-black shadow-[0_2px_10px_rgba(6,182,212,0.15)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Zap className="w-4 h-4" />
              Predefinições com Tempo (Tempo, Nome, Comentário)
            </button>
          </div>

          {activePresetTab === "standard" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COLUNA 1 & 2: MODELOS INDIVIDUAIS (1-CLICK FILL) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Modelos Individuais de Alta Conversão (Clique para Preencher)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Categoria 1: Prova Social */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      ⭐ Prova Social
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {SINGLE_COMMENT_PRESETS.filter(p => p.category === "social").map((preset, idx) => (
                        <Button
                          key={`social-${idx}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectPreset(preset)}
                          className="justify-start text-left text-xs font-semibold py-1.5 h-auto truncate border-muted-foreground/15 hover:bg-emerald-500/5 hover:border-emerald-500/30 group"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                          <span className="truncate" title={preset.message}>{preset.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Categoria 2: Compra Confirmada */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                      🔥 Compra (FOMO)
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {SINGLE_COMMENT_PRESETS.filter(p => p.category === "purchase").map((preset, idx) => (
                        <Button
                          key={`purchase-${idx}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectPreset(preset)}
                          className="justify-start text-left text-xs font-semibold py-1.5 h-auto truncate border-muted-foreground/15 hover:bg-cyan-500/5 hover:border-cyan-500/30 group"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                          <span className="truncate" title={preset.message}>{preset.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Categoria 3: Dúvidas */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      ❓ Dúvidas & Perguntas
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {SINGLE_COMMENT_PRESETS.filter(p => p.category === "question").map((preset, idx) => (
                        <Button
                          key={`question-${idx}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectPreset(preset)}
                          className="justify-start text-left text-xs font-semibold py-1.5 h-auto truncate border-muted-foreground/15 hover:bg-amber-500/5 hover:border-amber-500/30 group"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
                          <span className="truncate" title={preset.message}>{preset.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUNA 3: INJEÇÃO DE PACOTES EM LOTE (BULK PACKS) */}
              <div className="border-t lg:border-t-0 lg:border-l border-muted-foreground/10 pt-4 lg:pt-0 lg:pl-6 space-y-4">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Injetar Pacotes em Lote (Lançamento)
                </h4>
                
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Escolha o Pacote Temático</label>
                    <select
                      value={selectedPackId}
                      onChange={(e) => setSelectedPackId(e.target.value)}
                      className="w-full rounded-md border border-muted-foreground/15 bg-muted/30 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {PRESET_PACKS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        Início (MM:SS)
                      </label>
                      <Input
                        size={5}
                        placeholder="50:00"
                        value={packStartTime}
                        onChange={(e) => setPackStartTime(e.target.value)}
                        className="bg-muted/30 border-muted-foreground/15 h-8 text-xs font-mono"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase">
                        Espaçamento
                      </label>
                      <select
                        value={packInterval}
                        onChange={(e) => setPackInterval(parseInt(e.target.value, 10))}
                        className="w-full rounded-md border border-muted-foreground/15 bg-muted/30 px-2 py-1.5 text-xs text-foreground h-8 focus:outline-none"
                      >
                        <option value={10}>10 segundos</option>
                        <option value={15}>15 segundos</option>
                        <option value={20}>20 segundos</option>
                        <option value={30}>30 segundos</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleInjectPack}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs h-9 tracking-wide uppercase shadow-[0_2px_10px_rgba(6,182,212,0.15)] flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    Injetar 5 Comentários
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center leading-tight">
                    Adiciona 5 comentários em sequência espaçados pelo tempo selecionado a partir do tempo inicial.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* COLUNA 1: FORMULÁRIO DE CADASTRO DE PREDEFINIÇÃO */}
              <div className="space-y-4 bg-muted/10 border border-muted-foreground/10 p-4 rounded-xl">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Nova Predefinição Completa
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-muted-foreground uppercase">Nome da Predefinição / Etiqueta</label>
                    <Input
                      placeholder="Ex: Boas-vindas Fábio"
                      value={presetLabel}
                      onChange={(e) => setPresetLabel(e.target.value)}
                      className="bg-card border-muted-foreground/15 h-9 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-muted-foreground uppercase flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        Tempo (MM:SS)
                      </label>
                      <Input
                        placeholder="00:18"
                        value={presetTime}
                        onChange={(e) => setPresetTime(e.target.value)}
                        className="bg-card border-muted-foreground/15 h-9 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-muted-foreground uppercase flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        @usuario
                      </label>
                      <Input
                        placeholder="Fabiotravell"
                        value={presetUsername}
                        onChange={(e) => setPresetUsername(e.target.value)}
                        className="bg-card border-muted-foreground/15 h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-muted-foreground uppercase">Comentário</label>
                    <Input
                      placeholder="opa cheguei"
                      value={presetMessage}
                      onChange={(e) => setPresetMessage(e.target.value)}
                      className="bg-card border-muted-foreground/15 h-9 text-xs"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1 pb-1">
                    <input
                      type="checkbox"
                      id="preset-schedule-immediately"
                      checked={presetScheduleImmediately}
                      onChange={(e) => setPresetScheduleImmediately(e.target.checked)}
                      className="h-4 w-4 rounded border-muted-foreground/30 bg-muted/30 text-cyan-500 focus:ring-cyan-500"
                    />
                    <label
                      htmlFor="preset-schedule-immediately"
                      className="text-xs font-semibold text-muted-foreground cursor-pointer select-none"
                    >
                      Agendar imediatamente na transmissão ao salvar
                    </label>
                  </div>

                  <Button 
                    onClick={handleSaveCustomPreset}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs h-9 tracking-wide uppercase shadow-[0_2px_10px_rgba(6,182,212,0.15)] flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Salvar na Biblioteca
                  </Button>
                </div>
              </div>

              {/* COLUNA 2 & 3: GRID DE PREDEFINIÇÕES CADASTRADAS */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Predefinições de Comentários Cadastradas ({customPresets.length})
                </h4>

                {customPresets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {customPresets.map((preset) => (
                      <div 
                        key={preset.id} 
                        className="bg-card border border-muted-foreground/15 p-3 rounded-xl space-y-3 shadow-sm hover:border-cyan-500/30 transition-all duration-300 relative group flex flex-col justify-between"
                      >
                        <button 
                          onClick={() => handleDeleteCustomPreset(preset.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors duration-200"
                          title="Excluir Predefinição"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center pr-6">
                            <span className="font-black text-xs text-foreground uppercase tracking-wider truncate" title={preset.label}>
                              {preset.label}
                            </span>
                            <Badge variant="outline" className="font-mono text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-2 py-0.5">
                              {preset.time}
                            </Badge>
                          </div>

                          <div className="text-[11px] text-muted-foreground bg-muted/20 p-2 rounded-lg border border-muted-foreground/5 font-mono leading-relaxed truncate-2-lines">
                            <span className="text-primary font-bold">@{preset.username}: </span>
                            "{preset.message}"
                          </div>
                        </div>

                        <Button 
                          size="sm" 
                          onClick={() => handleApplyCustomPreset(preset)} 
                          className="w-full bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black font-black text-[10px] h-7.5 tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          Agendar Comentário
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] border border-dashed border-muted-foreground/15 rounded-xl bg-muted/5 gap-2 text-center p-4">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                    <p className="text-xs font-semibold text-muted-foreground">Nenhuma predefinição com tempo cadastrada.</p>
                    <p className="text-[10px] text-muted-foreground max-w-xs">Use o formulário ao lado para criar predefinições contendo tempo, nome de usuário e comentário.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GRID DE CONFIGURAÇÕES DE TRANSMISSÃO & OFERTAS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* CARD 1: CONTROLE DE VÍDEO DA TRANSMISSÃO */}
        <Card className="border border-muted-foreground/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Vídeo da Transmissão (Replay)
            </CardTitle>
            <CardDescription>
              Substitua o vídeo do YouTube exibido na live de replay para os usuários (/live-aovivo).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="video-url" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                URL ou ID do Vídeo do YouTube
              </label>
              <Input
                id="video-url"
                placeholder="Ex: https://www.youtube.com/watch?v=Xqcw-NpPz08 ou Xqcw-NpPz08"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="bg-muted/30 border-muted-foreground/15"
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Suporta links completos do YouTube, links curtos (youtu.be) ou diretamente o ID de 11 caracteres do vídeo.
              </p>
            </div>
            
            <div className="pt-2 flex justify-between items-center">
              {/* Mini Preview do Iframe */}
              <div className="text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-muted-foreground/5 font-mono">
                Ativo: {videoUrl.includes("watch?v=") ? videoUrl.split("watch?v=")[1]?.substring(0,11) : videoUrl.substring(0,11)}...
              </div>
              <Button onClick={handleSaveVideoSettings} className="bg-primary text-primary-foreground hover:bg-primary/95 gap-2">
                <Check className="w-4 h-4" />
                Salvar Vídeo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: BANNER GRANDE DE PREÇO & OFERTA E BOTÃO DE CHECKOUT */}
        <Card className="border border-muted-foreground/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Banner de Preço & Oferta da Live
            </CardTitle>
            <CardDescription>
              Programe o aparecimento automático de um banner e botão de compra para os planos quando falar de preços.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* PRIMEIRA LINHA: STATUS E TEMPO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Exibição do Banner</label>
                <select
                  value={offerStatus}
                  onChange={(e) => setOfferStatus(e.target.value as any)}
                  className="w-full rounded-md border border-muted-foreground/15 bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="hidden">🚫 Ocultar Banner</option>
                  <option value="visible">👁️ Sempre Mostrar</option>
                  <option value="scheduled">⏱️ Agendado por Tempo</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  Aparecer em (MM:SS)
                </label>
                <Input
                  placeholder="50:00"
                  value={offerTime}
                  disabled={offerStatus !== "scheduled"}
                  onChange={(e) => setOfferTime(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15"
                />
              </div>
            </div>

            {/* SEGUNDA LINHA: TÍTULO DA OFERTA E PREÇO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Título da Oferta</label>
                <Input
                  placeholder="Ex: 🔥 OFERTA EXCLUSIVA DA LIVE!"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Preço/Texto de Destaque</label>
                <Input
                  placeholder="Ex: Apenas 12x de R$ 29,70 ou R$ 297"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15 text-sm"
                />
              </div>
            </div>

            {/* TERCEIRA LINHA: DESCRIÇÃO DA OFERTA */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Descrição Curta</label>
              <Input
                placeholder="Ex: Canva Viagem Vitalício + Fábrica de Anúncios com Desconto!"
                value={offerDesc}
                onChange={(e) => setOfferDesc(e.target.value)}
                className="bg-muted/30 border-muted-foreground/15 text-sm"
              />
            </div>

            {/* QUARTA LINHA: LINK DE COMPRA & BANNER PERSONALIZADO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Link de Compra (Checkout)
                </label>
                <Input
                  placeholder="Ex: https://checkout.hotmart.com/..."
                  value={offerCheckoutUrl}
                  onChange={(e) => setOfferCheckoutUrl(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  URL da Imagem do Banner (Opcional)
                </label>
                <Input
                  placeholder="https://suaimagem.com/banner.png"
                  value={offerBannerUrl}
                  onChange={(e) => setOfferBannerUrl(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15 text-sm"
                  title="Se deixado em branco, a plataforma gerará automaticamente um banner moderno em degradê CSS"
                />
              </div>
            </div>

            {/* BOTÃO DE SALVAR CONFIGURAÇÕES */}
            <div className="pt-2 flex justify-end">
              <Button onClick={handleSaveOfferSettings} className="bg-primary text-primary-foreground hover:bg-primary/95 gap-2">
                <Check className="w-4 h-4" />
                Salvar Oferta
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* CARD DO GERENCIADOR DE COMENTÁRIOS DA LIVE (EXISTENTE E SEGURO) */}
      <Card className="border border-muted-foreground/10 bg-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Gerenciador de Comentários da Live
              </CardTitle>
              <CardDescription>
                Adicione, edite e remova os comentários agendados que aparecem automaticamente no replay da live (/live-aovivo).
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                onClick={handleSyncWithCloud}
                size="sm" 
                disabled={isSyncing}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-600/95 font-bold shadow-md"
              >
                <CloudUpload className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Salvando..." : "Salvar na Live"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRestoreDefault}
                className="gap-2 text-muted-foreground border-muted-foreground/20 hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar Padrão
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportJSON}
                className="gap-2 text-muted-foreground border-muted-foreground/20 hover:text-foreground"
              >
                <Download className="w-4 h-4" />
                Exportar Backup
              </Button>
              <Button 
                onClick={handleOpenAdd}
                size="sm" 
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/95"
              >
                <Plus className="w-4 h-4" />
                Novo Comentário
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por @usuario, comentário ou tempo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30 border-muted-foreground/10 focus:border-primary/30"
              />
            </div>
            <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Total de Comentários: <Badge variant="secondary" className="ml-1 font-bold">{comments.length}</Badge></span>
            </div>
          </div>

          <div className="rounded-md border border-muted-foreground/15 overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[120px] font-bold">Tempo de Vídeo</TableHead>
                    <TableHead className="w-[200px] font-bold">@usuario</TableHead>
                    <TableHead className="font-bold">Comentário</TableHead>
                    <TableHead className="w-[120px] text-right font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.length > 0 ? (
                    filteredComments.map((comment, index) => (
                      <TableRow key={`${comment.time}-${comment.username}-${index}`} className="hover:bg-muted/20">
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-sm px-2.5 py-0.5 bg-primary/5 text-primary border-primary/20">
                            {comment.time}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <span className="text-muted-foreground">@</span>{comment.username}
                        </TableCell>
                        <TableCell className="max-w-md truncate text-muted-foreground text-sm" title={comment.message}>
                          {comment.message}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleOpenEdit(index, comment)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
                          <p>Nenhum comentário encontrado para a busca atual.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NOVO CARD: COMENTÁRIOS DE ESPERA (ANTES DO PLAY) */}
      <Card className="border border-muted-foreground/10 bg-card mt-6">
        <CardHeader>
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              Comentários de Espera (Antes do Play)
            </CardTitle>
            <CardDescription>
              Estes 3 comentários aparecem fixos na tela de chat antes de o usuário clicar no Play (simulando que outras pessoas já estavam aguardando).
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prePlayComments.map((comment, index) => (
              <div key={comment.id} className="bg-muted/10 border border-muted-foreground/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-muted-foreground/5 pb-2">
                  <span className="text-xs font-black text-pink-400 uppercase tracking-wider">
                    Comentário {index + 1}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Aparece no início
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      @usuario
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-muted-foreground text-xs font-semibold">@</span>
                      <Input
                        value={comment.username}
                        onChange={(e) => {
                          const updated = [...prePlayComments];
                          updated[index] = { ...updated[index], username: e.target.value };
                          setPrePlayComments(updated);
                        }}
                        placeholder="Ex: Fabiotravell"
                        className="pl-6 bg-muted/20 border-muted-foreground/10 text-xs h-8 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      Mensagem
                    </label>
                    <Input
                      value={comment.message}
                      onChange={(e) => {
                        const updated = [...prePlayComments];
                        updated[index] = { ...updated[index], message: e.target.value };
                        setPrePlayComments(updated);
                      }}
                      placeholder="Mensagem de espera..."
                      className="bg-muted/20 border-muted-foreground/10 text-xs h-8 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={savePrePlay}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Salvar Comentários de Espera
            </Button>
          </div>
        </CardContent>
      </Card>

        </div>
      )}

      {/* ABA DE LEADS / CONTATOS CAPTURADOS */}
      {activeSubTab === "leads" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* SEÇÃO ESPECIAL: Novos Comentários de Usuários (Não Respondidos) */}
          {unansweredComments.length > 0 && (
            <Card className="border border-amber-500/25 bg-amber-500/5 backdrop-blur-sm shadow-[0_4px_25px_rgba(245,158,11,0.08)] animate-fadeIn">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-md font-black flex items-center gap-2 text-amber-400 uppercase tracking-wider">
                    <MessageSquare className="w-5 h-5 text-amber-400 animate-pulse" />
                    Comentários Recentes de Usuários (Não Respondidos)
                  </CardTitle>
                  <CardDescription className="text-amber-200/60 font-semibold text-xs mt-0.5">
                    Perguntas reais enviadas pelos leads durante a live. Clique para responder diretamente no WhatsApp do lead ou marcar como respondido.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-extrabold bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs px-2.5 py-1">
                  {unansweredComments.length} PENDENTE(S)
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unansweredComments.map((item, idx) => (
                    <div key={idx} className="bg-zinc-950/90 border border-amber-500/20 p-4 rounded-xl flex flex-col justify-between gap-3 text-white">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                          <span className="font-extrabold text-xs text-amber-400 tracking-wide">@{item.leadName}</span>
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 font-bold px-1.5 py-0.5 rounded">Vídeo: {item.time}</span>
                        </div>
                        <p className="text-xs text-zinc-200 leading-relaxed font-semibold italic">
                          "{item.message}"
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-[10px] mt-1.5">
                        <span className="text-zinc-500 font-bold">{new Date(item.timestamp).toLocaleTimeString("pt-BR")}</span>
                        <div className="flex gap-1.5">
                          <a 
                            href={`https://wa.me/${item.leadPhone.replace(/\D/g, "").startsWith("55") ? item.leadPhone.replace(/\D/g, "") : "55" + item.leadPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${item.leadName}! Vi sua pergunta na live: "${item.message}". Vamos conversar?`)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="bg-[#25D366] hover:bg-[#1ebd54] text-white font-extrabold text-[9px] uppercase tracking-wider h-7 px-2 border-none">
                              Responder Whats
                            </Button>
                          </a>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkCommentAnswered(item.leadId, item.commentIndex)}
                            className="border-amber-500/20 hover:bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase h-7 px-2"
                          >
                            ✓ Concluído
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-emerald-500/20 bg-card/65 backdrop-blur-sm shadow-[0_4px_25px_rgba(16,185,129,0.05)]">
            <CardHeader className="border-b border-muted-foreground/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                    <Users className="w-5 h-5 text-emerald-400" />
                    Contatos Capturados / Leads da Live
                  </CardTitle>
                  <CardDescription>
                    Pessoas que se inscreveram para a live. Entre em contato 1-a-1 via WhatsApp e veja os dados de retenção e cliques.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={seedMockData}
                    className="gap-2 text-purple-400 border-purple-500/20 hover:bg-purple-500/10 font-bold"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    Simular Dados (+35 Leads)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearLeads}
                    className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar Leads
                  </Button>
                  <Button 
                    onClick={handleExportLeadsCSV}
                    size="sm" 
                    className="gap-2 bg-emerald-500 text-black hover:bg-emerald-600 font-black tracking-wide uppercase shadow-[0_2px_10px_rgba(16,185,129,0.15)] h-9"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Excel (CSV)
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, telefone ou data de entrada..."
                    value={leadsSearch}
                    onChange={(e) => setLeadsSearch(e.target.value)}
                    className="pl-9 bg-muted/30 border-muted-foreground/10 focus:border-emerald-500/30"
                  />
                </div>
                <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground font-semibold">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Total Filtrado: <Badge variant="secondary" className="ml-1 font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{filteredLeads.length}</Badge></span>
                </div>
              </div>

              <div className="rounded-xl border border-muted-foreground/15 overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-[240px] font-black uppercase text-[10px] tracking-wider text-muted-foreground">Identificação (Lead)</TableHead>
                        <TableHead className="w-[180px] font-black uppercase text-[10px] tracking-wider text-muted-foreground">Status de Conexão</TableHead>
                        <TableHead className="w-[160px] font-black uppercase text-[10px] tracking-wider text-muted-foreground">Data de Entrada</TableHead>
                        <TableHead className="w-[130px] font-black uppercase text-[10px] tracking-wider text-muted-foreground">Tempo Assistido</TableHead>
                        <TableHead className="w-[180px] font-black uppercase text-[10px] tracking-wider text-muted-foreground">Interação / Oferta</TableHead>
                        <TableHead className="w-[180px] text-right font-black uppercase text-[10px] tracking-wider text-muted-foreground">Ações de Contato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead) => {
                          const isOnline = lead.lastActiveAt ? (Date.now() - lead.lastActiveAt < 10000) : false;
                          const entryCount = lead.entryCount || 1;
                          const isFrequent = entryCount >= 3;
                          
                          // Avatar initials and custom gradient background based on lead ID or name hash
                          const nameInitials = lead.name
                            ? lead.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
                            : "U";
                          
                          const charCodeSum = lead.name ? lead.name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
                          const gradientColors = [
                            "from-purple-500/15 to-indigo-500/15 text-purple-400 border-purple-500/25",
                            "from-emerald-500/15 to-teal-500/15 text-emerald-400 border-emerald-500/25",
                            "from-amber-500/15 to-orange-500/15 text-amber-400 border-amber-500/25",
                            "from-pink-500/15 to-rose-500/15 text-pink-400 border-pink-500/25",
                            "from-blue-500/15 to-cyan-500/15 text-blue-400 border-blue-500/25"
                          ];
                          const gradientClass = gradientColors[charCodeSum % gradientColors.length];

                          return (
                            <>
                              <TableRow 
                                key={lead.id} 
                                onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                                className={`hover:bg-muted/20 cursor-pointer transition-all duration-200 border-b border-muted-foreground/5 py-3 ${expandedLeadId === lead.id ? "bg-muted/15" : ""}`}
                              >
                                {/* Identificação (Lead) */}
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {/* Avatar circular premium */}
                                    <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold text-xs tracking-wider border flex-shrink-0 shadow-sm`}>
                                      {nameInitials}
                                    </div>
                                    
                                    <div className="flex flex-col gap-0.5">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {isFrequent && (
                                          <span className="relative flex h-2 w-2 shadow-[0_0_8px_#ef4444] mr-0.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                          </span>
                                        )}
                                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 tracking-wide">{lead.name}</span>
                                        {isFrequent && (
                                          <Badge variant="destructive" className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/30">
                                            🚨 {entryCount}x
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold">
                                        {formatPhoneNumber(lead.phone)}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                
                                {/* Status de Conexão */}
                                <TableCell>
                                  {isOnline ? (
                                    <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 animate-pulse border border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.1)]">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping" />
                                      🔴 ASSISTINDO AGORA
                                    </span>
                                  ) : (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] font-black text-red-700 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-red-500/20 w-fit">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                                        SAIU DA LIVE
                                      </span>
                                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                        Momento: {formatWatchTime(lead.lastPlaybackTime !== undefined ? lead.lastPlaybackTime : (lead.watchTime || 0))}
                                      </span>
                                    </div>
                                  )}
                                </TableCell>
                                
                                {/* Data de Entrada */}
                                <TableCell>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                    <span>{lead.registeredAt}</span>
                                  </div>
                                </TableCell>
                                
                                {/* Tempo Assistido */}
                                <TableCell>
                                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                                    <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    {formatWatchTime(lead.watchTime || 0)}
                                  </span>
                                </TableCell>
                                
                                {/* Status Oferta / Compra */}
                                <TableCell>
                                  {lead.clickedOffer ? (
                                    <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                                      <ShoppingBag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
                                      🔥 CLICOU EM COMPRAR
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                                      <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                      Assistindo Live
                                    </span>
                                  )}
                                </TableCell>
                                
                                {/* Ações de Contato */}
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-2">
                                    <a 
                                      href={getWhatsAppLink(lead.phone, lead.name)} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      title="Chamar no WhatsApp"
                                    >
                                      <Button 
                                        size="sm" 
                                        className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition-all border-none h-8"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5 fill-black text-black" />
                                        Chamar no Whats
                                      </Button>
                                    </a>
                                    
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleDeleteLead(lead.id)}
                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"
                                      title="Excluir Lead"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                              
                              {/* Sub-row Timeline Drawer */}
                              {expandedLeadId === lead.id && (
                                <TableRow className="bg-muted/10 border-b border-muted-foreground/10 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                  <TableCell colSpan={6} className="p-6">
                                    <div className="bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-muted-foreground/15 p-6 space-y-5 text-white">
                                      <div className="flex items-center justify-between border-b border-muted-foreground/10 pb-3">
                                        <h4 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                                          Linha do Tempo da Sessão Interativa - {lead.name}
                                        </h4>
                                        <span className="text-[10px] text-zinc-500 font-bold font-mono">ID: {lead.id}</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Vertical Timeline Steps */}
                                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
                                          {/* Step 1: Entry */}
                                          <div className="relative flex flex-col gap-1">
                                            <span className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-black flex items-center justify-center">
                                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            </span>
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold uppercase px-2 py-0.5 rounded-md">Entrada</span>
                                              <span className="text-xs text-zinc-400 font-semibold">{lead.registeredAt}</span>
                                            </div>
                                            <p className="text-xs text-zinc-200">
                                              Acessou a live ao vivo e preencheu os dados de inscrição com sucesso.
                                            </p>
                                          </div>
                                          
                                          {/* Step 2: Recurrency */}
                                          {entryCount > 1 && (
                                            <div className="relative flex flex-col gap-1">
                                              <span className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-red-500 bg-black flex items-center justify-center animate-pulse">
                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                              </span>
                                              <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-red-500/10 text-red-400 font-extrabold uppercase px-2 py-0.5 rounded-md">Entradas Recorrentes</span>
                                                <span className="text-xs text-zinc-400 font-semibold">{entryCount} visitas</span>
                                              </div>
                                              <p className="text-xs text-zinc-200">
                                                Usuário retornou ou recarregou a transmissão {entryCount} vezes. Retomou do minuto exato.
                                              </p>
                                            </div>
                                          )}
                                          
                                          {/* Step 3: Watch Progression */}
                                          <div className="relative flex flex-col gap-1">
                                            <span className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-cyan-400 bg-black flex items-center justify-center">
                                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                            </span>
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-extrabold uppercase px-2 py-0.5 rounded-md">Retenção de Vídeo</span>
                                              <span className="text-xs text-zinc-400 font-semibold">{formatWatchTime(lead.watchTime)} assistidos</span>
                                            </div>
                                            <p className="text-xs text-zinc-200">
                                              Assistiu a live por um total acumulado de {formatWatchTime(lead.watchTime)} segundos. Último playback marcado no segundo {lead.lastPlaybackTime || 0}.
                                            </p>
                                          </div>
                                          
                                          {/* Step 4: Clicked Offer */}
                                          {lead.clickedOffer && (
                                            <div className="relative flex flex-col gap-1">
                                              <span className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-amber-500 bg-black flex items-center justify-center animate-pulse">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                              </span>
                                              <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-amber-500/10 text-amber-400 font-extrabold uppercase px-2 py-0.5 rounded-md">Gatilho de Venda</span>
                                                <span className="text-xs text-zinc-400 font-semibold">Clicou no CTA</span>
                                              </div>
                                              <p className="text-xs text-zinc-200">
                                                Demonstrou alto interesse psicológico: clicou na oferta especial para ir ao checkout da Fábrica de Criativos.
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {/* Messages & Chat History inside Live */}
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 max-h-[250px] overflow-y-auto">
                                          <h5 className="text-xs font-black uppercase tracking-wider text-cyan-400 border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            Histórico de Mensagens Enviadas pelo Lead
                                          </h5>
                                          {lead.comments && lead.comments.length > 0 ? (
                                            <div className="space-y-2">
                                              {lead.comments.map((comm: any, idx: number) => (
                                                <div key={idx} className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800 flex flex-col gap-1">
                                                  <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-cyan-400 font-bold">Vídeo: {comm.time}</span>
                                                    <span className="text-zinc-500 font-mono font-medium">{new Date(comm.timestamp || Date.now()).toLocaleTimeString("pt-BR")}</span>
                                                  </div>
                                                  <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                                                    {comm.message}
                                                  </p>
                                                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-zinc-900 text-[10px]">
                                                    <span className={comm.answered ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                                                      {comm.answered ? "✓ Respondido" : "⌛ Pendente"}
                                                    </span>
                                                    {!comm.answered && (
                                                      <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={() => handleMarkCommentAnswered(lead.id, idx)}
                                                        className="h-5 px-2 text-[9px] font-black uppercase text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded border-none"
                                                      >
                                                        Marcar Respondido
                                                      </Button>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 py-4">
                                              <MessageSquare className="w-6 h-6 text-zinc-600 mb-1" />
                                              <p className="text-[10px] text-center">Nenhum comentário digitado por este lead nesta transmissão.</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
                              <p className="font-bold text-xs">Nenhum lead encontrado para a busca.</p>
                              <p className="text-[10px] text-muted-foreground">Certifique-se de que há leads registrados ou simule novos dados.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ABA DE MÉTRICAS E ANÁLISE / CALENDÁRIO */}
      {activeSubTab === "metrics" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* SEÇÃO 1: KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CARD 1: TOTAL DE LEADS */}
            <Card className="border border-purple-500/20 bg-card/95 dark:bg-card/40 shadow-md flex items-center p-5 gap-4 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1 z-10">
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Leads Únicos</p>
                <h3 className="text-3xl font-black text-purple-700 dark:text-purple-300 tracking-tight">{metricsStats.totalLeads}</h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Inscritos cadastrados na live</p>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-purple-400 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Users className="w-24 h-24 font-black" />
              </div>
            </Card>

            {/* CARD 2: CRESCIMENTO */}
            <Card className="border border-emerald-500/20 bg-card/95 dark:bg-card/40 shadow-md flex items-center p-5 gap-4 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="space-y-1 z-10">
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Crescimento</p>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                    {metricsStats.growthRate > 0 ? `+${metricsStats.growthRate}%` : `${metricsStats.growthRate}%`}
                  </h3>
                  <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">3d vs 3d</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Cadastros dos últimos 3 dias: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{metricsStats.leadsLast3Days}</strong></p>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-emerald-400 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-24 h-24 font-black" />
              </div>
            </Card>

            {/* CARD 3: TEMPO MÉDIO */}
            <Card className="border border-cyan-500/20 bg-card/95 dark:bg-card/40 shadow-md flex items-center p-5 gap-4 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300">
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1 z-10">
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tempo de Tela</p>
                <h3 className="text-3xl font-black text-cyan-700 dark:text-cyan-300 tracking-tight">{formatWatchTime(metricsStats.avgSeconds)}</h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Média de retenção por usuário</p>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-cyan-400 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-24 h-24 font-black" />
              </div>
            </Card>

            {/* CARD 4: CONVERSÃO CTR */}
            <Card className="border border-amber-500/20 bg-card/95 dark:bg-card/40 shadow-md flex items-center p-5 gap-4 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1 z-10">
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Conversão (CTR)</p>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-3xl font-black text-amber-700 dark:text-amber-300 tracking-tight">{metricsStats.ctr}%</h3>
                  <span className="text-[9px] font-black bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">CTR</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total: <strong className="text-amber-700 dark:text-amber-400 font-extrabold">{metricsStats.totalClicks}</strong> cliques no botão</p>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-amber-400 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <ShoppingBag className="w-24 h-24 font-black" />
              </div>
            </Card>
            
          </div>

          {/* SEÇÃO 2: GRÁFICO DE RETENÇÃO PURE CSS E CALENDÁRIO */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* COLUNA 1 & 2: GRÁFICO DE RETENÇÃO PURE CSS */}
            <Card className="border border-muted-foreground/10 bg-card/95 dark:bg-card/40 backdrop-blur-sm shadow-md xl:col-span-2">
              <CardHeader className="border-b border-muted-foreground/5 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />
                  Gráfico de Retenção e Abandono da Audiência (Drop-off)
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                  Entenda exatamente em qual momento do vídeo você está perdendo espectadores e onde direcionar a oferta.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Danger Zone banner */}
                {dangerZoneAnalysis.dangerIntervalName !== "Nenhum" && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-red-950 dark:text-red-200 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-extrabold text-sm uppercase tracking-wide">
                        ⚠️ Zona de Perigo Detectada (Foco de Evasão)
                      </p>
                      <p className="text-xs font-semibold leading-relaxed">
                        A maior taxa de abandono da live ocorre no intervalo de <strong className="text-red-700 dark:text-red-400 font-extrabold">{dangerZoneAnalysis.dangerIntervalName}</strong>. 
                        Nesse trecho, <strong className="text-red-700 dark:text-red-400 font-extrabold">{dangerZoneAnalysis.dangerExits} leads</strong> encerraram a visualização. 
                        Sugerimos otimizar a dinâmica do vídeo ou antecipar a chamada para ação (CTA) nesse período para evitar a perda de vendas!
                      </p>
                    </div>
                  </div>
                )}

                {/* Bars */}
                <div className="space-y-4">
                  {retentionChartData.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                        <div className="space-y-0.5">
                          <span className="font-extrabold">{item.label}</span>
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="font-black text-slate-750 dark:text-slate-300">{item.count} usuários</span>
                          <span className="font-black bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{item.pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-150 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </CardContent>
            </Card>

            {/* COLUNA 3: CALENDÁRIO DE INSCRIÇÕES */}
            <Card className="border border-muted-foreground/10 bg-card/95 dark:bg-card/40 backdrop-blur-sm shadow-md">
              <CardHeader className="border-b border-muted-foreground/5 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Calendário de Inscrições
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                  Inscrições diárias e análise de reincidência nos últimos 7 dias.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {calendarDailyData.map((day, i) => {
                    const isToday = i === 0;
                    return (
                      <div 
                        key={i} 
                        className={`p-3 rounded-xl border flex flex-col justify-between relative transition-all duration-300 ${
                          day.highlyRecurrent > 0 
                            ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60 shadow-[0_2px_8px_rgba(239,68,68,0.05)]" 
                            : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-purple-500/30"
                        }`}
                      >
                        {/* Red dot and alert icon if highly recurrent exists */}
                        {day.highlyRecurrent > 0 && (
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-550 dark:bg-red-500 rounded-full animate-pulse" title="Lead com mais de 3 acessos!" />
                            <span title={`${day.highlyRecurrent} usuário(s) com > 3 acessos!`}>
                              <AlertCircle className="w-3.5 h-3.5 text-red-650 dark:text-red-500" />
                            </span>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {day.dateString}
                          </div>
                          <div className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            {day.dateLabel}
                            {isToday && (
                              <span className="text-[8px] bg-purple-500/20 text-purple-700 dark:text-purple-400 px-1 py-0.2 rounded font-extrabold uppercase">Hoje</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-500 dark:text-slate-400">Total:</span>
                            <span className="font-black text-slate-850 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{day.total}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-450 mt-1">
                            <div>Únicos: <strong className="text-slate-800 dark:text-slate-350">{day.uniques}</strong></div>
                            <div>Recorr.: <strong className="text-slate-800 dark:text-slate-350">{day.recurrents}</strong></div>
                          </div>
                          
                          {day.highlyRecurrent > 0 && (
                            <div className="text-[9px] font-black text-red-700 dark:text-red-400 mt-1 flex items-center gap-0.5">
                              <span>🚨 Multi-Acesso!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Alerta de Multi-Acesso:</strong> Blocos com bordas vermelhas e ícone de alerta indicam dias em que o mesmo usuário acessou a live 3 ou mais vezes.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
          
        </div>
      )}


      {/* Add / Edit Dialog for Comments */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border border-muted-foreground/20 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
              {editingIndex !== null ? <Edit3 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
              {editingIndex !== null ? "Editar Comentário" : "Adicionar Comentário"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingIndex !== null 
                ? "Modifique os detalhes do comentário nos campos abaixo." 
                : "Preencha os campos abaixo para programar um novo comentário na live."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editingIndex === null && (
              <div className="grid gap-2">
                <label htmlFor="preset-loader" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Carregar de uma Predefinição <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                </label>
                <select
                  id="preset-loader"
                  className="w-full rounded-md border border-muted-foreground/15 bg-muted/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 h-9"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    
                    if (val.startsWith("custom_")) {
                      const presetId = val.replace("custom_", "");
                      const found = customPresets.find(p => p.id === presetId);
                      if (found) {
                        setFormUsername(found.username);
                        setFormMessage(found.message);
                        setFormTime(found.time);
                        toast.success(`Carregado: ${found.label} (${found.time})`);
                      }
                    } else if (val.startsWith("single_")) {
                      const idx = parseInt(val.replace("single_", ""), 10);
                      const found = SINGLE_COMMENT_PRESETS[idx];
                      if (found) {
                        setFormUsername(found.username);
                        setFormMessage(found.message);
                        
                        // Sugerir tempo sequencial inteligente
                        let suggestedTime = "50:00";
                        if (comments.length > 0) {
                          const lastComment = comments[comments.length - 1];
                          const parts = lastComment.time.split(":");
                          if (parts.length === 2) {
                            let mins = parseInt(parts[0], 10) || 0;
                            let secs = parseInt(parts[1], 10) || 0;
                            secs += 10;
                            if (secs >= 60) {
                              mins += Math.floor(secs / 60);
                              secs = secs % 60;
                            }
                            suggestedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                          }
                        }
                        setFormTime(suggestedTime);
                        toast.success(`Carregado: ${found.label} (Tempo sugerido: ${suggestedTime})`);
                      }
                    }
                    e.target.value = ""; // Limpa a seleção do select após carregar
                  }}
                >
                  <option value="">-- Escolha uma predefinição para preencher os campos --</option>
                  {customPresets.length > 0 && (
                    <optgroup label="Sua Biblioteca (Predefinições com Tempo)">
                      {customPresets.map((p) => (
                        <option key={p.id} value={`custom_${p.id}`}>
                          ⏱️ {p.time} - @{p.username} ({p.label})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Prova Social (Sugere tempo sequencial)">
                    {SINGLE_COMMENT_PRESETS.filter(p => p.category === "social").map((preset) => {
                      const originalIdx = SINGLE_COMMENT_PRESETS.indexOf(preset);
                      return (
                        <option key={`opt-social-${originalIdx}`} value={`single_${originalIdx}`}>
                          ⭐ {preset.label} - @{preset.username}
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="Compra / FOMO (Sugere tempo sequencial)">
                    {SINGLE_COMMENT_PRESETS.filter(p => p.category === "purchase").map((preset) => {
                      const originalIdx = SINGLE_COMMENT_PRESETS.indexOf(preset);
                      return (
                        <option key={`opt-purchase-${originalIdx}`} value={`single_${originalIdx}`}>
                          🔥 {preset.label} - @{preset.username}
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="Dúvidas / Perguntas (Sugere tempo sequencial)">
                    {SINGLE_COMMENT_PRESETS.filter(p => p.category === "question").map((preset) => {
                      const originalIdx = SINGLE_COMMENT_PRESETS.indexOf(preset);
                      return (
                        <option key={`opt-question-${originalIdx}`} value={`single_${originalIdx}`}>
                          ❓ {preset.label} - @{preset.username}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>
            )}

            <div className="grid gap-2">
              <label htmlFor="form-time" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Tempo de Vídeo <span className="text-xs text-muted-foreground font-normal">(formato MM:SS, ex: 00:18 ou 68:20)</span>
              </label>
              <Input
                id="form-time"
                placeholder="00:18"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                className="bg-muted/30 border-muted-foreground/15"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="form-username" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-4 h-4 text-muted-foreground" />
                @usuario <span className="text-xs text-muted-foreground font-normal">(nome do usuário sem o @)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">@</span>
                <Input
                  id="form-username"
                  placeholder="Fabiotravell"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="pl-7 bg-muted/30 border-muted-foreground/15"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="form-message" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Comentário <span className="text-xs text-muted-foreground font-normal">(conteúdo da mensagem)</span>
              </label>
              <Input
                id="form-message"
                placeholder="opa cheguei"
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="bg-muted/30 border-muted-foreground/15"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="save-as-preset"
                checked={saveAsPresetCheckbox}
                onChange={(e) => setSaveAsPresetCheckbox(e.target.checked)}
                className="h-4 w-4 rounded border-muted-foreground/30 bg-muted/30 text-primary focus:ring-primary"
              />
              <label
                htmlFor="save-as-preset"
                className="text-xs font-semibold text-muted-foreground cursor-pointer select-none"
              >
                Salvar também na Biblioteca de Predefinições com Tempo
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-muted-foreground/20">
              Cancelar
            </Button>
            <Button onClick={handleSaveComment} className="bg-primary text-primary-foreground hover:bg-primary/95 gap-2">
              <Check className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Eye, MessageCircle, AlertCircle, Sparkles, Play, Check, Pause, Clock, ShoppingBag, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Comment {
  id: string;
  username: string;
  message: string;
  isUser?: boolean;
  time: string;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: "init-1", username: "Fabiotravell", message: "boa noite galera, ansioso pra live começar!", time: "19:28" },
  { id: "init-2", username: "Jr99", message: "boa noite pessoal, lucas já está online?", time: "19:29" },
  { id: "init-3", username: "AnaPeloMundo", message: "oiii gente, boa noiteee! ansiosa demais", time: "19:30" },
  { id: "init-4", username: "PedroViagens", message: "Bora pra cima! Ansioso por essa aula da fábrica de anúncios", time: "19:30" },
];

import { DEFAULT_SCHEDULED_COMMENTS, ScheduledComment } from "@/data/scheduledComments";

const AUTO_COMMENTS_POOL = [
  { username: "PatriciaLemosAgente", message: "lucas, da pra colocar a logo e as cores da minha agencia?" },
  { username: "RicardoViagens", message: "Da sim Patricia! Eu ja uso e fica mt bom" },
  { username: "AnaPeloMundo", message: "nossa essa IA vai economizar mt tempo de postagem" },
  { username: "RobertoTrilhas", message: "lucas, os criativos ja vem no formato de reels?" },
  { username: "LeticiaViajante", message: "ja sim roberto, fica perfeito" },
  { username: "AlinePeloMundo", message: "chocada com a velocidade q gera as fotos com preco" },
  { username: "CarlaTurismo", message: "ja sou aluna do elite o suporte é top demais msm" },
  { username: "TiagoTurismo", message: "top" },
  { username: "Jr99", message: "kd o preço? " },
  { username: "Fabiotravell", message: "concorrente vai odiar isso kkk" },
  { username: "TripsByGabi", message: "como faco pra acessar o gerador com as IAs lucas?" },
  { username: "VaneMundial", message: "escolhe a foto de Jeri" },
  { username: "GuiDoDestino", message: "funciona pra quem ta comecando do zero?" },
  { username: "RafaDeFerias", message: "tem q ter notebook ou da pra fazer tudo pelo celular?" },
  { username: "PedroViagens", message: "dá pra gerar quantos anuncios por dia?" },
  { username: "MariEmJericoacoara", message: "como faz pra assinar? libera o link logo lucas rs" },
  { username: "CarlosTrip", message: "isso ajuda mt quem nao sabe usar o canva do zero" },
  { username: "Let_Viajante", message: "dá pra usar fotos proprias ou so as da IA?" },
  { username: "AmandaTurismo", message: "tem destinos internacionais tbm?" },
  { username: "BrunoPeloGlobo", message: "jeri fica lindo dms na fabrica" },
  { username: "LeoMundoAfora", message: "Consigo mudar as cores dps?" },
  { username: "GiseleDestinos", message: "ja quero assinar hj com desconto" },
  { username: "DiegoExpedicoes", message: "muito prático de verdade" },
  { username: "SandraRoteiros", message: "dá pra usar no plano Start?" },
  { username: "RenataPeloMundo", message: "sensacional isso, facilitou 100%" },
  { username: "ValdirTur", message: "quais os limites de geração diária?" },
  { username: "BiaExplora", message: "aula incrível! obrigado" },
  { username: "MuriloTrilhas", message: "muito ansioso pelo gerador" },
  { username: "KarinaViagens", message: "já mudei meu feed com o Canva Viagem" },
  { username: "DuduPeloMundo", message: "esse suporte do elite é de outro planeta" },
  { username: "ThiagoMochileiro", message: "vou aplicar isso no meu insta hoje mesmo" },
  { username: "FernandaRoteiros", message: "ótimo método" },
];

const LiveStream = () => {
  const [isTimeAllowed, setIsTimeAllowed] = useState<boolean>(true);

  const [step, setStep] = useState<"register" | "watch">("register");
  const [name, setName] = useState("Lucas");
  const [phone, setPhone] = useState("(85) 99845-8995");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  
  const [viewers, setViewers] = useState(107);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "offer">("chat");
  const [scheduledCommentsList, setScheduledCommentsList] = useState<ScheduledComment[]>([]);
  const [videoUrlId, setVideoUrlId] = useState("Xqcw-NpPz08");
  const [offerSettings, setOfferSettings] = useState({
    status: "scheduled",
    time: "60:00",
    title: "🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!",
    description: "Adquira o Canva Viagem Vitalício + Fábrica de Anúncios I.A com Desconto!",
    price: "Apenas 12x de R$ 28,91 ou R$ 347 à vista",
    checkoutUrl: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
    bannerUrl: ""
  });
  const [showOfferBanner, setShowOfferBanner] = useState(false);

  const getYouTubeId = (urlOrId: string) => {
    if (!urlOrId) return "Xqcw-NpPz08";
    if (urlOrId.length === 11) return urlOrId;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  };

  useEffect(() => {
    // 1. Comments
    const saved = localStorage.getItem("live_stream_comments");
    if (saved) {
      try {
        setScheduledCommentsList(JSON.parse(saved));
      } catch (e) {
        setScheduledCommentsList(DEFAULT_SCHEDULED_COMMENTS);
      }
    } else {
      setScheduledCommentsList(DEFAULT_SCHEDULED_COMMENTS);
      localStorage.setItem("live_stream_comments", JSON.stringify(DEFAULT_SCHEDULED_COMMENTS));
    }

    // 2. Video URL/ID
    const savedVideo = localStorage.getItem("live_stream_video_url");
    if (savedVideo) {
      setVideoUrlId(getYouTubeId(savedVideo));
    }

    // 3. Offer Settings
    const savedOffer = localStorage.getItem("live_stream_offer_settings");
    if (savedOffer) {
      try {
        const parsed = JSON.parse(savedOffer);
        setOfferSettings(parsed);
        if (parsed.status === "visible") {
          setShowOfferBanner(true);
        }
      } catch (e) {
        console.error("Error parsing offer settings", e);
      }
    }
  }, []);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const poolRef = useRef<typeof AUTO_COMMENTS_POOL>([...AUTO_COMMENTS_POOL]);
  const offerActivatedRef = useRef(false);

  useEffect(() => {
    document.title = "Canva Viagem — Aula Secreta Ao Vivo";
  }, []);

  useEffect(() => {
    const verify = () => {
      setIsTimeAllowed(true);
    };
    verify();
    const interval = setInterval(verify, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      return;
    }
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    
    if (iframeRef.current?.contentWindow) {
      const command = nextPaused ? "pauseVideo" : "playVideo";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: "" }), 
        "*"
      );
      toast.info(nextPaused ? "Vídeo pausado" : "Vídeo retomado");
    }
  };

  // Fluctuating viewers simulation (around 95 to 115)
  useEffect(() => {
    if (step !== "watch") return;
    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const nextValue = prev + change;
        return Math.max(90, Math.min(120, nextValue));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [step]);

  // Increment playback timer in seconds
  useEffect(() => {
    if (!isPlaying || isPaused || step !== "watch") return;
    const interval = setInterval(() => {
      setPlaybackSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, step]);

  // Trigger scheduled comments at exact MM:SS markers
  useEffect(() => {
    if (!isPlaying || isPaused || step !== "watch" || scheduledCommentsList.length === 0) return;

    const match = scheduledCommentsList.find(c => {
      const parts = c.time.split(":");
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      const totalSecs = mins * 60 + secs;
      return totalSecs === playbackSeconds;
    });

    if (match) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setComments(prev => [
        ...prev,
        {
          id: `scheduled-${match.time}-${Date.now()}`,
          username: match.username,
          message: match.message,
          time: timeStr
        }
      ]);
    }
  }, [playbackSeconds, isPlaying, isPaused, step]);

  // Calcula o segundo de ativação da oferta com base no tempo configurado
  const getOfferActivationSeconds = () => {
    const parts = offerSettings.time.split(":");
    if (parts.length === 2) {
      return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
    }
    return 3600; // default 60 min
  };

  // Auto-switch to "Oferta" tab at configured time
  useEffect(() => {
    if (isPlaying && step === "watch") {
      const offerStartSeconds = getOfferActivationSeconds();
      if (playbackSeconds >= offerStartSeconds && !offerActivatedRef.current) {
        offerActivatedRef.current = true;
        setActiveTab("offer");
        toast.success("🔥 Oferta Especial Revelada! Aproveite o desconto exclusivo.");
      } else if (playbackSeconds < offerStartSeconds && offerActivatedRef.current) {
        offerActivatedRef.current = false;
        if (activeTab === "offer") {
          setActiveTab("chat");
        }
      }
    }
  }, [playbackSeconds, isPlaying, step, activeTab]);

  const getOfferCountdown = () => {
    const offerStartSeconds = getOfferActivationSeconds();
    const countdownTotal = 600; // 10 minutes (600 seconds)
    if (playbackSeconds < offerStartSeconds) {
      return "10:00";
    }
    const elapsed = playbackSeconds - offerStartSeconds;
    const remaining = Math.max(0, countdownTotal - elapsed);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Trigger scheduled pricing banner/offer at exact MM:SS marker
  useEffect(() => {
    if (!isPlaying || isPaused || step !== "watch" || offerSettings.status !== "scheduled") return;

    const parts = offerSettings.time.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      const totalSecs = mins * 60 + secs;
      if (playbackSeconds === totalSecs) {
        setShowOfferBanner(true);
        toast.success("🔥 Oferta Especial Revelada! Aproveite o desconto exclusivo.");
      }
    }
  }, [playbackSeconds, isPlaying, isPaused, step, offerSettings]);

  // Fallback scrolling chat simulation after scheduled comments run out
  useEffect(() => {
    if (step !== "watch" || isPaused || !isPlaying) return;
    if (playbackSeconds < 7200) return;

    const addFakeComment = () => {
      const randomDelay = Math.floor(Math.random() * 10000) + 15000;
      
      return setTimeout(() => {
        if (poolRef.current.length === 0) return;

        const randomIndex = Math.floor(Math.random() * poolRef.current.length);
        const randomComment = poolRef.current[randomIndex];
        poolRef.current.splice(randomIndex, 1);

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        setComments(prev => [
          ...prev,
          {
            id: `fallback-${Date.now()}`,
            username: randomComment.username,
            message: randomComment.message,
            time: timeStr
          }
        ]);
        
        addFakeComment();
      }, randomDelay);
    };

    const timer = addFakeComment();
    return () => clearTimeout(timer);
  }, [step, isPaused, isPlaying, playbackSeconds]);

  // Auto scroll chat to bottom when comments update
  useEffect(() => {
    if (step === "watch") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, step]);

  const handleRegister = () => {
    if (!name.trim()) {
      toast.error("Por favor, digite seu nome.");
      return;
    }
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("watch");
      toast.success("Inscrição confirmada! Aproveite a transmissão.");
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const userComment: Comment = {
      id: String(Date.now()),
      username: name.trim() || "Lucas",
      message: newComment.trim(),
      isUser: true,
      time: timeStr
    };

    setComments(prev => [...prev, userComment]);
    setNewComment("");
    toast.success("Comentário publicado!");
  };

  const offerActivationSec = getOfferActivationSeconds();
  const offerUnlocked = playbackSeconds >= offerActivationSec;

  if (!isTimeAllowed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none justify-center items-center p-4 md:p-6 animate-fade-in relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <div className="bg-zinc-900/80 backdrop-blur-xl text-zinc-100 rounded-3xl shadow-2xl border border-zinc-800/80 p-6 md:p-8 flex flex-col gap-6 items-center text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-cyan-400">Canva Viagem</span>
              <h2 className="text-xl font-black italic tracking-tighter text-white mt-1">
                AULA SECRETA AO VIVO
              </h2>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-cyan-400/5 animate-pulse" />
              <div className="h-20 w-20 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner relative z-10">
                <Clock size={36} className="text-cyan-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wide">
                Transmissão Offline
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed px-2">
                A aula secreta ao vivo da Fábrica de Anúncios e criação de sites está programada para iniciar pontualmente no horário reservado.
              </p>
            </div>

            <div className="w-full bg-zinc-950 border border-zinc-800/50 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Período de Acesso</span>
                <span className="text-zinc-300 font-black">Diário</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Horário de Brasília</span>
                <span className="text-cyan-400 font-black text-sm bg-cyan-400/10 px-3 py-1 rounded-xl">
                  19:30 às 22:00
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950/40 border border-zinc-800/40 px-4 py-2 rounded-xl text-[10px] text-zinc-400 uppercase tracking-widest font-black">
              <span className="h-2 w-2 rounded-full bg-zinc-600 animate-pulse" />
              Retorne no horário da transmissão
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      
      {/* PASSO 1: CARD DE CADASTRO */}
      {step === "register" ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <div className="bg-white text-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 p-6 flex flex-col gap-5">
              
              {/* BANNER ESTILIZADO SUPERIOR */}
              <div className="bg-black text-white p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden border border-zinc-800">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-500">Acelere Suas Vendas com</span>
                <h2 className="text-lg md:text-xl font-black italic tracking-tighter text-cyan-400 mt-1">
                  CANVA VIAGEM <span className="text-white">&amp; FÁBRICA</span>
                </h2>
                <div className="flex gap-1.5 mt-3 justify-center">
                  <span className="text-[8px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-bold">✓ Feed Premium em 5 min</span>
                  <span className="text-[8px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-bold">✓ Anúncios com I.A em 5s</span>
                </div>
              </div>

              {/* BARRA DE PROGRESSO DE VAGAS */}
              <div className="w-full">
                <div className="h-6 w-full bg-zinc-200 rounded-full overflow-hidden relative border border-zinc-300">
                  <div 
                    className="h-full bg-[#25D366] rounded-full flex items-center justify-center text-[10px] font-black text-white tracking-wider animate-pulse" 
                    style={{ width: "84%" }}
                  >
                    84% dos agentes de viagens conectados...
                  </div>
                </div>
              </div>

              {/* TÍTULO PRINCIPAL */}
              <div className="text-center">
                <h3 className="text-[22px] md:text-[26px] font-black text-zinc-900 leading-tight">
                  A I.A que cria anúncios e site de viagens em minutos!
                </h3>
              </div>

              {/* FORMULÁRIO */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-700 uppercase tracking-wider">Nome</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 focus-visible:ring-[#00E5FF] rounded-xl py-5"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-700 uppercase tracking-wider">Telefone</label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center gap-1.5 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm font-bold flex-shrink-0">
                      <span>🇧🇷 BR</span>
                      <span className="text-[10px] text-zinc-500">▼</span>
                    </div>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(85) 99845-8995"
                      required
                      className="flex-1 bg-zinc-50 border-zinc-200 text-zinc-900 focus-visible:ring-[#00E5FF] rounded-xl py-5"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={isSubmitting}
                  className={`w-full font-black py-6 rounded-xl shadow-lg border-none flex items-center justify-center text-md transition-all duration-300 ${
                    isSubmitting 
                      ? "bg-[#00E5FF] hover:bg-[#00c8e0] text-black" 
                      : "bg-[#25D366] hover:bg-[#20ba59] text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Conectando à Live...</span>
                    </div>
                  ) : (
                    "Confirmar Inscrição"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        
        /* PASSO 2: PLAYER DA LIVE — LAYOUT MOBILE-FIRST */
        <div className="flex flex-col h-screen overflow-hidden">

          {/* HEADER DA LIVE */}
          <div className="bg-zinc-900/80 border-b border-zinc-800/80 px-3 py-2.5 flex items-center justify-between gap-2 flex-shrink-0">
            <h2 className="text-xs sm:text-sm font-black text-white leading-tight flex-1 min-w-0 truncate">
              Como usar a Fábrica de Anúncios e Criar Site de Viagens com I.A!
            </h2>
            <div className="flex items-center gap-1.5 bg-red-600/15 border border-red-500/20 px-2.5 py-1 rounded-xl flex-shrink-0 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="text-[9px] font-black text-red-400 uppercase tracking-wider hidden sm:block">Ao Vivo</span>
            </div>
          </div>

          {/* LAYOUT PRINCIPAL: empilhado no mobile, lado a lado no desktop */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

            {/* ── PLAYER DE VÍDEO ─────────────────────────────────────── */}
            <div className="relative bg-black lg:flex-1 overflow-hidden" style={{ minHeight: "min(55vw, 56vh)" }}>

              {/* BADGES */}
              <div className="absolute top-3 left-3 z-40 flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-full font-black text-[10px] text-white uppercase tracking-wider shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  Ao Vivo
                </div>
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-lg border border-white/10">
                  <Eye size={11} className="text-cyan-400 animate-pulse" />
                  <span>{viewers}</span>
                </div>
              </div>

              {/* CLICK-TO-PLAY OVERLAY */}
              {!isPlaying ? (
                <div 
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 z-30 cursor-pointer bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-zinc-950 flex flex-col items-center justify-between p-6 text-center hover:brightness-110 transition-all duration-500"
                >
                  <h3 className="text-lg md:text-3xl font-black text-white tracking-widest uppercase mt-4">
                    SUA AULA JÁ COMEÇOU
                  </h3>

                  <div className="h-20 w-20 md:h-28 md:w-28 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-white/15 animate-pulse">
                    <Play size={36} className="text-white fill-white ml-2" />
                  </div>

                  <h3 className="text-lg md:text-3xl font-black text-white tracking-widest uppercase mb-4">
                    CLIQUE PARA ASSISTIR
                  </h3>
                </div>
              ) : (
                /* OVERLAY DE PAUSE */
                <div 
                  onClick={handleTogglePause}
                  className="absolute inset-0 z-20 cursor-pointer flex flex-col items-center justify-center group"
                >
                  {isPaused && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 transition-all duration-300 animate-fade-in z-30">
                      <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-cyan-400/20 border-2 border-cyan-400 flex items-center justify-center shadow-2xl transition-all duration-300 transform scale-110 hover:scale-125">
                        <Play size={28} className="text-cyan-400 fill-cyan-400 ml-1.5 animate-pulse" />
                      </div>
                      <span className="text-xs md:text-sm font-black tracking-[0.2em] text-cyan-400 uppercase drop-shadow-[0_2px_10px_rgba(0,229,255,0.4)]">
                        Transmissão Pausada
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Clique em qualquer lugar para retomar
                      </span>
                    </div>
                  )}

                  {!isPaused && (
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 shadow-lg z-30">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">Ao Vivo</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePause();
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white p-1.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                      >
                        <Pause size={11} className="fill-white" />
                        Pausar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VÍDEO COM AMBIENT GLOW */}
              <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-3xl opacity-35 scale-125 pointer-events-none transition-all duration-700"
                  style={{ backgroundImage: `url('https://img.youtube.com/vi/${videoUrlId}/maxresdefault.jpg')` }}
                />
                <div className="relative w-full h-full bg-black shadow-[0_0_80px_rgba(0,0,0,0.9)] z-10 overflow-hidden flex items-center justify-center">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-none pointer-events-none"
                    src={`https://www.youtube.com/embed/${videoUrlId}?autoplay=${isPlaying ? 1 : 0}&mute=0&controls=0&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&enablejsapi=1`}
                    title="Canva Viagem Live"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>

              {/* BANNER DE OFERTA SOBRE O VÍDEO */}
              {showOfferBanner && (
                <div className="absolute bottom-3 left-3 right-3 z-40 bg-zinc-950/95 backdrop-blur-xl border-2 border-cyan-400/40 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_40px_rgba(34,211,238,0.25)] animate-fade-in">
                  {offerSettings.bannerUrl ? (
                    <div className="relative w-full flex flex-col items-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowOfferBanner(false); }}
                        className="absolute -top-1 -right-1 z-50 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full w-5 h-5 flex items-center justify-center border border-zinc-700 shadow-md text-[9px]"
                      >
                        ✕
                      </button>
                      <a href={offerSettings.checkoutUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                        <img 
                          src={offerSettings.bannerUrl} 
                          alt="Oferta Especial" 
                          className="w-full h-auto rounded-xl hover:scale-[1.01] transition-transform duration-300 max-h-[120px] object-cover" 
                        />
                      </a>
                    </div>
                  ) : (
                    <div className="relative w-full flex flex-col sm:flex-row items-center justify-between gap-3 pr-6">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowOfferBanner(false); }}
                        className="absolute -top-1 right-0 z-50 text-zinc-400 hover:text-white text-xs font-bold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ✕
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-2 rounded-xl text-black flex-shrink-0">
                          <ShoppingBag size={16} className="animate-bounce" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider line-clamp-1">{offerSettings.title}</h4>
                          <p className="text-[10px] text-zinc-300 font-medium leading-tight line-clamp-1">{offerSettings.description}</p>
                        </div>
                      </div>

                      <a 
                        href={offerSettings.checkoutUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full sm:w-auto flex-shrink-0"
                      >
                        <button className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-black font-black px-4 py-2 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider animate-pulse whitespace-nowrap">
                          <Sparkles size={11} className="fill-black" />
                          Garantir Desconto
                        </button>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── PAINEL DO CHAT ───────────────────────────────────────── */}
            <div className="flex flex-col bg-zinc-900/60 border-t border-zinc-800/80 lg:border-t-0 lg:border-l lg:w-80 xl:w-96 flex-shrink-0 min-h-0 overflow-hidden" style={{ height: "auto", maxHeight: "45vh" }} data-chat-panel>
              
              {/* ABAS: CHAT e OFERTA */}
              <div className="flex p-1.5 bg-zinc-900 border-b border-zinc-800/80 gap-1 flex-shrink-0">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                    activeTab === "chat"
                      ? "bg-white text-black shadow-lg"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab("offer")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 relative overflow-hidden ${
                    activeTab === "offer" && offerUnlocked
                      ? "bg-gradient-to-r from-emerald-400 to-green-500 text-black shadow-lg"
                      : offerUnlocked
                      ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20 border border-emerald-900/30"
                      : "text-zinc-600 cursor-default"
                  }`}
                >
                  {/* Dot piscante só aparece APÓS ativação */}
                  {offerUnlocked && activeTab !== "offer" && (
                    <span className="absolute top-1.5 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                  🔥 Oferta
                </button>
              </div>

              {/* ABA CHAT */}
              {activeTab === "chat" && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className={`flex flex-col gap-0.5 p-2.5 rounded-2xl max-w-[90%] transition-all duration-300 ${
                          c.isUser
                            ? "bg-cyan-950/40 border border-cyan-800/30 ml-auto text-zinc-100"
                            : "bg-zinc-800/40 border border-zinc-800/30 text-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold ${c.isUser ? "text-cyan-400" : "text-zinc-400"}`}>
                            @{c.username}
                          </span>
                          <span className="text-[9px] text-zinc-600 ml-auto">{c.time}</span>
                        </div>
                        <p className="text-xs font-medium leading-relaxed break-words">{c.message}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-2 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center gap-1.5 flex-shrink-0">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Digite algo..."
                      className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-cyan-500 rounded-xl text-xs py-2 h-9"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 shadow-md flex-shrink-0 h-9 w-9"
                    >
                      <Send size={14} />
                    </Button>
                  </form>
                </div>
              )}

              {/* ABA DE OFERTA ESPECIAL */}
              {activeTab === "offer" && (
                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {!offerUnlocked ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                      <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <Clock size={20} className="text-zinc-500" />
                      </div>
                      <p className="text-xs text-zinc-400 max-w-[180px]">A oferta especial será revelada no momento certo da transmissão!</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200 flex flex-col gap-3 text-zinc-900">
                      
                      {/* BANNER NEGRO DA OFERTA */}
                      <div className="bg-black rounded-xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute -top-8 -left-8 w-20 h-20 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
                        <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-yellow-500/10 blur-xl pointer-events-none" />
                        
                        <span className="text-[#FFD700] font-black text-lg md:text-xl tracking-wider animate-pulse drop-shadow-[0_2px_8px_rgba(255,215,0,0.3)]">
                          SOMENTE 10 VAGAS
                        </span>
                        
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2 block">
                          DE <span className="line-through decoration-red-500 decoration-2 font-black text-white text-sm">R$ 1.500,00</span>
                        </span>
                        
                        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest block mt-1.5">
                          POR APENAS
                        </span>
                        
                        <div className="flex items-baseline justify-center gap-1 mt-2">
                          <span className="text-white text-xs font-extrabold uppercase tracking-wide">12x</span>
                          <span className="text-[#00E676] font-black text-2xl md:text-3xl tracking-tight drop-shadow-[0_0_15px_rgba(0,230,118,0.4)]">
                            R$ 28,91
                          </span>
                        </div>
                        
                        <span className="text-white text-xs underline mt-2 block font-bold hover:text-zinc-200 transition-colors">
                          ou R$ 347,00 à vista
                        </span>
                      </div>

                      {/* ANCORAGEM DE PREÇOS */}
                      <div className="flex justify-between items-center px-1 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-zinc-400 line-through font-semibold">De R$ 1.500,00</span>
                          <span className="text-zinc-900 font-extrabold text-sm">Por R$ 347,00</span>
                        </div>
                        <div className="flex flex-col text-right gap-0.5">
                          <span className="text-zinc-400 font-semibold">Por tempo limitado</span>
                          <span className="text-zinc-900 font-extrabold text-sm">Oferta só hoje</span>
                        </div>
                      </div>

                      {/* BOTÃO GRANDE VERDE */}
                      <a 
                        href="https://buy.stripe.com/8x26oIgGuej656zaAY8so05" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full block animate-pulse"
                      >
                        <Button className="w-full py-5 bg-[#25D366] hover:bg-[#1ebd54] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-none flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden">
                          <ShoppingBag size={16} className="fill-white animate-bounce flex-shrink-0" />
                          APROVEITAR OPORTUNIDADE
                        </Button>
                      </a>

                      {/* CRONÔMETRO DE 10 MINUTOS */}
                      <div className="flex flex-col items-center justify-center gap-1 bg-zinc-50 rounded-xl py-2.5 border border-zinc-100">
                        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">A oferta expira em</span>
                        <div className="flex items-center gap-1.5 text-zinc-900 font-black text-2xl tracking-widest font-mono select-none">
                          <Clock size={18} className="text-red-500 animate-pulse" />
                          {getOfferCountdown()}
                        </div>
                      </div>

                      {/* LINK VER OUTROS PLANOS */}
                      <div className="text-center">
                        <a 
                          href="/planos"
                          className="text-zinc-400 hover:text-zinc-800 text-xs font-black transition-colors underline uppercase tracking-widest"
                        >
                          ver outros planos
                        </a>
                      </div>

                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStream;

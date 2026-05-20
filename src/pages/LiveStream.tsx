import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Eye, MessageCircle, AlertCircle, Sparkles, Play, Check, Pause, Clock } from "lucide-react";
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
  { id: "1", username: "Juliana Costa", message: "boa noite gente! lucas a ferramenta ta rodando?", time: "20:02" },
  { id: "2", username: "Marcos Silva", message: "conectado de recife. ansioso pra ver a fabrica de anuncios", time: "20:02" },
  { id: "3", username: "Fernanda", message: "o audio e video tao perfeitos aqui", time: "20:03" },
  { id: "4", username: "Carlos", message: "Bora pra cima! boa noite lucas", time: "20:04" },
];

interface ScheduledComment {
  time: string; // Time in "MM:SS" format relative to video start
  username: string;
  message: string;
}

const SCHEDULED_COMMENTS: ScheduledComment[] = [
  { time: "07:35", username: "JessiTur", message: "eu" },
  { time: "07:39", username: "FelipeMilMilhas", message: "eu uso todo dia" },
  { time: "07:41", username: "CamilaDestinos", message: "sempre posto" },
  { time: "07:44", username: "RafaMundo", message: "antes de usar o canva viagem eu fazia muito" },
  { time: "08:02", username: "TatiViajante", message: "concordo" },
  { time: "08:05", username: "BetoExplora", message: "tem razão cliente percebe" },
  { time: "08:18", username: "LeoRoteiros", message: "verdade" },
  { time: "08:26", username: "GabyMundo", message: "vai rodar a ferramenta do fábrica hoje na pratica?" },
  { time: "10:17", username: "JulioPeloMundo", message: "são os mesmos anuncios mesm" },
  { time: "10:20", username: "AgenteMarcela", message: "sou franqueado da cvc sempre as mesmas campanhas mesm" },
  { time: "16:22", username: "BiaViajante", message: "1" },
  { time: "16:24", username: "FelipeDestinos", message: "1" },
  { time: "16:25", username: "RafaPeloMundo", message: "1" },
  { time: "16:29", username: "CamilaTurismo", message: "1" },
  { time: "16:34", username: "KatiaViagens", message: "2" },
  { time: "16:36", username: "TiagoRoteiros", message: "1" },
  { time: "16:38", username: "GabiMochileira", message: "1" },
  { time: "16:39", username: "CarlosPeloGlobo", message: "2" },
  { time: "16:41", username: "LeoTrips", message: "2" },
  { time: "16:42", username: "MariExpedicoes", message: "1" },
  { time: "16:49", username: "DiegoTurismo", message: "2" },
  { time: "16:57", username: "LaraDestinos", message: "acho que sei" },
  { time: "17:03", username: "RenatoTrilhas", message: "não sei explica" },
  { time: "17:13", username: "CarlaTurismo", message: "não sei explica" },
  { time: "17:44", username: "MarcosMilhas", message: "ver um anúncio entra em contato cria uma certa confiança e comprar" },
  { time: "18:57", username: "DaniloMochileiro", message: "acontece muito comigo isso" },
  { time: "22:04", username: "ValDestinos", message: "eu não aguento mais curiosos" },
  { time: "22:15", username: "CarolTurista", message: "eu" },
  { time: "22:20", username: "RodrigoTrips", message: "eu" },
  { time: "22:25", username: "AmandaPeloMundo", message: "eu" },
  { time: "23:42", username: "RuteViagens", message: "Vou criar um grupo hj" },
  { time: "24:07", username: "LucasMilhas", message: "eu vendo muito no meu grupo" },
  { time: "28:01", username: "SandraRoteiros", message: "Não sei nada disso" },
  { time: "28:05", username: "ThiagoMochileiro", message: "Muita coisa pra minha cabeça" },
  { time: "30:06", username: "PatyTurismo", message: "2 pacotes" },
  { time: "30:10", username: "GuilhermeTrips", message: "1" },
  { time: "30:13", username: "DudaDestinos", message: "nenhum novo só antigos" },
  { time: "31:04", username: "FernandoMundo", message: "Eu" },
  { time: "31:09", username: "RenataViagens", message: "Eu" },
  { time: "31:14", username: "AgenteRoberto", message: "eu demais" },
  { time: "31:17", username: "LeticiaRoteiros", message: "eu" },
  { time: "38:12", username: "JulianaViagens", message: "Verdade, por isso sou tão exigente com perfil bonito" },
  { time: "38:36", username: "ArthurDestinos", message: "Preciso arrumar meu perfil" },
  { time: "49:06", username: "VaniaTur", message: "Muito bom" },
  { time: "49:11", username: "RafaMochileiro", message: "bom demais" },
  { time: "51:13", username: "JuniorViagens", message: "caraca muito bom" },
  { time: "51:29", username: "GiseleDestinos", message: "uau eu quero!" },
  { time: "51:42", username: "MarcosRoteiros", message: "finalmente vou ter um site bom" },
  { time: "58:56", username: "FabioTravel", message: "Perfeito e preço?" },
  { time: "59:20", username: "BetoMochileiro", message: "deve ser mil reais" },
  { time: "59:52", username: "DaniloMilhas", message: "Deve ser mil reais" },
  { time: "60:15", username: "CarlaTrips", message: "quero saber os preços também" },
  { time: "61:20", username: "TaniaDestinos", message: "Já assinei esse plano start é muito bom" },
  { time: "62:40", username: "RodrigoMilhas", message: "Eita, achei que ia ser mais de R$ 500" },
  { time: "63:12", username: "MariEmJericoacoara", message: "Cadê o link?" },
  { time: "63:42", username: "FelipeRoteiros", message: "Achei que era mais caro mas vai aumentar né" },
  { time: "64:00", username: "EduardoMundo", message: "O anual compensa bem mais só por entregar um site vou pegar" },
  { time: "65:20", username: "BeatrizTrips", message: "Adoro seu trabalho Lucas parabéns" },
  { time: "66:10", username: "GustavoRoteiros", message: "Meu faturamento mudou depois que conheci esse cara" },
  { time: "66:35", username: "LuanDestinos", message: "tamo junto Lucas, assinei aqui" },
  { time: "67:00", username: "CamilaMochileira", message: "Concordo demais" },
  { time: "67:20", username: "RenatoViajante", message: "Eu amo vender viagens" },
  { time: "67:55", username: "TatiPeloMundo", message: "Amo viajar e fazer amigos viajar tbm" },
];

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
  const [isTimeAllowed, setIsTimeAllowed] = useState<boolean>(() => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      const hourStr = parts.find(p => p.type === "hour")?.value;
      const minuteStr = parts.find(p => p.type === "minute")?.value;
      if (!hourStr || !minuteStr) return false;

      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const currentTimeInMinutes = hour * 60 + minute;
      const startTimeInMinutes = 19 * 60 + 30; // 19:30
      const endTimeInMinutes = 22 * 60;        // 22:00

      return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
    } catch (error) {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentTimeInMinutes = hour * 60 + minute;
      return currentTimeInMinutes >= 1170 && currentTimeInMinutes <= 1320;
    }
  });

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
  const [activeTab, setActiveTab] = useState<"chat" | "support">("chat");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const poolRef = useRef<typeof AUTO_COMMENTS_POOL>([...AUTO_COMMENTS_POOL]);

  useEffect(() => {
    document.title = "Canva Viagem — Aula Secreta Ao Vivo";
  }, []);

  useEffect(() => {
    const verify = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const parts = formatter.formatToParts(now);
        const hourStr = parts.find(p => p.type === "hour")?.value;
        const minuteStr = parts.find(p => p.type === "minute")?.value;
        if (!hourStr || !minuteStr) {
          setIsTimeAllowed(false);
          return;
        }

        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const currentTimeInMinutes = hour * 60 + minute;
        const startTimeInMinutes = 19 * 60 + 30;
        const endTimeInMinutes = 22 * 60;

        setIsTimeAllowed(currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes);
      } catch (error) {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTimeInMinutes = hour * 60 + minute;
        setIsTimeAllowed(currentTimeInMinutes >= 1170 && currentTimeInMinutes <= 1320);
      }
    };
    
    // Periódico a cada 15 segundos
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
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
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
    if (!isPlaying || isPaused || step !== "watch") return;

    const match = SCHEDULED_COMMENTS.find(c => {
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

  // Fallback scrolling chat simulation (adds a comment every 15s to 25s after scheduled comments run out, which is 7200s/2h)
  useEffect(() => {
    if (step !== "watch" || isPaused || !isPlaying) return;
    if (playbackSeconds < 7200) return; // Keep chat only displaying scheduled comments for first 2 hours

    const addFakeComment = () => {
      const randomDelay = Math.floor(Math.random() * 10000) + 15000; // 15s to 25s
      
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
    
    // Simulate loading spinner
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

    // Sincroniza com o nome do usuário cadastrado na captura
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

  if (!isTimeAllowed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none justify-center items-center p-4 md:p-6 animate-fade-in relative overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <div className="bg-zinc-900/80 backdrop-blur-xl text-zinc-100 rounded-3xl shadow-2xl border border-zinc-800/80 p-6 md:p-8 flex flex-col gap-6 items-center text-center">
            
            {/* Header / Brand */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-cyan-400">Canva Viagem</span>
              <h2 className="text-xl font-black italic tracking-tighter text-white mt-1">
                AULA SECRETA AO VIVO
              </h2>
            </div>

            {/* Offline Icon Container */}
            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-cyan-400/5 animate-pulse" />
              <div className="h-20 w-20 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner relative z-10">
                <Clock size={36} className="text-cyan-400" />
              </div>
            </div>

            {/* Title & Info */}
            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wide">
                Transmissão Offline
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed px-2">
                A aula secreta ao vivo da Fábrica de Anúncios e criação de sites está programada para iniciar pontualmente no horário reservado.
              </p>
            </div>

            {/* Time badge details with premium visual container */}
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

            {/* Countdown / Wait notice */}
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none justify-center animate-fade-in">
      
      {/* PASSO 1: CARD DE CADASTRO */}
      {step === "register" ? (
        <div className="max-w-md w-full mx-auto p-4 md:p-6">
          <div className="bg-white text-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 p-6 flex flex-col gap-6">
            
            {/* BANNER ESTILIZADO SUPERIOR */}
            <div className="bg-black text-white p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden border border-zinc-800">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-500">Acelere Suas Vendas com</span>
              <h2 className="text-lg md:text-xl font-black italic tracking-tighter text-cyan-400 mt-1">
                CANVA VIAGEM <span className="text-white">& FÁBRICA</span>
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

            {/* TÍTULO PRINCIPAL (ALINHADO EM EXATAMENTE 2 LINHAS) */}
            <div className="text-center md:text-left">
              <h3 className="text-[22px] md:text-[28px] font-black text-zinc-900 leading-tight">
                A I.A que cria anúncios <br className="hidden sm:inline" />e site de viagens em minutos!
              </h3>
            </div>

            {/* FORMULÁRIO DE CADASTRO COM DIV DIRETA (EVITA BLOQUEIOS DO NAVEGADOR) */}
            <div className="flex flex-col gap-4">
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

              {/* BOTÃO DE ENVIAR COM CLICK DIRETO (VERDE ANTES, MUDA DE COR PARA CIANO DEPOIS DO CLICK) */}
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
      ) : (
        
        /* PASSO 2: PLAYER DA LIVE ULTRA CLEAN COM CHAT (TELA CHEIA) */
        <main className="flex-1 w-full max-w-full mx-auto px-4 pb-4 md:px-6 md:pb-6 flex flex-col gap-4 h-[calc(100vh-20px)] lg:h-[calc(100vh-10px)] overflow-hidden">
          
          {/* TÍTULO DA LIVE ULTRA CLEAN */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 flex-shrink-0">
            <h2 className="text-lg md:text-xl font-black text-white tracking-wide">
              Como usar a Fábrica de Anúncios e Criar Anúncios e Site de Viagens com I.A!
            </h2>
            <div className="flex items-center gap-1.5 bg-red-600/15 border border-red-500/20 px-3 py-1.5 rounded-xl flex-shrink-0 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Ao Vivo</span>
            </div>
          </div>

          {/* GRID PRINCIPAL: VÍDEO GIGANTE E CHAT LADO A LADO */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0 items-stretch">
            
            {/* LADO ESQUERDO: PLAYER DE VÍDEO HORIZONTAL 16:9 COM GLOW AMBIENT */}
            <div className="lg:col-span-3 flex flex-col bg-black border border-zinc-800/80 rounded-3xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.5)] relative h-full">
              
              {/* BADGES DO LIVESTREAM EM CIMA DO VÍDEO */}
              <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-red-600 px-3 py-1.5 rounded-full font-black text-xs text-white uppercase tracking-wider shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  Ao Vivo
                </div>
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black text-white shadow-lg border border-white/10">
                  <Eye size={13} className="text-cyan-400 animate-pulse" />
                  <span>{viewers}</span>
                </div>
              </div>

              {/* CAPA INTERATIVA DE CLICK-TO-PLAY */}
              {!isPlaying ? (
                <div 
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 z-30 cursor-pointer bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-zinc-950 flex flex-col items-center justify-between p-8 text-center transition-all duration-500 hover:brightness-110"
                >
                  <h3 className="text-xl md:text-3xl font-black text-white tracking-widest uppercase mt-4">
                    SUA AULA JÁ COMEÇOU
                  </h3>

                  {/* CÍRCULO PLAY GIGANTE */}
                  <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-white/15 animate-pulse">
                    <Play size={44} className="text-white fill-white ml-2" />
                  </div>

                  <h3 className="text-xl md:text-3xl font-black text-white tracking-widest uppercase mb-4">
                    CLIQUE PARA ASSISTIR
                  </h3>
                </div>
              ) : (
                /* OVERLAY DE INTERAÇÃO COM A LIVE - PERMITE PAUSAR E REPRODUZIR COM CLICK NA TELA SEM SAIR DA PÁGINA */
                <div 
                  onClick={handleTogglePause}
                  className="absolute inset-0 z-20 cursor-pointer flex flex-col items-center justify-center group"
                >
                  {/* Overlay Escuro com Vidro Fosco quando Pausado */}
                  {isPaused && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 transition-all duration-300 animate-fade-in z-30">
                      <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-cyan-400/20 border-2 border-cyan-400 flex items-center justify-center shadow-2xl transition-all duration-300 transform scale-110 hover:scale-125">
                        <Play size={36} className="text-cyan-400 fill-cyan-400 ml-1.5 animate-pulse" />
                      </div>
                      <span className="text-xs md:text-sm font-black tracking-[0.2em] text-cyan-400 uppercase drop-shadow-[0_2px_10px_rgba(0,229,255,0.4)]">
                        Transmissão Pausada
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Clique em qualquer lugar para retomar
                      </span>
                    </div>
                  )}

                  {/* Botão de Controle de Pause Flutuante e Indicador no Canto Inferior (Aparece ao passar o mouse) */}
                  {!isPaused && (
                    <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-3 shadow-lg z-30">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">Ao Vivo</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePause();
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white p-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                      >
                        <Pause size={12} className="fill-white" />
                        Pausar Live
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* CONTAINER COM EFEITO DE BLUR AMBIENTE PARA EXPANDIR O VÍDEO HORIZONTAL */}
              <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">
                
                {/* Imagem de Fundo Borrada (Ambient Glow) */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-3xl opacity-35 scale-125 pointer-events-none transition-all duration-700"
                  style={{ backgroundImage: `url('https://img.youtube.com/vi/Xqcw-NpPz08/maxresdefault.jpg')` }}
                />

                {/* Iframe do Vídeo Horizontal (16:9 Nativo - Bloqueado Contra Cliques e Sem Controles de Busca) */}
                <div className="relative w-full h-full bg-black shadow-[0_0_80px_rgba(0,0,0,0.9)] z-10 overflow-hidden flex items-center justify-center">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-none pointer-events-none"
                    src={`https://www.youtube.com/embed/Xqcw-NpPz08?autoplay=${isPlaying ? 1 : 0}&mute=0&controls=0&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&enablejsapi=1`}
                    title="Canva Viagem Live"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>

              </div>

            </div>

            {/* LADO DIREITO: CHAT DO LIVESTREAM (AUTOMATICAMENTE ESTICADO PARA A MESMA ALTURA DO VÍDEO) */}
            <div className="flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl h-full min-h-0">
              
              {/* ABAS CHAT / SUPORTE */}
              <div className="flex p-2 bg-zinc-900 border-b border-zinc-800/80 gap-1">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                    activeTab === "chat"
                      ? "bg-white text-black shadow-lg"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => {
                    setActiveTab("support");
                    toast.info("Canal de Suporte carregado com sucesso!");
                  }}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                    activeTab === "support"
                      ? "bg-white text-black shadow-lg"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  Suporte
                </button>
              </div>

              {/* ABA DO CHAT DE TRANSMISSÃO */}
              {activeTab === "chat" ? (
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  
                  {/* HISTÓRICO DE MENSAGENS COM ROLAGEM */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-col gap-1 p-3 rounded-2xl max-w-[85%] transition-all duration-300 bg-zinc-800/40 border border-zinc-800/30 text-zinc-100 rounded-tl-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-zinc-400">
                            @{c.username}
                          </span>
                          <span className="text-[9px] text-zinc-500 ml-auto">{c.time}</span>
                        </div>
                        <p className="text-xs md:text-sm font-medium leading-relaxed break-words">{c.message}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* INPUT DE MENSAGEM */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                      onClick={() => toast.success("Anexar arquivo disponível apenas no suporte")}
                    >
                      <Paperclip size={18} />
                    </Button>
                    
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Digite algo..."
                      className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-cyan-500 rounded-xl"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                      onClick={() => toast.info("Escolha de emojis em desenvolvimento")}
                    >
                      <Smile size={18} />
                    </Button>

                    <Button
                      type="submit"
                      size="icon"
                      className="rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 shadow-md flex-shrink-0"
                    >
                      <Send size={16} />
                    </Button>
                  </form>

                </div>
              ) : (
                /* ABA DE SUPORTE */
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-6 animate-scale-in">
                  <div className="h-16 w-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <MessageCircle size={32} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Canal de Suporte Ativo</h3>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                      Precisa de assistência técnica ou comercial imediata? Nossos assistentes estão de plantão para ajudar você a configurar seu acesso.
                    </p>
                  </div>
                  <a
                    href="https://wa.me/5585986411294?text=Olá,%20estou%20assistindo%20a%20Live%20da%20Fábrica%20e%20preciso%20de%20suporte."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full py-6 bg-[#25D366] hover:bg-[#22c35e] text-white font-black text-sm rounded-2xl shadow-lg border-none flex items-center justify-center gap-2">
                      <MessageCircle size={18} />
                      Falar no WhatsApp
                    </Button>
                  </a>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-2">
                    <AlertCircle size={12} />
                    Tempo de resposta menor que 2 min
                  </div>
                </div>
              )}

            </div>

          </div>

        </main>
      )}

      {/* RODA PÉ REMOVIDO CONFORME DIRETRIZ DE UX */}
    </div>
  );
};

export default LiveStream;

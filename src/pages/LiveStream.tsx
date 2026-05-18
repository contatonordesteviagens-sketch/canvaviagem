import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Eye, MessageCircle, AlertCircle, Sparkles } from "lucide-react";
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
  { id: "1", username: "calielsuruagy", message: "Boraaaa povo", time: "22:40" },
  { id: "2", username: "matheusborges1521", message: "opa", time: "22:41" },
  { id: "3", username: "dalvanifaustinomoreira8910", message: "Sim", time: "22:41" },
  { id: "4", username: "leonardoduarteneto", message: "Sim", time: "22:42" },
  { id: "5", username: "dreduardo.carvalho", message: "Eduardo de recife escutando perfeito", time: "22:42" },
  { id: "6", username: "luanfranca1248", message: "Boraaaaa fabricarr 🚀", time: "22:43" },
  { id: "7", username: "matheusborges1521", message: "ta file", time: "22:43" },
  { id: "8", username: "JulianoFerreira-k4b", message: "Sim!", time: "22:44" },
];

const AUTO_COMMENTS_POOL = [
  { username: "alinemaria_viagens", message: "Estou chocada com a velocidade desse gerador! 😱" },
  { username: "robertoturismo", message: "Consigo mudar o logo e as cores do cliente?" },
  { username: "fernandotravels", message: "Sim, roberto, é super fácil no Canva!" },
  { username: "agente_premium", message: "Isso vai me poupar umas 10 horas de trabalho por semana." },
  { username: "lucas_viagens", message: "O som e vídeo estão ótimos aqui." },
  { username: "carla_agente", message: "Já sou aluna do Elite e recomendo muito!" },
  { username: "marcos_tur", message: "Bora lucrar galera! ✈️" },
  { username: "patriciatravel", message: "Dá para exportar em PDF e JPG também?" },
  { username: "tiago_vendas", message: "Show de bola esse modelo de negócios!" },
  { username: "renata_agencia", message: "Dá pra usar no celular também ou só no PC?" },
  { username: "valdir_tours", message: "Melhor investimento que fiz este ano!" },
  { username: "agencia_viva", message: "Os criativos são de alta conversão mesmo, mudei meus resultados." },
  { username: "beatriz_travel", message: "Como faço para acessar os bônus da Fábrica?" },
  { username: "murilomarketing", message: "Muito bom ver o passo a passo na prática!" },
];

const LiveStream = () => {
  const [viewers, setViewers] = useState(107);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "support">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fluctuating viewers simulation (around 95 to 115)
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const nextValue = prev + change;
        return Math.max(90, Math.min(120, nextValue));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scrolling chat simulation (adding a fake comment every 3 to 7 seconds)
  useEffect(() => {
    const addFakeComment = () => {
      const randomDelay = Math.floor(Math.random() * 4000) + 3000; // 3s to 7s
      return setTimeout(() => {
        const randomComment = AUTO_COMMENTS_POOL[Math.floor(Math.random() * AUTO_COMMENTS_POOL.length)];
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        setComments(prev => [
          ...prev,
          {
            id: String(Date.now()),
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
  }, []);

  // Auto scroll chat to bottom when comments update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const userComment: Comment = {
      id: String(Date.now()),
      username: "você",
      message: newComment.trim(),
      isUser: true,
      time: timeStr
    };

    setComments(prev => [...prev, userComment]);
    setNewComment("");
    toast.success("Mensagem enviada no chat ao vivo!");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      {/* HEADER PREMIUM */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center font-bold text-lg text-black shadow-lg">
            CV
          </div>
          <div>
            <h1 className="text-md md:text-lg font-black tracking-tight bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent uppercase">
              Canva Viagem Live
            </h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Painel de Acesso Interno</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 hidden sm:inline">Servidor de Transmissão Ativo</span>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LADO ESQUERDO: PLAYER DE VÍDEO & INFO */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* TÍTULO DA LIVE */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 md:p-5 flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest mb-2 inline-block">
                Masterclass
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white leading-snug">
                A Fábrica de Anúncios cria um Low Ticket por HORA!
              </h2>
            </div>
            <div className="flex items-center gap-1.5 bg-red-600/10 border border-red-500/20 px-3 py-1.5 rounded-xl flex-shrink-0 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-[11px] font-black text-red-500 uppercase tracking-wider">Ao Vivo</span>
            </div>
          </div>

          {/* PLAYER DE VÍDEO COM EMBED REAL */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-zinc-800/80 shadow-[0_24px_50px_rgba(0,0,0,0.5)]">
            
            {/* BADGES DO LIVESTREAM EM CIMA DO VÍDEO */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-red-600 px-3 py-1.5 rounded-full font-black text-xs text-white uppercase tracking-wider shadow-lg">
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                Ao Vivo
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black text-white shadow-lg border border-white/10">
                <Eye size={13} className="text-cyan-400 animate-pulse" />
                <span>{viewers}</span>
              </div>
            </div>

            {/* EMBED YOUTUBE EM LOOP */}
            <iframe
              className="w-full h-full border-none"
              src="https://www.youtube.com/embed/dvInvZZ7fLY?autoplay=1&mute=1&controls=1&loop=1&playlist=dvInvZZ7fLY&modestbranding=1&rel=0&iv_load_policy=3"
              title="Canva Viagem Live"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* DESCRIÇÃO DE APOIO */}
          <div className="bg-zinc-900/35 border border-zinc-800/50 rounded-2xl p-5 text-sm text-zinc-400 leading-relaxed">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              Sobre esta transmissão ao vivo:
            </h3>
            <p>
              Nesta aula exclusiva demonstrativa para acesso interno, mostramos a engrenagem perfeita de geração da 
              <strong> Fábrica de Anúncios</strong>. Descubra como estruturar ofertas, funis de alta conversão e campanhas 
              completas de viagens em minutos, garantindo escala automática e vendas recorrentes.
            </p>
          </div>
        </div>

        {/* LADO DIREITO: CHAT DO LIVESTREAM */}
        <div className="flex flex-col h-[600px] lg:h-[680px] bg-zinc-900/60 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
          
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
                    className={`flex flex-col gap-1 p-3 rounded-2xl max-w-[85%] transition-all duration-300 ${
                      c.isUser
                        ? "ml-auto bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-cyan-400/30 text-white rounded-tr-none"
                        : "bg-zinc-800/40 border border-zinc-800/30 text-zinc-100 rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold ${c.isUser ? "text-cyan-400" : "text-zinc-400"}`}>
                        @{c.username}
                      </span>
                      {c.isUser && (
                        <span className="text-[8px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.5 rounded font-black uppercase">
                          Você
                        </span>
                      )}
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

      </main>
    </div>
  );
};

export default LiveStream;

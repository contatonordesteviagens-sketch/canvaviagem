import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Eye, MessageCircle, AlertCircle, Sparkles, Play, Check } from "lucide-react";
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

const AUTO_COMMENTS_POOL = [
  { username: "Patricia Lemos", message: "lucas, da pra colocar a logo e as cores da minha agencia?" },
  { username: "Ricardo", message: "Da sim Patricia! Eu ja uso e fica mt bom" },
  { username: "Ana Paula", message: "nossa essa IA vai economizar mt tempo de postagem" },
  { username: "Roberto Antunes", message: "lucas, os criativos ja vem no formato de reels?" },
  { username: "Leticia", message: "ja sim roberto, fica perfeito" },
  { username: "Aline Maria", message: "chocada com a velocidade q gera as fotos com preco" },
  { username: "Carla Aguiar", message: "ja sou aluna do elite o suporte é top demais msm" },
  { username: "Tiago", message: "top" },
  { username: "Renata", message: "kd o preço? " },
  { username: "Valdir", message: "concorrente vai odiar isso kkk" },
  { username: "Beatriz", message: "como faco pra acessar o gerador com as IAs lucas?" },
  { username: "Murilo Costa", message: "escolhe a foto de Jeri" },
  { username: "Sandra Souza", message: "funciona pra quem ta comecando do zero?" },
  { username: "Diego", message: "tem q ter notebook ou da pra fazer tudo pelo celular?" },
  { username: "Lucas Agente", message: "dá pra gerar quantos anuncios por dia?" },
  { username: "Gisele", message: "como faz pra assinar? libera o link logo lucas rs" },
  { username: "Bruno Reis", message: "isso ajuda mt quem nao sabe usar o canva do zero" },
  { username: "Mariana", message: "dá pra usar fotos proprias ou so as da IA?" },
  { username: "Felipe", message: "tem destinos internacionais tbm?" },
  { username: "Julio Cesar", message: "jeri fica lindo dms na fabrica" },
  { username: "Amanda", message: "Consigo mudar as cores dps?" },
  { username: "Katia Tur", message: "ja quero assinar hj com desconto" },
];

const LiveStream = () => {
  const [step, setStep] = useState<"register" | "watch">("register");
  const [name, setName] = useState("Lucas");
  const [phone, setPhone] = useState("(85) 99845-8995");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [viewers, setViewers] = useState(107);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "support">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const poolRef = useRef<typeof AUTO_COMMENTS_POOL>([...AUTO_COMMENTS_POOL]);

  useEffect(() => {
    document.title = "Canva Viagem — Aula Secreta Ao Vivo";
  }, []);

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

  // Scrolling chat simulation (adding a fake non-repeated comment every 12 to 20 seconds)
  useEffect(() => {
    if (step !== "watch") return;
    const addFakeComment = () => {
      const randomDelay = Math.floor(Math.random() * 8000) + 12000; // 12s to 20s
      
      return setTimeout(() => {
        if (poolRef.current.length === 0) return; // Stop when pool is empty to avoid repetitions

        // Pick one random comment
        const randomIndex = Math.floor(Math.random() * poolRef.current.length);
        const randomComment = poolRef.current[randomIndex];
        
        // Remove it from current pool
        poolRef.current.splice(randomIndex, 1);

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
  }, [step]);

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
                /* PROTEÇÃO CONTRA CLIQUES E LINKS DO YOUTUBE (TRANSPARENT OVERLAY Z-20 - USUÁRIO NÃO PODE SAIR DA PÁGINA NEM PAUSAR) */
                <div className="absolute inset-0 z-20 bg-transparent cursor-default" />
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
                    className="w-full h-full border-none pointer-events-none"
                    src={`https://www.youtube.com/embed/Xqcw-NpPz08?autoplay=${isPlaying ? 1 : 0}&mute=0&controls=0&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1`}
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

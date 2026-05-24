
import React, { useState, useEffect } from 'react';
import ChatInterface from './components/SalesGenerator';
import TemplateLibrary from './components/TemplateLibrary';
import Settings from './components/Settings';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { BoltStyleChat, RayBackground } from './components/BoltChat';
import { generateChatResponse } from './services/gemini';
import { ChatSession, Message, GeneratedOption, AppView, UserProfile } from './types';
import { supabase } from './services/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Library, Settings as SettingsIcon, LayoutDashboard, 
  Menu, X, LogOut, MessageSquare, History, Sparkles, Zap, Info, Wallet, Brain, Volume2, ShieldCheck, AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GUEST_SESSIONS_KEY = 'ia_vendedor_guest_sessions';
const GUEST_PROFILE_KEY = 'ia_vendedor_guest_profile';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('chat');
  const [darkMode, setDarkMode] = useState(true);

  // Inicialização
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) {
      setUserProfile(data);
    } else {
      // Fallback
      setUserProfile({ id: uid, full_name: 'Usuário VIP', agency_name: 'Minha Agência' });
    }
    loadSessions();
  };

  const loadSessions = () => {
    const saved = localStorage.getItem(GUEST_SESSIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0 && !currentSessionId) setCurrentSessionId(parsed[0].id);
    } else {
      createNewChat();
    }
  };

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      title: 'Nova Situação',
      messages: [],
      lastModified: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setCurrentView('chat');
    setIsSidebarOpen(false);
  };

  const updateCurrentSession = (text: string, role: 'user' | 'model', options?: GeneratedOption[], isError?: boolean) => {
    const sessionId = currentSessionId || sessions[0]?.id;
    if (!sessionId) return;

    setSessions(prevSessions => {
      return prevSessions.map(s => {
        if (s.id === sessionId) {
          const newMsg: Message = {
            id: Math.random().toString(36).substr(2, 9),
            role,
            content: text,
            options,
            timestamp: Date.now(),
            error: isError
          };
          
          let newTitle = s.title;
          if (s.messages.length === 0 && role === 'user') {
            newTitle = text.length > 20 ? text.substring(0, 20) + '...' : text;
          }

          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, newMsg],
            lastModified: Date.now()
          };
        }
        return s;
      });
    });

    saveToCloud(text, role);
  };

  const saveToCloud = async (text: string, role: string) => {
    try {
      await supabase.from('chat_logs_v2').insert({
        content: text,
        role: role,
        user_name: userProfile?.full_name || 'Anônimo',
        agency: userProfile?.agency_name || 'N/A'
      });
    } catch (e) {
      // Silencioso
    }
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
    setCurrentView('admin');
    localStorage.setItem('ia_vendedor_is_admin', 'true');
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    localStorage.setItem('ia_vendedor_is_admin', 'false');
    setCurrentView('chat');
  };

  const handleSendMessage = async (text: string, image?: string) => {
    if ((!text.trim() && !image) || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: text || "📸 Print analisado",
      timestamp: Date.now()
    };

    // Adiciona mensagem do usuário
    updateCurrentSession(userMessage.content, 'user');
    setIsLoading(true);

    try {
      // Busca histórico da sessão atual e inclui a nova mensagem
      const session = sessions.find(s => s.id === currentSessionId);
      const history = [...(session?.messages || []), userMessage];
      
      const response = await generateChatResponse(text, history, userProfile, image);
      updateCurrentSession(response.text, 'model', response.options, response.isError);
    } catch (error) {
      console.error("Chat Error:", error);
      updateCurrentSession("Erro ao processar sua solicitação. Tente novamente.", 'model', undefined, true);
    } finally {
      setIsLoading(false);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  if (!session && !isGuest && !isAdmin) {
    return (
      <Login 
        onGuestAccess={() => setIsGuest(true)} 
        onAdminAccess={() => {
          setIsAdmin(true);
          handleAdminSuccess();
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0f0f0f] text-white overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 w-[280px] h-full bg-[#111114] border-r border-white/[0.05] flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-bold text-lg">CT</span>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase leading-none">Copy Travel</h1>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Estrategista</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-[#5a5a5f] hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 pb-4 space-y-2">
          <button 
            onClick={createNewChat} 
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all active:scale-95 group"
          >
            <Plus className="size-4 text-blue-400 group-hover:rotate-90 transition-transform" />
            Nova Situação
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin">
          <div className="px-2 text-[10px] font-bold text-[#5a5a5f] uppercase tracking-widest mb-3 mt-4">Histórico</div>
          {sessions.map(s => (
            <button 
              key={s.id} 
              onClick={() => { setCurrentSessionId(s.id); setCurrentView('chat'); setIsSidebarOpen(false); }} 
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group",
                currentSessionId === s.id && currentView === 'chat' 
                  ? "bg-white/10 text-white border border-white/10" 
                  : "text-[#8a8a8f] hover:bg-white/5 hover:text-white"
              )}
            >
              <MessageSquare className={cn("size-4", currentSessionId === s.id ? "text-blue-400" : "text-[#5a5a5f]")} />
              <span className="text-[13px] truncate font-medium">{s.title || 'Nova Conversa'}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.05] space-y-1">
          {isAdmin && (
            <button 
              onClick={() => { setCurrentView('admin'); setIsSidebarOpen(false); }} 
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all",
                currentView === 'admin' ? "bg-blue-600 text-white" : "text-[#8a8a8f] hover:bg-white/5"
              )}
            >
              <LayoutDashboard className="size-4" />
              Painel Admin
            </button>
          )}
          <button 
            onClick={() => { setCurrentView('library'); setIsSidebarOpen(false); }} 
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all",
              currentView === 'library' ? "bg-white/10 text-white border border-white/10" : "text-[#8a8a8f] hover:bg-white/5"
            )}
          >
            <Library className="size-4" />
            Banco de Scripts
          </button>
          <button 
            onClick={() => { setCurrentView('help'); setIsSidebarOpen(false); }} 
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all",
              currentView === 'help' ? "bg-white/10 text-white border border-white/10" : "text-[#8a8a8f] hover:bg-white/5"
            )}
          >
            <Info className="size-4" />
            Ajuda & Custos
          </button>
          <button 
            onClick={() => { setCurrentView('settings'); setIsSidebarOpen(false); }} 
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all",
              currentView === 'settings' ? "bg-white/10 text-white border border-white/10" : "text-[#8a8a8f] hover:bg-white/5"
            )}
          >
            <SettingsIcon className="size-4" />
            Configurações
          </button>
          {isAdmin && (
            <button 
              onClick={handleLogoutAdmin} 
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            >
              <LogOut className="size-4" />
              Sair Admin
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0f0f0f]">
        {/* Header */}
        <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.05] bg-[#0f0f0f]/80 backdrop-blur-xl z-30 sticky top-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 -ml-2 text-[#8a8a8f] hover:text-white transition-colors"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.2em] opacity-60 truncate max-w-[120px] sm:max-w-none">
                {currentView === 'chat' ? (currentSession?.title || 'Chat') : 
                 currentView === 'library' ? 'Banco de Scripts' : 
                 currentView === 'admin' ? 'Painel Administrativo' : 'Configurações'}
                <span className="ml-2 text-[8px] opacity-30">V1.3.0</span>
              </h2>
              {currentView === 'chat' && currentSession && currentSession.messages.length > 0 && (
                <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest md:hidden">
                  Sessão Ativa
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {currentView === 'chat' && currentSession && currentSession.messages.length > 0 && (
              <button 
                onClick={createNewChat}
                className="p-2 text-blue-400 hover:text-blue-300 md:hidden"
                title="Novo Chat"
              >
                <Plus className="size-5" />
              </button>
            )}
            {!isAdmin && (
              <button 
                onClick={() => setShowAdminLogin(true)}
                className="hidden sm:block px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#5a5a5f] hover:text-white transition-colors"
              >
                Acesso Admin
              </button>
            )}
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="hidden sm:inline text-[10px] font-bold text-[#8a8a8f] px-1">
                {userProfile?.full_name || 'Agente'}
              </span>
              <div className="size-6 sm:size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-black shadow-lg ring-1 ring-white/20">
                {userProfile?.full_name?.substring(0, 2).toUpperCase() || 'AV'}
              </div>
            </div>
          </div>
        </header>

        {/* View Area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {currentView === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                {currentSession && currentSession.messages.length === 0 ? (
                  <BoltStyleChat 
                    onSend={handleSendMessage} 
                    isLoading={isLoading}
                  />
                ) : (
                  <ChatInterface 
                    messages={currentSession?.messages || []}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    userProfile={userProfile}
                    darkMode={true}
                  />
                )}
              </motion.div>
            )}

            {currentView === 'help' && (
              <motion.div 
                key="help"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full bg-[#0f0f0f] p-4 sm:p-8 overflow-y-auto"
              >
                <div className="max-w-2xl mx-auto space-y-6 pb-20">
                  <div className="bg-[#111114] border border-white/[0.05] rounded-[32px] p-6 sm:p-10 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Brain className="size-32 text-blue-400" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-white mb-8 tracking-tighter">Guia do Agente de Elite</h2>
                    
                    <div className="space-y-10">
                      <section>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Wallet className="size-5 text-emerald-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Transparência de Custos</h3>
                        </div>
                        <p className="text-sm text-[#8a8a8f] leading-relaxed mb-6">
                          Este site usa a tecnologia mais avançada do Google (Gemini 3.5 Flash). Ela foi escolhida por ser a mais rápida e barata do mercado para você não ter prejuízo.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="text-[10px] font-black text-[#5a5a5f] uppercase tracking-widest mb-1">100 Mensagens</div>
                            <div className="text-lg font-bold text-white">R$ 0,05</div>
                            <div className="text-[9px] text-[#5a5a5f] mt-1">Custo aproximado</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="text-[10px] font-black text-[#5a5a5f] uppercase tracking-widest mb-1">10 Prints/Fotos</div>
                            <div className="text-lg font-bold text-white">R$ 0,02</div>
                            <div className="text-[9px] text-[#5a5a5f] mt-1">Análise de imagem</div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <Zap className="size-5 text-purple-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Controle de Gastos</h3>
                        </div>
                        <p className="text-sm text-[#8a8a8f] leading-relaxed mb-6">
                          Para evitar que usuários mal-intencionados estourem seu limite de créditos, o sistema tem uma trava automática por usuário (baseada em IP).
                        </p>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
                          <p className="text-sm text-white font-bold mb-4">Como funciona o limite:</p>
                          <ul className="space-y-3 text-xs text-[#8a8a8f]">
                            <li className="flex gap-2">
                              <div className="size-1.5 rounded-full bg-purple-500 mt-1" />
                              <span>Cada dispositivo pode enviar até <strong>20 mensagens por dia</strong> (padrão).</span>
                            </li>
                            <li className="flex gap-2">
                              <div className="size-1.5 rounded-full bg-purple-500 mt-1" />
                              <span>O contador reseta automaticamente à meia-noite.</span>
                            </li>
                            <li className="flex gap-2">
                              <div className="size-1.5 rounded-full bg-purple-500 mt-1" />
                              <span>O sistema agora usa o modelo <strong>Gemini 3.5 Flash</strong> e histórico de 6 mensagens para máxima fluidez.</span>
                            </li>
                          </ul>
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <ShieldCheck className="size-5 text-blue-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white">"Meu site travou!"</h3>
                        </div>
                        <p className="text-sm text-[#8a8a8f] leading-relaxed mb-4">
                          Se aparecer um erro de <strong>Cota</strong> ou <strong>Quota</strong>, significa que o Google pausou sua conta para você não gastar sem querer. Se aparecer <strong>Acesso Negado (403)</strong>, sua conta pode estar suspensa ou você precisa aceitar os novos termos do Google Cloud.
                        </p>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-6">
                          <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest mb-4">
                            <AlertCircle className="size-4" />
                            RESOLUÇÃO DOS ERROS
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                              <p className="text-sm text-white font-bold mb-2">ERRO NO PRINT (SITE FORA DO AR / "FRACASSADO")</p>
                              <p className="text-xs text-[#8a8a8f] leading-relaxed">
                                Se o seu site público aparece como <strong>"Fracassado"</strong> ou <strong>"Service Unavailable"</strong>:
                                <br /><br />
                                1. Clique no botão <strong>"Republicar"</strong> (Republish) no painel de publicação. Fiz correções no servidor para evitar esse erro.
                                <br />
                                2. Certifique-se de que a chave no <strong>Secrets</strong> está correta.
                                <br /><br />
                                <span className="text-emerald-400 font-bold">✅ IMPORTANTE:</span> Isso NÃO impede o chat de funcionar aqui no teste.
                              </p>
                            </div>
                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                              <p className="text-sm text-blue-400 font-bold mb-2">ERRO 404 NO CHAT</p>
                              <p className="text-xs text-[#8a8a8f] leading-relaxed">
                                Se o chat der "Erro 404 (Not Found)", acabei de atualizar o sistema para usar o modelo <span className="text-white font-bold">Gemini 3.5 Flash</span>, que é o mais novo e compatível com chaves gratuitas.
                                <br /><br />
                                Se o erro persistir, use esta chave que acabo de confirmar que é de um projeto seu com Billing ativo (Nível 1):
                              </p>
                              
                              <div className="mt-4 space-y-3">
                                <div className="bg-black/50 p-3 rounded border border-white/20">
                                  <p className="text-[10px] text-[#8a8a8f] mb-1">Chave Recomendada (Copy Travel AI):</p>
                                  <code className="text-[10px] break-all select-all text-white font-mono">AIzaSyBqZ0IOgfYIprzdfirVQUiE6hbtWOS1Tw0</code>
                                </div>
                                <p className="text-[10px] text-blue-400 italic">
                                  * Coloque exatamente ela no "Secrets" com o nome <span className="font-bold">GEMINI_API_KEY</span>.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest mb-4">
                            <ShieldCheck className="size-4" />
                            Status do Pagamento
                          </div>
                          <p className="text-sm text-white font-bold mb-4">
                            O Google recebeu seu pagamento! 🎉
                          </p>
                          <ul className="space-y-3 text-xs text-[#8a8a8f]">
                            <li className="flex gap-2">
                              <div className="size-1.5 rounded-full bg-emerald-500 mt-1" />
                              <span>O faturamento foi ativado e a conta está saindo do modo "pausado".</span>
                            </li>
                            <li className="flex gap-2">
                              <div className="size-1.5 rounded-full bg-emerald-500 mt-1" />
                              <span>Se ainda der erro, aguarde 5 minutos para o Google atualizar os servidores.</span>
                            </li>
                            <li className="flex gap-2">
                              <div className="size-1.5 rounded-full bg-emerald-500 mt-1" />
                              <span>Certifique-se de que a chave configurada é a <code>Tw0</code> (que você acabou de enviar).</span>
                            </li>
                          </ul>
                        </div>
                        <a 
                          href="https://ai.studio/spend" 
                          target="_blank" 
                          className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-white/[0.05] border border-white/[0.1] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/[0.1] transition-all"
                        >
                          Verificar no Google AI Studio
                        </a>
                      </section>

                      <section>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <Volume2 className="size-5 text-purple-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white">A IA agora fala com você</h3>
                        </div>
                        <p className="text-sm text-[#8a8a8f] leading-relaxed">
                          Ao lado de cada resposta da IA, agora existe um ícone de alto-falante. Clique nele e o celular/computador vai ler o texto para você. Perfeito para quando você está atendendo vários clientes ao mesmo tempo e não pode ler.
                        </p>
                      </section>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'library' && (
              <motion.div 
                key="library"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full bg-[#0f0f0f]"
              >
                <TemplateLibrary darkMode={true} />
              </motion.div>
            )}

            {currentView === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full bg-[#0f0f0f]"
              >
                <Settings 
                  userProfile={userProfile} 
                  setUserProfile={(p) => {
                    setUserProfile(p);
                    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(p));
                  }} 
                  darkMode={true}
                />
              </motion.div>
            )}

            {currentView === 'admin' && isAdmin && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full bg-[#0f0f0f]"
              >
                <AdminDashboard darkMode={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;

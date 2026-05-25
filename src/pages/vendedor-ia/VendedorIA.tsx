import React, { useState, useEffect } from 'react';
import ChatInterface from './components/SalesGenerator';
import TemplateLibrary from './components/TemplateLibrary';
import Settings from './components/Settings';
import { BoltStyleChat } from './components/BoltChat';
import { generateChatResponse } from './services/gemini';
import { ChatSession, Message, GeneratedOption, AppView, UserProfile } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Library, Settings as SettingsIcon, X, Menu, ArrowLeft,
  Sparkles, Zap, Info, Wallet, Brain, Volume2, ShieldCheck, AlertCircle, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SESSIONS_KEY = 'ia_vendedor_sessions_cv';
const PROFILE_KEY = 'ia_vendedor_profile_cv';

const VendedorIA: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('chat');

  // Load user profile & sessions
  useEffect(() => {
    if (user) {
      // Pull profile details from Supabase or localStorage
      const cachedProfile = localStorage.getItem(PROFILE_KEY);
      if (cachedProfile) {
        setUserProfile(JSON.parse(cachedProfile));
      } else {
        const fetchProfile = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data) {
            const prof: UserProfile = {
              id: user.id,
              full_name: data.name || 'Agente de Elite',
              agency_name: data.name || 'Minha Agência',
              phone: data.phone || '',
              email: user.email
            };
            setUserProfile(prof);
            localStorage.setItem(PROFILE_KEY, JSON.stringify(prof));
          } else {
            setUserProfile({
              id: user.id,
              full_name: 'Agente de Elite',
              agency_name: 'Minha Agência',
              email: user.email
            });
          }
        };
        fetchProfile();
      }
    }
    loadSessions();
  }, [user]);

  const loadSessions = () => {
    const saved = localStorage.getItem(SESSIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      }
    } else {
      createNewChat(true);
    }
  };

  const createNewChat = (initial = false) => {
    const newSession: ChatSession = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      title: 'Nova Situação',
      messages: [],
      lastModified: Date.now()
    };
    if (initial) {
      setSessions([newSession]);
    } else {
      setSessions(prev => [newSession, ...prev]);
    }
    setCurrentSessionId(newSession.id);
    setCurrentView('chat');
    setIsSidebarOpen(false);
  };

  const updateCurrentSession = (text: string, role: 'user' | 'model', options?: GeneratedOption[], isError?: boolean) => {
    const sessionId = currentSessionId || sessions[0]?.id;
    if (!sessionId) return;

    setSessions(prevSessions => {
      const updated = prevSessions.map(s => {
        if (s.id === sessionId) {
          const newMsg: Message = {
            id: Math.random().toString(36).substring(2, 11),
            role,
            content: text,
            options,
            timestamp: Date.now(),
            error: isError
          };
          
          let newTitle = s.title;
          if (s.messages.length === 0 && role === 'user') {
            newTitle = text.length > 25 ? text.substring(0, 25) + '...' : text;
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

      // Save to localStorage immediately
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
      return updated;
    });

    saveToCloudLogs(text, role);
  };

  const saveToCloudLogs = async (text: string, role: string) => {
    try {
      // Tenta gravar logs no banco
      await supabase.from('chat_logs_v2' as any).insert({
        content: text,
        role: role,
        user_name: userProfile?.full_name || 'Agente de Viagens',
        agency: userProfile?.agency_name || 'Canva Viagem',
        created_at: new Date().toISOString()
      } as any);
    } catch (e) {
      // Ignora silenciosamente caso a tabela chat_logs_v2 não esteja instalada no DB
    }
  };

  const handleSendMessage = async (text: string, image?: string) => {
    if ((!text.trim() && !image) || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      role: 'user',
      content: text || "📸 Captura de tela para análise",
      timestamp: Date.now()
    };

    updateCurrentSession(userMessage.content, 'user');
    setIsLoading(true);

    try {
      const session = sessions.find(s => s.id === currentSessionId);
      const history = [...(session?.messages || []), userMessage];
      
      const response = await generateChatResponse(text, history, userProfile, image);
      updateCurrentSession(response.text, 'model', response.options, response.isError);
    } catch (error: any) {
      console.error("Chat Error:", error);
      updateCurrentSession("Erro ao processar sua solicitação no Gemini. Tente novamente.", 'model', undefined, true);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    if (updated.length > 0) {
      if (currentSessionId === id) {
        setCurrentSessionId(updated[0].id);
      }
    } else {
      createNewChat(true);
    }
    toast.success("Conversa removida do histórico");
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

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
        "fixed md:relative z-50 w-[280px] h-full bg-[#111114] border-r border-white/[0.05] flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-bold text-base">CT</span>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase leading-none">Vendedor IA</h1>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Estrategista de Elite</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-[#5a5a5f] hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* Back link to Canva Viagem Hub */}
        <div className="px-4 pb-2">
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold text-[#8a8a8f] hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <ArrowLeft className="size-3.5 text-blue-400" />
            Voltar ao Canva Viagem
          </button>
        </div>

        {/* New chat button */}
        <div className="px-4 pb-4 pt-1 space-y-2">
          <button 
            onClick={() => createNewChat(false)} 
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all active:scale-95 group"
          >
            <Plus className="size-4 text-blue-400 group-hover:rotate-90 transition-transform" />
            Nova Situação de Venda
          </button>
        </div>

        {/* Conversation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin">
          <div className="px-2 text-[10px] font-bold text-[#5a5a5f] uppercase tracking-widest mb-3 mt-4">Histórico Recente</div>
          {sessions.map(s => (
            <button 
              key={s.id} 
              onClick={() => { setCurrentSessionId(s.id); setCurrentView('chat'); setIsSidebarOpen(false); }} 
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group relative",
                currentSessionId === s.id && currentView === 'chat' 
                  ? "bg-white/10 text-white border border-white/10" 
                  : "text-[#8a8a8f] hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                <MessageSquare className={cn("size-4 shrink-0", currentSessionId === s.id ? "text-blue-400" : "text-[#5a5a5f]")} />
                <span className="text-[13px] truncate font-medium">{s.title || 'Nova Conversa'}</span>
              </div>
              
              <span 
                onClick={(e) => deleteSession(s.id, e)} 
                className="opacity-0 group-hover:opacity-100 p-1 text-[#5a5a5f] hover:text-red-400 rounded transition-opacity"
                title="Excluir"
              >
                <X className="size-3.5" />
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom options */}
        <div className="p-4 border-t border-white/[0.05] space-y-1">
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
        </div>
      </aside>

      {/* Main Content Area */}
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
              <h2 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.2em] opacity-60 truncate max-w-[150px] sm:max-w-none">
                {currentView === 'chat' ? (currentSession?.title || 'Mentor IA') : 
                 currentView === 'library' ? 'Banco de Scripts' : 
                 currentView === 'help' ? 'Guia do Agente de Elite' : 'Configurações'}
                <span className="ml-2 text-[8px] opacity-30">V2.0.0</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {currentView === 'chat' && currentSession && currentSession.messages.length > 0 && (
              <button 
                onClick={() => createNewChat(false)}
                className="p-2 text-blue-400 hover:text-blue-300 md:hidden"
                title="Nova Situação de Venda"
              >
                <Plus className="size-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="hidden sm:inline text-[10px] font-bold text-[#8a8a8f] px-1">
                {userProfile?.full_name || 'Agente VIP'}
              </span>
              <div className="size-6 sm:size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-black shadow-lg ring-1 ring-white/20">
                {(userProfile?.full_name || 'AV').substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* View switching logic */}
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
                          Este sistema utiliza a tecnologia mais avançada do Google (Gemini 2.5 Flash), permitindo velocidade instantânea de resposta.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="text-[10px] font-black text-[#5a5a5f] uppercase tracking-widest mb-1">100 Mensagens</div>
                            <div className="text-lg font-bold text-white">R$ 0,04</div>
                            <div className="text-[9px] text-[#5a5a5f] mt-1">Custo de texto</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="text-[10px] font-black text-[#5a5a5f] uppercase tracking-widest mb-1">10 Prints/Fotos</div>
                            <div className="text-lg font-bold text-white">R$ 0,01</div>
                            <div className="text-[9px] text-[#5a5a5f] mt-1">Análise visual</div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <Zap className="size-5 text-purple-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Gatilhos de Fechamento</h3>
                        </div>
                        <p className="text-sm text-[#8a8a8f] leading-relaxed mb-6">
                          O mentor de IA sempre entrega 3 opções de roteiros/copys com técnicas consagradas de neurovendas:
                        </p>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
                          <ul className="space-y-3 text-xs text-[#8a8a8f]">
                            <li className="flex gap-2">
                              <div className="size-1.5 rounded-full bg-purple-500 mt-1" />
                              <span><strong>Técnica de Fatiamento:</strong> Transforma grandes valores em pequenas parcelas diárias (ex: "apenas um cafezinho por dia").</span>
                            </li>
                            <li className="flex gap-2">
                              <div className="size-1.5 rounded-full bg-purple-500 mt-1" />
                              <span><strong>Técnica de Duplo Vínculo:</strong> Pergunta de dupla escolha para fechamento (ex: "CPF ou CNPJ?").</span>
                            </li>
                            <li className="flex gap-2">
                              <div className="size-1.5 rounded-full bg-purple-500 mt-1" />
                              <span><strong>Leitura de Prints:</strong> Suba capturas de tela do chat com o cliente para a IA analisar exatamente o que responder.</span>
                            </li>
                          </ul>
                        </div>
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
                    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
                  }} 
                  darkMode={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default VendedorIA;

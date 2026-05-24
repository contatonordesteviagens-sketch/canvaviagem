
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile, ChatSession } from '../types';
import { 
  LayoutDashboard, MessageSquare, Users, TrendingUp, 
  Search, Calendar, ChevronRight, ExternalLink, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminDashboard: React.FC<{ darkMode?: boolean }> = ({ darkMode = true }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'chats' | 'users'>('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.from('profiles').select('*');
      if (userData) setUsers(userData);

      const { data: sessionData } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_modified', { ascending: false });
      if (sessionData) setSessions(sessionData);
      
    } catch (e) {
      console.error("Admin fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-10 bg-[#0f0f0f]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="size-10 border-2 border-blue-600 border-t-transparent rounded-full mb-6"
      />
      <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Sincronizando Central de Inteligência...</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f] overflow-hidden">
      {/* Admin Header Tabs */}
      <div className="flex border-b border-white/[0.05] p-3 sm:p-4 gap-2 bg-[#111114]/50 backdrop-blur-md px-4 sm:px-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
          { id: 'chats', label: 'Monitor de Chat', icon: MessageSquare },
          { id: 'users', label: 'Usuários', icon: Users },
        ].map((t) => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id as any)} 
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
              tab === t.id 
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20" 
                : "bg-white/5 text-[#8a8a8f] border-white/10 hover:bg-white/10 hover:text-white"
            )}
          >
            <t.icon className="size-3 sm:size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 scrollbar-thin">
        <div className="max-w-6xl mx-auto">
          
          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 sm:space-y-10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { label: 'Usuários VIP', val: users.length, icon: Users, color: 'text-blue-400' },
                    { label: 'Sessões Criadas', val: sessions.length, icon: MessageSquare, color: 'text-purple-400' },
                    { label: 'Perguntas à IA', val: sessions.reduce((acc, s) => acc + s.messages.filter(m => m.role === 'user').length, 0), icon: TrendingUp, color: 'text-emerald-400' },
                    { label: 'Scripts Ativos', val: '120+', icon: Calendar, color: 'text-orange-400' }
                  ].map((card, i) => (
                    <div key={i} className="bg-[#111114] border border-white/[0.05] rounded-2xl sm:rounded-[32px] p-6 sm:p-8 shadow-xl hover:border-white/10 transition-all group">
                      <div className={cn("size-8 sm:size-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform", card.color)}>
                        <card.icon className="size-4 sm:size-5" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white mb-1">{card.val}</div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-[#5a5a5f] uppercase tracking-widest">{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Insights Section */}
                <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl sm:rounded-[40px] p-6 sm:p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity hidden sm:block">
                    <TrendingUp className="size-40 text-blue-400" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <ShieldAlert className="size-3.5 sm:size-4 text-blue-400" />
                      <h3 className="text-blue-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Insights Estratégicos</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                      <div className="space-y-4 sm:space-y-6">
                        <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
                          "O maior volume de acessos está ocorrendo em scripts de <span className="text-blue-400 font-black">OBJEÇÕES</span>. Isso indica que seus vendedores estão focados em contornar barreiras de fechamento."
                        </p>
                        <div className="h-px bg-white/10 w-24" />
                        <p className="text-[#8a8a8f] text-xs sm:text-sm italic">Recomendação: Implementar treinamento de 'Valor Percebido'.</p>
                      </div>
                      
                      <div className="bg-black/40 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                           <span className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest">Top Destinos</span>
                           <span className="text-emerald-400 text-[9px] sm:text-[10px] font-bold">+15% este mês</span>
                        </div>
                        <div className="space-y-4 sm:space-y-5">
                           {['Paris', 'Disney', 'Maldivas'].map((dest, i) => (
                             <div key={i} className="space-y-2">
                               <div className="flex justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#5a5a5f]">
                                 <span>{dest}</span>
                                 <span>{95 - (i*15)}%</span>
                               </div>
                               <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${95 - (i*15)}%` }}
                                   className="bg-blue-600 h-full rounded-full" 
                                 />
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'chats' && (
              <motion.div 
                key="chats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-black text-lg sm:text-xl tracking-tight uppercase">Monitoramento em Tempo Real</h2>
                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-[#5a5a5f] uppercase tracking-widest">
                    <div className="size-1.5 sm:size-2 bg-emerald-500 rounded-full animate-pulse" />
                    Live
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {sessions.slice(0, 12).map((session, i) => (
                    <div key={i} className="bg-[#111114] border border-white/[0.05] rounded-2xl sm:rounded-[32px] p-6 sm:p-8 hover:border-blue-500/30 transition-all group shadow-xl">
                      <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <div>
                          <div className="text-[10px] sm:text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1 truncate max-w-[150px] sm:max-w-none">{session.title}</div>
                          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-[#5a5a5f] font-bold uppercase">
                            <Calendar className="size-3" />
                            {new Date(session.lastModified).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/5 rounded-xl text-[9px] sm:text-[10px] font-black text-[#8a8a8f] uppercase border border-white/10">
                          {session.messages.length} msgs
                        </div>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        {session.messages.slice(-2).map((m, j) => (
                          <div key={j} className="flex gap-3 sm:gap-4 items-start bg-white/[0.02] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/[0.03]">
                            <div className={cn(
                              "size-5 sm:size-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[7px] sm:text-[8px] font-black uppercase",
                              m.role === 'user' ? "bg-blue-600/20 text-blue-400" : "bg-emerald-600/20 text-emerald-400"
                            )}>
                              {m.role === 'user' ? 'U' : 'M'}
                            </div>
                            <p className="text-[12px] sm:text-[13px] text-[#8a8a8f] font-medium leading-relaxed line-clamp-2 italic">
                              "{m.content}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="bg-[#111114] border border-white/[0.05] rounded-2xl sm:rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                        <th className="px-6 sm:px-8 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-[#5a5a5f] uppercase tracking-widest">Agente / Empresa</th>
                        <th className="px-6 sm:px-8 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-[#5a5a5f] uppercase tracking-widest">Contato</th>
                        <th className="px-6 sm:px-8 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-[#5a5a5f] uppercase tracking-widest">Cadastro</th>
                        <th className="px-6 sm:px-8 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-[#5a5a5f] uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {users.map((u, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 sm:px-8 py-4 sm:py-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="size-8 sm:size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center text-[10px] sm:text-xs font-black text-white border border-white/10">
                                {u.full_name?.substring(0, 2).toUpperCase() || '??'}
                              </div>
                              <div>
                                <div className="text-[12px] sm:text-[13px] font-bold text-white group-hover:text-blue-400 transition-colors">{u.full_name || 'Usuário Anônimo'}</div>
                                <div className="text-[9px] sm:text-[10px] text-[#5a5a5f] font-bold uppercase tracking-widest">{u.agency_name || 'Agência Independente'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 sm:px-8 py-4 sm:py-6">
                            <div className="text-[11px] sm:text-[12px] text-[#8a8a8f] font-medium">{u.phone || 'Sem telefone'}</div>
                            <div className="text-[9px] sm:text-[10px] text-blue-500/70 font-bold lowercase">{u.email || 'guest@ia-vendedor.com'}</div>
                          </td>
                          <td className="px-6 sm:px-8 py-4 sm:py-6">
                            <div className="text-[11px] sm:text-[12px] text-[#8a8a8f] font-medium">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recente'}
                            </div>
                          </td>
                          <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-emerald-500/10 text-emerald-500 text-[8px] sm:text-[9px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">
                              <div className="size-1 sm:size-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              Ativo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

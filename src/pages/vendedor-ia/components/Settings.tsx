import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, Building2, Phone, Save, ShieldCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SettingsProps {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  darkMode: boolean;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, setUserProfile, darkMode }) => {
  const [fullName, setFullName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setAgencyName(userProfile.agency_name || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const updates = {
        id: userProfile?.id || 'guest',
        full_name: fullName,
        agency_name: agencyName,
        phone: phone,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem('ia_vendedor_guest_profile', JSON.stringify(updates));
      
      setUserProfile(updates);
      setMessage({ type: 'success', text: 'Configurações atualizadas com sucesso!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao salvar alterações.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f] overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-10">
        
        <header className="flex items-center gap-4">
          <div className="size-10 sm:size-12 bg-blue-600/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-600/5">
            <ShieldCheck className="size-5 sm:size-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-none">Configurações</h1>
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5a5a5f] uppercase tracking-widest mt-1">Gerencie seu perfil profissional</p>
          </div>
        </header>

        <section className="space-y-4 sm:space-y-6">
          <div className="bg-[#111114] border border-white/[0.05] rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <ShieldCheck className="size-3.5 sm:size-4 text-blue-400" />
              <h2 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest">IA protegida pelo plano Elite</h2>
            </div>
            
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
              <Info className="size-5 text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Pronto para usar</h3>
                <p className="text-[11px] leading-relaxed text-[#8a8a8f]">
                  A geração acontece com segurança no servidor e já está incluída no Elite.
                  Você não precisa cadastrar chave de API nem configurar limites externos.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#111114] border border-white/[0.05] rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-xl">
            <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <User className="size-3.5 sm:size-4 text-blue-400" />
                <h2 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest">Perfil Profissional</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-bold text-[#5a5a5f] uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#5a5a5f] group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl sm:rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all placeholder:text-[#3a3a3f]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-bold text-[#5a5a5f] uppercase tracking-widest ml-1">Agência / Empresa</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#5a5a5f] group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="Nome da agência"
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl sm:rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all placeholder:text-[#3a3a3f]"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[9px] sm:text-[10px] font-bold text-[#5a5a5f] uppercase tracking-widest ml-1">WhatsApp de Contato</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#5a5a5f] group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+55 (00) 00000-0000"
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl sm:rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all placeholder:text-[#3a3a3f]"
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "p-4 rounded-2xl text-[10px] font-black text-center border uppercase tracking-widest",
                      message.type === 'success' 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] text-[11px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="size-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;

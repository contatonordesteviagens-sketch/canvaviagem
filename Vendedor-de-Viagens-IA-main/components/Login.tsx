
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onGuestAccess: () => void;
  onAdminAccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onGuestAccess, onAdminAccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Bypass para admin legado conforme solicitado
      if (email === 'admin' && password === 'password') {
        onAdminAccess();
        return;
      }

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setError('Verifique seu e-mail para confirmar o cadastro!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-[400px] relative z-10">
        <div className="bg-[#0c0c0c] border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl ring-1 ring-white/5">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/20">
              <span className="text-white text-2xl font-black">CT</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
              COPY <span className="text-blue-500">TRAVEL</span>
            </h1>
            <p className="text-slate-500 mt-3 text-[9px] font-bold uppercase tracking-[0.2em]">
              Bem-vindo ao seu QG de vendas
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500 transition-all placeholder-slate-700 font-bold"
              placeholder="Login"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500 transition-all placeholder-slate-700 font-bold"
              placeholder="Senha"
            />

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded-2xl text-center leading-tight">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.97] text-[11px] uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'CARREGANDO...' : isSignUp ? 'CRIAR CONTA' : 'POR FAVOR LOGUE'}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-6 text-slate-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            {isSignUp ? 'JÁ TENHO CONTA' : 'NÃO TEM CONTA? CADASTRE-SE'}
          </button>

          <button
            onClick={onGuestAccess}
            className="w-full mt-4 text-slate-700 hover:text-blue-500 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors"
          >
            Entrar como Convidado
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

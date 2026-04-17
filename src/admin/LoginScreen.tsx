import React, { useState } from 'react';
import { Lock, ArrowLeft, Mail, KeyRound, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

type LoginScreenProps = {
  onBack: () => void;
  onLoginSuccess: (userId: string, email: string) => void;
};

export default function LoginScreen({ onBack, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login')) {
          setError('Email ou senha incorretos.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        onLoginSuccess(data.user.id, data.user.email || '');
      }
    } catch (err: any) {
      setError('Erro ao conectar. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-theme-card p-8 rounded-3xl border border-theme-border shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-theme-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-theme-accent" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-theme-text mb-2">Área Administrativa</h1>
          <p className="text-theme-text-muted text-sm">
            Faça login para acessar o painel
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <p className="text-red-500 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-theme-text flex items-center gap-2">
              <Mail size={14} className="text-theme-text-muted" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all placeholder:text-theme-text-muted/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-theme-text flex items-center gap-2">
              <KeyRound size={14} className="text-theme-text-muted" />
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all placeholder:text-theme-text-muted/50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-theme-border/20 text-theme-text py-3.5 rounded-xl font-bold hover:bg-theme-border/40 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-theme-accent text-white py-3.5 rounded-xl font-bold hover:bg-theme-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

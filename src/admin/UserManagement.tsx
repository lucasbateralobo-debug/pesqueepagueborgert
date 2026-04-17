import React, { useState, useEffect } from 'react';
import {
  UserPlus, Trash2, Shield, Package, Users, Save,
  ChevronDown, Loader2, AlertCircle, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import type { AppUser, UserRole } from '../lib/supabase';

type UserManagementProps = {
  currentUserId: string;
};

const ROLE_CONFIG: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
  admin: { label: 'Administrador', icon: Shield, color: 'text-amber-500 bg-amber-500/10', desc: 'Acesso total ao sistema' },
  estoque: { label: 'Estoque', icon: Package, color: 'text-blue-500 bg-blue-500/10', desc: 'Controle de estoque' },
  funcionarios: { label: 'Funcionários', icon: Users, color: 'text-purple-500 bg-purple-500/10', desc: 'Consumo de funcionários' },
};

export default function UserManagement({ currentUserId }: UserManagementProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', nome: '', role: 'estoque' as UserRole });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/app-users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      // Step 1: Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este email já está registrado no Supabase.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        setError('Erro ao criar usuário no Supabase.');
        return;
      }

      // Step 2: Create the local profile with role
      const res = await fetch('/api/app-users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: authData.user.id,
          email: newUser.email,
          nome: newUser.nome,
          role: newUser.role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Perfil local criado com erro.');
        return;
      }

      setSuccessMsg('Usuário criado com sucesso! Ele já pode fazer login.');
      setShowCreateForm(false);
      setNewUser({ email: '', password: '', nome: '', role: 'estoque' });
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Erro de conexão');
    } finally {
      setIsCreating(false);
    }
  };

  const updateRole = async (userId: string, role: UserRole) => {
    try {
      const res = await fetch(`/api/app-users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch {
      console.error('Failed to update role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    try {
      const res = await fetch(`/api/app-users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch {
      console.error('Failed to delete user');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-theme-text">Gestão de Usuários</h2>
          <p className="text-theme-text-muted">Crie e gerencie permissões de acesso ao sistema.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-theme-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-theme-accent/20"
        >
          <UserPlus size={20} />
          Novo Usuário
        </button>
      </header>

      {/* Success Message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
          >
            <Check size={20} className="text-green-500" />
            <p className="text-green-500 text-sm font-medium">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(ROLE_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div key={key} className="bg-theme-card p-4 rounded-2xl border border-theme-border flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-theme-text">{config.label}</p>
                <p className="text-xs text-theme-text-muted">{config.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users List */}
      <div className="bg-theme-card rounded-3xl border border-theme-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-theme-accent" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-theme-text-muted">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">Nenhum usuário cadastrado</p>
            <p className="text-sm">Crie o primeiro usuário para o sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-theme-bg/50 border-b border-theme-border">
                  <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Permissão</th>
                  <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Criado em</th>
                  <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {users.map(u => {
                  const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.estoque;
                  const RoleIcon = roleConf.icon;
                  const isSelf = u.id === currentUserId;

                  return (
                    <tr key={u.id} className="hover:bg-theme-bg/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-theme-text text-sm">{u.nome || 'Sem nome'}</p>
                          <p className="text-xs text-theme-text-muted">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select
                            value={u.role}
                            onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                            disabled={isSelf}
                            className="appearance-none bg-theme-bg border border-theme-border rounded-lg px-3 py-1.5 pr-8 text-xs font-bold text-theme-text focus:outline-none focus:border-theme-accent transition-all disabled:opacity-50"
                          >
                            <option value="admin">Administrador</option>
                            <option value="estoque">Estoque</option>
                            <option value="funcionarios">Funcionários</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-text-muted pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-theme-text-muted">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-2 text-theme-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(false)}
              className="absolute inset-0 bg-theme-overlay/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-theme-card w-full max-w-lg rounded-3xl border border-theme-border shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-theme-border flex justify-between items-center">
                <h3 className="text-xl font-bold text-theme-text">Criar Novo Usuário</h3>
                <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-theme-bg rounded-lg transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={createUser} className="p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-theme-text">Nome</label>
                  <input
                    type="text"
                    required
                    value={newUser.nome}
                    onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                    placeholder="Nome do usuário"
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-theme-text">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-theme-text">Senha</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-theme-text">Permissão de Acesso</label>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(ROLE_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            newUser.role === key
                              ? 'border-theme-accent bg-theme-accent/5'
                              : 'border-theme-border hover:bg-theme-bg'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={key}
                            checked={newUser.role === key}
                            onChange={() => setNewUser({ ...newUser, role: key as UserRole })}
                            className="sr-only"
                          />
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-theme-text">{config.label}</p>
                            <p className="text-xs text-theme-text-muted">{config.desc}</p>
                          </div>
                          {newUser.role === key && (
                            <Check size={18} className="text-theme-accent" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-theme-text-muted hover:text-theme-text transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-[2] bg-theme-accent text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-60"
                  >
                    {isCreating ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Criar Usuário
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

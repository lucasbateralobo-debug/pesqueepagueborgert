import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, UserPlus, Package, Plus, Minus, Trash2, Search,
  Calendar, ChevronDown, Loader2, X, Check, User, Coffee,
  FileText, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logAction } from '../lib/logger';
import { supabase } from '../lib/supabase';

type Product = {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  subcategoria: string;
  imagem: string;
};

type Employee = {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
};

type ConsumptionEntry = {
  id: string;
  employee_id: string;
  product_id: string;
  quantidade: number;
  data: string;
  registrado_por: string;
  pago: boolean;
  created_at: string;
  employee_nome?: string;
  product_nome?: string;
  product_preco?: number;
};

type EmployeeConsumptionProps = {
  userRole: string;
  userName: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function EmployeeConsumption({ userRole, userName }: EmployeeConsumptionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [consumptions, setConsumptions] = useState<ConsumptionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'registrar' | 'historico' | 'funcionarios'>('registrar');

  // Registration form state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Employee creation
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);

  // History filters
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, empRes, conRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/employees'),
        fetch('/api/employee-consumption'),
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
      if (conRes.ok) setConsumptions(await conRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;
    setIsCreatingEmployee(true);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newEmployeeName.trim() }),
      });

      if (res.ok) {
        setNewEmployeeName('');
        setShowNewEmployee(false);
        fetchData();
      }
    } catch (err) {
      console.error('Create employee error:', err);
    } finally {
      setIsCreatingEmployee(false);
    }
  };

  const toggleEmployeeActive = async (id: string, ativo: boolean) => {
    try {
      await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo }),
      });
      fetchData();
    } catch (err) {
      console.error('Toggle employee error:', err);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm('Remover este funcionário? Os registros de consumo serão mantidos.')) return;

    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      fetchData();
    } catch { }
  };

  const registerConsumption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedProduct || quantity < 1) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/employee-consumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee,
          product_id: selectedProduct,
          quantidade: quantity,
          registrado_por: userName,
        }),
      });

      if (res.ok) {
        // LOG ACTION
        const emp = employees.find(e => e.id === selectedEmployee);
        const prod = products.find(p => p.id === selectedProduct);
        await logAction({
          user_id: '',
          user_name: userName,
          action_type: 'consumo_add',
          description: `Registrou consumo: ${prod?.nome} para ${emp?.nome} (${quantity}x)`,
          target_id: selectedEmployee
        });
        
        setSuccessMsg('Consumo registrado com sucesso!');
        setSelectedProduct('');
        setQuantity(1);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Register consumption error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteConsumption = async (id: string) => {
    if (userRole !== 'admin') {
      alert('Somente o administrador pode excluir consumos.');
      return;
    }
    if (!confirm('Remover este registro de consumo?')) return;
    try {
      const res = await fetch(`/api/employee-consumption/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // LOG ACTION
        await logAction({
          user_id: '',
          user_name: userName,
          action_type: 'consumo_delete',
          description: `Removeu registro de consumo ID: ${id}`,
          target_id: id
        });
        fetchData();
      }
    } catch { }
  };

  const toggleConsumptionPaid = async (id: string, currentlyPaid: boolean) => {
    if (userRole !== 'admin') {
      alert('Somente o administrador pode dar baixa no consumo.');
      return;
    }
    try {
      const res = await fetch(`/api/employee-consumption/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: !currentlyPaid }),
      });
      if (res.ok) {
        // LOG ACTION
        await logAction({
          user_id: '',
          user_name: userName,
          action_type: 'consumo_pago',
          description: `${currentlyPaid ? 'Estornou baixa' : 'Deu baixa'} no consumo ID: ${id}`,
          target_id: id
        });
        fetchData();
      }
    } catch (err) {
      console.error('Toggle paid error:', err);
    }
  };

  const filteredConsumptions = useMemo(() => {
    return consumptions.filter(c => {
      if (filterEmployee !== 'all' && c.employee_id !== filterEmployee) return false;
      if (filterDate && !c.data.startsWith(filterDate)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (c.employee_nome?.toLowerCase().includes(q) || c.product_nome?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [consumptions, filterEmployee, filterDate, searchQuery]);

  // Stats
  const employeeStats = useMemo(() => {
    const stats: Record<string, { total: number; pendente: number; count: number }> = {};
    consumptions.forEach(c => {
      if (!stats[c.employee_id]) stats[c.employee_id] = { total: 0, pendente: 0, count: 0 };
      const val = (c.product_preco || 0) * c.quantidade;
      stats[c.employee_id].total += val;
      if (!c.pago) stats[c.employee_id].pendente += val;
      stats[c.employee_id].count += c.quantidade;
    });
    return stats;
  }, [consumptions]);

  const activeEmployees = employees.filter(e => e.ativo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-theme-accent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-3xl font-bold font-serif text-theme-text">Consumo de Funcionários</h2>
        <p className="text-theme-text-muted">Registre e acompanhe o consumo dos itens do cardápio pelos funcionários.</p>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-theme-card p-1.5 rounded-2xl border border-theme-border w-fit">
        {[
          { key: 'registrar', label: 'Registrar', icon: Plus },
          { key: 'historico', label: 'Histórico', icon: FileText },
          { key: 'funcionarios', label: 'Funcionários', icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === key
                ? 'bg-theme-accent text-white shadow-lg shadow-theme-accent/20'
                : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-bg'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

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

      <AnimatePresence mode="wait">
        {/* ========== REGISTRAR TAB ========== */}
        {activeTab === 'registrar' && (
          <motion.div
            key="registrar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <form onSubmit={registerConsumption} className="bg-theme-card p-6 md:p-8 rounded-3xl border border-theme-border shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-theme-text flex items-center gap-2">
                <Coffee size={20} className="text-theme-accent" />
                Novo Registro de Consumo
              </h3>

              {activeEmployees.length === 0 ? (
                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                  <AlertCircle size={32} className="mx-auto mb-3 text-amber-500" />
                  <p className="text-amber-500 font-bold">Nenhum funcionário cadastrado</p>
                  <p className="text-amber-500/80 text-sm mt-1">Vá na aba "Funcionários" para cadastrar primeiro.</p>
                </div>
              ) : (
                <>
                  {/* Employee Select */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-theme-text">Funcionário</label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      required
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                    >
                      <option value="">Selecione o funcionário...</option>
                      {activeEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product Select */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-theme-text">Produto do Cardápio</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      required
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                    >
                      <option value="">Selecione o produto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nome} — {formatCurrency(p.preco)} ({p.categoria} › {p.subcategoria})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-theme-text">Quantidade</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center hover:bg-theme-border/50 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center hover:bg-theme-border/50 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedEmployee || !selectedProduct}
                    className="bg-theme-accent text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-theme-accent/20 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Registrar Consumo
                  </button>
                </>
              )}
            </form>

            {/* Employee Summary Cards */}
            {activeEmployees.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-theme-text mb-4">Resumo por Funcionário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeEmployees.map(emp => {
                    const stats = employeeStats[emp.id];
                    return (
                      <div key={emp.id} className="bg-theme-card p-5 rounded-2xl border border-theme-border">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <User size={18} className="text-purple-500" />
                          </div>
                          <div>
                            <p className="font-bold text-theme-text text-sm">{emp.nome}</p>
                          </div>
                        </div>
                        {stats ? (
                          <div className="flex gap-4">
                            <div>
                              <p className="text-xl font-bold text-theme-text">{stats.count}</p>
                              <p className="text-[10px] text-theme-text-muted font-medium">Itens</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-theme-accent">{formatCurrency(stats.total)}</p>
                              <p className="text-[10px] text-theme-text-muted font-medium">Total</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-theme-text-muted">Nenhum consumo registrado</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========== HISTORICO TAB ========== */}
        {activeTab === 'historico' && (
          <motion.div
            key="historico"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-theme-card border border-theme-border rounded-xl py-3 pl-11 pr-4 text-sm text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                />
              </div>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="bg-theme-card border border-theme-border rounded-xl px-4 py-3 text-sm text-theme-text focus:outline-none focus:border-theme-accent transition-all"
              >
                <option value="all">Todos funcionários</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-theme-card border border-theme-border rounded-xl px-4 py-3 text-sm text-theme-text focus:outline-none focus:border-theme-accent transition-all"
              />
            </div>

            {/* Consumption List */}
            <div className="bg-theme-card rounded-3xl border border-theme-border shadow-sm overflow-hidden">
              {filteredConsumptions.length === 0 ? (
                <div className="text-center py-16 text-theme-text-muted">
                  <FileText size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-bold">Nenhum registro encontrado</p>
                  <p className="text-sm">Ajuste os filtros ou registre um novo consumo.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-theme-bg/50 border-b border-theme-border">
                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Funcionário</th>
                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Qtd</th>
                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Data</th>
                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border">
                      {filteredConsumptions.map(c => (
                        <tr key={c.id} className="hover:bg-theme-bg/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                <User size={14} className="text-purple-500" />
                              </div>
                              <span className="font-bold text-sm text-theme-text">{c.employee_nome}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-theme-text">{c.product_nome}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-theme-text">{c.quantidade}x</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-theme-accent">
                              {formatCurrency((c.product_preco || 0) * c.quantidade)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-theme-text-muted">
                              {new Date(c.data).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* DAR BAIXA (Admin Only) */}
                              <button
                                onClick={() => toggleConsumptionPaid(c.id, c.pago)}
                                title={c.pago ? "Marcar como Pendente" : "Dar Baixa (Pago)"}
                                className={`p-2 rounded-lg transition-all ${
                                  c.pago 
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                                    : 'text-theme-text-muted hover:text-green-500 hover:bg-green-500/10'
                                } ${userRole !== 'admin' ? 'opacity-40 cursor-not-allowed' : ''}`}
                              >
                                {c.pago ? <Check size={16} strokeWidth={3} /> : <FileText size={16} />}
                              </button>

                              {/* REMOVER (Admin Only) */}
                              {userRole === 'admin' && (
                                <button
                                  onClick={() => deleteConsumption(c.id)}
                                  className="p-2 text-theme-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========== FUNCIONARIOS TAB ========== */}
        {activeTab === 'funcionarios' && (
          <motion.div
            key="funcionarios"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-theme-text">Funcionários Cadastrados</h3>
              <button
                onClick={() => setShowNewEmployee(true)}
                className="bg-theme-accent text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-theme-accent/20"
              >
                <UserPlus size={16} />
                Novo
              </button>
            </div>

            {/* New Employee Form */}
            <AnimatePresence>
              {showNewEmployee && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={createEmployee}
                  className="bg-theme-card p-5 rounded-2xl border border-theme-accent/20 flex items-center gap-3 overflow-hidden"
                >
                  <input
                    type="text"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="Nome do funcionário"
                    required
                    autoFocus
                    className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-sm text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isCreatingEmployee}
                    className="bg-theme-accent text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-60"
                  >
                    {isCreatingEmployee ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewEmployee(false); setNewEmployeeName(''); }}
                    className="p-2.5 hover:bg-theme-bg rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Employee List */}
            <div className="space-y-3">
              {employees.length === 0 ? (
                <div className="text-center py-16 bg-theme-card rounded-3xl border border-theme-border">
                  <Users size={48} className="mx-auto mb-4 text-theme-text-muted opacity-30" />
                  <p className="text-lg font-bold text-theme-text">Nenhum funcionário</p>
                  <p className="text-sm text-theme-text-muted">Cadastre funcionários para controlar o consumo.</p>
                </div>
              ) : (
                employees.map(emp => {
                  const stats = employeeStats[emp.id];
                  return (
                    <div
                      key={emp.id}
                      className={`bg-theme-card p-5 rounded-2xl border transition-all ${
                        emp.ativo ? 'border-theme-border' : 'border-red-500/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            emp.ativo ? 'bg-purple-500/10' : 'bg-red-500/10'
                          }`}>
                            <User size={18} className={emp.ativo ? 'text-purple-500' : 'text-red-500'} />
                          </div>
                          <div>
                            <p className="font-bold text-theme-text text-sm">{emp.nome}</p>
                            <p className="text-[10px] text-theme-text-muted">
                              {emp.ativo ? 'Ativo' : 'Inativo'} • Cadastrado em {new Date(emp.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {stats && (
                            <div className="text-right hidden md:block">
                              <p className="text-sm font-bold text-theme-accent">Pendente: {formatCurrency(stats.pendente)}</p>
                              <p className="text-[10px] text-theme-text-muted">Total: {formatCurrency(stats.total)} • {stats.count} itens</p>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleEmployeeActive(emp.id, emp.ativo)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                emp.ativo
                                  ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                  : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                              }`}
                            >
                              {emp.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => deleteEmployee(emp.id)}
                              className="p-2 text-theme-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

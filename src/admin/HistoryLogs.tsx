import React, { useState, useEffect } from 'react';
import { FileText, Search, Clock, User, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import type { ActionLog } from '../lib/logger';

export default function HistoryLogs() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('action_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('action_type', filterType);
      }

      const { data, error } = await query;
      if (!error) setLogs(data || []);
    } catch (err) {
      console.error('Fetch logs error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [filterType]);

  const filteredLogs = logs.filter(log => 
    log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'produto_edit': return { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'produto_delete': return { icon: Filter, color: 'text-red-500', bg: 'bg-red-500/10' };
      case 'estoque_edit': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'consumo_add': return { icon: User, color: 'text-green-500', bg: 'bg-green-500/10' };
      default: return { icon: FileText, color: 'text-theme-text-muted', bg: 'bg-theme-bg' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-theme-text">Histórico de Atividade</h2>
          <p className="text-theme-text-muted">Acompanhe quem fez o quê no sistema.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="bg-theme-bg border border-theme-border p-3 rounded-2xl text-theme-text-muted hover:text-theme-accent transition-all"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por usuário ou ação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-card border border-theme-border rounded-2xl py-4 pl-12 pr-4 text-theme-text focus:outline-none focus:border-theme-accent transition-all shadow-sm"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-theme-card border border-theme-border rounded-2xl px-6 py-4 text-theme-text focus:outline-none focus:border-theme-accent transition-all shadow-sm font-bold min-w-[200px]"
        >
          <option value="all">Todas as Ações</option>
          <option value="produto_edit">Edição de Produto</option>
          <option value="produto_delete">Exclusão de Produto</option>
          <option value="estoque_edit">Alteração de Estoque</option>
          <option value="consumo_add">Novo Consumo</option>
          <option value="consumo_pago">Baixa de Consumo</option>
        </select>
      </div>

      <div className="bg-theme-card rounded-[2.5rem] border border-theme-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={40} className="animate-spin text-theme-accent" />
            <p className="text-theme-text-muted font-bold animate-pulse">Carregando histórico...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-24 text-theme-text-muted">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-theme-border">
            {filteredLogs.map((log) => {
              const config = getLogIcon(log.action_type);
              const LogIcon = config.icon;
              return (
                <div key={log.id} className="p-6 hover:bg-theme-bg/30 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.bg}`}>
                      <LogIcon size={24} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-theme-text">{log.user_name}</p>
                        <span className="text-[10px] text-theme-text-muted font-bold uppercase tracking-wider">
                          {new Date(log.created_at || '').toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-theme-text-muted group-hover:text-theme-text transition-colors">
                        {log.description}
                      </p>
                      <p className="text-[10px] text-theme-accent font-bold mt-2 uppercase tracking-widest">
                        ID ALVO: {log.target_id}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

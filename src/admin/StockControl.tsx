import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, AlertTriangle, CheckCircle, Clock, ChevronDown,
  ArrowUpCircle, ArrowDownCircle, MinusCircle, Loader2,
  Search, Filter, Calendar, Save, FileText, ShoppingCart,
  Wine, UtensilsCrossed, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Product = {
  id: string;
  nome: string;
  categoria: string;
  subcategoria: string;
  imagem: string;
};

type StockEntry = {
  id: string;
  product_id: string;
  week_start: string;
  urgency: 'alta' | 'media' | 'baixa' | 'ok';
  quantity_estimate: number | null;
  notes: string;
  updated_by: string;
  updated_at: string;
};

type StockControlProps = {
  userRole: string;
  userName: string;
};

const URGENCY_CONFIG = {
  alta: { label: 'Urgente', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500 text-white', glow: 'shadow-red-500/30' },
  media: { label: 'Médio', icon: ArrowUpCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500 text-white', glow: 'shadow-amber-500/20' },
  baixa: { label: 'Baixo', icon: ArrowDownCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500 text-white', glow: '' },
  ok: { label: 'OK', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', badge: 'bg-green-500 text-white', glow: '' },
};

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export default function StockControl({ userRole, userName }: StockControlProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [editingEntries, setEditingEntries] = useState<Record<string, Partial<StockEntry>>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [currentWeek, setCurrentWeek] = useState(getWeekStart());
  const [showOnlyBebidas, setShowOnlyBebidas] = useState(true);
  const [showShoppingList, setShowShoppingList] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, stockRes] = await Promise.all([
        fetch('/api/products'),
        fetch(`/api/stock?week=${currentWeek}`),
      ]);

      if (prodRes.ok) {
        const allProducts = await prodRes.json();
        setProducts(allProducts);
      }
      if (stockRes.ok) {
        setStockEntries(await stockRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch stock data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentWeek]);

  const stockMap = useMemo(() => {
    const map: Record<string, StockEntry> = {};
    stockEntries.forEach(e => { map[e.product_id] = e; });
    return map;
  }, [stockEntries]);

  // Filter products based on category toggle
  const categoryFilteredProducts = useMemo(() => {
    if (showOnlyBebidas) {
      return products.filter(p => p.categoria === 'bebidas');
    }
    return products;
  }, [products, showOnlyBebidas]);

  const filteredProducts = useMemo(() => {
    return categoryFilteredProducts
      .filter(p => {
        const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subcategoria.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (filterUrgency === 'all') return matchesSearch;
        
        const entry = stockMap[p.id];
        if (filterUrgency === 'pendente') return matchesSearch && !entry;
        return matchesSearch && entry?.urgency === filterUrgency;
      })
      .sort((a, b) => {
        const urgencyOrder = { alta: 0, media: 1, baixa: 2, ok: 3 };
        const aUrgency = stockMap[a.id]?.urgency || 'ok';
        const bUrgency = stockMap[b.id]?.urgency || 'ok';
        return (urgencyOrder[aUrgency] ?? 4) - (urgencyOrder[bUrgency] ?? 4);
      });
  }, [categoryFilteredProducts, searchQuery, filterUrgency, stockMap]);

  // Shopping list: items that need to be purchased (alta + media)
  const shoppingList = useMemo(() => {
    return categoryFilteredProducts
      .filter(p => {
        const entry = stockMap[p.id];
        return entry && (entry.urgency === 'alta' || entry.urgency === 'media');
      })
      .sort((a, b) => {
        const urgencyOrder = { alta: 0, media: 1, baixa: 2, ok: 3 };
        const aUrgency = stockMap[a.id]?.urgency || 'ok';
        const bUrgency = stockMap[b.id]?.urgency || 'ok';
        return (urgencyOrder[aUrgency] ?? 4) - (urgencyOrder[bUrgency] ?? 4);
      });
  }, [categoryFilteredProducts, stockMap]);

  const getEditValue = (productId: string, field: keyof StockEntry) => {
    if (editingEntries[productId]?.[field] !== undefined) {
      return editingEntries[productId][field];
    }
    return stockMap[productId]?.[field] ?? '';
  };

  const updateLocalEntry = (productId: string, field: string, value: any) => {
    setEditingEntries(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const saveEntry = async (productId: string) => {
    setSavingIds(prev => new Set(prev).add(productId));

    const existing = stockMap[productId];
    const edits = editingEntries[productId] || {};
    const payload = {
      product_id: productId,
      week_start: currentWeek,
      urgency: edits.urgency ?? existing?.urgency ?? 'ok',
      quantity_estimate: edits.quantity_estimate ?? existing?.quantity_estimate ?? null,
      notes: edits.notes ?? existing?.notes ?? '',
      updated_by: userName,
    };

    try {
      const method = existing ? 'PUT' : 'POST';
      const url = existing ? `/api/stock/${existing.id}` : '/api/stock';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Remove from editing
        setEditingEntries(prev => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
        fetchData();
      }
    } catch (err) {
      console.error('Save stock error:', err);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const urgencyCounts = useMemo(() => {
    const counts = { alta: 0, media: 0, baixa: 0, ok: 0, pendente: 0 };
    categoryFilteredProducts.forEach(p => {
      const entry = stockMap[p.id];
      if (!entry) counts.pendente++;
      else counts[entry.urgency]++;
    });
    return counts;
  }, [categoryFilteredProducts, stockMap]);

  const weekLabel = useMemo(() => {
    const start = new Date(currentWeek + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    return `${fmt(start)} — ${fmt(end)}`;
  }, [currentWeek]);

  const goToPrevWeek = () => {
    const d = new Date(currentWeek + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setCurrentWeek(d.toISOString().split('T')[0]);
  };

  const goToNextWeek = () => {
    const d = new Date(currentWeek + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setCurrentWeek(d.toISOString().split('T')[0]);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(getWeekStart());
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-3xl font-bold font-serif text-theme-text">Controle de Estoque</h2>
        <p className="text-theme-text-muted">Gerencie a urgência de compra dos produtos semanalmente.</p>
      </header>

      {/* Category Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex bg-theme-card p-1 rounded-xl border border-theme-border">
          <button
            onClick={() => setShowOnlyBebidas(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              showOnlyBebidas
                ? 'bg-theme-accent text-white shadow-lg shadow-theme-accent/20'
                : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <Wine size={16} />
            Apenas Bebidas
          </button>
          <button
            onClick={() => setShowOnlyBebidas(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              !showOnlyBebidas
                ? 'bg-theme-accent text-white shadow-lg shadow-theme-accent/20'
                : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <Package size={16} />
            Todos os Produtos
          </button>
        </div>
        <span className="text-xs text-theme-text-muted">
          {categoryFilteredProducts.length} produtos
        </span>
      </div>

      {/* Week Navigation */}
      <div className="bg-theme-card p-4 rounded-2xl border border-theme-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-theme-accent" />
          <span className="text-sm font-bold text-theme-text">Semana:</span>
          <span className="text-sm text-theme-text-muted">{weekLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToPrevWeek} className="px-3 py-1.5 text-xs font-bold bg-theme-bg border border-theme-border rounded-lg hover:bg-theme-border/50 transition-all">← Anterior</button>
          <button onClick={goToCurrentWeek} className="px-3 py-1.5 text-xs font-bold bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 transition-all">Atual</button>
          <button onClick={goToNextWeek} className="px-3 py-1.5 text-xs font-bold bg-theme-bg border border-theme-border rounded-lg hover:bg-theme-border/50 transition-all">Próxima →</button>
        </div>
      </div>

      {/* URGENT Shopping List */}
      {shoppingList.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowShoppingList(!showShoppingList)}
            className="w-full"
          >
            <div className={`bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 p-4 rounded-2xl border-2 border-red-500/30 flex items-center justify-between transition-all hover:border-red-500/50 ${urgencyCounts.alta > 0 ? 'animate-pulse-subtle' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={20} className="text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-theme-text">
                    🛒 Lista de Compras Urgente
                  </p>
                  <p className="text-xs text-theme-text-muted">
                    {shoppingList.length} {shoppingList.length === 1 ? 'produto precisa' : 'produtos precisam'} ser comprado{shoppingList.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {urgencyCounts.alta > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-bounce">
                    {urgencyCounts.alta} URGENTE{urgencyCounts.alta > 1 ? 'S' : ''}
                  </span>
                )}
                {urgencyCounts.media > 0 && (
                  <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                    {urgencyCounts.media} MÉDIO{urgencyCounts.media > 1 ? 'S' : ''}
                  </span>
                )}
                <ChevronDown size={18} className={`text-theme-text-muted transition-transform ${showShoppingList ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          <AnimatePresence>
            {showShoppingList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {shoppingList.map(product => {
                    const entry = stockMap[product.id];
                    const urgency = entry?.urgency || 'ok';
                    const config = URGENCY_CONFIG[urgency];
                    const Icon = config.icon;

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-3 rounded-xl border ${config.border} ${config.bg} transition-all ${urgency === 'alta' ? 'shadow-lg ' + config.glow : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={config.color} />
                          <div>
                            <p className="text-sm font-bold text-theme-text">{product.nome}</p>
                            <p className="text-[10px] text-theme-text-muted">{product.subcategoria}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {entry?.quantity_estimate != null && (
                            <span className="text-xs text-theme-text-muted">
                              Qtd: <span className="font-bold text-theme-text">{entry.quantity_estimate}</span>
                            </span>
                          )}
                          {entry?.notes && (
                            <span className="text-[10px] text-theme-text-muted max-w-[150px] truncate hidden md:block">
                              💬 {entry.notes}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badge}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(URGENCY_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterUrgency(filterUrgency === key ? 'all' : key)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                filterUrgency === key
                  ? `${config.bg} ${config.border} ring-2 ring-offset-2 ring-offset-theme-bg`
                  : 'bg-theme-card border-theme-border hover:bg-theme-bg'
              }`}
              style={filterUrgency === key ? { ringColor: config.color.replace('text-', '') } : {}}
            >
              <Icon size={20} className={config.color} />
              <p className="text-2xl font-bold text-theme-text mt-2">{urgencyCounts[key as keyof typeof urgencyCounts]}</p>
              <p className="text-xs text-theme-text-muted font-medium">{config.label}</p>
            </button>
          );
        })}
        <button
          onClick={() => setFilterUrgency(filterUrgency === 'pendente' ? 'all' : 'pendente')}
          className={`p-4 rounded-2xl border transition-all text-left ${
            filterUrgency === 'pendente'
              ? 'bg-theme-text-muted/10 border-theme-text-muted/30 ring-2 ring-offset-2 ring-offset-theme-bg'
              : 'bg-theme-card border-theme-border hover:bg-theme-bg'
          }`}
        >
          <Clock size={20} className="text-theme-text-muted" />
          <p className="text-2xl font-bold text-theme-text mt-2">{urgencyCounts.pendente}</p>
          <p className="text-xs text-theme-text-muted font-medium">Pendente</p>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted" size={20} />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-theme-card border border-theme-border rounded-2xl py-4 pl-12 pr-4 text-theme-text focus:outline-none focus:border-theme-accent transition-all shadow-sm"
        />
      </div>

      {/* Product List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-theme-accent" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => {
            const entry = stockMap[product.id];
            const urgency = (getEditValue(product.id, 'urgency') || 'ok') as keyof typeof URGENCY_CONFIG;
            const config = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.ok;
            const Icon = config.icon;
            const hasEdits = !!editingEntries[product.id];
            const isSaving = savingIds.has(product.id);
            const isUrgent = urgency === 'alta';

            return (
              <motion.div
                key={product.id}
                layout
                className={`bg-theme-card rounded-2xl border ${config.border} p-4 md:p-5 transition-all ${isUrgent ? 'shadow-xl ' + config.glow + ' ring-1 ring-red-500/20' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Product Info */}
                  <div className="flex items-center gap-3 md:w-1/4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg} ${isUrgent ? 'animate-pulse' : ''}`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-theme-text text-sm truncate">{product.nome}</p>
                      <p className="text-[10px] text-theme-text-muted">{product.categoria} › {product.subcategoria}</p>
                    </div>
                  </div>

                  {/* Urgency Select */}
                  <div className="md:w-1/5">
                    <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider block mb-1">Urgência de Compra</label>
                    <select
                      value={urgency}
                      onChange={(e) => updateLocalEntry(product.id, 'urgency', e.target.value)}
                      className={`w-full bg-theme-bg border rounded-lg px-3 py-2 text-sm text-theme-text focus:outline-none focus:border-theme-accent transition-all ${isUrgent ? 'border-red-500/50 font-bold' : 'border-theme-border'}`}
                    >
                      <option value="ok">✅ OK - Tem estoque</option>
                      <option value="baixa">🔵 Baixo - Pode comprar</option>
                      <option value="media">🟡 Médio - Comprar logo</option>
                      <option value="alta">🔴 URGENTE - Acabando!</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="md:w-1/6">
                    <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider block mb-1">Qtd. em Estoque</label>
                    <input
                      type="number"
                      min={0}
                      value={getEditValue(product.id, 'quantity_estimate') ?? ''}
                      onChange={(e) => updateLocalEntry(product.id, 'quantity_estimate', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="—"
                      className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2 text-sm text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                    />
                  </div>

                  {/* Notes */}
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider block mb-1">Observação</label>
                    <input
                      type="text"
                      value={getEditValue(product.id, 'notes') ?? ''}
                      onChange={(e) => updateLocalEntry(product.id, 'notes', e.target.value)}
                      placeholder="Ex: Acabou ontem, precisa pra sexta..."
                      className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2 text-sm text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                    />
                  </div>

                  {/* Save */}
                  <div className="flex items-end">
                    <button
                      onClick={() => saveEntry(product.id)}
                      disabled={isSaving || (!hasEdits && !!entry)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                        hasEdits
                          ? 'bg-theme-accent text-white hover:scale-105 shadow-lg shadow-theme-accent/20'
                          : 'bg-theme-bg border border-theme-border text-theme-text-muted'
                      } disabled:opacity-40`}
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Salvar
                    </button>
                  </div>
                </div>

                {/* Last update info */}
                {entry?.updated_at && (
                  <p className="text-[10px] text-theme-text-muted mt-2 pl-13">
                    Atualizado por {entry.updated_by || '—'} em {new Date(entry.updated_at).toLocaleString('pt-BR')}
                  </p>
                )}
              </motion.div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 text-theme-text-muted">
              <Package size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold">Nenhum produto encontrado</p>
              <p className="text-sm">Tente buscar com outros termos.</p>
            </div>
          )}
        </div>
      )}

      {/* Custom CSS for subtle pulse animation */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}

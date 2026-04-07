import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  LayoutDashboard,
  MessageSquare,
  ArrowLeft,
  Lock,
  LogOut,
  Image as ImageIcon,
  Check,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Product = {
  id: string;
  nome: string;
  desc: string;
  preco: number;
  imagem: string;
  categoria: string;
  subcategoria: string;
  popular: boolean;
  tags: string[];
  ingredientes: string[];
  variacoes: any[];
  oculto: boolean;
};

type AppSettings = {
  whatsapp: string;
  max_reservations: string;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function Admin({ onBack }: { onBack: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ whatsapp: '', max_reservations: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Default product for "New Product"
  const defaultProduct: Omit<Product, 'id'> = {
    nome: '',
    desc: '',
    preco: 0,
    imagem: '',
    categoria: 'comidas',
    subcategoria: 'Geral',
    popular: false,
    tags: [],
    ingredientes: [],
    variacoes: [],
    oculto: false
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('borgert_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, settingsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/settings')
      ]);

      if (productsRes.ok && settingsRes.ok) {
        setProducts(await productsRes.json());
        setSettings(await settingsRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password for demo purposes. In a real app this would be secure.
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('borgert_admin_auth', 'true');
      fetchData();
    } else {
      alert('Senha incorreta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('borgert_admin_auth');
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const method = editingProduct.id ? 'PUT' : 'POST';
    const url = editingProduct.id ? `/api/products/${editingProduct.id}` : '/api/products';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        fetchData();
      } else {
        alert('Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Save product error:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Delete product error:', error);
    }
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        alert('Configurações atualizadas!');
      }
    } catch (error) {
      console.error('Update settings error:', error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subcategoria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-card p-8 rounded-3xl border border-theme-border shadow-2xl w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-theme-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-theme-accent" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-theme-text mb-2">Área Administrativa</h1>
          <p className="text-theme-text-muted text-sm mb-8">Digite sua senha para acessar as configurações</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha secreta"
              autoFocus
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
            />
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={onBack}
                className="flex-1 bg-theme-border/20 text-theme-text py-3 rounded-xl font-bold hover:bg-theme-border/40 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Voltar
              </button>
              <button 
                type="submit"
                className="flex-[2] bg-theme-accent text-white py-3 rounded-xl font-bold hover:bg-theme-accent/90 transition-all"
              >
                Entrar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-theme-card border-b md:border-b-0 md:border-r border-theme-border flex flex-col shrink-0">
        <div className="p-6 border-b border-theme-border">
          <h2 className="text-xl font-bold text-theme-accent font-serif uppercase tracking-wider">Admin Borgert</h2>
          <p className="text-[10px] text-theme-text-muted uppercase tracking-widest mt-1">Painel de Controle</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-theme-accent text-white shadow-lg shadow-theme-accent/20' : 'text-theme-text-muted hover:bg-theme-bg hover:text-theme-text'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-semibold text-sm">Resumo</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-theme-accent text-white shadow-lg shadow-theme-accent/20' : 'text-theme-text-muted hover:bg-theme-bg hover:text-theme-text'}`}
          >
            <Package size={20} />
            <span className="font-semibold text-sm">Produtos</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-theme-accent text-white shadow-lg shadow-theme-accent/20' : 'text-theme-text-muted hover:bg-theme-bg hover:text-theme-text'}`}
          >
            <Settings size={20} />
            <span className="font-semibold text-sm">Configurações</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-theme-border space-y-2">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-theme-text-muted hover:bg-theme-bg hover:text-theme-text transition-all"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">Ver Site</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            <span className="font-semibold text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <header>
                    <h2 className="text-3xl font-bold font-serif text-theme-text">Bem-vindo, Admin</h2>
                    <p className="text-theme-text-muted">Aqui está o resumo da sua loja hoje.</p>
                  </header>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Package className="text-blue-500" size={24} />
                      </div>
                      <h3 className="text-3xl font-bold text-theme-text">{products.length}</h3>
                      <p className="text-theme-text-muted text-sm font-medium">Produtos Cadastrados</p>
                    </div>
                    <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm">
                      <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <MessageSquare className="text-green-500" size={24} />
                      </div>
                      <h3 className="text-3xl font-bold text-theme-text">{settings.whatsapp.replace(/^55/, '')}</h3>
                      <p className="text-theme-text-muted text-sm font-medium">WhatsApp Ativo</p>
                    </div>
                    <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Package className="text-purple-500" size={24} />
                      </div>
                      <h3 className="text-3xl font-bold text-theme-text">{products.filter(p => p.oculto).length}</h3>
                      <p className="text-theme-text-muted text-sm font-medium">Itens Ocultos</p>
                    </div>
                  </div>
                  
                  <div className="bg-theme-card p-8 rounded-3xl border border-theme-border shadow-sm">
                    <h3 className="text-xl font-bold text-theme-text mb-6">Ações Rápidas</h3>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => { setEditingProduct(defaultProduct as any); setIsProductModalOpen(true); }}
                        className="bg-theme-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-theme-accent/20"
                      >
                        <Plus size={20} />
                        Novo Produto
                      </button>
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="bg-theme-bg border border-theme-border text-theme-text px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-theme-card transition-all"
                      >
                        <Settings size={20} />
                        Ajustar WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div 
                  key="products"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold font-serif text-theme-text">Produtos</h2>
                      <p className="text-theme-text-muted">Gerencie o seu cardápio completo.</p>
                    </div>
                    <button 
                      onClick={() => { setEditingProduct(defaultProduct as any); setIsProductModalOpen(true); }}
                      className="bg-theme-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-theme-accent/20"
                    >
                      <Plus size={20} />
                      Novo Produto
                    </button>
                  </header>
                  
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted" size={20} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome, categoria ou subcategoria..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-theme-card border border-theme-border rounded-2xl py-4 pl-12 pr-4 text-theme-text focus:outline-none focus:border-theme-accent transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="bg-theme-card rounded-3xl border border-theme-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-theme-bg/50 border-b border-theme-border">
                            <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Item</th>
                            <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                          {filteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-theme-bg/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-theme-bg border border-theme-border overflow-hidden shrink-0">
                                    {p.imagem ? (
                                      <img src={p.imagem} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-theme-text-muted">
                                        <ImageIcon size={16} />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-theme-text text-sm">{p.nome}</p>
                                    <p className="text-[10px] text-theme-text-muted truncate max-w-[150px]">{p.desc}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-medium text-theme-text-muted">{p.categoria} › {p.subcategoria}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-theme-accent">{formatCurrency(p.preco)}</span>
                              </td>
                              <td className="px-6 py-4">
                                {p.oculto ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
                                    <EyeOff size={10} /> Oculto
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
                                    <Eye size={10} /> Visível
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                    className="p-2 text-theme-text-muted hover:text-theme-accent hover:bg-theme-accent/10 rounded-lg transition-all"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button 
                                    onClick={() => deleteProduct(p.id)}
                                    className="p-2 text-theme-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <header>
                    <h2 className="text-3xl font-bold font-serif text-theme-text">Configurações</h2>
                    <p className="text-theme-text-muted">Ajuste os canais de contato e regras do site.</p>
                  </header>
                  
                  <form onSubmit={updateSettings} className="bg-theme-card p-8 rounded-3xl border border-theme-border shadow-sm max-w-2xl space-y-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-theme-text">WhatsApp de Reservas</label>
                          <input 
                            type="text" 
                            value={settings.whatsapp}
                            onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                            placeholder="Ex: 5511999999999"
                            className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                          />
                          <p className="text-[10px] text-theme-text-muted">Inclua o 55 (Brasil) e o DDD.</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-theme-text">Máximo de Pessoas (Reserva)</label>
                          <input 
                            type="number" 
                            value={settings.max_reservations}
                            onChange={(e) => setSettings({...settings, max_reservations: e.target.value})}
                            className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                          />
                          <p className="text-[10px] text-theme-text-muted">Limite para reservas diretas via form.</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      className="bg-theme-accent text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-theme-accent/20"
                    >
                      <Save size={20} />
                      Salvar Alterações
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-theme-overlay/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-theme-card w-full max-w-2xl max-h-[90vh] rounded-3xl border border-theme-border shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-theme-border flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-theme-text">
                  {editingProduct.id ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button 
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-2 hover:bg-theme-bg rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={saveProduct} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">Nome do Produto</label>
                      <input 
                        type="text" 
                        required
                        value={editingProduct.nome}
                        onChange={(e) => setEditingProduct({...editingProduct, nome: e.target.value})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">Preço (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={editingProduct.preco}
                        onChange={(e) => setEditingProduct({...editingProduct, preco: parseFloat(e.target.value)})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">Categoria</label>
                      <select 
                        value={editingProduct.categoria}
                        onChange={(e) => setEditingProduct({...editingProduct, categoria: e.target.value})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                      >
                        <option value="comidas">Comidas</option>
                        <option value="bebidas">Bebidas</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">Subcategoria</label>
                      <input 
                        type="text" 
                        required
                        value={editingProduct.subcategoria}
                        onChange={(e) => setEditingProduct({...editingProduct, subcategoria: e.target.value})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                        placeholder="Ex: Porções, Vinhos, Massas..."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">URL da Imagem</label>
                      <input 
                        type="text" 
                        value={editingProduct.imagem}
                        onChange={(e) => setEditingProduct({...editingProduct, imagem: e.target.value})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">Descrição</label>
                      <textarea 
                        rows={5}
                        value={editingProduct.desc}
                        onChange={(e) => setEditingProduct({...editingProduct, desc: e.target.value})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div 
                          onClick={() => setEditingProduct({...editingProduct, popular: !editingProduct.popular})}
                          className={`w-10 h-6 rounded-full transition-all relative ${editingProduct.popular ? 'bg-theme-accent' : 'bg-theme-border'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.popular ? 'left-5' : 'left-1'}`} />
                        </div>
                        <span className="text-sm font-bold text-theme-text">Item Popular (Selo)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div 
                          onClick={() => setEditingProduct({...editingProduct, oculto: !editingProduct.oculto})}
                          className={`w-10 h-6 rounded-full transition-all relative ${editingProduct.oculto ? 'bg-red-500' : 'bg-theme-border'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.oculto ? 'left-5' : 'left-1'}`} />
                        </div>
                        <span className="text-sm font-bold text-theme-text text-red-500">Ocultar do Cardápio</span>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
              
              <div className="p-6 border-t border-theme-border bg-theme-bg/50 flex justify-end gap-4 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-theme-text-muted hover:text-theme-text transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveProduct}
                  className="bg-theme-accent text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <Save size={18} />
                  Salvar Produto
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

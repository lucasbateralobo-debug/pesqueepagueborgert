import React, { useState, useEffect } from "react";
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
  LogOut,
  Image as ImageIcon,
  Check,
  Search,
  Users,
  Boxes,
  Coffee,
  Shield,
  Loader2,
  Cake,
  Gift,
  Upload,
  FileText,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";
import type { AppUser, UserRole } from "./lib/supabase";
import LoginScreen from "./admin/LoginScreen";
import UserManagement from "./admin/UserManagement";
import StockControl from "./admin/StockControl";
import EmployeeConsumption from "./admin/EmployeeConsumption";
import HistoryLogs from "./admin/HistoryLogs";
import { logAction } from "./lib/logger";

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
  destaque: boolean;
  preco_promocional: number | null;
  destaque_label: string;
};

type AppSettings = {
  whatsapp: string;
  max_reservations: string;
  birthday_items: string;
};

type AdminTab =
  | "dashboard"
  | "products"
  | "settings"
  | "users"
  | "stock"
  | "employees"
  | "birthday"
  | "history";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Define which tabs each role can access
const ROLE_TABS: Record<UserRole, AdminTab[]> = {
  admin: [
    "dashboard",
    "products",
    "settings",
    "users",
    "stock",
    "employees",
    "birthday",
    "history",
  ],
  estoque: ["stock"],
  funcionarios: ["employees"],
};

const TAB_CONFIG: Record<AdminTab, { label: string; icon: any }> = {
  dashboard: { label: "Resumo", icon: LayoutDashboard },
  products: { label: "Produtos", icon: Package },
  settings: { label: "Configurações", icon: Settings },
  users: { label: "Usuários", icon: Users },
  stock: { label: "Estoque", icon: Boxes },
  employees: { label: "Funcionários", icon: Coffee },
  birthday: { label: "Aniversário", icon: Cake },
  history: { label: "Histórico", icon: FileText },
};

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export default function Admin({ onBack }: { onBack: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    whatsapp: "",
    max_reservations: "",
    birthday_items: "[]",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [editingStock, setEditingStock] = useState<number | "">("");

  useEffect(() => {
    if (isProductModalOpen && editingProduct?.id) {
      const fetchStock = async () => {
        try {
          const week = getWeekStart();
          const res = await fetch(`/api/stock?week=${week}`);
          if (res.ok) {
            const data = await res.json();
            const entry = data.find((e: any) => e.product_id === editingProduct.id);
            setEditingStock(entry ? entry.quantity_estimate ?? "" : "");
          }
        } catch (err) {
          console.error("Error fetching product stock:", err);
        }
      };
      fetchStock();
    } else {
      setEditingStock("");
    }
  }, [isProductModalOpen, editingProduct?.id]);

  const defaultProduct: Omit<Product, "id"> = {
    nome: "",
    desc: "",
    preco: 0,
    imagem: "",
    categoria: "comidas",
    subcategoria: "Geral",
    popular: false,
    tags: [],
    ingredientes: [],
    variacoes: [],
    oculto: false,
    destaque: false,
    preco_promocional: null,
    destaque_label: "",
  };

  // Check existing Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email || "");
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const res = await fetch(`/api/app-users/${userId}`);
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setIsAuthenticated(true);

        // Set default tab based on role
        const tabs = ROLE_TABS[user.role as UserRole] || [];
        if (tabs.length > 0) {
          setActiveTab(tabs[0]);
        }
        fetchData();
      } else if (res.status === 404) {
        // First login — create as admin if no users exist
        const countRes = await fetch("/api/app-users");
        const allUsers = await countRes.json();

        const role: UserRole = allUsers.length === 0 ? "admin" : "estoque";

        const createRes = await fetch("/api/app-users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: userId,
            email,
            nome: email.split("@")[0],
            role,
          }),
        });

        if (createRes.ok) {
          const newUser = await createRes.json();
          setCurrentUser(newUser);
          setIsAuthenticated(true);
          const tabs = ROLE_TABS[newUser.role as UserRole] || [];
          if (tabs.length > 0) setActiveTab(tabs[0]);
          fetchData();
        }
      }
    } catch (err) {
      console.error("Load user profile error:", err);
    }
  };

  const handleLoginSuccess = async (userId: string, email: string) => {
    await loadUserProfile(userId, email);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, settingsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/settings"),
      ]);

      if (productsRes.ok && settingsRes.ok) {
        setProducts(await productsRes.json());
        setSettings(await settingsRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const method = editingProduct.id ? "PUT" : "POST";
    const url = editingProduct.id
      ? `/api/products/${editingProduct.id}`
      : "/api/products";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        const savedProduct = await res.json();

        // Save Stock if provided
        if (editingStock !== "") {
          try {
            await fetch("/api/stock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product_id: savedProduct.id,
                week_start: getWeekStart(),
                quantity_estimate: Number(editingStock),
                updated_by: currentUser?.nome || currentUser?.email || "Admin",
              }),
            });
          } catch (err) {
            console.error("Error saving stock from product modal:", err);
          }
        }

        // LOG ACTION
        await logAction({
          user_id: currentUser?.id || "",
          user_name: currentUser?.nome || currentUser?.email || "Unknown",
          action_type:
            editingProduct.categoria === "aniversario"
              ? "aniversario_edit"
              : "produto_edit",
          description: `Atualizou produto e estoque: ${editingProduct.nome}`,
          target_id: savedProduct.id,
        });

        setIsProductModalOpen(false);
        fetchData();
      } else {
        alert("Erro ao salvar produto");
      }
    } catch (error) {
      console.error("Save product error:", error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        // LOG ACTION
        await logAction({
          user_id: currentUser?.id || "",
          user_name: currentUser?.nome || currentUser?.email || "Unknown",
          action_type: "produto_delete",
          description: `Removeu produto ID: ${id}`,
          target_id: id,
        });
        fetchData();
      }
    } catch (error) {
      console.error("Delete product error:", error);
    }
  };

  const duplicateProduct = async (product: Product) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...productData } = product;
    const newProduct = {
      ...productData,
      nome: `${product.nome} (Cópia)`,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        // LOG ACTION
        await logAction({
          user_id: currentUser?.id || "",
          user_name: currentUser?.nome || currentUser?.email || "Unknown",
          action_type: "produto_edit",
          description: `Duplicou produto: ${product.nome}`,
          target_id: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error("Duplicate product error:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir ${selectedProductIds.length} produtos selecionados?`,
      )
    )
      return;

    setIsBulkDeleting(true);
    try {
      const res = await fetch("/api/products-bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProductIds }),
      });

      if (res.ok) {
        await logAction({
          user_id: currentUser?.id || "",
          user_name: currentUser?.nome || currentUser?.email || "Unknown",
          action_type: "produto_delete",
          description: `Excluiu ${selectedProductIds.length} produtos em massa`,
          target_id: "bulk",
        });
        setSelectedProductIds([]);
        fetchData();
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert("Configurações atualizadas!");
      }
    } catch (error) {
      console.error("Update settings error:", error);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategoria.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Loading splash
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-theme-accent" />
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return <LoginScreen onBack={onBack} onLoginSuccess={handleLoginSuccess} />;
  }

  const userRole = (currentUser?.role || "estoque") as UserRole;
  const allowedTabs = ROLE_TABS[userRole] || [];

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-64 bg-theme-card border-r border-theme-border flex-col shrink-0">
        <div className="p-6 border-b border-theme-border">
          <h2 className="text-xl font-bold text-theme-accent font-serif uppercase tracking-wider">
            Admin Borgert
          </h2>
          <p className="text-[10px] text-theme-text-muted uppercase tracking-widest mt-1">
            Painel de Controle
          </p>
          {currentUser && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-7 h-7 bg-theme-accent/10 rounded-lg flex items-center justify-center">
                <Shield size={14} className="text-theme-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-theme-text truncate">
                  {currentUser.nome || currentUser.email}
                </p>
                <p className="text-[9px] text-theme-text-muted uppercase tracking-wider">
                  {userRole === "admin"
                    ? "Administrador"
                    : userRole === "estoque"
                      ? "Estoque"
                      : "Funcionários"}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {allowedTabs.map((tabKey) => {
            const config = TAB_CONFIG[tabKey];
            const Icon = config.icon;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tabKey ? "bg-theme-accent text-white shadow-lg shadow-theme-accent/20" : "text-theme-text-muted hover:bg-theme-bg hover:text-theme-text"}`}
              >
                <Icon size={20} />
                <span className="font-semibold text-sm">{config.label}</span>
              </button>
            );
          })}
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold"
          >
            <LogOut size={20} />
            <span className="font-semibold text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-50 bg-theme-bg/80 backdrop-blur-md border-b border-theme-border flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-theme-accent/10 rounded-2xl flex items-center justify-center">
            {activeTab &&
              React.createElement(TAB_CONFIG[activeTab].icon, {
                size: 20,
                className: "text-theme-accent",
              })}
          </div>
          <div>
            <h1 className="text-lg font-bold text-theme-text tracking-tight">
              {TAB_CONFIG[activeTab]?.label || "Admin"}
            </h1>
            <p className="text-[10px] text-theme-text-muted uppercase tracking-widest leading-none">
              Borgert Admin
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-theme-text-muted hover:text-red-500 active:scale-90 transition-all font-bold"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-theme-card/95 backdrop-blur-lg border-t border-theme-border flex justify-around items-center px-4 py-2 safe-pb h-[72px] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        {allowedTabs.map((tabKey) => {
          const config = TAB_CONFIG[tabKey];
          const Icon = config.icon;
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className="relative flex flex-col items-center justify-center w-16 h-14 transition-all active:scale-90"
            >
              <div
                className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? "bg-theme-accent text-white -translate-y-1 shadow-lg shadow-theme-accent/30" : "text-theme-text-muted"}`}
              >
                <Icon size={isActive ? 20 : 18} />
              </div>
              <span
                className={`text-[9px] mt-1 font-bold transition-all duration-300 ${isActive ? "opacity-100 text-theme-accent" : "opacity-60 text-theme-text-muted"}`}
              >
                {config.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -top-2 w-1 h-1 bg-theme-accent rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {isLoading && activeTab !== "stock" && activeTab !== "employees" ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {/* DASHBOARD */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <header>
                    <h2 className="text-3xl font-bold font-serif text-theme-text">
                      Bem-vindo, {currentUser?.nome || "Admin"}
                    </h2>
                    <p className="text-theme-text-muted">
                      Aqui está o resumo da sua loja hoje.
                    </p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm flex flex-col justify-center">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-3">
                        <Package className="text-blue-500" size={20} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-theme-text">
                        {products.length}
                      </h3>
                      <p className="text-theme-text-muted text-[10px] uppercase tracking-wider font-bold">
                        Produtos Cadastrados
                      </p>
                    </div>
                    <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm flex flex-col justify-center">
                      <div className="w-10 h-10 bg-green-500/10 rounded-2xl flex items-center justify-center mb-3">
                        <MessageSquare className="text-green-500" size={20} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-theme-text truncate px-1">
                        {(() => {
                          try {
                            const list = JSON.parse(settings.whatsapp);
                            if (Array.isArray(list)) return `${list.length} Contatos`;
                            return String(settings.whatsapp).replace(/^55/, "");
                          } catch {
                            return String(settings.whatsapp).replace(/^55/, "");
                          }
                        })()}
                      </h3>
                      <p className="text-theme-text-muted text-[10px] uppercase tracking-wider font-bold">
                        WhatsApp Ativo
                      </p>
                    </div>
                    <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm flex flex-col justify-center">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-3">
                        <Package className="text-purple-500" size={20} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-theme-text">
                        {products.filter((p) => p.oculto).length}
                      </h3>
                      <p className="text-theme-text-muted text-[10px] uppercase tracking-wider font-bold">
                        Itens Ocultos
                      </p>
                    </div>
                  </div>

                  <div className="bg-theme-card p-8 rounded-3xl border border-theme-border shadow-sm">
                    <h3 className="text-xl font-bold text-theme-text mb-6">
                      Ações Rápidas
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => {
                          setEditingProduct(defaultProduct as any);
                          setIsProductModalOpen(true);
                        }}
                        className="bg-theme-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-theme-accent/20"
                      >
                        <Plus size={20} />
                        Novo Produto
                      </button>
                      <button
                        onClick={() => setActiveTab("settings")}
                        className="bg-theme-bg border border-theme-border text-theme-text px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-theme-card transition-all"
                      >
                        <Settings size={20} />
                        Ajustar WhatsApp
                      </button>
                      <button
                        onClick={() => setActiveTab("stock")}
                        className="bg-theme-bg border border-theme-border text-theme-text px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-theme-card transition-all"
                      >
                        <Boxes size={20} />
                        Ver Estoque
                      </button>
                      <button
                        onClick={() => setActiveTab("employees")}
                        className="bg-theme-bg border border-theme-border text-theme-text px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-theme-card transition-all"
                      >
                        <Coffee size={20} />
                        Consumo Funcionários
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PRODUCTS */}
              {activeTab === "products" && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold font-serif text-theme-text">
                        Produtos
                      </h2>
                      <p className="text-theme-text-muted">
                        Gerencie o seu cardápio completo.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedProductIds.length > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          disabled={isBulkDeleting}
                          className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                        >
                          {isBulkDeleting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                          Excluir ({selectedProductIds.length})
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingProduct(defaultProduct as any);
                          setIsProductModalOpen(true);
                        }}
                        className="bg-theme-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-theme-accent/20"
                      >
                        <Plus size={20} />
                        Novo Produto
                      </button>
                    </div>
                  </header>

                  <div className="relative mb-6">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted"
                      size={20}
                    />
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
                            <th className="px-6 py-4 w-10">
                              <input
                                type="checkbox"
                                checked={
                                  selectedProductIds.length ===
                                    filteredProducts.length &&
                                  filteredProducts.length > 0
                                }
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded border-theme-border text-theme-accent focus:ring-theme-accent"
                              />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">
                              Categoria
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">
                              Preço
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-1 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider text-right">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                          {filteredProducts.map((p) => (
                             <tr
                              key={p.id}
                              className={`hover:bg-theme-bg/30 transition-colors ${selectedProductIds.includes(p.id) ? "bg-theme-accent/5" : ""}`}
                            >
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedProductIds.includes(p.id)}
                                  onChange={() => toggleSelectProduct(p.id)}
                                  className="w-4 h-4 rounded border-theme-border text-theme-accent focus:ring-theme-accent"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-theme-bg border border-theme-border overflow-hidden shrink-0">
                                    {p.imagem ? (
                                      <img
                                        src={p.imagem}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-theme-text-muted">
                                        <ImageIcon size={16} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-theme-text text-sm truncate">
                                      {p.nome}
                                    </p>
                                    <p className="text-[10px] text-theme-text-muted truncate max-w-[150px]">
                                      {p.desc}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-medium text-theme-text-muted">
                                  {p.categoria} › {p.subcategoria}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-theme-accent">
                                  {formatCurrency(p.preco)}
                                </span>
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
                              <td className="px-1 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => duplicateProduct(p)}
                                    title="Duplicar"
                                    className="p-1.5 text-theme-text-muted hover:text-theme-accent hover:bg-theme-accent/10 rounded-lg transition-all"
                                  >
                                    <Copy size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setIsProductModalOpen(true);
                                    }}
                                    title="Editar"
                                    className="p-1.5 text-theme-text-muted hover:text-theme-accent hover:bg-theme-accent/10 rounded-lg transition-all"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(p.id)}
                                    title="Excluir"
                                    className="p-1.5 text-theme-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                  >
                                    <Trash2 size={16} />
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

              {/* SETTINGS */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {(() => {
                    const parsedWhatsappList = (() => {
                      try {
                        const list = JSON.parse(settings.whatsapp);
                        return Array.isArray(list)
                          ? list
                          : [
                              {
                                nome: "Atendimento",
                                numero: settings.whatsapp,
                              },
                            ];
                      } catch {
                        return [
                          {
                            nome: "Atendimento",
                            numero: settings.whatsapp || "",
                          },
                        ];
                      }
                    })();

                    const updateWhatsappNumber = (
                      index: number,
                      key: string,
                      value: string,
                    ) => {
                      const newList = [...parsedWhatsappList];
                      newList[index][key] = value;
                      setSettings({
                        ...settings,
                        whatsapp: JSON.stringify(newList),
                      });
                    };

                    const addWhatsappNumber = () => {
                      const newList = [
                        ...parsedWhatsappList,
                        { nome: "", numero: "" },
                      ];
                      setSettings({
                        ...settings,
                        whatsapp: JSON.stringify(newList),
                      });
                    };

                    const removeWhatsappNumber = (index: number) => {
                      const newList = parsedWhatsappList.filter(
                        (_, i) => i !== index,
                      );
                      if (newList.length === 0)
                        newList.push({ nome: "Atendimento", numero: "" });
                      setSettings({
                        ...settings,
                        whatsapp: JSON.stringify(newList),
                      });
                    };

                    return (
                      <React.Fragment>
                        <header>
                          <h2 className="text-3xl font-bold font-serif text-theme-text">
                            Configurações
                          </h2>
                          <p className="text-theme-text-muted">
                            Ajuste os canais de contato e regras do site.
                          </p>
                        </header>

                        <form
                          onSubmit={updateSettings}
                          className="bg-theme-card p-8 rounded-3xl border border-theme-border shadow-sm max-w-2xl space-y-8"
                        >
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                              <div className="space-y-4">
                                <label className="text-sm font-bold text-theme-text flex justify-between items-center">
                                  <span>WhatsApp de Reservas / Contatos</span>
                                  <button
                                    type="button"
                                    onClick={addWhatsappNumber}
                                    className="text-xs bg-theme-accent/10 text-theme-accent px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-theme-accent/20 transition-all font-medium"
                                  >
                                    <Plus size={14} /> Adicionar Número
                                  </button>
                                </label>
                                <div className="space-y-3">
                                  {parsedWhatsappList.map((wa, index) => (
                                    <div
                                      key={index}
                                      className="flex flex-col md:flex-row items-end gap-3 bg-theme-bg/50 p-4 rounded-xl border border-theme-border"
                                    >
                                      <div className="w-full">
                                        <label className="text-xs font-bold text-theme-text-muted mb-1 block">
                                          Nome do Contato (Ex: Garçom, Recepção)
                                        </label>
                                        <input
                                          type="text"
                                          value={wa.nome}
                                          onChange={(e) =>
                                            updateWhatsappNumber(
                                              index,
                                              "nome",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Ex: Pedro / Recepção"
                                          className="w-full bg-theme-card border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                                        />
                                      </div>
                                      <div className="w-full">
                                        <label className="text-xs font-bold text-theme-text-muted mb-1 block">
                                          Número c/ DDD (Ex: 5511999999999)
                                        </label>
                                        <input
                                          type="text"
                                          value={wa.numero}
                                          onChange={(e) =>
                                            updateWhatsappNumber(
                                              index,
                                              "numero",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Ex: 5511999999999"
                                          className="w-full bg-theme-card border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeWhatsappNumber(index)
                                        }
                                        className="p-3 bg-theme-card border border-theme-border rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                                      >
                                        <Trash2 size={20} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-[10px] text-theme-text-muted">
                                  A pessoa escolherá para qual destes enviar a
                                  reserva, caso configure mais de um.
                                </p>
                              </div>
                              <div className="space-y-2 mt-4 pt-4 border-t border-theme-border">
                                <label className="text-sm font-bold text-theme-text">
                                  Máximo de Pessoas (Reserva)
                                </label>
                                <input
                                  type="number"
                                  value={settings.max_reservations}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      max_reservations: e.target.value,
                                    })
                                  }
                                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                                />
                                <p className="text-[10px] text-theme-text-muted">
                                  Limite para reservas diretas via form.
                                </p>
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
                      </React.Fragment>
                    );
                  })()}
                </motion.div>
              )}

              {/* USER MANAGEMENT - admin only */}
              {activeTab === "users" && (
                <React.Fragment key="users">
                  <UserManagement currentUserId={currentUser?.id || ""} />
                </React.Fragment>
              )}

              {/* STOCK CONTROL */}
              {activeTab === "stock" && (
                <React.Fragment key="stock">
                  <StockControl
                    userRole={userRole}
                    userName={currentUser?.nome || currentUser?.email || ""}
                  />
                </React.Fragment>
              )}

              {/* EMPLOYEE CONSUMPTION */}
              {activeTab === "employees" && (
                <React.Fragment key="employees">
                  <EmployeeConsumption
                    userRole={userRole}
                    userName={currentUser?.nome || currentUser?.email || ""}
                  />
                </React.Fragment>
              )}

              {/* BIRTHDAY CONFIGURATION */}
              {activeTab === "birthday" && (
                <motion.div
                  key="birthday"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <header className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold font-serif text-theme-text">
                        Configuração de Aniversário
                      </h2>
                      <p className="text-theme-text-muted">
                        Gerencie os itens disponíveis para comemorações na mesa
                        através do sistema de produtos.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProduct({
                          ...defaultProduct,
                          categoria: "aniversario",
                        });
                        setIsProductModalOpen(true);
                      }}
                      className="bg-theme-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
                    >
                      <Plus size={20} /> Novo Item Aniversário
                    </button>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products
                      .filter((p) => p.categoria === "aniversario")
                      .map((product) => (
                        <div
                          key={product.id}
                          className="bg-theme-card border border-theme-border rounded-[2rem] p-4 flex gap-4 items-center"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-theme-bg overflow-hidden flex-shrink-0">
                            {product.imagem ? (
                              <img
                                src={product.imagem}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Cake className="w-full h-full p-4 text-theme-text-muted opacity-20" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-theme-text truncate">
                              {product.nome}
                            </h4>
                            <p className="text-xs text-theme-text-muted truncate">
                              {formatCurrency(product.preco)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsProductModalOpen(true);
                              }}
                              className="p-2 text-theme-text-muted hover:text-theme-accent transition-all"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="p-2 text-theme-text-muted hover:text-red-500 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
              {/* HISTORY LOGS - admin only */}
              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <HistoryLogs />
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
                  {editingProduct.id ? "Editar Produto" : "Novo Produto"}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-2 hover:bg-theme-bg rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                onSubmit={saveProduct}
                className="flex-1 overflow-y-auto p-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">
                        Nome do Produto
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.nome}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            nome: e.target.value,
                          })
                        }
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editingProduct.preco}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            preco: parseFloat(e.target.value),
                          })
                        }
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">
                        Categoria
                      </label>
                      <select
                        value={editingProduct.categoria}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            categoria: e.target.value,
                          })
                        }
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                      >
                        <option value="comidas">Comidas</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="aniversario">Aniversário 🎂</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">
                        Subcategoria
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.subcategoria}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            subcategoria: e.target.value,
                          })
                        }
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                        placeholder="Ex: Porções, Vinhos, Massas..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text flex items-center gap-2">
                        <Boxes size={14} className="text-theme-accent" />
                        Estoque Atual (Semana)
                      </label>
                      <input
                        type="number"
                        value={editingStock}
                        onChange={(e) =>
                          setEditingStock(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                        placeholder="Qtd em estoque..."
                      />
                      <p className="text-[10px] text-theme-text-muted italic">
                        * Atualiza o controle de estoque da semana atual.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">
                        Imagem do Produto
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://..."
                          value={editingProduct.imagem}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              imagem: e.target.value,
                            })
                          }
                          className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const target =
                                e.target.parentElement?.querySelector(
                                  "button",
                                ) as HTMLButtonElement;
                              if (target) target.disabled = true;

                              try {
                                const fileExt = file.name.split(".").pop();
                                const fileName = `${Math.random()}.${fileExt}`;
                                const filePath = `products/${fileName}`;

                                const { error: uploadError } =
                                  await supabase.storage
                                    .from("products")
                                    .upload(filePath, file);

                                if (uploadError) throw uploadError;

                                const {
                                  data: { publicUrl },
                                } = supabase.storage
                                  .from("products")
                                  .getPublicUrl(filePath);

                                setEditingProduct({
                                  ...editingProduct,
                                  imagem: publicUrl,
                                });
                              } catch (err: any) {
                                alert("Erro ao subir foto: " + err.message);
                              } finally {
                                if (target) target.disabled = false;
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                          />
                          <button
                            type="button"
                            className="bg-theme-bg border border-theme-border p-3 rounded-xl hover:bg-theme-accent/10 transition-all text-theme-accent relative z-10"
                          >
                            <Upload size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">
                        Descrição
                      </label>
                      <textarea
                        rows={5}
                        value={editingProduct.desc}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            desc: e.target.value,
                          })
                        }
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              popular: !editingProduct.popular,
                            })
                          }
                          className={`w-10 h-6 rounded-full transition-all relative ${editingProduct.popular ? "bg-theme-accent" : "bg-theme-border"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.popular ? "left-5" : "left-1"}`}
                          />
                        </div>
                        <span className="text-sm font-bold text-theme-text">
                          Item Popular (Selo)
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              oculto: !editingProduct.oculto,
                            })
                          }
                          className={`w-10 h-6 rounded-full transition-all relative ${editingProduct.oculto ? "bg-red-500" : "bg-theme-border"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.oculto ? "left-5" : "left-1"}`}
                          />
                        </div>
                        <span className="text-sm font-bold text-theme-text text-red-500">
                          Ocultar do Cardápio
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Promotion Section */}
                <div className="border-t border-theme-border pt-6 mt-2">
                  <h4 className="text-sm font-bold text-theme-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                    🔥 Destaque & Promoção
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              destaque: !editingProduct.destaque,
                            })
                          }
                          className={`w-10 h-6 rounded-full transition-all relative ${editingProduct.destaque ? "bg-amber-500" : "bg-theme-border"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.destaque ? "left-5" : "left-1"}`}
                          />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-theme-text block">
                            Produto em Destaque
                          </span>
                          <span className="text-[10px] text-theme-text-muted">
                            Aparece na seção de ofertas da página principal
                          </span>
                        </div>
                      </label>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-theme-text">
                          Label do Destaque
                        </label>
                        <select
                          value={editingProduct.destaque_label || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              destaque_label: e.target.value,
                            })
                          }
                          className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                        >
                          <option value="">Sem label</option>
                          <option value="OFERTA">🏷️ OFERTA</option>
                          <option value="PROMOÇÃO">🔥 PROMOÇÃO</option>
                          <option value="NOVIDADE">✨ NOVIDADE</option>
                          <option value="MAIS VENDIDO">⭐ MAIS VENDIDO</option>
                          <option value="OFERTA DO DIA">
                            📢 OFERTA DO DIA
                          </option>
                          <option value="IMPERDÍVEL">💥 IMPERDÍVEL</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-theme-text">
                        Preço Promocional (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.preco_promocional ?? ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            preco_promocional: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          })
                        }
                        placeholder="Deixe vazio se não houver promoção"
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                      />
                      <p className="text-[10px] text-theme-text-muted">
                        Se preenchido, o preço original aparecerá riscado na
                        página principal.
                      </p>
                      {editingProduct.preco_promocional &&
                        editingProduct.preco_promocional <
                          editingProduct.preco && (
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <p className="text-xs text-green-500 font-bold">
                              💰 Desconto de{" "}
                              {Math.round(
                                ((editingProduct.preco -
                                  editingProduct.preco_promocional) /
                                  editingProduct.preco) *
                                  100,
                              )}
                              % — De{" "}
                              <span className="line-through">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(editingProduct.preco)}
                              </span>{" "}
                              por{" "}
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(editingProduct.preco_promocional)}
                            </p>
                          </div>
                        )}
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

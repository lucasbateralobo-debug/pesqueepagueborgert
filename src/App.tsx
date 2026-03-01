import React, { useState, useEffect, useMemo } from 'react';
import { Fish, Waves, ShoppingCart, X, Plus, Minus, UtensilsCrossed, Wine, Image as ImageIcon, Check, Star, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const comidas = [
  {
    subcategoria: "Porções",
    itens: [
      { nome: "Porção de batata", desc: "Batatas fritas crocantes e douradas", ingredientes: ["Batata", "Sal", "Óleo vegetal"], preco: 25.90, popular: true, imagem: "https://picsum.photos/seed/fries/400/400", tags: ["vegetariano", "fritura"] },
      { nome: "Porção de filé de tilápia", desc: "Filés frescos empanados e fritos", ingredientes: ["Filé de tilápia", "Farinha de trigo", "Ovo", "Farinha de rosca", "Limão", "Sal"], preco: 45.90, popular: true, imagem: "https://picsum.photos/seed/friedfish/400/400", tags: ["frutos do mar", "fritura"] },
      { nome: "Porção de posta de tilápia", desc: "Postas suculentas com tempero da casa", ingredientes: ["Posta de tilápia", "Alho", "Limão", "Sal", "Ervas finas"], preco: 39.90, imagem: "https://picsum.photos/seed/fishsteak/400/400", tags: ["frutos do mar"] },
      { nome: "Porção de bolinho de tilápia com queijo", desc: "Bolinhos artesanais recheados com queijo derretido", ingredientes: ["Tilápia desfiada", "Queijo muçarela", "Batata", "Cebola", "Salsa", "Farinha de rosca"], preco: 35.90, popular: true, imagem: "https://picsum.photos/seed/fishcake/400/400", tags: ["frutos do mar", "fritura", "queijo"] },
      { nome: "Porção de camarão alho e óleo", desc: "Camarões salteados no azeite e alho", ingredientes: ["Camarão", "Alho", "Azeite de oliva", "Sal", "Salsa"], preco: 55.90, popular: true, imagem: "https://picsum.photos/seed/shrimp/400/400", tags: ["frutos do mar"] }
    ]
  },
  {
    subcategoria: "Acompanhamentos",
    itens: [
      { nome: "Porção de salada", desc: "Mix de folhas frescas, tomate e cebola", preco: 15.90, imagem: "https://picsum.photos/seed/salad/400/400", tags: ["vegetariano", "saudável"] },
      { nome: "Porção de arroz", desc: "Arroz branco soltinho", preco: 12.90, imagem: "https://picsum.photos/seed/rice/400/400", tags: ["vegetariano"] },
      { nome: "Porção de pirão de peixe", desc: "Pirão tradicional cremoso e saboroso", preco: 18.90, imagem: "https://picsum.photos/seed/stew/400/400", tags: ["frutos do mar"] }
    ]
  }
];

const bebidas = [
  {
    subcategoria: "Energéticos",
    itens: [
      { nome: "Red Bull", preco: 15.00, desc: "Lata 250ml", imagem: "https://picsum.photos/seed/energy1/400/400", tags: ["sem álcool", "energético"] },
      { nome: "Monster", preco: 18.00, desc: "Lata 473ml", imagem: "https://picsum.photos/seed/energy2/400/400", tags: ["sem álcool", "energético"] }
    ]
  },
  {
    subcategoria: "Refrigerantes",
    itens: [
      { nome: "Coca-Cola", preco: 7.00, desc: "Lata 350ml", imagem: "https://picsum.photos/seed/soda1/400/400", tags: ["sem álcool", "gaseificado"] },
      { nome: "Guaraná Antarctica", preco: 7.00, desc: "Lata 350ml", imagem: "https://picsum.photos/seed/soda2/400/400", tags: ["sem álcool", "gaseificado"] },
      { nome: "Soda Limonada", preco: 7.00, desc: "Lata 350ml", imagem: "https://picsum.photos/seed/soda3/400/400", tags: ["sem álcool", "gaseificado", "com limão"] }
    ]
  },
  {
    subcategoria: "Sucos",
    itens: [
      { nome: "Suco Natural de Laranja", preco: 12.00, desc: "Copo 400ml feito na hora", imagem: "https://picsum.photos/seed/orangejuice/400/400", tags: ["sem álcool", "natural", "saudável"] },
      { nome: "Suco de Polpa (Copo)", preco: 10.00, desc: "Copo 400ml - Consulte sabores (ex: morango, abacaxi)", imagem: "https://picsum.photos/seed/fruitjuice1/400/400", tags: ["sem álcool", "com morango", "com abacaxi"] },
      { nome: "Suco de Polpa (Jarra)", preco: 22.00, desc: "Jarra 1L - Consulte sabores", imagem: "https://picsum.photos/seed/fruitjuice2/400/400", tags: ["sem álcool", "com morango", "com abacaxi"] }
    ]
  },
  {
    subcategoria: "Vinhos",
    itens: [
      { nome: "Vinho Tinto Seco", preco: 85.00, desc: "Garrafa", imagem: "https://picsum.photos/seed/redwine/400/400", tags: ["com álcool", "vinho"] },
      { nome: "Vinho Branco Suave", preco: 75.00, desc: "Garrafa", imagem: "https://picsum.photos/seed/whitewine/400/400", tags: ["com álcool", "vinho"] }
    ]
  },
  {
    subcategoria: "Água",
    itens: [
      { nome: "Água Mineral sem Gás", preco: 5.00, desc: "Garrafa 500ml", imagem: "https://picsum.photos/seed/water1/400/400", tags: ["sem álcool", "saudável"] },
      { nome: "Água Mineral com Gás", preco: 5.50, desc: "Garrafa 500ml", imagem: "https://picsum.photos/seed/water2/400/400", tags: ["sem álcool", "gaseificado"] }
    ]
  },
  {
    subcategoria: "Cervejas",
    itens: [
      { nome: "Heineken 600ml", preco: 18.90, desc: "Garrafa 600ml bem gelada", popular: true, imagem: "https://picsum.photos/seed/beer1/400/400", tags: ["com álcool", "cerveja"] },
      { nome: "Original 600ml", preco: 16.90, desc: "Garrafa 600ml bem gelada", imagem: "https://picsum.photos/seed/beer2/400/400", tags: ["com álcool", "cerveja"] },
      { nome: "Brahma Chopp 600ml", preco: 15.90, desc: "Garrafa 600ml bem gelada", imagem: "https://picsum.photos/seed/beer3/400/400", tags: ["com álcool", "cerveja"] }
    ]
  },
  {
    subcategoria: "Doses",
    itens: [
      { nome: "Cachaça Artesanal", preco: 8.00, desc: "Dose 50ml", imagem: "https://picsum.photos/seed/shot1/400/400", tags: ["com álcool", "destilado"] },
      { nome: "Vodka", preco: 12.00, desc: "Dose 50ml", imagem: "https://picsum.photos/seed/shot2/400/400", tags: ["com álcool", "destilado"] },
      { nome: "Whisky", preco: 18.00, desc: "Dose 50ml", imagem: "https://picsum.photos/seed/shot3/400/400", tags: ["com álcool", "destilado"] }
    ]
  },
  {
    subcategoria: "Combo de bebidas",
    itens: [
      { nome: "Combo Vodka + Energéticos", preco: 180.00, desc: "1 Garrafa de Vodka + 4 Red Bulls", popular: true, imagem: "https://picsum.photos/seed/combo1/400/400", tags: ["com álcool", "destilado", "energético"] },
      { nome: "Combo Whisky + Energéticos", preco: 250.00, desc: "1 Garrafa de Whisky + 4 Red Bulls", imagem: "https://picsum.photos/seed/combo2/400/400", tags: ["com álcool", "destilado", "energético"] }
    ]
  },
  {
    subcategoria: "Caipiras",
    itens: [
      { nome: "Caipirinha de Limão", preco: 22.00, desc: "Cachaça, limão, açúcar e gelo", popular: true, imagem: "https://picsum.photos/seed/caipirinha1/400/400", tags: ["com álcool", "com limão", "destilado"] },
      { nome: "Caipiroska de Morango", preco: 26.00, desc: "Vodka, morango, açúcar e gelo", imagem: "https://picsum.photos/seed/caipirinha2/400/400", tags: ["com álcool", "com morango", "destilado"] },
      { nome: "Caipirinha de Vinho", preco: 24.00, desc: "Vinho, limão, açúcar e gelo", imagem: "https://picsum.photos/seed/caipirinha3/400/400", tags: ["com álcool", "com limão", "vinho"] }
    ]
  },
  {
    subcategoria: "Drinks especiais",
    itens: [
      { nome: "Gin Tônica", preco: 32.00, desc: "Gin, água tônica, limão e especiarias", imagem: "https://picsum.photos/seed/drink1/400/400", tags: ["com álcool", "com limão", "destilado"] },
      { nome: "Mojito", preco: 28.00, desc: "Rum, hortelã, limão e água com gás", imagem: "https://picsum.photos/seed/drink2/400/400", tags: ["com álcool", "com limão", "destilado"] },
      { nome: "Lagoa Azul", preco: 25.00, desc: "Vodka, curaçau blue e soda", imagem: "https://picsum.photos/seed/drink3/400/400", tags: ["com álcool", "destilado"] }
    ]
  }
];

type CartItem = {
  nome: string;
  preco: number;
  quantidade: number;
};

type MainCategory = 'comidas' | 'bebidas';

// Reusable Card Component with Micro-interaction
const ProductCard = ({ nome, desc, preco, icon: Icon, popular, imagem, onAdd }: { key?: React.Key, nome: string, desc?: string, preco: number, icon: any, popular?: boolean, imagem?: string, onAdd: () => void }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 800);
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="w-full h-full group cursor-pointer transition-transform duration-300 hover:-translate-y-1.5" 
      style={{ perspective: '1000px' }}
    >
      <div 
        className="relative w-full h-full transition-transform duration-500"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
        onClick={toggleFlip}
      >
        {/* FRONT FACE (Info) */}
        <div 
          className={`relative w-full h-full min-h-[200px] flex flex-col rounded-3xl bg-theme-card border ${popular ? 'border-theme-accent/30' : 'border-theme-border'} shadow-theme-card group-hover:shadow-theme-card-hover p-4 md:p-5 transition-shadow duration-300`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {popular && (
            <div className="absolute top-0 left-0 bg-theme-accent/10 border-b border-r border-theme-accent/20 text-theme-accent px-3 py-1.5 rounded-br-2xl rounded-tl-3xl z-10 flex items-center gap-1.5">
              <Star size={12} className="fill-theme-accent" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Mais Pedido</span>
            </div>
          )}
          
          <div className={`flex flex-col h-full ${popular ? 'pt-6' : ''}`}>
            <div className="flex justify-between items-start mb-2 gap-2">
              <h3 className="text-base md:text-lg font-semibold text-theme-text leading-tight group-hover:text-theme-accent transition-colors duration-300">
                {nome}
              </h3>
            </div>
            
            <span className="text-theme-accent font-bold font-serif text-lg md:text-xl mb-2">{formatCurrency(preco)}</span>
            
            {desc && (
              <p className="text-xs md:text-sm text-theme-text-muted italic leading-relaxed flex-1">{desc}</p>
            )}
            
            <div className="flex justify-end items-center mt-auto pt-4">
              <div 
                onClick={handleAdd}
                className={`flex items-center gap-1.5 font-medium text-xs md:text-sm px-3.5 py-2 rounded-xl transition-all duration-100 ${
                  isAdded 
                    ? 'bg-theme-accent text-white scale-[1.02]' 
                    : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-white active:scale-95'
                }`}
              >
                {isAdded ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                <span>{isAdded ? 'Adicionado' : 'Adicionar'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BACK FACE (Photo) */}
        <div 
          className={`absolute inset-0 w-full h-full flex flex-col rounded-3xl bg-theme-card border ${popular ? 'border-theme-accent/30' : 'border-theme-border'} shadow-theme-card group-hover:shadow-theme-card-hover overflow-hidden transition-shadow duration-300`}
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="w-full h-full bg-theme-text/5 relative flex items-center justify-center overflow-hidden rounded-3xl">
            {imagem ? (
              <>
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-theme-border/20 animate-pulse">
                    <Icon size={32} className="text-theme-text-muted opacity-50" />
                  </div>
                )}
                <img 
                  src={`${imagem}.webp`} 
                  alt={nome} 
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                  referrerPolicy="no-referrer" 
                  loading="lazy" 
                  decoding="async"
                  onLoad={() => setIsImageLoaded(true)}
                />
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center justify-center text-theme-text-muted opacity-30">
                  <Icon size={48} strokeWidth={1.5} />
                </div>
                <div className="absolute top-3 right-3 bg-theme-bg/95 px-2.5 py-1 rounded-lg text-[10px] font-medium text-theme-text-muted uppercase tracking-wider shadow-sm">
                  Sem foto
                </div>
              </>
            )}
            
            {/* Overlay Add Button on Back too */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
              <div 
                onClick={handleAdd}
                className={`flex items-center gap-1.5 font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all duration-100 shadow-md backdrop-blur-md ${
                  isAdded 
                    ? 'bg-theme-accent text-white scale-[1.02]' 
                    : 'bg-theme-bg/90 text-theme-accent hover:bg-theme-accent hover:text-white active:scale-95'
                }`}
              >
                {isAdded ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                <span>{isAdded ? 'Adicionado' : 'Adicionar'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCardSkeleton = () => (
  <div className="w-full h-full min-h-[200px] flex flex-col rounded-3xl bg-theme-card border border-theme-border shadow-theme-card p-4 md:p-5 animate-pulse">
    <div className="w-full h-36 md:h-44 bg-theme-border/50 rounded-2xl mb-4"></div>
    <div className="flex flex-col h-full">
      <div className="w-3/4 h-5 bg-theme-border/50 rounded-md mb-3"></div>
      <div className="w-1/3 h-6 bg-theme-border/50 rounded-md mb-4"></div>
      <div className="w-full h-3 bg-theme-border/50 rounded-md mb-2"></div>
      <div className="w-4/5 h-3 bg-theme-border/50 rounded-md mb-4"></div>
      
      <div className="flex justify-end items-center mt-auto pt-4">
        <div className="w-24 h-8 bg-theme-border/50 rounded-xl"></div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('borgert_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('comidas');
  const [activeSubcategory, setActiveSubcategory] = useState<string>(comidas[0].subcategoria);
  const [cartPulse, setCartPulse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('borgert_cart', JSON.stringify(cart));
  }, [cart]);

  // Handle category switching with skeleton loading
  const handleCategoryChange = (category: MainCategory) => {
    if (category === activeCategory) return;
    setIsLoading(true);
    setActiveCategory(category);
    setActiveSubcategory(category === 'comidas' ? comidas[0].subcategoria : bebidas[0].subcategoria);
    setSearchQuery("");
    setSelectedTags([]);
    setTimeout(() => setIsLoading(false), 300);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle subcategory switching with skeleton loading
  const handleSubcategoryChange = (subcat: string) => {
    if (subcat === activeSubcategory) return;
    setIsLoading(true);
    setActiveSubcategory(subcat);
    setSelectedTags([]);
    setTimeout(() => setIsLoading(false), 300);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Prevent background scrolling when cart is open on mobile
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen]);

  const addToCart = (nome: string, preco: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.nome === nome);
      if (existing) {
        return prev.map((item) =>
          item.nome === nome ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { nome, preco, quantidade: 1 }];
    });
    
    // Trigger cart pulse animation
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 300);
  };

  const updateQuantity = (nome: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.nome === nome) {
            return { ...item, quantidade: Math.max(0, item.quantidade + delta) };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0)
    );
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantidade, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  
  const activeComidaSection = comidas.find(c => c.subcategoria === activeSubcategory);
  const activeBebidaSection = bebidas.find(b => b.subcategoria === activeSubcategory);
  const isSophisticatedMode = activeCategory === 'bebidas' && activeSubcategory === 'Vinhos';

  const currentSectionItems = activeCategory === 'comidas' ? activeComidaSection?.itens : activeBebidaSection?.itens;

  // Search logic
  const allItems = useMemo(() => {
    return [
      ...comidas.flatMap(c => c.itens.map(i => ({ ...i, category: 'comidas', icon: UtensilsCrossed }))),
      ...bebidas.flatMap(b => b.itens.map(i => ({ ...i, category: 'bebidas', icon: Wine })))
    ];
  }, []);

  const availableTags = useMemo(() => {
    const itemsToConsider = searchQuery.trim() ? allItems : currentSectionItems;
    if (!itemsToConsider) return [];
    const tags = new Set<string>();
    itemsToConsider.forEach(item => {
      if ((item as any).tags) {
        (item as any).tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [currentSectionItems, searchQuery, allItems]);

  const filteredItems = useMemo(() => {
    if (!currentSectionItems) return [];
    if (selectedTags.length === 0) return currentSectionItems;
    return currentSectionItems.filter(item => 
      selectedTags.every(tag => (item as any).tags?.includes(tag))
    );
  }, [currentSectionItems, selectedTags]);

  // Apply sophisticated theme to body for full page coverage
  useEffect(() => {
    if (isSophisticatedMode) {
      document.body.classList.add('theme-sophisticated');
    } else {
      document.body.classList.remove('theme-sophisticated');
    }
  }, [isSophisticatedMode]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    let results = allItems.filter(item => 
      item.nome.toLowerCase().includes(query) || 
      (item.desc && item.desc.toLowerCase().includes(query)) ||
      ((item as any).tags && (item as any).tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );

    if (selectedTags.length > 0) {
      results = results.filter(item => 
        selectedTags.every(tag => (item as any).tags?.includes(tag))
      );
    }
    
    return results;
  }, [searchQuery, allItems, selectedTags]);

  return (
    <div className={`min-h-screen bg-theme-bg text-theme-text font-sans selection:bg-theme-accent selection:text-white relative flex flex-col w-full overflow-x-hidden transition-colors duration-300 ${isSophisticatedMode ? 'theme-sophisticated' : ''}`}>
      {/* Header */}
      <header className="safe-pt pb-6 flex flex-col items-center justify-center text-center px-4 shrink-0">
        <div className="mb-4 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-20 h-14 overflow-hidden">
            <div className="absolute top-0 w-20 h-20 rounded-full border-t-[3px] border-l-[3px] border-r-[3px] border-theme-border border-dashed opacity-80"></div>
            <Fish size={32} className="text-theme-accent fill-current mt-3 z-10" />
          </div>
          <Waves size={24} className="text-theme-text -mt-1 z-10 opacity-90" strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-widest text-theme-accent uppercase font-serif">
          Borgert
        </h1>
        <p className="mt-2 text-[9px] md:text-xs tracking-[0.3em] text-theme-text uppercase font-medium opacity-90">
          Buffet | Restaurante | Eventos
        </p>
      </header>

      {/* Main Category Navigation */}
      <div className="sticky top-0 z-30 bg-theme-nav backdrop-blur-md border-b border-theme-border px-4 py-3 shrink-0">
        <div className="max-w-md mx-auto flex bg-theme-card p-1.5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-theme-border relative">
          <button
            onClick={() => handleCategoryChange('comidas')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-colors duration-150 relative z-10 active:scale-[0.98] ${
              activeCategory === 'comidas' 
                ? 'bg-theme-text text-white shadow-md' 
                : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <UtensilsCrossed size={18} />
            <span className="tracking-wide text-sm md:text-base">Comidas</span>
          </button>
          <button
            onClick={() => handleCategoryChange('bebidas')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-colors duration-150 relative z-10 active:scale-[0.98] ${
              activeCategory === 'bebidas' 
                ? 'bg-theme-accent text-white shadow-md' 
                : 'text-theme-text-muted hover:text-theme-accent'
            }`}
          >
            <Wine size={18} />
            <span className="tracking-wide text-sm md:text-base">Bebidas</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="px-4 md:px-12 mb-6 shrink-0">
        <div className="relative max-w-md mx-auto mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted" size={20} />
          <input
            type="text"
            placeholder="Buscar pratos ou bebidas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-card border border-theme-border rounded-2xl py-3.5 pl-12 pr-10 text-theme-text focus:outline-none focus:border-theme-accent transition-colors shadow-sm text-sm md:text-base"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-theme-text p-1"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div className="max-w-md mx-auto">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selectedTags.includes(tag)
                      ? 'bg-theme-accent text-white border-theme-accent'
                      : 'bg-theme-card text-theme-text-muted border-theme-border hover:border-theme-accent/50 hover:text-theme-accent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-12 py-4 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col w-full h-full">
          {/* Search Results */}
          {searchQuery.trim() !== "" || selectedTags.length > 0 && searchQuery.trim() !== "" ? (
            <section className="flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-theme-text font-serif">
                  Resultados para "{searchQuery}"
                </h3>
                <p className="text-theme-text-muted text-sm mt-1">{searchResults.length} itens encontrados</p>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {searchResults.map((item, idx) => (
                    <ProductCard 
                      key={idx} 
                      nome={item.nome} 
                      desc={item.desc} 
                      preco={item.preco} 
                      icon={item.icon} 
                      popular={(item as any).popular}
                      imagem={item.imagem}
                      onAdd={() => addToCart(item.nome, item.preco)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <Search size={48} className="text-theme-border mb-4" />
                  <p className="text-theme-text-muted text-lg">Nenhum item encontrado.</p>
                </div>
              )}
            </section>
          ) : (
            <AnimatePresence mode="wait">
              {/* Comidas Section */}
              {activeCategory === 'comidas' && (
                <motion.section 
                  key="comidas"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col h-full"
                >
                  {/* Subcategory Navigation */}
                  <div className="mb-10 px-2">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 pb-2">
                      {comidas.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSubcategoryChange(cat.subcategoria)}
                          className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-150 border active:scale-95 ${
                            activeSubcategory === cat.subcategoria
                              ? 'bg-theme-accent text-white border-theme-accent shadow-[0_4px_15px_rgba(0,0,0,0.1)]'
                              : 'bg-theme-card text-theme-text-muted border-theme-border hover:border-theme-accent/50 hover:text-theme-accent'
                          }`}
                        >
                          {cat.subcategoria}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Subcategory Items */}
                  {activeComidaSection && (
                    <div className="flex-1">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl md:text-3xl font-bold text-theme-text uppercase tracking-widest font-serif inline-block relative">
                          {activeComidaSection.subcategoria}
                          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-[2px] bg-theme-accent/60"></div>
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {isLoading ? (
                          Array.from({ length: 8 }).map((_, idx) => (
                            <ProductCardSkeleton key={idx} />
                          ))
                        ) : filteredItems.length > 0 ? (
                          filteredItems.map((item, idx) => (
                            <ProductCard 
                              key={idx} 
                              nome={item.nome} 
                              desc={item.desc} 
                              preco={item.preco} 
                              icon={UtensilsCrossed} 
                              popular={(item as any).popular}
                              imagem={(item as any).imagem}
                              onAdd={() => addToCart(item.nome, item.preco)}
                            />
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12">
                            <p className="text-theme-text-muted text-lg">Nenhum item com essas características.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.section>
              )}

              {/* Bebidas Section */}
              {activeCategory === 'bebidas' && (
                <motion.section 
                  key="bebidas"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col h-full"
                >
              {/* Subcategory Navigation */}
              <div className="mb-10 px-2">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 pb-2">
                  {bebidas.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubcategoryChange(cat.subcategoria)}
                      className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-150 border active:scale-95 ${
                        activeSubcategory === cat.subcategoria
                          ? 'bg-theme-accent text-white border-theme-accent shadow-[0_4px_15px_rgba(0,0,0,0.1)]'
                          : 'bg-theme-card text-theme-text-muted border-theme-border hover:border-theme-accent/50 hover:text-theme-accent'
                      }`}
                    >
                      {cat.subcategoria}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Subcategory Items */}
              {activeBebidaSection && (
                <div className="flex-1">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-theme-text uppercase tracking-widest font-serif inline-block relative">
                      {activeBebidaSection.subcategoria}
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-[2px] bg-theme-accent/60"></div>
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <ProductCardSkeleton key={idx} />
                      ))
                    ) : filteredItems.length > 0 ? (
                      filteredItems.map((item, itemIdx) => (
                        <ProductCard 
                          key={itemIdx} 
                          nome={item.nome} 
                          desc={item.desc} 
                          preco={item.preco} 
                          icon={Wine} 
                          popular={(item as any).popular}
                          imagem={(item as any).imagem}
                          onAdd={() => addToCart(item.nome, item.preco)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-theme-text-muted text-lg">Nenhum item com essas características.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      )}
    </div>
  </main>
      
      <footer className="mt-auto text-center py-10 safe-pb shrink-0">
        <div className="w-16 h-[1px] bg-theme-border mx-auto mb-6"></div>
        <p className="text-theme-text-muted text-xs font-serif italic">Obrigado pela preferência!</p>
      </footer>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ 
              scale: cartPulse ? [1, 1.15, 1] : 1, 
              opacity: 1, 
              y: 0 
            }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ 
              duration: cartPulse ? 0.2 : 0.15,
              scale: { type: "tween", ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-[max(env(safe-area-inset-bottom),1.5rem)] right-4 md:right-8 bg-theme-accent text-white p-4 md:p-5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] transition-all duration-150 z-40 flex items-center justify-center group"
          >
            <motion.div
              animate={{ rotate: cartPulse ? [-10, 10, -10, 0] : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ShoppingCart size={24} strokeWidth={2.5} />
            </motion.div>
            <motion.span 
              key={totalItems}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-2 -right-2 bg-theme-text text-theme-bg text-[11px] font-bold w-7 h-7 flex items-center justify-center rounded-full border-2 border-theme-bg shadow-sm"
            >
              {totalItems}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sidebar/Bottom Sheet Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-theme-overlay/80 z-50 transition-opacity duration-200"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Sidebar (Desktop) / Bottom Sheet (Mobile) */}
      <div 
        className={`fixed bottom-0 left-0 right-0 h-[85vh] md:h-full md:top-0 md:right-0 md:left-auto md:w-[450px] bg-theme-bg shadow-2xl z-50 rounded-t-[2.5rem] md:rounded-none flex flex-col border-t md:border-l border-theme-border transition-transform duration-300 ease-out transform-gpu ${isCartOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}
      >
        {/* Mobile Drag Indicator (Visual only now) */}
        <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
          <div className="w-14 h-1.5 bg-theme-border rounded-full"></div>
        </div>

        <div className="flex items-center justify-between px-6 md:px-8 pb-5 pt-2 md:pt-8 border-b border-theme-border bg-transparent shrink-0">
            <h2 className="text-3xl font-serif text-theme-accent italic">Seu Pedido</h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2.5 text-theme-text-muted hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors active:scale-95 bg-theme-card shadow-sm border border-theme-border"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 overscroll-contain hide-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center text-theme-text-muted mt-16 italic font-serif flex flex-col items-center">
                <div className="w-24 h-24 bg-theme-card rounded-full flex items-center justify-center mb-6 shadow-sm border border-theme-border">
                  <ShoppingCart size={40} className="opacity-30" />
                </div>
                <p className="text-lg">Seu pedido está vazio.</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div 
                    key={item.nome}
                    className="flex items-center justify-between bg-theme-card p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-theme-border"
                  >
                    <div className="flex-1 pr-4">
                      <h4 className="font-semibold text-theme-text text-sm md:text-base leading-tight">{item.nome}</h4>
                      <p className="text-theme-accent text-sm font-serif mt-1.5 font-medium">{formatCurrency(item.preco)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-theme-bg rounded-xl p-1.5 border border-theme-border shadow-inner">
                      <button 
                        onClick={() => updateQuantity(item.nome, -1)}
                        className="w-8 h-8 flex items-center justify-center text-theme-text hover:text-theme-accent hover:bg-theme-card rounded-lg transition-all active:scale-90 shadow-sm"
                      >
                        <Minus size={16} strokeWidth={2.5} />
                      </button>
                      <span className="w-5 text-center font-bold text-theme-text text-sm">
                        {item.quantidade}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.nome, 1)}
                        className="w-8 h-8 flex items-center justify-center text-theme-text hover:text-theme-accent hover:bg-theme-card rounded-lg transition-all active:scale-90 shadow-sm"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="p-6 md:p-8 border-t border-theme-border bg-theme-card safe-pb shrink-0 rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-theme-text-muted font-semibold uppercase tracking-widest text-xs">Total de Itens</span>
              <span className="text-lg font-serif text-theme-text font-bold">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-theme-text-muted font-semibold uppercase tracking-widest text-xs">Subtotal</span>
              <span className="text-2xl font-serif text-theme-accent font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-theme-accent text-white py-4 rounded-2xl font-semibold tracking-wide transition-all duration-150 flex items-center justify-center space-x-2 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:bg-opacity-90 text-lg active:scale-[0.98]"
            >
              <span>Mostrar ao Garçom</span>
            </button>
          </div>
        </div>
    </div>
  );
}

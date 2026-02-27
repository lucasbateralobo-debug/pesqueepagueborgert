import React, { useState, useEffect } from 'react';
import { Fish, Waves, ShoppingCart, X, Plus, Minus, UtensilsCrossed, Wine, Image as ImageIcon, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const comidas = [
  { nome: "Porção de batata", desc: "Batatas fritas crocantes e douradas", popular: true },
  { nome: "Porção de filé de tilápia", desc: "Filés frescos empanados e fritos", popular: true },
  { nome: "Porção de posta de tilápia", desc: "Postas suculentas com tempero da casa" },
  { nome: "Porção de bolinho de tilápia com queijo", desc: "Bolinhos artesanais recheados com queijo derretido", popular: true },
  { nome: "Porção de salada", desc: "Mix de folhas frescas, tomate e cebola" },
  { nome: "Porção de arroz", desc: "Arroz branco soltinho" },
  { nome: "Porção de pirão de peixe", desc: "Pirão tradicional cremoso e saboroso" },
  { nome: "Porção de camarão alho e óleo", desc: "Camarões salteados no azeite e alho", popular: true }
];

const bebidas = [
  {
    subcategoria: "Energéticos",
    itens: [
      { nome: "Red Bull", preco: "R$ --", desc: "Lata 250ml" },
      { nome: "Monster", preco: "R$ --", desc: "Lata 473ml" }
    ]
  },
  {
    subcategoria: "Refrigerantes",
    itens: [
      { nome: "Coca-Cola", preco: "R$ --", desc: "Lata 350ml" },
      { nome: "Guaraná Antarctica", preco: "R$ --", desc: "Lata 350ml" },
      { nome: "Soda Limonada", preco: "R$ --", desc: "Lata 350ml" }
    ]
  },
  {
    subcategoria: "Sucos",
    itens: [
      { nome: "Suco Natural de Laranja", preco: "R$ --", desc: "Copo 400ml feito na hora" },
      { nome: "Suco de Polpa (Copo)", preco: "R$ --", desc: "Copo 400ml - Consulte sabores" },
      { nome: "Suco de Polpa (Jarra)", preco: "R$ --", desc: "Jarra 1L - Consulte sabores" }
    ]
  },
  {
    subcategoria: "Vinhos",
    itens: [
      { nome: "Vinho Tinto Seco", preco: "R$ --", desc: "Taça ou Garrafa" },
      { nome: "Vinho Branco Suave", preco: "R$ --", desc: "Taça ou Garrafa" }
    ]
  },
  {
    subcategoria: "Água",
    itens: [
      { nome: "Água Mineral sem Gás", preco: "R$ --", desc: "Garrafa 500ml" },
      { nome: "Água Mineral com Gás", preco: "R$ --", desc: "Garrafa 500ml" }
    ]
  },
  {
    subcategoria: "Cervejas",
    itens: [
      { nome: "Heineken 600ml", preco: "R$ --", desc: "Garrafa 600ml bem gelada", popular: true },
      { nome: "Original 600ml", preco: "R$ --", desc: "Garrafa 600ml bem gelada" },
      { nome: "Brahma Chopp 600ml", preco: "R$ --", desc: "Garrafa 600ml bem gelada" }
    ]
  },
  {
    subcategoria: "Doses",
    itens: [
      { nome: "Cachaça Artesanal", preco: "R$ --", desc: "Dose 50ml" },
      { nome: "Vodka", preco: "R$ --", desc: "Dose 50ml" },
      { nome: "Whisky", preco: "R$ --", desc: "Dose 50ml" }
    ]
  },
  {
    subcategoria: "Combo de bebidas",
    itens: [
      { nome: "Combo Vodka + Energéticos", preco: "R$ --", desc: "1 Garrafa de Vodka + 4 Red Bulls", popular: true },
      { nome: "Combo Whisky + Energéticos", preco: "R$ --", desc: "1 Garrafa de Whisky + 4 Red Bulls" }
    ]
  },
  {
    subcategoria: "Caipiras",
    itens: [
      { nome: "Caipirinha de Limão", preco: "R$ --", desc: "Cachaça, limão, açúcar e gelo", popular: true },
      { nome: "Caipiroska de Morango", preco: "R$ --", desc: "Vodka, morango, açúcar e gelo" },
      { nome: "Caipirinha de Vinho", preco: "R$ --", desc: "Vinho, limão, açúcar e gelo" }
    ]
  },
  {
    subcategoria: "Drinks especiais",
    itens: [
      { nome: "Gin Tônica", preco: "R$ --", desc: "Gin, água tônica, limão e especiarias" },
      { nome: "Mojito", preco: "R$ --", desc: "Rum, hortelã, limão e água com gás" },
      { nome: "Lagoa Azul", preco: "R$ --", desc: "Vodka, curaçau blue e soda" }
    ]
  }
];

type CartItem = {
  nome: string;
  preco: string;
  quantidade: number;
};

type MainCategory = 'comidas' | 'bebidas';

// Reusable Card Component with Micro-interaction
const ProductCard = ({ nome, desc, preco, icon: Icon, popular, onAdd }: { key?: React.Key, nome: string, desc?: string, preco: string, icon: any, popular?: boolean, onAdd: () => void }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="w-full h-full group cursor-pointer" 
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
          className={`relative w-full h-full min-h-[200px] flex flex-col rounded-3xl bg-theme-card border ${popular ? 'border-theme-accent/30' : 'border-theme-border'} shadow-theme-card hover:shadow-theme-card-hover p-4 md:p-5`}
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
              <h3 className="text-base md:text-lg font-semibold text-theme-text leading-tight">
                {nome}
              </h3>
            </div>
            
            <span className="text-theme-accent font-bold font-serif text-lg md:text-xl mb-2">{preco}</span>
            
            {desc && (
              <p className="text-xs md:text-sm text-theme-text-muted italic leading-relaxed flex-1">{desc}</p>
            )}
            
            <div className="flex justify-end items-center mt-auto pt-4">
              <div 
                onClick={handleAdd}
                className={`flex items-center gap-1.5 font-medium text-xs md:text-sm px-3.5 py-2 rounded-xl transition-all duration-150 ${
                  isAdded 
                    ? 'bg-theme-accent text-white scale-[1.05]' 
                    : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-white'
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
          className={`absolute inset-0 w-full h-full flex flex-col rounded-3xl bg-theme-card border ${popular ? 'border-theme-accent/30' : 'border-theme-border'} shadow-theme-card overflow-hidden`}
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="w-full h-full bg-theme-text/5 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center text-theme-text-muted opacity-30">
              <Icon size={48} strokeWidth={1.5} />
            </div>
            <div className="absolute top-3 right-3 bg-theme-bg/95 px-2.5 py-1 rounded-lg text-[10px] font-medium text-theme-text-muted uppercase tracking-wider shadow-sm">
              Sem foto
            </div>
            
            {/* Overlay Add Button on Back too */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
              <div 
                onClick={handleAdd}
                className={`flex items-center gap-1.5 font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all duration-150 shadow-md backdrop-blur-md ${
                  isAdded 
                    ? 'bg-theme-accent text-white scale-[1.05]' 
                    : 'bg-theme-bg/90 text-theme-accent hover:bg-theme-accent hover:text-white'
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

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('comidas');
  const [activeSubcategory, setActiveSubcategory] = useState<string>(bebidas[0].subcategoria);
  const [cartPulse, setCartPulse] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  // Handle native swipe gestures for category navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && activeCategory === 'comidas') {
      setActiveCategory('bebidas');
    } else if (isRightSwipe && activeCategory === 'bebidas') {
      setActiveCategory('comidas');
    }
  };

  const addToCart = (nome: string, preco: string) => {
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
  const activeBebidaSection = bebidas.find(b => b.subcategoria === activeSubcategory);
  const isSophisticatedMode = activeCategory === 'bebidas' && activeSubcategory === 'Vinhos';

  return (
    <div className={`min-h-screen font-sans selection:bg-theme-accent selection:text-white relative flex flex-col w-full overflow-x-hidden ${isSophisticatedMode ? 'theme-sophisticated' : ''}`}>
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
            onClick={() => setActiveCategory('comidas')}
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
            onClick={() => setActiveCategory('bebidas')}
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-12 py-8 flex flex-col overflow-hidden relative">
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="flex-1 flex flex-col w-full h-full"
        >
          {/* Comidas Section */}
          {activeCategory === 'comidas' && (
            <section className="flex flex-col">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl italic text-theme-text font-serif">Porções</h2>
                <div className="w-12 h-[2px] bg-theme-border mx-auto mt-4"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {comidas.map((item, idx) => (
                  <ProductCard 
                    key={idx} 
                    nome={item.nome} 
                    desc={item.desc} 
                    preco="R$ --" 
                    icon={UtensilsCrossed} 
                    popular={item.popular}
                    onAdd={() => addToCart(item.nome, "R$ --")}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Bebidas Section */}
          {activeCategory === 'bebidas' && (
            <section className="flex flex-col h-full">
              {/* Subcategory Navigation */}
              <div className="mb-10 px-2">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 pb-2">
                  {bebidas.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSubcategory(cat.subcategoria)}
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
                    {activeBebidaSection.itens.map((item, itemIdx) => (
                      <ProductCard 
                        key={itemIdx} 
                        nome={item.nome} 
                        desc={item.desc} 
                        preco={item.preco} 
                        icon={Wine} 
                        popular={(item as any).popular}
                        onAdd={() => addToCart(item.nome, item.preco)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
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
          className="fixed inset-0 bg-theme-overlay backdrop-blur-sm z-50"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Sidebar (Desktop) / Bottom Sheet (Mobile) */}
      {isCartOpen && (
        <motion.div 
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            if (info.offset.y > 100 || info.velocity.y > 500) {
              setIsCartOpen(false);
            }
          }}
          className="fixed bottom-0 left-0 right-0 h-[85vh] md:h-full md:top-0 md:right-0 md:left-auto md:w-[450px] bg-theme-bg shadow-2xl z-50 rounded-t-[2.5rem] md:rounded-none flex flex-col border-t md:border-l border-theme-border"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-full flex justify-center pt-4 pb-2 md:hidden cursor-grab active:cursor-grabbing">
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
                      <p className="text-theme-accent text-sm font-serif mt-1.5 font-medium">{item.preco}</p>
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
            <div className="flex justify-between items-center mb-6">
              <span className="text-theme-text-muted font-semibold uppercase tracking-widest text-xs">Total de Itens</span>
              <span className="text-2xl font-serif text-theme-accent font-bold">{totalItems}</span>
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-theme-accent text-white py-4 rounded-2xl font-semibold tracking-wide transition-all duration-150 flex items-center justify-center space-x-2 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:bg-opacity-90 text-lg"
            >
              <span>Mostrar ao Garçom</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

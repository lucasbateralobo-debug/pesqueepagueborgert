import React, { useState, useEffect } from 'react';
import { Fish, Waves, ShoppingCart, X, Plus, Minus, UtensilsCrossed, Wine, Image as ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const comidas = [
  { nome: "Porção de batata", desc: "Batatas fritas crocantes e douradas" },
  { nome: "Porção de filé de tilápia", desc: "Filés frescos empanados e fritos" },
  { nome: "Porção de posta de tilápia", desc: "Postas suculentas com tempero da casa" },
  { nome: "Porção de bolinho de tilápia com queijo", desc: "Bolinhos artesanais recheados com queijo derretido" },
  { nome: "Porção de salada", desc: "Mix de folhas frescas, tomate e cebola" },
  { nome: "Porção de arroz", desc: "Arroz branco soltinho" },
  { nome: "Porção de pirão de peixe", desc: "Pirão tradicional cremoso e saboroso" },
  { nome: "Porção de camarão alho e óleo", desc: "Camarões salteados no azeite e alho" }
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
      { nome: "Heineken 600ml", preco: "R$ --", desc: "Garrafa 600ml bem gelada" },
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
      { nome: "Combo Vodka + Energéticos", preco: "R$ --", desc: "1 Garrafa de Vodka + 4 Red Bulls" },
      { nome: "Combo Whisky + Energéticos", preco: "R$ --", desc: "1 Garrafa de Whisky + 4 Red Bulls" }
    ]
  },
  {
    subcategoria: "Caipiras",
    itens: [
      { nome: "Caipirinha de Limão", preco: "R$ --", desc: "Cachaça, limão, açúcar e gelo" },
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
const ProductCard = ({ nome, desc, preco, icon: Icon, onAdd }: { key?: React.Key, nome: string, desc?: string, preco: string, icon: any, onAdd: () => void }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <motion.div 
      whileTap={{ scale: 0.96 }}
      onClick={handleAdd}
      className="flex flex-col group cursor-pointer rounded-3xl bg-theme-card border border-theme-border shadow-theme-card hover:shadow-theme-card-hover hover:border-theme-accent/50 transition-all duration-300 overflow-hidden h-full backdrop-blur-md"
    >
      {/* Image Placeholder */}
      <div className="w-full h-36 md:h-44 bg-theme-text/5 relative overflow-hidden group-hover:bg-theme-text/10 transition-colors duration-500 flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center text-theme-text-muted opacity-30">
          <Icon size={36} strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-3 right-3 bg-theme-bg/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-medium text-theme-text-muted transition-colors duration-500 uppercase tracking-wider">
          Sem foto
        </div>
      </div>
      
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-base md:text-lg font-semibold text-theme-text group-hover:text-theme-accent transition-colors duration-300 leading-tight">
            {nome}
          </h3>
          <span className="text-theme-accent font-bold font-serif text-base md:text-lg whitespace-nowrap">{preco}</span>
        </div>
        
        {desc && (
          <p className="text-xs md:text-sm text-theme-text-muted italic leading-relaxed mb-4 flex-1">{desc}</p>
        )}
        
        <div className="flex justify-end mt-auto pt-2">
          <motion.div 
            animate={{ 
              backgroundColor: isAdded ? 'var(--accent)' : 'transparent',
              color: isAdded ? '#ffffff' : 'var(--accent)',
              scale: isAdded ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-1.5 font-medium text-xs md:text-sm px-3.5 py-2 rounded-xl transition-colors duration-300 ${!isAdded && 'bg-theme-accent/10 group-hover:bg-theme-accent group-hover:text-white'}`}
          >
            {isAdded ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
            <span>{isAdded ? 'Adicionado' : 'Adicionar'}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('comidas');
  const [activeSubcategory, setActiveSubcategory] = useState<string>(bebidas[0].subcategoria);
  const [cartPulse, setCartPulse] = useState(false);

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
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-4 flex flex-col items-center"
        >
          <div className="relative flex items-center justify-center w-20 h-14 overflow-hidden">
            <div className="absolute top-0 w-20 h-20 rounded-full border-t-[3px] border-l-[3px] border-r-[3px] border-theme-border border-dashed opacity-80 transition-colors duration-700"></div>
            <Fish size={32} className="text-theme-accent fill-current mt-3 z-10 transition-colors duration-700" />
          </div>
          <Waves size={24} className="text-theme-text -mt-1 z-10 opacity-90 transition-colors duration-700" strokeWidth={2.5} />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold tracking-widest text-theme-accent uppercase font-serif transition-colors duration-700"
        >
          Borgert
        </motion.h1>
        <motion.p 
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-2 text-[9px] md:text-xs tracking-[0.3em] text-theme-text uppercase font-medium opacity-90 transition-colors duration-700"
        >
          Buffet | Restaurante | Eventos
        </motion.p>
      </header>

      {/* Main Category Navigation */}
      <div className="sticky top-0 z-30 bg-theme-nav backdrop-blur-2xl border-b border-theme-border px-4 py-3 shrink-0 transition-colors duration-700">
        <div className="max-w-md mx-auto flex bg-theme-card p-1.5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-theme-border relative transition-colors duration-700">
          <button
            onClick={() => setActiveCategory('comidas')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-colors duration-300 relative z-10 active:scale-[0.98] ${
              activeCategory === 'comidas' 
                ? 'text-white' 
                : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <UtensilsCrossed size={18} />
            <span className="tracking-wide text-sm md:text-base">Comidas</span>
          </button>
          <button
            onClick={() => setActiveCategory('bebidas')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-colors duration-300 relative z-10 active:scale-[0.98] ${
              activeCategory === 'bebidas' 
                ? 'text-white' 
                : 'text-theme-text-muted hover:text-theme-accent'
            }`}
          >
            <Wine size={18} />
            <span className="tracking-wide text-sm md:text-base">Bebidas</span>
          </button>
          
          {/* Animated Background Pill */}
          <motion.div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-xl shadow-md transition-colors duration-700 ${
              activeCategory === 'comidas' ? 'bg-theme-text left-1.5' : 'bg-theme-accent right-1.5'
            }`}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-12 py-8 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="popLayout">
          {/* Comidas Section */}
          {activeCategory === 'comidas' && (
            <motion.section 
              key="comidas"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl italic text-theme-text font-serif transition-colors duration-700">Porções</h2>
                <div className="w-12 h-[2px] bg-theme-border mx-auto mt-4 transition-colors duration-700"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {comidas.map((item, idx) => (
                  <ProductCard 
                    key={idx} 
                    nome={item.nome} 
                    desc={item.desc} 
                    preco="R$ --" 
                    icon={UtensilsCrossed} 
                    onAdd={() => addToCart(item.nome, "R$ --")}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Bebidas Section */}
          {activeCategory === 'bebidas' && (
            <motion.section 
              key="bebidas"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              {/* Subcategory Navigation */}
              <div className="mb-10 px-2">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 pb-2">
                  {bebidas.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSubcategory(cat.subcategoria)}
                      className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-300 border active:scale-95 ${
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
              <AnimatePresence mode="popLayout">
                {activeBebidaSection && (
                  <motion.div 
                    key={activeBebidaSection.subcategoria}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl md:text-3xl font-bold text-theme-text uppercase tracking-widest font-serif inline-block relative transition-colors duration-700">
                        {activeBebidaSection.subcategoria}
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-[2px] bg-theme-accent/60 transition-colors duration-700"></div>
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
                          onAdd={() => addToCart(item.nome, item.preco)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="mt-auto text-center py-10 safe-pb shrink-0">
        <div className="w-16 h-[1px] bg-theme-border mx-auto mb-6 transition-colors duration-700"></div>
        <p className="text-theme-text-muted text-xs font-serif italic transition-colors duration-700">Obrigado pela preferência!</p>
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
              duration: cartPulse ? 0.3 : 0.2,
              scale: { type: "tween", ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-[max(env(safe-area-inset-bottom),1.5rem)] right-4 md:right-8 bg-theme-accent text-white p-4 md:p-5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] transition-all duration-300 z-40 flex items-center justify-center group"
          >
            <motion.div
              animate={{ rotate: cartPulse ? [-10, 10, -10, 0] : 0 }}
              transition={{ duration: 0.4 }}
            >
              <ShoppingCart size={24} strokeWidth={2.5} />
            </motion.div>
            <motion.span 
              key={totalItems}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-2 -right-2 bg-theme-text text-theme-bg text-[11px] font-bold w-7 h-7 flex items-center justify-center rounded-full border-2 border-theme-bg transition-colors duration-500 shadow-sm"
            >
              {totalItems}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sidebar/Bottom Sheet Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-theme-overlay backdrop-blur-md z-50 transition-colors duration-700"
            onClick={() => setIsCartOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Cart Sidebar (Desktop) / Bottom Sheet (Mobile) */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                setIsCartOpen(false);
              }
            }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] md:h-full md:top-0 md:right-0 md:left-auto md:w-[450px] bg-theme-bg shadow-2xl z-50 rounded-t-[2.5rem] md:rounded-none flex flex-col transition-colors duration-700 border-t md:border-l border-theme-border"
          >
            {/* Mobile Drag Indicator */}
            <div className="w-full flex justify-center pt-4 pb-2 md:hidden cursor-grab active:cursor-grabbing">
              <div className="w-14 h-1.5 bg-theme-border rounded-full"></div>
            </div>

            <div className="flex items-center justify-between px-6 md:px-8 pb-5 pt-2 md:pt-8 border-b border-theme-border bg-transparent shrink-0 transition-colors duration-700">
              <h2 className="text-3xl font-serif text-theme-accent italic transition-colors duration-700">Seu Pedido</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2.5 text-theme-text-muted hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors active:scale-95 bg-theme-card shadow-sm border border-theme-border"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 overscroll-contain hide-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center text-theme-text-muted mt-16 italic font-serif flex flex-col items-center transition-colors duration-700">
                  <div className="w-24 h-24 bg-theme-card rounded-full flex items-center justify-center mb-6 shadow-sm border border-theme-border">
                    <ShoppingCart size={40} className="opacity-30" />
                  </div>
                  <p className="text-lg">Seu pedido está vazio.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div 
                      key={item.nome}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center justify-between bg-theme-card p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-theme-border transition-colors duration-700"
                    >
                      <div className="flex-1 pr-4">
                        <h4 className="font-semibold text-theme-text text-sm md:text-base leading-tight transition-colors duration-700">{item.nome}</h4>
                        <p className="text-theme-accent text-sm font-serif mt-1.5 font-medium transition-colors duration-700">{item.preco}</p>
                      </div>
                      
                      <div className="flex items-center space-x-3 bg-theme-bg rounded-xl p-1.5 border border-theme-border transition-colors duration-700 shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.nome, -1)}
                          className="w-8 h-8 flex items-center justify-center text-theme-text hover:text-theme-accent hover:bg-theme-card rounded-lg transition-all active:scale-90 shadow-sm"
                        >
                          <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <span className="w-5 text-center font-bold text-theme-text text-sm transition-colors duration-700">
                          {item.quantidade}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.nome, 1)}
                          className="w-8 h-8 flex items-center justify-center text-theme-text hover:text-theme-accent hover:bg-theme-card rounded-lg transition-all active:scale-90 shadow-sm"
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="p-6 md:p-8 border-t border-theme-border bg-theme-card safe-pb shrink-0 transition-colors duration-700 rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-theme-text-muted font-semibold uppercase tracking-widest text-xs transition-colors duration-700">Total de Itens</span>
                <span className="text-2xl font-serif text-theme-accent font-bold transition-colors duration-700">{totalItems}</span>
              </div>
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-theme-accent text-white py-4 rounded-2xl font-semibold tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:bg-opacity-90 text-lg"
              >
                <span>Mostrar ao Garçom</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

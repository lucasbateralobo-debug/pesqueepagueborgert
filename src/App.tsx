import React, { useState, useEffect, useMemo } from 'react';
import { Fish, Waves, ShoppingCart, X, Plus, Minus, UtensilsCrossed, Wine, Image as ImageIcon, Check, Star, Search, MessageSquare, Info, Moon, Sun, Calendar, Users, ShoppingBag } from 'lucide-react';
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
      { 
        nome: "Refrigerante Lata", 
        preco: 7.00, 
        desc: "Lata 350ml. Escolha o sabor.", 
        imagem: "https://picsum.photos/seed/soda1/400/400", 
        tags: ["sem álcool", "gaseificado"],
        variacoes: [
          { nome: "Coca-Cola", imagem: "https://picsum.photos/seed/coke/400/400" },
          { nome: "Coca-Cola Zero Açúcar", imagem: "https://picsum.photos/seed/cokezero/400/400" },
          { nome: "Pepsi", imagem: "https://picsum.photos/seed/pepsi/400/400" },
          { nome: "Soda Limão", imagem: "https://picsum.photos/seed/soda/400/400" },
          { nome: "Fanta Laranja", imagem: "https://picsum.photos/seed/fanta/400/400" },
          { nome: "Sukita Uva", imagem: "https://picsum.photos/seed/sukita/400/400" },
          { nome: "Guaraná", imagem: "https://picsum.photos/seed/guarana/400/400" },
          { nome: "Guaraná Zero", imagem: "https://picsum.photos/seed/guaranazero/400/400" },
          { nome: "Água Tônica", imagem: "https://picsum.photos/seed/tonica/400/400" },
          { nome: "Água Tônica Zero", imagem: "https://picsum.photos/seed/tonicazero/400/400" }
        ]
      },
      { 
        nome: "Refrigerante 1L", 
        preco: 12.00, 
        desc: "Garrafa 1L. Escolha o sabor.", 
        imagem: "https://picsum.photos/seed/soda2/400/400", 
        tags: ["sem álcool", "gaseificado"],
        variacoes: [
          { nome: "Água da Serra Laranjinha", imagem: "https://picsum.photos/seed/laranjinha/400/400" },
          { nome: "Água da Serra Framboesa", imagem: "https://picsum.photos/seed/framboesa/400/400" },
          { nome: "Água da Serra Limão", imagem: "https://picsum.photos/seed/limao/400/400" },
          { nome: "Água da Serra Guaraná", imagem: "https://picsum.photos/seed/guarana1l/400/400" }
        ]
      }
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
      { nome: "Cabernet Sauvignon Reserva", preco: 120.00, desc: "Vinho tinto encorpado com notas de frutas vermelhas e especiarias. Chile.", imagem: "https://picsum.photos/seed/winecabernet/400/400", tags: ["com álcool", "vinho", "tinto"] },
      { nome: "Malbec Argentino", preco: 145.00, desc: "Aromas intensos de ameixa e baunilha, taninos macios. Mendoza, Argentina.", popular: true, imagem: "https://picsum.photos/seed/winemalbec/400/400", tags: ["com álcool", "vinho", "tinto"] },
      { nome: "Chardonnay Classic", preco: 95.00, desc: "Vinho branco fresco com toques cítricos e final amanteigado.", imagem: "https://picsum.photos/seed/winechardonnay/400/400", tags: ["com álcool", "vinho", "branco"] },
      { nome: "Pinot Noir Suave", preco: 110.00, desc: "Leve e elegante, com notas de cereja e morango. Ideal para frutos do mar.", imagem: "https://picsum.photos/seed/winepinot/400/400", tags: ["com álcool", "vinho", "tinto"] },
      { nome: "Sauvignon Blanc", preco: 85.00, desc: "Branco refrescante, com aromas herbáceos e acidez vibrante.", imagem: "https://picsum.photos/seed/winesauvignon/400/400", tags: ["com álcool", "vinho", "branco"] },
      { nome: "Espumante Brut", preco: 130.00, desc: "Perlage fina e persistente, notas de maçã verde e pão tostado.", imagem: "https://picsum.photos/seed/wineespumante/400/400", tags: ["com álcool", "vinho", "espumante"] }
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
  imagem?: string;
};

type MainCategory = 'comidas' | 'bebidas';

type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

const ProductModal = ({ 
  product, 
  isOpen, 
  onClose, 
  reviews, 
  onAddReview, 
  onAddToCart 
}: { 
  product: any, 
  isOpen: boolean, 
  onClose: () => void, 
  reviews: Review[], 
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void,
  onAddToCart: (variacao?: string) => void 
}) => {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVariacao, setSelectedVariacao] = useState('');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (product && product.variacoes && product.variacoes.length > 0) {
      setSelectedVariacao(product.variacoes[0].nome);
    } else {
      setSelectedVariacao('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) {
      alert('Por favor, selecione uma nota.');
      return;
    }
    if (!newAuthor.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      onAddReview({
        author: newAuthor.trim(),
        rating: newRating,
        comment: newComment.trim()
      });
      setNewRating(0);
      setNewComment('');
      setNewAuthor('');
      setIsSubmitting(false);
    }, 500);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-theme-overlay/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-theme-bg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header / Image Area */}
            <div className="relative h-48 sm:h-64 shrink-0 bg-theme-card">
              {product.imagem ? (
                <img 
                  src={`${product.imagem}.webp`} 
                  alt={product.nome} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-theme-text-muted opacity-30">
                  <ImageIcon size={64} strokeWidth={1.5} />
                </div>
              )}
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{product.nome}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-theme-accent font-bold font-serif text-xl">{formatCurrency(product.preco)}</span>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-white text-sm font-medium">{averageRating.toFixed(1)}</span>
                      <span className="text-white/70 text-xs">({reviews.length})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {product.desc && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider mb-2">Descrição</h3>
                  <p className="text-theme-text-muted leading-relaxed">{product.desc}</p>
                </div>
              )}

              {product.ingredientes && product.ingredientes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider mb-3">Ingredientes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredientes.map((ing: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-theme-card border border-theme-border rounded-full text-xs text-theme-text-muted">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.variacoes && product.variacoes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider mb-4">Escolha a Opção</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.variacoes.map((v: any, idx: number) => (
                      <ProductCard 
                        key={v.nome}
                        index={idx}
                        item={{
                          ...v,
                          preco: v.preco || product.preco,
                          imagem: v.imagem || product.imagem,
                          desc: v.desc || product.desc,
                        }}
                        icon={Plus}
                        onAdd={(item) => {
                          onAddToCart(v.nome);
                        }}
                        onOpenDetails={() => {}}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="w-full h-[1px] bg-theme-border mb-8"></div>

              {/* Reviews Section */}
              <div>
                <h3 className="text-lg font-bold text-theme-text mb-6 flex items-center gap-2">
                  <MessageSquare size={20} className="text-theme-accent" />
                  Avaliações dos Clientes
                </h3>

                {/* Review Form */}
                <form onSubmit={handleSubmitReview} className="bg-theme-card border border-theme-border rounded-2xl p-5 mb-8">
                  <h4 className="text-sm font-bold text-theme-text mb-4">Deixe sua avaliação</h4>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-theme-text-muted mb-2">Sua Nota</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star 
                            size={24} 
                            className={`${star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-theme-border'} transition-colors`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="author" className="block text-xs font-medium text-theme-text-muted mb-2">Seu Nome</label>
                    <input
                      id="author"
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="Como quer ser chamado?"
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-sm text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-xs font-medium text-theme-text-muted mb-2">Comentário (Opcional)</label>
                    <textarea
                      id="comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="O que achou deste item?"
                      rows={3}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-sm text-theme-text focus:outline-none focus:border-theme-accent transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      isSubmitting 
                        ? 'bg-theme-border text-theme-text-muted cursor-not-allowed' 
                        : 'bg-theme-accent text-white hover:bg-theme-accent/90 active:scale-[0.98]'
                    }`}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-theme-bg border border-theme-border rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-theme-text text-sm block">{review.author}</span>
                            <span className="text-xs text-theme-text-muted">{new Date(review.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-theme-border'} 
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-theme-text-muted mt-2 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-theme-bg border border-theme-border border-dashed rounded-xl">
                      <Star size={32} className="text-theme-border mx-auto mb-3" />
                      <p className="text-theme-text-muted text-sm">Nenhuma avaliação ainda.<br/>Seja o primeiro a avaliar!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer Action */}
            {(!product.variacoes || product.variacoes.length === 0) && (
              <div className="p-4 bg-theme-card border-t border-theme-border shrink-0">
                <button
                  onClick={() => {
                    onAddToCart();
                    onClose();
                  }}
                  className="w-full bg-theme-accent text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-theme-accent/90 active:scale-[0.98] transition-all"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Adicionar ao Carrinho
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Reusable Card Component with Micro-interaction
const ProductCard = React.memo(({ item, icon: Icon, onAdd, onOpenDetails, isSophisticatedMode = false, index = 0 }: { key?: React.Key, item: any, icon: any, onAdd: (item: any) => void, onOpenDetails: (item: any) => void, isSophisticatedMode?: boolean, index?: number }) => {
  const { nome, desc, preco, popular, imagem } = item;
  const [isAdded, setIsAdded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.variacoes && item.variacoes.length > 0) {
      onOpenDetails(item);
      return;
    }
    onAdd(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 800);
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
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
          className={`relative w-full h-full min-h-[200px] flex flex-col rounded-3xl bg-theme-card border ${popular ? 'border-theme-accent/30' : 'border-theme-border'} shadow-theme-card group-hover:shadow-theme-card-hover p-4 md:p-5 transition-shadow duration-300 ${isSophisticatedMode ? 'items-center text-center' : ''}`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {popular && (
            <div className={`absolute top-0 left-0 bg-theme-accent/10 border-b border-r border-theme-accent/20 text-theme-accent px-3 py-1.5 rounded-br-2xl rounded-tl-3xl z-10 flex items-center gap-1.5 ${isSophisticatedMode ? 'left-1/2 -translate-x-1/2 rounded-b-2xl rounded-t-none border-l' : ''}`}>
              <Star size={12} className="fill-theme-accent" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Mais Pedido</span>
            </div>
          )}
          
          <div className={`flex flex-col h-full w-full ${popular ? 'pt-6' : ''}`}>
            {isSophisticatedMode && (
              <div className="flex justify-center mb-4 opacity-70">
                <Wine size={32} strokeWidth={1} />
              </div>
            )}
            <div className={`flex ${isSophisticatedMode ? 'justify-center' : 'justify-between'} items-start mb-2 gap-2`}>
              <h3 className={`text-base md:text-lg font-semibold text-theme-text leading-tight group-hover:text-theme-accent transition-colors duration-300 ${isSophisticatedMode ? 'font-serif text-xl' : ''}`}>
                {nome}
              </h3>
            </div>
            
            <span className={`text-theme-accent font-bold font-serif text-lg md:text-xl mb-2 ${isSophisticatedMode ? 'text-2xl my-2' : ''}`}>{formatCurrency(preco)}</span>
            
            {desc && (
              <p className={`text-xs md:text-sm text-theme-text-muted italic leading-relaxed flex-1 ${isSophisticatedMode ? 'font-serif' : ''}`}>{desc}</p>
            )}
            
            <div className={`flex ${isSophisticatedMode ? 'justify-center' : 'justify-end'} items-center mt-auto pt-4 gap-2`}>
              <div 
                onClick={(e) => { e.stopPropagation(); onOpenDetails(item); }}
                className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl transition-all duration-100 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-white active:scale-95 ${isSophisticatedMode ? 'rounded-full' : ''}`}
                title="Detalhes e Avaliações"
              >
                <Info size={18} strokeWidth={2.5} />
              </div>
              <motion.div 
                whileTap={{ scale: 0.85 }}
                animate={isAdded ? { scale: [1, 1.15, 1], transition: { duration: 0.3 } } : {}}
                onClick={handleAdd}
                className={`flex items-center gap-1.5 font-medium text-xs md:text-sm px-3.5 py-2 md:py-2.5 rounded-xl transition-all duration-100 cursor-pointer ${
                  isAdded 
                    ? 'bg-theme-accent text-white' 
                    : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-white'
                } ${isSophisticatedMode ? 'rounded-full px-6 uppercase tracking-widest text-[10px]' : ''}`}
              >
                {isAdded ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                <span>{isAdded ? 'Adicionado' : 'Adicionar'}</span>
              </motion.div>
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
            <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4 gap-2">
              <div 
                onClick={(e) => { e.stopPropagation(); onOpenDetails(item); }}
                className={`flex items-center justify-center w-10 h-10 transition-all duration-100 shadow-md backdrop-blur-md bg-theme-bg/90 text-theme-accent hover:bg-theme-accent hover:text-white active:scale-95 ${isSophisticatedMode ? 'rounded-full' : 'rounded-xl'}`}
                title="Detalhes e Avaliações"
              >
                <Info size={18} strokeWidth={2.5} />
              </div>
              <motion.div 
                whileTap={{ scale: 0.85 }}
                animate={isAdded ? { scale: [1, 1.15, 1], transition: { duration: 0.3 } } : {}}
                onClick={handleAdd}
                className={`flex items-center gap-1.5 font-medium text-xs md:text-sm px-5 py-2.5 transition-all duration-100 shadow-md backdrop-blur-md cursor-pointer ${
                  isAdded 
                    ? 'bg-theme-accent text-white' 
                    : 'bg-theme-bg/90 text-theme-accent hover:bg-theme-accent hover:text-white'
                } ${isSophisticatedMode ? 'rounded-full uppercase tracking-widest text-[10px]' : 'rounded-xl'}`}
              >
                {isAdded ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                <span>{isAdded ? 'Adicionado' : 'Adicionar'}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

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
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('borgert_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    data: '',
    hora: '',
    nome: '',
    quantidade: '',
    obs: ''
  });
  const [reservationError, setReservationError] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(false);

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const day = d.getDay();
      
      if (day === 0 || day === 5 || day === 6) {
        if (i === 0) {
          const now = new Date();
          const currentHour = now.getHours();
          if (day === 5 && currentHour >= 23) continue;
          if (day === 6 && currentHour >= 23) continue;
          if (day === 0 && currentHour >= 15) continue;
        }
        dates.push(d);
      }
    }
    return dates;
  }, []);

  const availableTimes = useMemo(() => {
    if (!reservationForm.data) return [];
    
    const [y, m, d] = reservationForm.data.split('-').map(Number);
    const selectedDate = new Date(y, m - 1, d);
    const day = selectedDate.getDay();
    
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const times = [];
    const addRange = (startH, endH) => {
      for (let h = startH; h <= endH; h++) {
        for (let min of [0, 30]) {
          if (h === endH && min === 30) continue;
          if (isToday) {
            if (h < currentHour || (h === currentHour && min <= currentMinute)) continue;
          }
          times.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
        }
      }
    };

    if (day === 5) {
      addRange(18, 22);
    } else if (day === 6) {
      addRange(11, 14);
      addRange(18, 22);
    } else if (day === 0) {
      addRange(11, 14);
    }

    return times;
  }, [reservationForm.data]);

  const whatsappOptions = [
    { id: 'reservas', label: 'Reservas de Mesa', icon: Calendar, type: 'form' },
    { id: 'eventos', label: 'Eventos e Contato', icon: Users, type: 'whatsapp', message: 'Olá! Gostaria de informações sobre eventos e outras dúvidas.' },
  ];

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReservationError('');

    if (!reservationForm.data || !reservationForm.hora) {
      setReservationError('Por favor, selecione uma data e um horário.');
      return;
    }

    const [y, m, d] = reservationForm.data.split('-').map(Number);
    const [hours, minutes] = reservationForm.hora.split(':').map(Number);
    const selectedDate = new Date(y, m - 1, d, hours, minutes);
    const now = new Date();
    
    if (selectedDate < now) {
      setReservationError('A data e hora da reserva não podem ser no passado.');
      return;
    }

    // Validate quantity
    const quantity = parseInt(reservationForm.quantidade, 10);
    if (isNaN(quantity) || quantity <= 0) {
      setReservationError('A quantidade de pessoas deve ser um número positivo.');
      return;
    }

    if (quantity > 20) {
      setReservationError('Para reservas acima de 20 pessoas, por favor entre em contato via WhatsApp de eventos.');
      return;
    }

    const text = `*🍽️ Nova Solicitação de Reserva*
*👤 Nome:* ${reservationForm.nome}
*📅 Data:* ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(selectedDate)} às ${reservationForm.hora}
*👥 Quantidade de pessoas:* ${quantity}
*📝 Observações:* ${reservationForm.obs || 'Nenhuma'}

*✨ Aguardamos vocês para uma experiência incrível!*`;
    
    setReservationSuccess(true);
    
    setTimeout(() => {
      window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank');
      setIsReservationModalOpen(false);
      setReservationSuccess(false);
      setReservationForm({ data: '', hora: '', nome: '', quantidade: '', obs: '' });
    }, 2000);
  };

  // Persist dark mode to localStorage and apply class
  useEffect(() => {
    localStorage.setItem('borgert_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  useEffect(() => {
    localStorage.setItem('borgert_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch reviews from server
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  const handleAddReview = React.useCallback(async (productName: string, review: Omit<Review, 'id' | 'date'>) => {
    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(productName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews(prev => ({
          ...prev,
          [productName]: [...(prev[productName] || []), newReview]
        }));
      } else {
        alert('Erro ao salvar avaliação. Tente novamente.');
      }
    } catch (error) {
      console.error('Failed to save review:', error);
      alert('Erro ao salvar avaliação. Tente novamente.');
    }
  }, []);

  // Handle category switching with skeleton loading
  const handleCategoryChange = React.useCallback((category: MainCategory) => {
    setActiveCategory((prev) => {
      if (category === prev) return prev;
      setIsLoading(true);
      setActiveSubcategory(category === 'comidas' ? comidas[0].subcategoria : bebidas[0].subcategoria);
      setSearchQuery("");
      setSelectedTags([]);
      setTimeout(() => setIsLoading(false), 300);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return category;
    });
  }, []);

  // Handle subcategory switching with skeleton loading
  const handleSubcategoryChange = React.useCallback((subcat: string) => {
    setActiveSubcategory((prev) => {
      if (subcat === prev) return prev;
      setIsLoading(true);
      setSelectedTags([]);
      setTimeout(() => setIsLoading(false), 300);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return subcat;
    });
  }, []);

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

  const addToCart = React.useCallback((item: any, variacao?: string) => {
    setCart((prev) => {
      const nomeCompleto = variacao ? `${item.nome} - ${variacao}` : item.nome;
      const existing = prev.find((i) => i.nome === nomeCompleto);
      if (existing) {
        return prev.map((i) =>
          i.nome === nomeCompleto ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...prev, { nome: nomeCompleto, preco: item.preco, quantidade: 1, imagem: item.imagem }];
    });
    
    // Trigger cart pulse animation
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 400);
  }, []);

  const updateQuantity = React.useCallback((nome: string, delta: number) => {
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
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantidade, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  
  const activeComidaSection = comidas.find(c => c.subcategoria === activeSubcategory);
  const activeBebidaSection = bebidas.find(b => b.subcategoria === activeSubcategory);
  const isSophisticatedMode = activeCategory === 'bebidas' && activeSubcategory === 'Vinhos';

  const currentSectionItems = activeCategory === 'comidas' ? activeComidaSection?.itens : activeBebidaSection?.itens;

  // Search logic
  const allItems = useMemo(() => {
    return [
      ...comidas.flatMap(c => c.itens.map(i => ({ ...i, category: 'comidas', subcategoria: c.subcategoria, icon: UtensilsCrossed }))),
      ...bebidas.flatMap(b => b.itens.map(i => ({ ...i, category: 'bebidas', subcategoria: b.subcategoria, icon: Wine })))
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

  // Apply sophisticated theme to html for full page coverage
  useEffect(() => {
    if (isSophisticatedMode) {
      document.documentElement.classList.add('theme-sophisticated');
    } else {
      document.documentElement.classList.remove('theme-sophisticated');
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
    <div className={`min-h-screen bg-theme-bg text-theme-text ${isSophisticatedMode ? 'font-serif' : 'font-sans'} selection:bg-theme-accent selection:text-white relative flex flex-col w-full overflow-x-hidden transition-colors duration-300 ${isSophisticatedMode ? 'theme-sophisticated' : ''}`}>
      {/* Header */}
      <header className="safe-pt pb-6 flex flex-col items-center justify-center text-center px-4 shrink-0 relative">
        <div className="absolute top-0 right-0 p-4 md:p-8 safe-pt w-full flex justify-end gap-3 pointer-events-none">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="pointer-events-auto p-2.5 rounded-full bg-theme-card border border-theme-border text-theme-text-muted hover:text-theme-accent hover:border-theme-accent/50 transition-all duration-200 shadow-sm z-20"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {totalItems > 0 && (
            <motion.button
              animate={{ 
                scale: cartPulse ? [1, 1.15, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsCartOpen(true)}
              className="pointer-events-auto relative p-2.5 rounded-full bg-theme-card border border-theme-border text-theme-text-muted hover:text-theme-accent hover:border-theme-accent/50 transition-all duration-200 shadow-sm z-20"
              aria-label="Open Cart"
            >
              <motion.div
                animate={{ 
                  rotate: cartPulse ? [0, -20, 20, -20, 20, 0] : 0,
                  scale: cartPulse ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.4 }}
              >
                <ShoppingCart size={20} />
              </motion.div>
              <motion.span 
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -top-1.5 -right-1.5 bg-theme-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-theme-bg shadow-sm"
              >
                {totalItems}
              </motion.span>
            </motion.button>
          )}
        </div>
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
                ? 'bg-theme-text text-theme-bg shadow-md' 
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
                      key={item.nome} 
                      index={idx}
                      item={item}
                      icon={item.icon} 
                      onAdd={addToCart}
                      onOpenDetails={setSelectedProduct}
                      isSophisticatedMode={item.subcategoria === 'Vinhos'}
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
                        <h3 className="text-2xl md:text-3xl font-bold text-theme-text uppercase tracking-widest font-serif inline-flex items-center justify-center gap-3 relative">
                          <UtensilsCrossed size={28} className="text-theme-accent/80" />
                          <span>{activeComidaSection.subcategoria}</span>
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
                              key={item.nome} 
                              index={idx}
                              item={item}
                              icon={UtensilsCrossed} 
                              onAdd={addToCart}
                              onOpenDetails={setSelectedProduct}
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
                    <h3 className="text-2xl md:text-3xl font-bold text-theme-text uppercase tracking-widest font-serif inline-flex items-center justify-center gap-3 relative">
                      <Wine size={28} className="text-theme-accent/80" />
                      <span>{activeBebidaSection.subcategoria}</span>
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-[2px] bg-theme-accent/60"></div>
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <ProductCardSkeleton key={idx} />
                      ))
                    ) : filteredItems.length > 0 ? (
                      filteredItems.map((item, idx) => (
                        <ProductCard 
                          key={item.nome} 
                          index={idx}
                          item={item}
                          icon={Wine} 
                          onAdd={addToCart}
                          onOpenDetails={setSelectedProduct}
                          isSophisticatedMode={isSophisticatedMode}
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

      {/* WhatsApp Floating Button & Menu */}
      <div className="fixed bottom-[max(env(safe-area-inset-bottom),1.5rem)] left-4 md:left-8 z-40">
        <AnimatePresence>
          {isContactMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30"
                onClick={() => setIsContactMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-16 left-0 w-64 md:w-72 bg-theme-card rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-theme-border p-2 mb-2 origin-bottom-left z-40"
              >
                <div className="p-3 border-b border-theme-border/50 mb-2">
                  <h4 className="font-semibold text-theme-text text-sm">Como podemos ajudar?</h4>
                  <p className="text-xs text-theme-text-muted mt-0.5">Escolha uma opção de contato</p>
                </div>
                <div className="flex flex-col gap-1">
                  {whatsappOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (option.type === 'form') {
                          setIsReservationModalOpen(true);
                        } else {
                          window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(option.message || '')}`, '_blank');
                        }
                        setIsContactMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-theme-bg rounded-xl transition-colors text-left group"
                    >
                      <div className="bg-theme-bg group-hover:bg-theme-card p-2 rounded-lg transition-colors border border-theme-border/50">
                        <option.icon size={16} className="text-theme-accent" />
                      </div>
                      <span className="text-sm font-medium text-theme-text group-hover:text-theme-accent transition-colors">{option.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsContactMenuOpen(!isContactMenuOpen)}
          className="relative bg-[#25D366] text-white p-4 md:p-5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_8px_40px_rgba(37,211,102,0.4)] transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 z-40"
          aria-label="Contato WhatsApp"
        >
          {isContactMenuOpen ? (
            <X size={24} strokeWidth={2.5} />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" height="28" width="28">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Reservation Form Modal */}
      <AnimatePresence>
        {isReservationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsReservationModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-theme-card rounded-3xl shadow-2xl overflow-hidden border border-theme-border"
            >
              <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-bg/50">
                <div>
                  <h3 className="text-xl font-serif font-bold text-theme-text">Reserva de Mesa</h3>
                  <p className="text-sm text-theme-text-muted mt-1">Preencha os dados para solicitar sua reserva</p>
                </div>
                <button 
                  onClick={() => setIsReservationModalOpen(false)}
                  className="p-2 bg-theme-card hover:bg-theme-border/50 rounded-full transition-colors"
                >
                  <X size={20} className="text-theme-text" />
                </button>
              </div>
              
              {reservationSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-2"
                  >
                    <Check size={40} className="text-green-500" />
                  </motion.div>
                  <h3 className="text-2xl font-serif font-bold text-theme-text">Reserva Pronta!</h3>
                  <p className="text-theme-text-muted">Redirecionando para o WhatsApp...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleReservationSubmit} className="p-6 space-y-4">
                  {reservationError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
                      {reservationError}
                    </div>
                  )}
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-theme-text mb-1.5">Nome Completo</label>
                    <input
                      type="text"
                      id="nome"
                      required
                      value={reservationForm.nome}
                      onChange={(e) => setReservationForm({...reservationForm, nome: e.target.value})}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all"
                      placeholder="Seu nome"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="data" className="block text-sm font-medium text-theme-text mb-1.5">Data</label>
                      <select
                        id="data"
                        required
                        value={reservationForm.data}
                        onChange={(e) => setReservationForm({...reservationForm, data: e.target.value, hora: ''})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all appearance-none"
                      >
                        <option value="" disabled>Selecione a data</option>
                        {availableDates.map(date => {
                          const y = date.getFullYear();
                          const m = String(date.getMonth() + 1).padStart(2, '0');
                          const d = String(date.getDate()).padStart(2, '0');
                          const value = `${y}-${m}-${d}`;
                          const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(date);
                          return <option key={value} value={value}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>;
                        })}
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="hora" className="block text-sm font-medium text-theme-text mb-1.5">Horário</label>
                      <select
                        id="hora"
                        required
                        disabled={!reservationForm.data || availableTimes.length === 0}
                        value={reservationForm.hora}
                        onChange={(e) => setReservationForm({...reservationForm, hora: e.target.value})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="" disabled>
                          {!reservationForm.data ? 'Selecione a data' : (availableTimes.length === 0 ? 'Sem horários' : 'Selecione o horário')}
                        </option>
                        {availableTimes.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="quantidade" className="block text-sm font-medium text-theme-text mb-1.5">Pessoas</label>
                      <input
                        type="number"
                        id="quantidade"
                        min="1"
                        max="20"
                        required
                        value={reservationForm.quantidade}
                        onChange={(e) => setReservationForm({...reservationForm, quantidade: e.target.value})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all"
                        placeholder="Ex: 4"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="obs" className="block text-sm font-medium text-theme-text mb-1.5">Observações (Opcional)</label>
                    <textarea
                      id="obs"
                      rows={3}
                      value={reservationForm.obs}
                      onChange={(e) => setReservationForm({...reservationForm, obs: e.target.value})}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all resize-none"
                      placeholder="Alguma preferência ou restrição?"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#25D366] text-white py-4 rounded-xl font-semibold tracking-wide transition-all duration-150 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:bg-[#20bd5a] active:scale-[0.98]"
                  >
                    <MessageSquare size={20} />
                    <span>Enviar Solicitação via WhatsApp</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              animate={{ 
                rotate: cartPulse ? [0, -20, 20, -20, 20, 0] : 0,
                scale: cartPulse ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: 0.4 }}
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
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-theme-accent/10 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-theme-card rounded-full shadow-sm border border-theme-border flex items-center justify-center">
                    <UtensilsCrossed size={48} className="text-theme-accent/50" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-serif font-bold text-theme-text mb-2">Seu pedido está vazio</h3>
                <p className="text-theme-text-muted text-sm md:text-base max-w-[250px] mx-auto leading-relaxed">
                  Que tal explorar nosso cardápio e adicionar algumas delícias?
                </p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-8 px-8 py-3 bg-theme-bg border-2 border-theme-accent text-theme-accent rounded-xl font-semibold hover:bg-theme-accent hover:text-white transition-colors duration-200 active:scale-95"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div 
                    key={item.nome}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 bg-theme-card p-3 md:p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-theme-border"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.imagem ? (
                        <img src={`${item.imagem}.webp`} alt={item.nome} className="w-14 h-14 rounded-xl object-cover border border-theme-border/50 shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-theme-border/20 flex items-center justify-center shrink-0">
                          <UtensilsCrossed size={20} className="text-theme-text-muted opacity-50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-theme-text text-sm md:text-base leading-tight truncate">{item.nome}</h4>
                        <p className="text-theme-accent text-sm font-serif mt-1 font-medium">{formatCurrency(item.preco)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-1 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-theme-border/50">
                      <span className="text-xs text-theme-text-muted font-medium sm:hidden">Quantidade:</span>
                      <div className="flex items-center space-x-3 bg-theme-bg rounded-xl p-1 border border-theme-border shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.nome, -1)}
                          className="w-8 h-8 flex items-center justify-center text-theme-text hover:text-theme-accent hover:bg-theme-card rounded-lg transition-all active:scale-90 shadow-sm"
                        >
                          <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <span className="w-6 text-center font-bold text-theme-text text-sm">
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
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="p-5 md:p-8 border-t border-theme-border bg-theme-card safe-pb shrink-0 rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-theme-text-muted font-medium text-sm">Total de Itens</span>
              <span className="text-theme-text font-bold">{totalItems}</span>
            </div>
            <div className="flex justify-between items-end mb-5">
              <span className="text-theme-text-muted font-semibold uppercase tracking-widest text-xs mb-1">Subtotal</span>
              <span className="text-3xl font-serif text-theme-accent font-bold leading-none">{formatCurrency(subtotal)}</span>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-semibold tracking-wide transition-all duration-150 flex items-center justify-center space-x-2 shadow-[0_8px_20px_rgba(37,211,102,0.25)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.35)] hover:bg-[#20bd5a] text-lg active:scale-[0.98]"
            >
              <MessageSquare size={20} className="mr-1" />
              <span>Finalizar Pedido</span>
            </button>
          </div>
        </div>
        
        <ProductModal 
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          reviews={selectedProduct ? (reviews[selectedProduct.nome] || []) : []}
          onAddReview={(review) => handleAddReview(selectedProduct.nome, review)}
          onAddToCart={(variacao) => addToCart(selectedProduct, variacao)}
        />
    </div>
  );
}

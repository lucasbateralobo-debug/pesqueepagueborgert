import React, { useState, useEffect, useMemo } from 'react';
import { Fish, Waves, ShoppingCart, X, Plus, Minus, UtensilsCrossed, Wine, Image as ImageIcon, Check, Star, Search, MessageSquare, Info, Moon, Sun, Calendar, Users, ShoppingBag, Settings, Gift, Cake, Music, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

import Admin from './Admin';

// We'll keep the categories structure but populate it from the API
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
  destaque?: boolean;
  preco_promocional?: number | null;
  destaque_label?: string;
};

type Category = {
  subcategoria: string;
  itens: Product[];
};


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
  const [isAdded, setIsAdded] = useState(false);

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
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-theme-bg/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-theme-border/50 flex flex-col"
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
                  <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider mb-2">DescriÃ§Ã£o</h3>
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
                  <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider mb-4">Escolha a OpÃ§Ã£o</h3>
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
                  AvaliaÃ§Ãµes dos Clientes
                </h3>

                {/* Review Form */}
                <form onSubmit={handleSubmitReview} className="bg-theme-card border border-theme-border rounded-2xl p-5 mb-8">
                  <h4 className="text-sm font-bold text-theme-text mb-4">Deixe sua avaliaÃ§Ã£o</h4>
                  
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
                    <label htmlFor="comment" className="block text-xs font-medium text-theme-text-muted mb-2">ComentÃ¡rio (Opcional)</label>
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
                    {isSubmitting ? 'Enviando...' : 'Enviar AvaliaÃ§Ã£o'}
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
                      <p className="text-theme-text-muted text-sm">Nenhuma avaliaÃ§Ã£o ainda.<br/>Seja o primeiro a avaliar!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer Action */}
            {(!product.variacoes || product.variacoes.length === 0) && (
              <div className="p-4 bg-theme-card border-t border-theme-border shrink-0">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  animate={isAdded ? { scale: [1, 1.05, 1], transition: { duration: 0.3 } } : {}}
                  onClick={() => {
                    if (isAdded) return;
                    onAddToCart();
                    setIsAdded(true);
                    setTimeout(() => {
                      setIsAdded(false);
                      onClose();
                    }, 1000);
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isAdded 
                      ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                      : 'bg-theme-accent text-white hover:bg-theme-accent/90'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Check size={20} strokeWidth={3} />
                      </motion.div>
                      <span>Adicionado!</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={2.5} />
                      <span>Adicionar ao Carrinho</span>
                    </>
                  )}
                </motion.button>
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
    if (isAdded) return;
    onAdd(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
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
          className={`relative w-full h-full min-h-[220px] flex flex-col rounded-[2rem] bg-theme-card border ${popular ? 'border-theme-accent/30' : 'border-theme-border/40'} shadow-sm group-hover:shadow-2xl group-hover:shadow-theme-accent/5 p-5 md:p-6 transition-all duration-500 overflow-hidden ${isSophisticatedMode ? 'items-center text-center' : ''}`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {popular && (
            <div className={`absolute top-0 right-0 bg-theme-accent text-white px-4 py-1.5 rounded-bl-2xl rounded-tr-[2rem] z-10 flex items-center gap-1.5 ${isSophisticatedMode ? 'left-1/2 -translate-x-1/2 rounded-b-2xl rounded-t-none border-l' : ''}`}>
              <Star size={10} className="fill-white" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Destaque</span>
            </div>
          )}
          
          <div className={`flex flex-col h-full w-full`}>
            {isSophisticatedMode && (
              <div className="flex justify-center mb-4 opacity-70">
                <Wine size={32} strokeWidth={1} />
              </div>
            )}
            <div className={`flex ${isSophisticatedMode ? 'justify-center' : 'justify-between'} items-start mb-3 gap-2`}>
              <h3 className={`text-lg md:text-xl font-bold text-theme-text leading-tight group-hover:text-theme-accent transition-colors duration-300 ${isSophisticatedMode ? 'font-serif text-2xl' : ''}`}>
                {nome}
              </h3>
            </div>
            
            <span className={`text-theme-accent font-bold font-serif text-xl md:text-2xl mb-3 ${isSophisticatedMode ? 'text-3xl my-3' : ''}`}>
              {(item as any).preco_promocional && (item as any).preco_promocional < preco ? (
                <>
                  <span className="line-through text-theme-text-muted text-sm mr-2 font-normal">{formatCurrency(preco)}</span>
                  {formatCurrency((item as any).preco_promocional)}
                </>
              ) : (
                formatCurrency(preco)
              )}
            </span>
            
            {desc && (
              <p className={`text-xs md:text-sm text-theme-text-muted font-medium leading-relaxed flex-1 opacity-80 ${isSophisticatedMode ? 'font-serif' : ''}`}>{desc}</p>
            )}
            
            <div className={`flex ${isSophisticatedMode ? 'justify-center' : 'justify-between'} items-center mt-6 gap-3`}>
              <div 
                onClick={(e) => { e.stopPropagation(); onOpenDetails(item); }}
                className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 bg-theme-border/5 text-theme-text-muted hover:bg-theme-accent hover:text-white active:scale-90`}
                title="Detalhes"
              >
                <Info size={18} strokeWidth={2.5} />
              </div>
              <motion.div 
                whileTap={{ scale: 0.9 }}
                animate={isAdded ? { scale: [1, 1.1, 1] } : {}}
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs md:text-sm px-6 py-3 rounded-full transition-all duration-300 cursor-pointer ${
                  isAdded 
                    ? 'bg-green-500 text-white shadow-xl shadow-green-500/20' 
                    : 'bg-theme-text text-theme-bg hover:bg-theme-accent hover:text-white shadow-lg shadow-theme-text/5'
                } ${isSophisticatedMode ? 'rounded-full uppercase tracking-widest text-[10px]' : ''}`}
              >
                {isAdded ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <Plus size={18} strokeWidth={2.5} />
                )}
                <span>{isAdded ? 'Feito' : 'Pedir'}</span>
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
                  src={imagem} 
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
                title="Detalhes e AvaliaÃ§Ãµes"
              >
                <Info size={18} strokeWidth={2.5} />
              </div>
              <motion.div 
                whileTap={{ scale: 0.85 }}
                animate={isAdded ? { scale: [1, 1.15, 1], transition: { duration: 0.3 } } : {}}
                onClick={handleAdd}
                className={`flex items-center gap-1.5 font-medium text-xs md:text-sm px-5 py-2.5 transition-all duration-100 shadow-md backdrop-blur-md cursor-pointer ${
                  isAdded 
                    ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                    : 'bg-theme-bg/90 text-theme-accent hover:bg-theme-accent hover:text-white'
                } ${isSophisticatedMode ? 'rounded-full uppercase tracking-widest text-[10px]' : 'rounded-xl'}`}
              >
                {isAdded ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </motion.div>
                ) : (
                  <Plus size={16} strokeWidth={2.5} />
                )}
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
  const [comidas, setComidas] = useState<Category[]>([]);
  const [bebidas, setBebidas] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({
    whatsapp: '5511999999999',
    max_reservations: '20',
    birthday_items: '[]'
  });
  const [isBirthdayOpen, setIsBirthdayOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('comidas');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('');
  const [cartPulse, setCartPulse] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    obs: '',
    contato_id: '0'
  });

  const parsedWhatsappList = useMemo(() => {
    try {
      const list = JSON.parse(siteSettings.whatsapp);
      return Array.isArray(list) && list.length > 0 ? list : [{ nome: 'Atendimento', numero: siteSettings.whatsapp || '5511999999999' }];
    } catch {
      return [{ nome: 'Atendimento', numero: siteSettings.whatsapp || '5511999999999' }];
    }
  }, [siteSettings.whatsapp]);
  const [reservationError, setReservationError] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

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
    const addRange = (startH: number, endH: number) => {
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
    { id: 'reservas', label: 'Fazer Reserva', icon: Calendar, type: 'form' },
    ...parsedWhatsappList.map((wa, idx) => ({
      id: `contato-${idx}`,
      label: `Falar com ${wa.nome}`,
      icon: Users,
      type: 'whatsapp',
      message: 'OlÃ¡! Gostaria de informaÃ§Ãµes.',
      numero: wa.numero
    }))
  ];

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReservationError('');

    if (!reservationForm.data || !reservationForm.hora) {
      setReservationError('Por favor, selecione uma data e um horÃ¡rio.');
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

    const maxRes = parseInt(siteSettings.max_reservations || '20', 10);
    if (quantity > maxRes) {
      setReservationError(`Para reservas acima de ${maxRes} pessoas, por favor entre em contato via WhatsApp de eventos.`);
      return;
    }

    const text = `*🍽️ Nova Solicitação de Reserva*
*👤 Nome:* ${reservationForm.nome}
*📅 Data:* ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(selectedDate)} às ${reservationForm.hora}
*👥 Quantidade de pessoas:* ${quantity}
*📝 Observações:* ${reservationForm.obs || 'Nenhuma'}

*✨ Aguardamos vocês para uma experiência incrível!*`;
    
    setReservationSuccess(true);
    
    const selectedContact = parsedWhatsappList[parseInt(reservationForm.contato_id, 10)] || parsedWhatsappList[0];
    const targetNumber = selectedContact.numero;

    setTimeout(() => {
      window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`, '_blank');
      setIsReservationModalOpen(false);
      setReservationSuccess(false);
      setReservationForm({ data: '', hora: '', nome: '', quantidade: '', obs: '', contato_id: '0' });
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

  // Shake Detection for Birthday
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let threshold = 15; // Sensitivity
    let lastUpdate = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const curTime = Date.now();
      if ((curTime - lastUpdate) > 100) {
        const diffTime = curTime - lastUpdate;
        lastUpdate = curTime;

        const { x, y, z } = acceleration;
        const speed = Math.abs((x || 0) + (y || 0) + (z || 0) - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > threshold) {
          // SHAKEN!
          setIsBirthdayOpen(true);
        }

        lastX = x || 0;
        lastY = y || 0;
        lastZ = z || 0;
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  // Launch confetti when birthday opens
  useEffect(() => {
    if (isBirthdayOpen) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 101 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isBirthdayOpen]);

  // Fetch data from server
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, settingsRes, reviewsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/settings'),
          fetch('/api/reviews')
        ]);

        if (productsRes.ok && settingsRes.ok) {
          const products: Product[] = await productsRes.json();
          const settings = await settingsRes.json();
          
          setSiteSettings(settings);

          // Group products by category and subcategory
          const visibleProducts = products.filter(p => !p.oculto);
          
          const processCategory = (cat: string) => {
            const grouped: Record<string, Product[]> = {};
            visibleProducts.filter(p => p.categoria === cat).forEach(p => {
              if (!grouped[p.subcategoria]) grouped[p.subcategoria] = [];
              grouped[p.subcategoria].push(p);
            });
            return Object.entries(grouped).map(([sub, itens]) => ({ subcategoria: sub, itens }));
          };

          const newComidas = processCategory('comidas');
          const newBebidas = processCategory('bebidas');

          setComidas(newComidas);
          setBebidas(newBebidas);

          if (!activeSubcategory) {
            if (activeCategory === 'comidas' && newComidas.length > 0) setActiveSubcategory(newComidas[0].subcategoria);
            else if (activeCategory === 'bebidas' && newBebidas.length > 0) setActiveSubcategory(newBebidas[0].subcategoria);
          }
        }
        
        if (reviewsRes.ok) {
          setReviews(await reviewsRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [showAdmin]); // Refetch when returning from admin


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
        alert('Erro ao salvar avaliaÃ§Ã£o. Tente novamente.');
      }
    } catch (error) {
      console.error('Failed to save review:', error);
      alert('Erro ao salvar avaliaÃ§Ã£o. Tente novamente.');
    }
  }, []);

  // Handle category switching with skeleton loading
  const handleCategoryChange = React.useCallback((category: MainCategory) => {
    setActiveCategory(category);
    setIsLoading(true);
    
    // Safety check to set initial subcategory
    if (category === 'comidas' && comidas.length > 0) {
      setActiveSubcategory(comidas[0].subcategoria);
    } else if (category === 'bebidas' && bebidas.length > 0) {
      setActiveSubcategory(bebidas[0].subcategoria);
    }
    
    setSearchQuery("");
    setSelectedTags([]);
    setTimeout(() => setIsLoading(false), 300);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [comidas, bebidas]);

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

  // Ensure activeSubcategory is valid for the active category
  useEffect(() => {
    if (activeCategory === 'comidas' && comidas.length > 0) {
      const exists = comidas.some(c => c.subcategoria === activeSubcategory);
      if (!exists && comidas[0]) setActiveSubcategory(comidas[0].subcategoria);
    } else if (activeCategory === 'bebidas' && bebidas.length > 0) {
      const exists = bebidas.some(b => b.subcategoria === activeSubcategory);
      if (!exists && bebidas[0]) setActiveSubcategory(bebidas[0].subcategoria);
    }
  }, [activeCategory, comidas, bebidas, activeSubcategory]);

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
  }, [comidas, bebidas]);

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

  // Featured / promoted products
  const featuredProducts = useMemo(() => {
    return allItems.filter(item => (item as any).destaque === true && !(item as any).oculto);
  }, [allItems]);

  if (showAdmin) {
    return <Admin onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className={`min-h-screen bg-theme-bg text-theme-text ${isSophisticatedMode ? 'font-serif' : 'font-sans'} selection:bg-theme-accent selection:text-white relative flex flex-col w-full overflow-x-hidden transition-colors duration-500 ${isSophisticatedMode ? 'theme-sophisticated' : ''}`} style={{ backgroundImage: 'radial-gradient(circle at top right, var(--color-theme-accent)/0.03, transparent 40%)' }}>
      {/* Header */}
      <header className="safe-pt pb-12 flex flex-col items-center justify-center text-center px-4 shrink-0 relative overflow-hidden">
        {/* Animated Background Glow */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-theme-accent/20 rounded-full blur-[120px] pointer-events-none"
        />
        
        <div className="absolute top-0 right-0 p-4 md:p-8 safe-pt w-full flex justify-end gap-3 pointer-events-none">
          <button
            onClick={() => setShowAdmin(true)}
            className="pointer-events-auto p-2.5 rounded-full bg-theme-card/80 backdrop-blur-xl border border-theme-border/50 text-theme-text-muted hover:text-theme-accent hover:border-theme-accent/50 transition-all duration-300 shadow-xl shadow-black/5 z-20"
            aria-label="Admin"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="pointer-events-auto p-2.5 rounded-full bg-theme-card/80 backdrop-blur-xl border border-theme-border/50 text-theme-text-muted hover:text-theme-accent hover:border-theme-accent/50 transition-all duration-300 shadow-xl shadow-black/5 z-20"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {totalItems > 0 && (
            <motion.button
              animate={{ scale: cartPulse ? [1, 1.15, 1] : 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsCartOpen(true)}
              className="pointer-events-auto relative p-2.5 rounded-full bg-theme-card/80 backdrop-blur-xl border border-theme-border/50 text-theme-text-muted hover:text-theme-accent hover:border-theme-accent/50 transition-all duration-300 shadow-xl shadow-black/5 z-20"
              aria-label="Open Cart"
            >
              <ShoppingCart size={20} />
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

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-col items-center select-none cursor-pointer"
          onClick={(e) => {
            if (e.detail === 3) setIsBirthdayOpen(true);
          }}
        >
          <div className="relative w-[280px] h-[140px] flex justify-center overflow-visible">
            <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible drop-shadow-md">
              <defs>
                <clipPath id="fish-clip">
                  <ellipse cx="100" cy="80" rx="60" ry="35" />
                </clipPath>
              </defs>
              
              {/* Rope Semi-Circle - Dark Blue */}
              <path 
                d="M 30,90 A 70,70 0 0,1 170,90" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="10" 
                strokeDasharray="6 4"
                className="text-[#203a56] dark:text-[#6ba1d6]"
              />
              <path 
                d="M 30,90 A 70,70 0 0,1 170,90" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="14"
                strokeOpacity="0.2"
                className="text-[#203a56] dark:text-[#6ba1d6]"
              />

              {/* Solid Red Fish */}
              <g transform="translate(65, 45) scale(0.6)">
                <path 
                  d="M 85.3,16 C 60,16 35,30 20,45 L -10,15 C -5,35 -5,55 -10,75 L 20,45 C 35,60 60,74 85.3,74 C 115,74 130,55 130,45 C 130,35 115,16 85.3,16 Z" 
                  className="fill-[#ce1f21]"
                />
                <circle cx="110" cy="35" r="4" fill="white" />
              </g>

              {/* Dark Blue Waves */}
              <path 
                d="M 10,95 Q 25,85 40,95 T 70,95 T 100,95 T 130,95 T 160,95 T 190,95" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4.5" 
                strokeLinecap="round"
                className="text-[#203a56] dark:text-[#6ba1d6]"
              />
              <path 
                d="M 15,107 Q 30,97 45,107 T 75,107 T 105,107 T 135,107 T 165,107 T 185,107" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4.5" 
                strokeLinecap="round"
                className="text-[#203a56] dark:text-[#6ba1d6]"
              />
            </svg>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.4 }}
            className="text-6xl md:text-[5.5rem] mt-4 font-black tracking-tighter text-[#ce1f21] uppercase"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            Borgert
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="text-sm md:text-lg text-[#203a56] dark:text-[#6ba1d6] font-semibold tracking-[0.2em] md:tracking-[0.3em] uppercase mt-1"
          >
            Buffet | Restaurante | Eventos
          </motion.p>
        </motion.div>
      </header>

      {/* Featured / Promotions Section */}
      {featuredProducts.length > 0 && !searchQuery.trim() && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="px-4 md:px-12 mb-6"
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-red-500 rounded-lg flex items-center justify-center text-white text-sm">
                ðŸ”¥
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-theme-text font-serif">Destaques & Ofertas</h2>
                <p className="text-[11px] text-theme-text-muted uppercase tracking-wider font-medium">ImperdÃ­veis</p>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x snap-mandatory">
              {featuredProducts.map((item, idx) => (
                <motion.div
                  key={item.id || item.nome}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="snap-start shrink-0 w-[260px] md:w-[300px] group cursor-pointer"
                  onClick={() => setSelectedProduct(item)}
                >
                  <div className="relative bg-theme-card rounded-3xl border border-theme-accent/20 overflow-hidden shadow-lg hover:shadow-xl hover:shadow-theme-accent/10 transition-all duration-300 hover:-translate-y-1">
                    {/* Promotion Label */}
                    {(item as any).destaque_label && (
                      <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-gradient-to-r from-red-500 to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                        {(item as any).destaque_label}
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-40 md:h-48 bg-theme-bg overflow-hidden">
                      {item.imagem ? (
                        <img
                          src={item.imagem}
                          alt={item.nome}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-text-muted opacity-30">
                          <ImageIcon size={48} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-theme-text text-base mb-1 group-hover:text-theme-accent transition-colors">
                        {item.nome}
                      </h3>
                      {item.desc && (
                        <p className="text-xs text-theme-text-muted line-clamp-2 mb-3">{item.desc}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          {(item as any).preco_promocional && (item as any).preco_promocional < item.preco ? (
                            <>
                              <span className="text-lg font-bold text-theme-accent font-serif">
                                {formatCurrency((item as any).preco_promocional)}
                              </span>
                              <span className="text-xs text-theme-text-muted line-through">
                                {formatCurrency(item.preco)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-theme-accent font-serif">
                              {formatCurrency(item.preco)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="w-9 h-9 rounded-full bg-theme-accent text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-theme-accent/20"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Discount Badge */}
                    {(item as any).preco_promocional && (item as any).preco_promocional < item.preco && (
                      <div className="absolute top-3 right-3 z-10 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-[10px] font-black leading-tight text-center">
                          -{Math.round(((item.preco - (item as any).preco_promocional) / item.preco) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Main Category Navigation */}
      <div className="sticky top-0 z-30 bg-theme-bg/80 backdrop-blur-xl border-b border-theme-border/50 px-4 py-4 shrink-0 overflow-hidden">
        <div className="max-w-md mx-auto flex bg-theme-card/50 p-1 rounded-full shadow-lg border border-theme-border/30 relative">
          <motion.div 
            layoutId="activeCategoryBg"
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-colors duration-500 ${activeCategory === 'comidas' ? 'left-1 bg-theme-text' : 'left-[calc(50%+3px)] bg-theme-accent'}`}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button
            onClick={() => handleCategoryChange('comidas')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-bold transition-all duration-300 relative z-10 active:scale-[0.95] ${
              activeCategory === 'comidas' ? 'text-theme-bg' : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <UtensilsCrossed size={20} />
            <span className="tracking-wide text-sm md:text-base">CardÃ¡pio</span>
          </button>
          <button
            onClick={() => handleCategoryChange('bebidas')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-bold transition-all duration-300 relative z-10 active:scale-[0.95] ${
              activeCategory === 'bebidas' ? 'text-theme-bg' : 'text-theme-text-muted hover:text-theme-accent'
            }`}
          >
            <Wine size={20} />
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
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
                            <p className="text-theme-text-muted text-lg">Nenhum item com essas caracterÃ­sticas.</p>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
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
                        <p className="text-theme-text-muted text-lg">Nenhum item com essas caracterÃ­sticas.</p>
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
      </footer>

      {/* Birthday Overlay (Mobile Only Trigger) */}
      <AnimatePresence>
        {isBirthdayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-theme-bg/95 backdrop-blur-xl flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex justify-end p-2">
              <button 
                onClick={() => setIsBirthdayOpen(false)}
                className="p-3 bg-theme-card border border-theme-border rounded-full text-theme-text shadow-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto py-8">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl"
              >
                <Cake size={48} />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black text-theme-text font-serif italic tracking-tighter">Parabéns pra você!</h2>
                <p className="text-theme-text-muted font-medium uppercase tracking-widest text-xs">Comemore o seu dia no Borgert</p>
              </div>

              <div className="w-full space-y-4 pt-4">
                <h3 className="text-sm font-bold text-theme-text uppercase flex items-center justify-center gap-2">
                  <Music size={16} /> 
                  Peça o seu item de parabéns:
                </h3>
                
                <div className="grid grid-cols-1 gap-3 w-full">
                  {(() => {
                    try {
                      const items = JSON.parse(siteSettings.birthday_items);
                      if (items.length === 0) return (
                        <div className="p-8 text-center bg-theme-card border border-theme-border rounded-2xl italic text-theme-text-muted text-sm">
                          O garçom já está vindo com a alegria! 🎂
                        </div>
                      );
                      return items.map((item: any, idx: number) => (
                        <motion.button
                          key={idx}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const text = `*🎂 PEDIDO DE ANIVERSÁRIO*\nQuero pedir: *${item.nome}* para o parabéns na minha mesa!`;
                            window.open(`https://wa.me/${parsedWhatsappList[0]?.numero}?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="flex items-center gap-4 p-4 bg-theme-card border border-theme-border rounded-2xl hover:border-theme-accent transition-all text-left group"
                        >
                          {item.imagem ? (
                            <img src={item.imagem} className="w-16 h-16 rounded-xl object-cover" />
                          ) : (
                            <div className="w-16 h-16 bg-theme-bg rounded-xl flex items-center justify-center text-theme-text-muted">
                              <Gift size={24} />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-theme-text">{item.nome}</p>
                            <p className="text-xs text-theme-text-muted line-clamp-2">{item.desc}</p>
                          </div>
                          <ChevronRight size={16} className="text-theme-text-muted group-hover:text-theme-accent transition-colors" />
                        </motion.button>
                      ));
                    } catch { return null; }
                  })()}
                </div>
              </div>

              <div className="pt-8 opacity-40 text-[10px] text-theme-text font-bold uppercase tracking-widest">
                Aviso: Gire ou chacoalhe o aparelho para a mágica acontecer! 🪄
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <p className="text-xs text-theme-text-muted mt-0.5">Escolha uma opÃ§Ã£o de contato</p>
                </div>
                <div className="flex flex-col gap-1">
                  {whatsappOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (option.type === 'form') {
                          setIsReservationModalOpen(true);
                        } else {
                          window.open(`https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent(option.message || '')}`, '_blank');
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
                      <label htmlFor="hora" className="block text-sm font-medium text-theme-text mb-1.5">HorÃ¡rio</label>
                      <select
                        id="hora"
                        required
                        disabled={!reservationForm.data || availableTimes.length === 0}
                        value={reservationForm.hora}
                        onChange={(e) => setReservationForm({...reservationForm, hora: e.target.value})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="" disabled>
                          {!reservationForm.data ? 'Selecione a data' : (availableTimes.length === 0 ? 'Sem horÃ¡rios' : 'Selecione o horÃ¡rio')}
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
                    <label htmlFor="obs" className="block text-sm font-medium text-theme-text mb-1.5">ObservaÃ§Ãµes (Opcional)</label>
                    <textarea
                      id="obs"
                      rows={3}
                      value={reservationForm.obs}
                      onChange={(e) => setReservationForm({...reservationForm, obs: e.target.value})}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all resize-none"
                      placeholder="Alguma preferÃªncia ou restriÃ§Ã£o?"
                    />
                  </div>
                  
                  {parsedWhatsappList.length > 1 && (
                    <div>
                      <label htmlFor="contato" className="block text-sm font-medium text-theme-text mb-1.5">Enviar pedido para:</label>
                      <select
                        id="contato"
                        value={reservationForm.contato_id}
                        onChange={(e) => setReservationForm({...reservationForm, contato_id: e.target.value})}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all appearance-none"
                      >
                        {parsedWhatsappList.map((contact, index) => (
                          <option key={index} value={index.toString()}>{contact.nome}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#25D366] text-white py-4 rounded-xl font-semibold tracking-wide transition-all duration-150 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:bg-[#20bd5a] active:scale-[0.98]"
                  >
                    <MessageSquare size={20} />
                    <span>Enviar SolicitaÃ§Ã£o via WhatsApp</span>
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
                <h3 className="text-2xl font-serif font-bold text-theme-text mb-2">Seu pedido estÃ¡ vazio</h3>
                <p className="text-theme-text-muted text-sm md:text-base max-w-[250px] mx-auto leading-relaxed">
                  Que tal explorar nosso cardÃ¡pio e adicionar algumas delÃ­cias?
                </p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-8 px-8 py-3 bg-theme-bg border-2 border-theme-accent text-theme-accent rounded-xl font-semibold hover:bg-theme-accent hover:text-white transition-colors duration-200 active:scale-95"
                >
                  Ver CardÃ¡pio
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
                        <img src={item.imagem} alt={item.nome} className="w-14 h-14 rounded-xl object-cover border border-theme-border/50 shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-theme-border/20 flex items-center justify-center shrink-0">
                          <UtensilsCrossed size={20} className="text-theme-text-muted opacity-50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-theme-text text-sm md:text-base leading-tight truncate uppercase tracking-wider">{item.nome}</h4>
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
              onClick={() => {
                setIsCartOpen(false);
                setIsOrderSummaryOpen(true);
              }}
              className="w-full bg-theme-text text-theme-bg py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-150 flex items-center justify-center space-x-2 shadow-lg hover:bg-theme-accent hover:text-white text-lg active:scale-[0.98]"
            >
              <Check size={20} className="mr-1" />
              <span>Concluir Pedido</span>
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

        {/* Order Summary Modal (Waiter Focus) */}
        <AnimatePresence>
          {isOrderSummaryOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-theme-overlay/95 backdrop-blur-md"
                onClick={() => setIsOrderSummaryOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-theme-card rounded-[2.5rem] shadow-2xl border border-theme-border overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-8 border-b border-theme-border flex justify-between items-start bg-theme-bg/50">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-theme-text italic">Resumo do Pedido</h3>
                    <p className="text-xs text-theme-text-muted mt-1 uppercase tracking-widest font-black opacity-60">Apresente ao garÃ§om</p>
                  </div>
                  <button 
                    onClick={() => setIsOrderSummaryOpen(false)}
                    className="p-3 bg-theme-card hover:bg-theme-border/50 rounded-full transition-colors border border-theme-border shadow-sm active:scale-90"
                  >
                    <X size={24} className="text-theme-text" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-7 overscroll-contain">
                  {cart.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex justify-between items-start gap-4 pb-6 border-b border-theme-border/30 last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <h4 className="text-3xl font-black text-theme-text uppercase tracking-tighter leading-[0.9] mb-2 break-words">
                          {item.quantidade}x {item.nome}
                        </h4>
                        <p className="text-theme-accent font-serif text-xl font-bold opacity-80">
                          {formatCurrency(item.preco * item.quantidade)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="p-8 border-t border-theme-border bg-theme-card safe-pb shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-end mb-8">
                    <div className="flex flex-col">
                      <span className="text-theme-text-muted font-bold uppercase tracking-widest text-[10px] mb-1">Total Geral</span>
                      <span className="text-4xl font-serif text-theme-accent font-bold leading-none">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-theme-text-muted font-bold uppercase tracking-widest text-[10px] mb-1 block">Itens</span>
                       <span className="text-2xl font-black text-theme-text">{totalItems}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setCart([]);
                      localStorage.removeItem('borgert_cart');
                      setIsOrderSummaryOpen(false);
                    }}
                    className="w-full bg-theme-text text-theme-bg py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all duration-150 flex items-center justify-center space-x-3 shadow-xl hover:bg-theme-accent hover:text-white text-xl active:scale-[0.98]"
                  >
                    <ShoppingBag size={24} />
                    <span>Novo Pedido</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
}


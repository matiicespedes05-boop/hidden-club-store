import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, Barcode, Banknote, Check, ChevronDown, Instagram, Menu, MessageCircle, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { SiMercadopago } from 'react-icons/si';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { TooltipProvider } from '@/components/ui/tooltip';
import { catalog, categories, categoryLabels, featuredProducts, type Category, type Product } from '@/data/catalog';

type CartItem = {
  product: Product;
  size: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, size: string, quantity: number) => void;
  changeSize: (id: string, currentSize: string, nextSize: string) => void;
  setQuantity: (id: string, size: string, quantity: number) => void;
  removeItem: (id: string, size: string) => void;
  clearCart: () => void;
  notice: string;
};

const CartContext = createContext<CartContextValue | null>(null);
const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const DELIVERY_FEE = 8500;
const TRANSFER_DISCOUNT_RATE = 0.1;
const WHATSAPP_NUMBER = '5491121603067';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const INSTAGRAM_URL = 'https://www.instagram.com/hidden.clubba/';
// URL del backend (server/) una vez deployado. Configurala con la variable de entorno VITE_API_URL
// en el hosting del frontend (Vercel/Netlify). En desarrollo local apunta al server corriendo en :4000.
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe utilizarse dentro de CartProvider');
  return context;
}

function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hidden-club-cart');
      return saved ? (JSON.parse(saved) as CartItem[]).map((item) => ({ ...item, size: 'L' })) : [];
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    localStorage.setItem('hidden-club-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, size: string, quantity: number) => {
    if (product.stock < 1) {
      setNotice(`${product.name} está agotado`);
      window.setTimeout(() => setNotice(''), 2600);
      return;
    }
    setItems((current) => {
      const match = current.find((item) => item.product.id === product.id && item.size === size);
      if (match) {
        return current.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item,
        );
      }
      return [...current, { product, size, quantity: Math.min(product.stock, quantity) }];
    });
    setNotice(`${product.name} · Talle ${size} agregado`);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const changeSize = (id: string, currentSize: string, nextSize: string) => {
    if (currentSize === nextSize) return;
    setItems((current) => {
      const source = current.find((item) => item.product.id === id && item.size === currentSize);
      const target = current.find((item) => item.product.id === id && item.size === nextSize);
      if (!source) return current;

      if (target) {
        return current
          .filter((item) => !(item.product.id === id && item.size === currentSize))
          .map((item) =>
            item.product.id === id && item.size === nextSize
              ? { ...item, quantity: Math.min(item.product.stock, item.quantity + source.quantity) }
              : item,
          );
      }

      return current.map((item) =>
        item.product.id === id && item.size === currentSize
          ? { ...item, size: nextSize }
          : item,
      );
    });
  };

  const setQuantity = (id: string, size: string, quantity: number) => {
    if (quantity < 1) return removeItem(id, size);
    setItems((current) => current.map((item) =>
      item.product.id === id && item.size === size
        ? { ...item, quantity: Math.min(item.product.stock, quantity) }
        : item,
    ));
  };

  const removeItem = (id: string, size: string) => {
    setItems((current) => current.filter((item) => !(item.product.id === id && item.size === size)));
  };

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    addItem,
    changeSize,
    setQuantity,
    removeItem,
    clearCart: () => setItems([]),
    notice,
  }), [items, notice]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="group inline-flex items-center gap-2" data-testid="link-logo">
      <span className="flex h-6 w-6 items-center justify-center border border-[#eeeae2] text-[10px] font-bold tracking-[-0.1em] transition-colors group-hover:bg-[#d8ff47] group-hover:text-[#080808]">H</span>
      <span className="text-[13px] font-extrabold tracking-[0.22em] text-[#eeeae2]">HIDDEN CLUB</span>
    </Link>
  );
}

function Header({ onCart, onMenu }: { onCart: () => void; onMenu: () => void }) {
  const [location] = useLocation();
  const isShop = location.startsWith('/shop');
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#080808]/85 px-5 py-4 backdrop-blur-md md:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between">
        <button className="mr-4 md:hidden" onClick={onMenu} aria-label="Abrir menú" data-testid="button-open-menu">
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <Logo />
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex" aria-label="Navegación principal">
          <Link href="/" className={`text-[10px] font-bold tracking-[0.16em] transition-colors hover:text-[#d8ff47] ${location === '/' ? 'text-[#eeeae2]' : 'text-[#77756f]'}`} data-testid="link-nav-inicio">INICIO</Link>
          <Link href="/shop" className={`text-[10px] font-bold tracking-[0.16em] transition-colors hover:text-[#d8ff47] ${isShop ? 'text-[#eeeae2]' : 'text-[#77756f]'}`} data-testid="link-nav-shop">SHOP</Link>
        </nav>
        <button onClick={onCart} className="group flex items-center gap-3 text-[10px] font-bold tracking-[0.16em]" data-testid="button-open-cart">
          <span className="text-[#77756f] transition-colors group-hover:text-[#eeeae2]">CARRITO</span>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#d8ff47] px-1.5 text-[10px] text-[#080808]"><CartCount /></span>
        </button>
      </div>
    </header>
  );
}

function CartCount() {
  const { count } = useCart();
  return count;
}

function MobileMenu({ open, close }: { open: boolean; close: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-[#080808] px-5 pt-6 md:hidden hc-page-in" data-testid="menu-mobile">
      <div className="flex items-center justify-between">
        <Logo onClick={close} />
        <button onClick={close} aria-label="Cerrar menú" data-testid="button-close-menu"><X size={21} strokeWidth={1.5} /></button>
      </div>
      <nav className="mt-24 flex flex-col gap-7">
        {[
          ['INICIO', '/'],
          ['SHOP', '/shop'],
        ].map(([label, href]) => (
          <Link key={href} href={href} onClick={close} className="flex items-center justify-between border-b border-white/10 pb-5 text-3xl font-semibold tracking-[-0.05em]" data-testid={`link-mobile-${label.toLowerCase()}`}>
            {label}<ArrowUpRight size={22} strokeWidth={1.2} className="text-[#d8ff47]" />
          </Link>
        ))}
      </nav>
      <div className="mt-14 flex items-center gap-5 border-t border-white/10 pt-5">
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-[#c0bdb5] transition-colors hover:text-[#d8ff47]" data-testid="link-mobile-instagram">
          <Instagram size={15} strokeWidth={1.4} /> @hidden.clubba
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-[#c0bdb5] transition-colors hover:text-[#d8ff47]" data-testid="link-mobile-whatsapp">
          <MessageCircle size={15} strokeWidth={1.4} /> WHATSAPP
        </a>
      </div>
      <p className="absolute bottom-8 left-5 font-mono text-[9px] tracking-[0.2em] text-[#77756f]">BUENOS AIRES · ARGENTINA</p>
    </div>
  );
}

function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const stockLabel = product.stock <= 3 ? `ÚLTIMAS ${product.stock} UNIDADES` : `STOCK ${product.stock} UNIDADES`;
  return (
    <article className="hc-product-card group hc-reveal" style={{ animationDelay: `${index * 90}ms` }} data-testid={`card-product-${product.id}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#141412]">
        <img src={product.image} alt={product.name} className="hc-product-image h-full w-full object-cover" />
        {product.tag && <span className="absolute left-3 top-3 bg-[#d8ff47] px-2 py-1 font-mono text-[9px] font-medium tracking-[0.12em] text-[#080808]">{product.tag}</span>}
        <Link href={`/shop/${product.category.toLowerCase()}`} className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center bg-[#eeeae2] text-[#080808] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-label={`Ver ${product.category}`} data-testid={`link-category-${product.id}`}>
          <ArrowUpRight size={16} strokeWidth={1.5} />
        </Link>
      </div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[12px] font-bold tracking-[0.08em]">{product.name}</h3>
            <p className="mt-1 text-[11px] text-[#85827a]">{product.description}</p>
            <p className={`mt-2 font-mono text-[9px] tracking-[0.1em] ${product.stock <= 3 ? 'text-[#d8ff47]' : 'text-[#77756f]'}`} data-testid={`text-stock-${product.id}`}>{stockLabel}</p>
          </div>
          <span className="whitespace-nowrap font-mono text-[11px] text-[#d8ff47]" data-testid={`text-price-${product.id}`}>{currency.format(product.price)}</span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex gap-1" role="group" aria-label={`Talles de ${product.name}`}>
            {product.sizes.map((itemSize) => (
              <button key={itemSize} onClick={() => setSize(itemSize)} className={`h-7 min-w-7 border px-1.5 font-mono text-[9px] transition-colors ${size === itemSize ? 'border-[#eeeae2] bg-[#eeeae2] text-[#080808]' : 'border-white/15 text-[#85827a] hover:border-white/50'}`} data-testid={`button-size-${product.id}-${itemSize}`}>{itemSize}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#85827a] hover:text-[#eeeae2]" aria-label="Disminuir cantidad" data-testid={`button-minus-${product.id}`}><Minus size={13} /></button>
            <span className="w-3 text-center font-mono text-[10px]" data-testid={`text-quantity-${product.id}`}>{quantity}</span>
            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock} className="text-[#85827a] hover:text-[#eeeae2] disabled:cursor-not-allowed disabled:opacity-30" aria-label="Aumentar cantidad" data-testid={`button-plus-${product.id}`}><Plus size={13} /></button>
          </div>
        </div>
        <button onClick={() => addItem(product, size, quantity)} disabled={product.stock < 1} className="mt-3 flex w-full items-center justify-between border border-white/20 px-3 py-2.5 text-left text-[10px] font-bold tracking-[0.12em] transition-colors hover:border-[#d8ff47] hover:text-[#d8ff47] disabled:cursor-not-allowed disabled:border-white/10 disabled:text-[#77756f]" data-testid={`button-add-${product.id}`}>
          AGREGAR AL CARRITO <ArrowUpRight size={14} strokeWidth={1.5} />
        </button>
      </div>
    </article>
  );
}

function HomePage() {
  const [, setLocation] = useLocation();
  return (
    <main className="hc-page-in">
      <section className="relative flex min-h-[90vh] items-end overflow-hidden px-5 pb-12 pt-36 md:min-h-[790px] md:px-8 md:pb-20">
        <div className="absolute inset-0 opacity-80">
          <img src={featuredProducts[3].image} alt="" className="h-full w-full object-cover object-center grayscale contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/45 to-[#080808]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80 via-transparent to-[#080808]/30" />
        </div>
        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-start">
          <h1 className="hc-reveal hc-reveal-delay-1 max-w-4xl text-[clamp(4.5rem,15vw,12rem)] font-extrabold leading-[.78] tracking-[-0.1em] text-[#eeeae2]">HIDDEN CLUB</h1>
          <button onClick={() => setLocation('/shop')} className="hc-reveal hc-reveal-delay-2 mt-10 flex w-fit items-center gap-5 border-b border-[#d8ff47] pb-2 text-[11px] font-bold tracking-[0.16em] text-[#eeeae2] transition-colors hover:text-[#d8ff47]" data-testid="button-ver-coleccion">VER COLECCIÓN <ArrowUpRight size={18} strokeWidth={1.3} /></button>
        </div>
      </section>

      <div className="overflow-hidden border-y border-white/10 py-4">
        <div className="hc-marquee flex w-max items-center gap-8 font-mono text-[10px] tracking-[0.22em] text-[#85827a]">
          {Array.from({ length: 2 }).flatMap((_, i) => ['BUENOS AIRES', 'HIDDEN IN PLAIN SIGHT', 'DROP 01', 'EST. 2021'].map((item) => <span key={`${i}-${item}`} className="flex items-center gap-8"><span>{item}</span><span className="text-[#d8ff47]">×</span></span>))}
        </div>
      </div>

      <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-36">
        <div className="flex flex-col justify-between gap-6 border-b border-white/15 pb-6 md:flex-row md:items-end">
          <div><span className="font-mono text-[10px] text-[#d8ff47]">01 / 03</span><h2 className="mt-3 text-4xl font-bold tracking-[-0.06em] md:text-6xl">SELECCIÓN<br />DEL CLUB.</h2></div>
          <p className="max-w-xs text-sm leading-relaxed text-[#85827a]">Cuatro piezas para empezar. Un lenguaje, distintas formas de llevarlo.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
      </section>

      <section className="border-y border-white/10 bg-[#111110]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-24 md:grid-cols-[1.1fr_.9fr] md:px-8 md:py-36">
          <div><span className="font-mono text-[10px] text-[#d8ff47]">02 / 03 — EL CÓDIGO</span><h2 className="mt-5 max-w-lg text-5xl font-bold leading-[.92] tracking-[-0.08em] md:text-8xl">MENOS<br /><span className="text-[#77756f]">RUIDO.</span><br />MÁS TÚ.</h2></div>
          <div className="max-w-sm md:justify-self-end"><div className="mb-10 h-px w-20 bg-[#d8ff47]" /><p className="text-xl leading-snug tracking-[-0.03em] text-[#ddd9d0]">No diseñamos para llamar la atención. Diseñamos para que te reconozcas cuando te mirás.</p><p className="mt-8 text-sm leading-relaxed text-[#85827a]">Materiales honestos, proporciones precisas y una paleta que deja espacio. HIDDEN CLUB es el uniforme de lo que pasa todos los días.</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="flex items-end justify-between"><div><span className="font-mono text-[10px] text-[#d8ff47]">03 / 03</span><h2 className="mt-3 text-4xl font-bold tracking-[-0.06em] md:text-6xl">EXPLORÁ<br />POR CATEGORÍA.</h2></div><Link href="/shop" className="hidden items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-[#85827a] hover:text-[#d8ff47] sm:flex" data-testid="link-ver-todo">VER TODO <ArrowUpRight size={15} /></Link></div>
          <div className="mt-10 grid grid-cols-2 gap-px border border-white/10 bg-white/10 md:grid-cols-5">{categories.map((category, index) => <Link key={category} href={`/shop/${category.toLowerCase()}`} className="group relative flex aspect-square flex-col justify-between overflow-hidden bg-[#080808] p-4 transition-colors hover:bg-[#171714] md:p-6" data-testid={`link-category-home-${category}`}><span className="font-mono text-[9px] text-[#85827a]">0{index + 1}</span><span className="flex items-end justify-between text-xl font-bold tracking-[-0.06em] md:text-3xl">{categoryLabels[category]}<ArrowUpRight size={20} strokeWidth={1.2} className="text-[#d8ff47] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span></Link>)}</div>
      </section>
    </main>
  );
}

function ShopPage() {
  const params = useParams<{ category?: string }>();
  const active = categories.find((category) => category === params.category?.toUpperCase());
  const products = active && categories.includes(active) ? catalog.filter((product) => product.category === active) : catalog;
  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-5 pb-24 pt-32 md:px-8 md:pt-40 hc-page-in">
      <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-8 md:flex-row md:items-end">
         <div><span className="font-mono text-[10px] text-[#d8ff47]">HIDDEN CLUB / SHOP</span><h1 className="mt-4 text-6xl font-bold tracking-[-0.09em] md:text-9xl">{active ? categoryLabels[active] : 'CATÁLOGO'}</h1></div>
        <p className="max-w-xs text-sm leading-relaxed text-[#85827a]">Una selección editada para todos los días. Elegí una pieza, hacela tuya.</p>
      </div>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-b border-white/10 pb-4">{['TODO', ...categories].map((category) => <Link key={category} href={category === 'TODO' ? '/shop' : `/shop/${category.toLowerCase()}`} className={`whitespace-nowrap font-mono text-[10px] tracking-[0.12em] transition-colors hover:text-[#d8ff47] ${((!active && category === 'TODO') || active === category) ? 'text-[#d8ff47]' : 'text-[#77756f]'}`} data-testid={`link-filter-${category}`}>{category === 'TODO' ? 'TODOS' : categoryLabels[category as Category]}</Link>)}</div>
       {products.length > 0 ? <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="mt-10 border border-white/10 px-5 py-16 text-center" data-testid="empty-category"><p className="font-mono text-[10px] tracking-[.15em] text-[#d8ff47]">PRÓXIMAMENTE</p><p className="mt-3 text-sm text-[#85827a]">Todavía no hay productos cargados en esta categoría.</p></div>}
    </main>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const { changeSize, setQuantity, removeItem } = useCart();
  return <div className="flex gap-4 border-b border-white/10 py-5" data-testid={`row-cart-${item.product.id}-${item.size}`}><img src={item.product.image} alt={item.product.name} className="h-24 w-20 object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-4"><div><h3 className="text-xs font-bold tracking-[.06em]">{item.product.name}</h3><label className="mt-2 flex items-center gap-2 font-mono text-[10px] text-[#85827a]">TALLE<select value={item.size} onChange={(event) => changeSize(item.product.id, item.size, event.target.value)} className="border border-white/15 bg-transparent px-1.5 py-1 text-[10px] text-[#eeeae2] outline-none focus:border-[#d8ff47]" aria-label={`Cambiar talle de ${item.product.name}`} data-testid={`select-cart-size-${item.product.id}`}>{item.product.sizes.map((size) => <option key={size} value={size} className="bg-[#10100f] text-[#eeeae2]">{size}</option>)}</select></label></div><span className="font-mono text-[11px] text-[#d8ff47]">{currency.format(item.product.price * item.quantity)}</span></div><div className="mt-5 flex items-center justify-between"><div className="flex items-center gap-3 border border-white/15 px-2 py-1"><button onClick={() => setQuantity(item.product.id, item.size, item.quantity - 1)} aria-label="Disminuir cantidad" data-testid={`button-cart-minus-${item.product.id}`}><Minus size={12} /></button><span className="font-mono text-[10px]">{item.quantity}</span><button onClick={() => setQuantity(item.product.id, item.size, item.quantity + 1)} disabled={item.quantity >= item.product.stock} aria-label="Aumentar cantidad" className="disabled:cursor-not-allowed disabled:opacity-30" data-testid={`button-cart-plus-${item.product.id}`}><Plus size={12} /></button></div><button onClick={() => removeItem(item.product.id, item.size)} className="font-mono text-[9px] tracking-[.12em] text-[#85827a] hover:text-[#eeeae2]" data-testid={`button-remove-${item.product.id}`}>QUITAR</button></div></div></div>;
}

function EmptyCart({ close }: { close?: () => void }) {
  return <div className="flex min-h-[55vh] flex-col items-center justify-center text-center"><span className="flex h-16 w-16 items-center justify-center border border-white/15"><ShoppingBag size={22} strokeWidth={1} className="text-[#77756f]" /></span><h2 className="mt-7 text-2xl font-bold tracking-[-.05em]">TU CARRITO ESTÁ VACÍO.</h2><p className="mt-2 max-w-xs text-sm text-[#85827a]">Todavía no hay nada escondido acá.</p><Link href="/shop" onClick={close} className="mt-8 border-b border-[#d8ff47] pb-2 text-[10px] font-bold tracking-[.15em] text-[#d8ff47]" data-testid="link-empty-shop">EXPLORAR SHOP</Link></div>;
}

function CartDrawer({ close }: { close: () => void }) {
  const { items, subtotal } = useCart();
  return <div className="fixed inset-0 z-50 bg-black/70" onClick={close} data-testid="cart-drawer-overlay"><aside className="hc-drawer absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#10100f] px-5 pt-6 shadow-2xl sm:px-8" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-white/15 pb-5"><span className="font-mono text-[10px] tracking-[.16em] text-[#85827a]">TU CARRITO</span><button onClick={close} aria-label="Cerrar carrito" data-testid="button-close-cart"><X size={20} strokeWidth={1.3} /></button></div><div className="flex-1 overflow-y-auto">{items.length === 0 ? <EmptyCart close={close} /> : items.map((item) => <CartLine key={`${item.product.id}-${item.size}`} item={item} />)}</div>{items.length > 0 && <div className="border-t border-white/15 py-6"><div className="flex justify-between text-sm"><span className="text-[#85827a]">Subtotal</span><span className="font-mono text-[#d8ff47]" data-testid="text-cart-subtotal">{currency.format(subtotal)}</span></div><p className="mt-2 text-[10px] text-[#85827a]">Envío calculado al confirmar el pedido.</p><Link href="/checkout" onClick={close} className="mt-6 flex items-center justify-between bg-[#d8ff47] px-4 py-4 text-[10px] font-bold tracking-[.15em] text-[#080808] transition-colors hover:bg-[#eeeae2]" data-testid="link-checkout">CONTINUAR COMPRA <ArrowUpRight size={16} /></Link><Link href="/carrito" onClick={close} className="mt-4 block text-center font-mono text-[9px] tracking-[.15em] text-[#85827a] hover:text-[#eeeae2]" data-testid="link-view-cart">VER CARRITO COMPLETO</Link></div>}</aside></div>;
}

function CartPage() {
  const { items, subtotal } = useCart();
  return <main className="mx-auto min-h-screen max-w-[1100px] px-5 pb-24 pt-32 md:px-8 md:pt-40 hc-page-in"><Link href="/shop" className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[.13em] text-[#85827a] hover:text-[#d8ff47]" data-testid="link-back-shop"><ArrowLeft size={14} /> SEGUIR COMPRANDO</Link><div className="mt-10 flex items-end justify-between border-b border-white/15 pb-7"><h1 className="text-5xl font-bold tracking-[-.08em] md:text-8xl">CARRITO</h1><span className="font-mono text-[10px] text-[#85827a]">{items.length} {items.length === 1 ? 'PRODUCTO' : 'PRODUCTOS'}</span></div>{items.length === 0 ? <EmptyCart /> : <div className="grid gap-14 pt-8 md:grid-cols-[1fr_320px]"><div>{items.map((item) => <CartLine key={`${item.product.id}-${item.size}`} item={item} />)}</div><div className="h-fit border border-white/15 p-5"><span className="font-mono text-[10px] text-[#85827a]">RESUMEN</span><div className="mt-6 flex justify-between border-b border-white/10 pb-5 text-sm"><span>Subtotal</span><span className="font-mono text-[#d8ff47]" data-testid="text-page-subtotal">{currency.format(subtotal)}</span></div><p className="py-5 text-xs leading-relaxed text-[#85827a]">Los costos de envío se definen según destino. Envíos a todo el país.</p><Link href="/checkout" className="flex items-center justify-between bg-[#d8ff47] px-4 py-4 text-[10px] font-bold tracking-[.15em] text-[#080808] hover:bg-[#eeeae2]" data-testid="link-page-checkout">CONTINUAR <ArrowUpRight size={16} /></Link></div></div>}</main>;
}

function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [shipping, setShipping] = useState<'delivery' | 'showroom'>('delivery');
  const [payment, setPayment] = useState<'transferencia' | 'efectivo' | 'mercadopago'>('mercadopago');
  const [orderNotes, setOrderNotes] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const shippingCost = shipping === 'delivery' ? DELIVERY_FEE : 0;
  const discount = payment === 'transferencia' ? Math.round(subtotal * TRANSFER_DISCOUNT_RATE) : 0;
  const transferTotal = subtotal + shippingCost - Math.round(subtotal * TRANSFER_DISCOUNT_RATE);
  const total = subtotal + shippingCost - discount;
  const confirmationMessage = payment === 'transferencia'
    ? 'Tu pedido quedó reservado. Realizá la transferencia para que podamos preparar el envío.'
    : 'Tu pedido quedó reservado. Coordinaremos el pago en efectivo al momento del retiro.';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    const form = new FormData(event.currentTarget);
    const newOrderNumber = `HC-${String(Date.now()).slice(-6)}`;

    if (payment === 'mercadopago') {
      setSubmitting(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/create-preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: newOrderNumber,
            shippingCost,
            buyer: {
              name: form.get('name'),
              lastName: form.get('lastName'),
              email: form.get('email'),
              phone: form.get('phone'),
              address: shipping === 'delivery' ? form.get('address') : null,
            },
            items: items.map((item) => ({
              name: item.product.name,
              size: item.size,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
          }),
        });
        if (!response.ok) throw new Error('No se pudo iniciar el pago');
        const data = await response.json();
        window.location.href = data.init_point; // redirige al checkout real de Mercado Pago
      } catch (error) {
        setSubmitting(false);
        setSubmitError('No pudimos conectar con Mercado Pago. Probá de nuevo en un momento o escribinos por WhatsApp.');
      }
      return;
    }

    // Transferencia / efectivo: no hay cobro online, queda reservado y se coordina manualmente.
    setOrderNumber(newOrderNumber);
    setSent(true);
  };

  if (items.length === 0) return <main className="mx-auto min-h-screen max-w-[700px] px-5 pb-24 pt-40"><EmptyCart /></main>;
  if (sent) {
    return <main className="mx-auto flex min-h-screen max-w-[680px] flex-col items-center justify-center px-5 py-24 text-center hc-page-in">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d8ff47] text-[#080808]"><Check size={26} /></span>
      <p className="mt-8 font-mono text-[10px] tracking-[.16em] text-[#d8ff47]">ORDEN {orderNumber}</p>
      <h1 className="mt-3 text-5xl font-bold tracking-[-.08em] md:text-7xl">PEDIDO<br />CONFIRMADO.</h1>
      <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#85827a]">{confirmationMessage}</p>
      {payment === 'transferencia' ? <div className="mt-8 w-full max-w-sm border border-[#d8ff47]/60 bg-[#111110] p-5 text-left" data-testid="transfer-details">
        <p className="font-mono text-[10px] tracking-[.15em] text-[#d8ff47]">DATOS PARA TRANSFERIR · 10% OFF APLICADO</p>
        <div className="mt-5 space-y-3 font-mono text-[11px] text-[#c0bdb5]">
          <p>CBU <span className="text-[#eeeae2]">0000003100000000000000</span></p>
          <p>ALIAS <span className="text-[#eeeae2]">HIDDEN.CLUB</span></p>
          <p>TITULAR <span className="text-[#eeeae2]">HIDDEN CLUB</span></p>
          <p className="border-t border-white/10 pt-3 text-[#d8ff47]">TOTAL A TRANSFERIR {currency.format(total)}</p>
        </div>
      </div> : null}
      <a href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Hola HIDDEN CLUB, quiero enviar el comprobante de la orden ${orderNumber}. Total: ${currency.format(total)}.`)}`} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-full max-w-sm items-center justify-center gap-3 border border-[#d8ff47] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#d8ff47] transition-colors hover:bg-[#d8ff47] hover:text-[#080808]" data-testid="link-send-receipt-whatsapp">
        <MessageCircle size={16} strokeWidth={1.4} /> ENVIAR COMPROBANTE POR WHATSAPP
      </a>
      <div className="mt-8 flex w-full max-w-sm justify-between border-t border-white/10 pt-4 font-mono text-[10px] text-[#85827a]"><span>TOTAL</span><span className="text-[#d8ff47]">{currency.format(total)}</span></div>
      <Link href="/" className="mt-10 border-b border-[#d8ff47] pb-2 text-[10px] font-bold tracking-[.15em] text-[#d8ff47]" data-testid="link-checkout-home">VOLVER AL INICIO</Link>
    </main>;
  }

  return <main className="mx-auto min-h-screen max-w-[1100px] px-5 pb-24 pt-32 md:px-8 md:pt-40 hc-page-in">
    <Link href="/carrito" className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[.13em] text-[#85827a] hover:text-[#d8ff47]" data-testid="link-checkout-back"><ArrowLeft size={14} /> VOLVER AL CARRITO</Link>
    <div className="mt-10 border-b border-white/15 pb-7"><span className="font-mono text-[10px] text-[#d8ff47]">HIDDEN CLUB / CHECKOUT</span><h1 className="mt-4 text-5xl font-bold tracking-[-.08em] md:text-8xl">FINALIZAR<br />PEDIDO.</h1></div>
    <div className="grid gap-14 pt-10 md:grid-cols-[1fr_360px]">
      <form className="space-y-8" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="mb-5 font-mono text-[10px] tracking-[.15em] text-[#85827a]">01 / TUS DATOS</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[10px] text-[#85827a]">NOMBRE<input name="name" required autoComplete="given-name" className="mt-2 w-full border-b border-white/20 bg-transparent px-0 py-3 text-sm text-[#eeeae2] outline-none focus:border-[#d8ff47]" placeholder="Tu nombre" data-testid="input-checkout-name" /></label>
            <label className="text-[10px] text-[#85827a]">APELLIDO<input name="lastName" required autoComplete="family-name" className="mt-2 w-full border-b border-white/20 bg-transparent px-0 py-3 text-sm text-[#eeeae2] outline-none focus:border-[#d8ff47]" placeholder="Tu apellido" data-testid="input-checkout-last-name" /></label>
            <label className="text-[10px] text-[#85827a]">EMAIL<input name="email" required type="email" autoComplete="email" className="mt-2 w-full border-b border-white/20 bg-transparent px-0 py-3 text-sm text-[#eeeae2] outline-none focus:border-[#d8ff47]" placeholder="tu@email.com" data-testid="input-checkout-email" /></label>
            <label className="text-[10px] text-[#85827a]">TELÉFONO<input name="phone" required type="tel" autoComplete="tel" className="mt-2 w-full border-b border-white/20 bg-transparent px-0 py-3 text-sm text-[#eeeae2] outline-none focus:border-[#d8ff47]" placeholder="+54 9 ..." data-testid="input-checkout-phone" /></label>
          </div>
        </fieldset>
        <div className="border border-white/15 bg-[#10100f]" data-testid="order-notes">
          <button type="button" onClick={() => setNotesOpen((open) => !open)} className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-white/[.03]">
            <span className="font-mono text-[10px] tracking-[.15em] text-[#85827a]">NOTAS DE PEDIDO</span>
            <span className="flex items-center gap-2 text-[10px] font-bold tracking-[.12em] text-[#d8ff47]">{notesOpen ? 'CERRAR' : 'AGREGAR'} <Plus size={14} className={notesOpen ? 'rotate-45 transition-transform' : 'transition-transform'} /></span>
          </button>
          {notesOpen && <div className="border-t border-white/10 px-4 pb-4"><textarea value={orderNotes} onChange={(event) => setOrderNotes(event.target.value)} rows={3} className="mt-4 w-full resize-none border border-white/15 bg-[#080808] px-3 py-3 text-sm text-[#eeeae2] outline-none placeholder:text-[#77756f] focus:border-[#d8ff47]" placeholder="Agregar una nota para tu pedido..." data-testid="textarea-order-notes" /></div>}
        </div>
        <fieldset>
          <legend className="mb-5 font-mono text-[10px] tracking-[.15em] text-[#85827a]">02 / ENTREGA</legend>
          <label className="block text-[10px] text-[#85827a]">PUNTO DE RETIRO / ENVÍO
            <select value={shipping} onChange={(event) => setShipping(event.target.value as 'delivery' | 'showroom')} className="mt-2 w-full border border-white/20 bg-[#10100f] px-3 py-3 text-xs text-[#eeeae2] outline-none focus:border-[#d8ff47]" data-testid="select-shipping">
              <option value="delivery">Envío a domicilio · {currency.format(DELIVERY_FEE)}</option>
              <option value="showroom">Retiro en showroom · $0</option>
            </select>
          </label>
          {shipping === 'delivery' && <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_180px]">
            <label className="text-[10px] text-[#85827a]">DIRECCIÓN DE ENTREGA<input name="address" required autoComplete="street-address" className="mt-2 w-full border-b border-white/20 bg-transparent px-0 py-3 text-sm text-[#eeeae2] outline-none focus:border-[#d8ff47]" placeholder="Calle y número, ciudad" data-testid="input-checkout-address" /></label>
            <label className="text-[10px] text-[#85827a]">CÓDIGO POSTAL<input name="postalCode" required autoComplete="postal-code" inputMode="numeric" className="mt-2 w-full border-b border-white/20 bg-transparent px-0 py-3 text-sm text-[#eeeae2] outline-none focus:border-[#d8ff47]" placeholder="Ej. 1425" data-testid="input-checkout-postal-code" /></label>
          </div>}
          <p className="mt-3 text-[10px] leading-relaxed text-[#77756f]">{shipping === 'delivery' ? `Costo fijo configurable: ${currency.format(DELIVERY_FEE)}. El plazo depende del destino.` : 'Coordinamos el retiro en nuestro showroom de Buenos Aires.'}</p>
        </fieldset>
        <fieldset>
          <legend className="mb-5 font-mono text-[10px] tracking-[.15em] text-[#85827a]">03 / MEDIO DE PAGO</legend>
          <div className="space-y-2.5">
            <label className={`group flex cursor-pointer items-center gap-4 border p-4 transition-colors ${payment === 'mercadopago' ? 'border-[#d8ff47] bg-[#111110]' : 'border-white/15 hover:border-white/35'}`} data-testid="option-payment-mercadopago">
              <input type="radio" name="payment" value="mercadopago" checked={payment === 'mercadopago'} onChange={() => setPayment('mercadopago')} className="sr-only" />
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${payment === 'mercadopago' ? 'border-[#d8ff47]' : 'border-white/30'}`} aria-hidden="true">{payment === 'mercadopago' && <span className="h-2 w-2 rounded-full bg-[#d8ff47]" />}</span>
              <span className="min-w-0 flex-1"><strong className="block text-xs">TARJETA Y MERCADO PAGO</strong><small className="mt-1 block text-[11px] text-[#85827a]">Visa, Mastercard, Amex, cuotas y saldo en cuenta — pago seguro con Mercado Pago</small></span>
              <SiMercadopago size={23} className="shrink-0 text-[#d8ff47]" aria-hidden="true" />
            </label>
            <label className={`group flex cursor-pointer items-center gap-4 border p-4 transition-colors ${payment === 'transferencia' ? 'border-[#d8ff47] bg-[#111110]' : 'border-white/15 hover:border-white/35'}`} data-testid="option-payment-transferencia">
              <input type="radio" name="payment" value="transferencia" checked={payment === 'transferencia'} onChange={() => setPayment('transferencia')} className="sr-only" />
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${payment === 'transferencia' ? 'border-[#d8ff47]' : 'border-white/30'}`} aria-hidden="true">{payment === 'transferencia' && <span className="h-2 w-2 rounded-full bg-[#d8ff47]" />}</span>
              <span className="min-w-0 flex-1"><strong className="block text-xs">TRANSFERENCIA O DEPÓSITO BANCARIO</strong><small className="mt-1 block text-[11px] text-[#85827a]">CBU y Alias disponibles al confirmar el pedido</small></span>
              <span className="flex shrink-0 flex-col items-end gap-2"><Banknote size={21} strokeWidth={1.3} className="text-[#d8ff47]" aria-hidden="true" /><span className="bg-[#d8ff47] px-2 py-1 font-mono text-[9px] font-bold tracking-[.05em] text-[#080808]">10% OFF · PAGÁS {currency.format(transferTotal)}</span></span>
            </label>
            <label className={`group flex cursor-pointer items-center gap-4 border p-4 transition-colors ${payment === 'efectivo' ? 'border-[#d8ff47] bg-[#111110]' : 'border-white/15 hover:border-white/35'}`} data-testid="option-payment-efectivo">
              <input type="radio" name="payment" value="efectivo" checked={payment === 'efectivo'} onChange={() => setPayment('efectivo')} className="sr-only" />
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${payment === 'efectivo' ? 'border-[#d8ff47]' : 'border-white/30'}`} aria-hidden="true">{payment === 'efectivo' && <span className="h-2 w-2 rounded-full bg-[#d8ff47]" />}</span>
              <span className="min-w-0 flex-1"><strong className="block text-xs">EFECTIVO</strong><small className="mt-1 block text-[11px] text-[#85827a]">Disponible para retiro coordinado</small></span>
              <Barcode size={21} strokeWidth={1.3} className="shrink-0 text-[#d8ff47]" aria-hidden="true" />
            </label>
          </div>
        </fieldset>
        {submitError && <p className="text-xs text-red-400" role="alert" data-testid="text-checkout-error">{submitError}</p>}
        <button type="submit" disabled={submitting} className="flex w-full items-center justify-between bg-[#080808] px-5 py-4 text-[10px] font-bold tracking-[.16em] text-[#eeeae2] ring-1 ring-[#eeeae2]/70 transition-colors hover:bg-[#d8ff47] hover:text-[#080808] disabled:cursor-not-allowed disabled:opacity-60" data-testid="button-confirm-checkout">{submitting ? 'REDIRIGIENDO A MERCADO PAGO…' : 'REALIZAR PEDIDO'} <ArrowUpRight size={16} /></button>
        <p className="text-center font-mono text-[9px] leading-relaxed text-[#77756f]">NO GUARDAMOS DATOS DE TARJETA. EL PAGO SE REALIZA EN UNA PLATAFORMA SEGURA.</p>
      </form>
      <aside className="h-fit border border-white/15 p-5">
        <span className="font-mono text-[10px] tracking-[.15em] text-[#85827a]">TU PEDIDO</span>
        <div className="mt-6 space-y-4">{items.map((item) => <div key={`${item.product.id}-${item.size}`} className="flex justify-between gap-4 text-xs"><span className="text-[#c0bdb5]">{item.product.name} <span className="text-[#77756f]">× {item.quantity}</span></span><span className="font-mono text-[10px]">{currency.format(item.product.price * item.quantity)}</span></div>)}</div>
        <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
          <div className="flex justify-between"><span className="text-[#85827a]">Subtotal</span><span className="font-mono">{currency.format(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-[#85827a]">Envío</span><span className="font-mono">{shippingCost === 0 ? '$0' : currency.format(shippingCost)}</span></div>
          {discount > 0 && <div className="flex justify-between text-[#d8ff47]"><span>Descuento transferencia</span><span className="font-mono">− {currency.format(discount)}</span></div>}
          <div className="flex justify-between border-t border-white/10 pt-4"><span>TOTAL</span><span className="font-mono text-[#d8ff47]" data-testid="text-checkout-total">{currency.format(total)}</span></div>
        </div>
      </aside>
    </div>
  </main>;
}

function Footer() {
  return <footer className="border-t border-white/10 px-5 pb-8 pt-16 md:px-8"><div className="mx-auto max-w-[1440px]"><div className="grid gap-12 md:grid-cols-[1.3fr_.7fr_.7fr]"><div><Logo /><p className="mt-6 max-w-xs text-sm leading-relaxed text-[#85827a]">Una marca independiente de Buenos Aires. Prendas para estar, moverse y volver.</p></div><div><span className="font-mono text-[9px] tracking-[.16em] text-[#85827a]">EXPLORAR</span><div className="mt-5 flex flex-col gap-3 text-[11px] font-bold tracking-[.1em]"><Link href="/shop" className="hover:text-[#d8ff47]" data-testid="link-footer-shop">SHOP</Link></div></div><div><span className="font-mono text-[9px] tracking-[.16em] text-[#85827a]">ENCONTRANOS</span><div className="mt-5 flex flex-col gap-3 text-[11px] font-bold tracking-[.1em]"><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#d8ff47]" data-testid="link-instagram"><Instagram size={14} /> @hidden.clubba</a><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#d8ff47]" data-testid="link-footer-whatsapp"><MessageCircle size={14} /> WHATSAPP</a><span className="text-[#77756f]">MERCADO PAGO · TRANSFERENCIA</span></div></div></div><div className="mt-20 flex flex-col justify-between gap-3 border-t border-white/10 pt-5 font-mono text-[9px] tracking-[.12em] text-[#77756f] sm:flex-row"><span>© 2024 HIDDEN CLUB</span><span>HECHO EN BUENOS AIRES</span></div></div></footer>;
}

function NotFoundPage() {
  return <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center"><span className="font-mono text-[10px] text-[#d8ff47]">404 / PÁGINA NO ENCONTRADA</span><h1 className="mt-4 text-6xl font-bold tracking-[-.09em]">NADA POR ACÁ.</h1><Link href="/" className="mt-8 border-b border-[#d8ff47] pb-2 text-[10px] font-bold tracking-[.15em] text-[#d8ff47]" data-testid="link-404-home">VOLVER AL INICIO</Link></main>;
}

function Storefront() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { notice } = useCart();
  return <div className="hc-noise min-h-[100dvh] bg-[#080808] text-[#eeeae2]"><Header onCart={() => setCartOpen(true)} onMenu={() => setMenuOpen(true)} /><MobileMenu open={menuOpen} close={() => setMenuOpen(false)} /><Switch><Route path="/" component={HomePage} /><Route path="/shop" component={ShopPage} /><Route path="/shop/:category" component={ShopPage} /><Route path="/carrito" component={CartPage} /><Route path="/checkout" component={CheckoutPage} /><Route path="/checkout/resultado" component={CheckoutResultPage} /><Route component={NotFoundPage} /></Switch><Footer /><a href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hola HIDDEN CLUB, quiero hacer una consulta.')}`} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp" title="Consultar por WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#d8ff47] text-[#080808] shadow-[0_8px_30px_rgba(216,255,71,.18)] transition-transform hover:scale-105 hover:bg-[#eeeae2]" data-testid="floating-whatsapp"><MessageCircle size={23} strokeWidth={1.5} /></a>{cartOpen && <CartDrawer close={() => setCartOpen(false)} />}{notice && <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 border border-[#d8ff47] bg-[#d8ff47] px-4 py-3 text-[10px] font-bold tracking-[.1em] text-[#080808] shadow-xl" role="status" data-testid="status-cart-added"><Check size={13} className="mr-2 inline" />{notice}</div>}</div>;
}

function CheckoutResultPage() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const order = params.get('order') || '';
  const { clearCart } = useCart();

  useEffect(() => {
    if (status === 'approved') clearCart();
  }, [status]);

  useEffect(() => {
    if (status !== 'approved' || !order) return;
    const message = `Hola HIDDEN CLUB, ya realicé el pago de la orden ${order} por Mercado Pago. Te mando el comprobante.`;
    const timer = setTimeout(() => {
      window.location.href = `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
    }, 1800);
    return () => clearTimeout(timer);
  }, [status, order]);

  const title = status === 'approved' ? 'PAGO APROBADO.' : status === 'pending' ? 'PAGO PENDIENTE.' : 'PAGO NO COMPLETADO.';
  const body = status === 'approved'
    ? 'Te vamos a redirigir a WhatsApp en un instante para que nos envíes el comprobante y coordinemos el envío.'
    : status === 'pending'
      ? 'Mercado Pago está procesando tu pago. Te avisaremos por email apenas se acredite.'
      : 'Algo salió mal o cancelaste el pago. Podés volver al checkout e intentar de nuevo.';

  return <main className="mx-auto flex min-h-screen max-w-[680px] flex-col items-center justify-center px-5 py-24 text-center hc-page-in">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d8ff47] text-[#080808]"><Check size={26} /></span>
    {order && <p className="mt-8 font-mono text-[10px] tracking-[.16em] text-[#d8ff47]">ORDEN {order}</p>}
    <h1 className="mt-3 text-5xl font-bold tracking-[-.08em] md:text-7xl">{title}</h1>
    <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#85827a]">{body}</p>
    {status === 'approved' && <a href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Hola HIDDEN CLUB, ya realicé el pago de la orden ${order} por Mercado Pago. Te mando el comprobante.`)}`} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-full max-w-sm items-center justify-center gap-3 border border-[#d8ff47] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#d8ff47] transition-colors hover:bg-[#d8ff47] hover:text-[#080808]" data-testid="link-send-receipt-whatsapp">
      <MessageCircle size={16} strokeWidth={1.4} /> ENVIAR COMPROBANTE POR WHATSAPP
    </a>}
    <Link href="/" className="mt-10 border-b border-[#d8ff47] pb-2 text-[10px] font-bold tracking-[.15em] text-[#d8ff47]" data-testid="link-checkout-home">VOLVER AL INICIO</Link>
  </main>;
}

function App() {
  return <TooltipProvider><CartProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Storefront /></WouterRouter></CartProvider></TooltipProvider>;
}

export default App;
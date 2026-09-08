/**
 * CATÁLOGO EDITABLE
 *
 * Para cargar o actualizar productos, editá solamente el array `catalog`.
 * - `name`: nombre exacto que verá el cliente
 * - `category`: JEANS, SHORTS, CAMPERAS, BUZOS o REMERAS
 * - `price`: precio en pesos argentinos, sin separadores
 * - `image`: ruta local dentro de `public/` o URL externa
 * - `sizes`, `stock` y `description`: información visible del producto
 */
export type Category = 'JEANS' | 'SHORTS' | 'CAMPERAS' | 'BUZOS' | 'REMERAS';

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  stock: number;
  tag?: string;
};

const localImage = (file: string) => `${import.meta.env.BASE_URL}product-images/${file}`;

export const categories: Category[] = ['JEANS', 'SHORTS', 'CAMPERAS', 'BUZOS', 'REMERAS'];

export const categoryLabels: Record<Category, string> = {
  JEANS: 'JEANS',
  SHORTS: 'SHORTS',
  CAMPERAS: 'CAMPERAS',
  BUZOS: 'BUZOS',
  REMERAS: 'REMERAS',
};

export const catalog: Product[] = [
  {
    id: 'campera-valley-portugal',
    name: 'Campera Valley x Portugal',
    category: 'CAMPERAS',
    price: 202000,
    image: localImage('valley-portugal.webp'),
    description: 'Campera con capucha · detalles de cristales · cierre frontal.',
    sizes: ['L'],
    stock: 8,
    tag: 'NUEVO',
  },
  {
    id: 'campera-mixed-emotion',
    name: 'Campera Mixed Emotion (Emotions Never Die)',
    category: 'BUZOS',
    price: 202000,
    image: localImage('mixed-emotion-zip.webp'),
    description: 'Buzo con cierre · capucha · estampa Emotions Never Die.',
    sizes: ['L'],
    stock: 8,
    tag: 'NUEVO',
  },
  {
    id: 'remera-mixed-emotion-angel-jet-ski-negra',
    name: 'Remera Mixed Emotion - Angel Jet Ski (Negra)',
    category: 'REMERAS',
    price: 125000,
    image: localImage('angel-jet-ski-black.jpeg'),
    description: 'Remera de algodón · gráfica Angel Jet Ski · color negro.',
    sizes: ['L'],
    stock: 8,
  },
  {
    id: 'remera-mixed-emotion-angel-face-negra',
    name: 'Remera Mixed Emotion - Angel Face (Negra)',
    category: 'REMERAS',
    price: 125000,
    image: localImage('angel-face-black.jpeg'),
    description: 'Remera de algodón · gráfica Angel Face · color negro.',
    sizes: ['L'],
    stock: 8,
  },
  {
    id: 'remera-mixed-emotion-angel-jet-ski-blanca',
    name: 'Remera Mixed Emotion - Angel Jet Ski (Blanca)',
    category: 'REMERAS',
    price: 125000,
    image: localImage('angel-jet-ski-white.jpeg'),
    description: 'Remera de algodón · gráfica Angel Jet Ski · color blanco.',
    sizes: ['L'],
    stock: 8,
  },
  {
    id: 'remera-mixed-emotion-angel-face-blanca',
    name: 'Remera Mixed Emotion - Angel Face (Blanca)',
    category: 'REMERAS',
    price: 125000,
    image: localImage('angel-face-white.jpeg'),
    description: 'Remera de algodón · gráfica Angel Face · color blanco.',
    sizes: ['L'],
    stock: 8,
  },
  {
    id: 'remera-mixed-emotion-emotions-never-die-negra',
    name: 'Remera Mixed Emotion - Emotions Never Die (Negra)',
    category: 'REMERAS',
    price: 125000,
    image: localImage('emotions-never-die-black.jpeg'),
    description: 'Remera de algodón · gráfica Emotions Never Die · color negro.',
    sizes: ['L'],
    stock: 8,
  },
  {
    id: 'remera-mixed-emotion-emotions-never-die-blanca',
    name: 'Remera Mixed Emotion - Emotions Never Die (Blanca)',
    category: 'REMERAS',
    price: 125000,
    image: localImage('emotions-never-die-white.jpeg'),
    description: 'Remera de algodón · gráfica Emotions Never Die · color blanco.',
    sizes: ['L'],
    stock: 8,
  },
];

export const featuredProducts = catalog.slice(0, 4);
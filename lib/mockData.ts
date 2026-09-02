export type ProductCategory = "Men" | "Women" | "Footwear" | "Bags" | "Watches";

export type ProductVariant = {
  color: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  rating: number;
  reviewCount: number;
  brand: string;
  colors: string[];
  sizes: string[];
  image: string;
  /**
   * Optional colour-specific product images. Products without separate source
   * imagery retain their supplied product image for every valid colour.
   */
  variants?: ProductVariant[];
  description: string;
  isBestSeller?: boolean;
};

export const categories: { name: ProductCategory; image: string; caption: string }[] = [
  { name: "Men", caption: "Everyday tailoring", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80" },
  { name: "Women", caption: "Effortless layers", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" },
  { name: "Footwear", caption: "Grounded in comfort", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
  { name: "Bags", caption: "Carry it beautifully", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80" },
  { name: "Watches", caption: "Time, refined", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80" },
];

export const products: Product[] = [
  { id: "linen-overshirt", name: "Linen Overshirt", category: "Men", price: 79, rating: 4.8, reviewCount: 126, brand: "Atelier", colors: ["Stone", "Ink"], sizes: ["S", "M", "L", "XL"], image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80", description: "A relaxed overshirt cut from breathable linen for warm days.", isBestSeller: true },
  { id: "tailored-trouser", name: "Tailored Wide Trouser", category: "Women", price: 96, rating: 4.9, reviewCount: 88, brand: "Atelier", colors: ["Black", "Oat"], sizes: ["S", "M", "L"], image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80", description: "Fluid, tailored trousers designed for work and weekends.", isBestSeller: true },
  { id: "stride-runner", name: "Stride Runner", category: "Footwear", price: 112, rating: 4.7, reviewCount: 214, brand: "New Balance", colors: ["Cloud", "Charcoal"], sizes: ["7", "8", "9", "10", "11"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", description: "Lightweight trainers with a cushioned everyday ride.", isBestSeller: true },
  { id: "arch-tote", name: "The Arch Tote", category: "Bags", price: 138, rating: 4.8, reviewCount: 63, brand: "Atelier", colors: ["Espresso", "Tan"], sizes: ["One size"], image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80", description: "A structured tote made for your daily rhythm.", isBestSeller: true },
  { id: "field-watch", name: "Field Watch 36", category: "Watches", price: 189, rating: 4.6, reviewCount: 42, brand: "Seiko", colors: ["Steel", "Black"], sizes: ["One size"], image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80", description: "A dependable field watch with an understated dial.", isBestSeller: true },
  { id: "cotton-tee", name: "Heavyweight Cotton Tee", category: "Men", price: 38, rating: 4.7, reviewCount: 341, brand: "Atelier", colors: ["White", "Slate"], sizes: ["S", "M", "L", "XL"], image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", description: "A heavyweight cotton staple with a considered fit.", isBestSeller: true },
  { id: "draped-dress", name: "Draped Midi Dress", category: "Women", price: 124, rating: 4.8, reviewCount: 75, brand: "Atelier", colors: ["Onyx", "Sage"], sizes: ["XS", "S", "M", "L"], image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80", description: "A softly draped dress that moves with you.", isBestSeller: true },
  { id: "court-sneaker", name: "Court Sneaker", category: "Footwear", price: 94, rating: 4.5, reviewCount: 189, brand: "Adidas", colors: ["White", "Green"], sizes: ["7", "8", "9", "10"], image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80", description: "Clean leather sneakers with timeless court styling." },
  { id: "weekend-duffle", name: "Weekend Duffle", category: "Bags", price: 158, rating: 4.9, reviewCount: 53, brand: "Atelier", colors: ["Black", "Olive"], sizes: ["One size"], image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", description: "A durable companion for short escapes." },
  { id: "minimal-watch", name: "Minimal Leather Watch", category: "Watches", price: 149, rating: 4.6, reviewCount: 67, brand: "Fossil", colors: ["Brown", "Black"], sizes: ["One size"], image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80", description: "A clean everyday timepiece with a leather strap." },
  { id: "utility-jacket", name: "Utility Jacket", category: "Men", price: 118, rating: 4.6, reviewCount: 109, brand: "Carhartt", colors: ["Moss", "Navy"], sizes: ["S", "M", "L", "XL"], image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80", description: "A practical lightweight jacket with a refined profile." },
  { id: "ribbed-knit", name: "Ribbed Knit Cardigan", category: "Women", price: 88, rating: 4.7, reviewCount: 97, brand: "Atelier", colors: ["Cream", "Grey"], sizes: ["XS", "S", "M", "L"], image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80", description: "A soft ribbed knit for layering across seasons." },
  { id: "trail-sandal", name: "Trail Sandal", category: "Footwear", price: 72, rating: 4.4, reviewCount: 55, brand: "Teva", colors: ["Black", "Sand"], sizes: ["7", "8", "9", "10"], image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=80", description: "Secure, adjustable sandals for city and trail." },
  { id: "crossbody", name: "Compact Crossbody", category: "Bags", price: 85, rating: 4.7, reviewCount: 84, brand: "Atelier", colors: ["Ink", "Clay"], sizes: ["One size"], image: "https://images.unsplash.com/photo-1554342872-034a06541bad?auto=format&fit=crop&w=900&q=80", description: "Hands-free carrying in a compact, intentional shape." },
  { id: "solar-watch", name: "Solar Everyday Watch", category: "Watches", price: 169, rating: 4.8, reviewCount: 61, brand: "Citizen", colors: ["Steel", "Navy"], sizes: ["One size"], image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&w=900&q=80", description: "Solar-powered reliability in a versatile silhouette." },
];

export const bestSellers = products.filter((product) => product.isBestSeller);

export const brands = [...new Set(products.map((product) => product.brand))];

export function getProductVariants(product: Product): ProductVariant[] {
  if (product.variants?.length) return product.variants;

  // The existing mock catalogue supplies one source image per product. Keep
  // every colour available while providing a consistent variant contract to
  // the product detail and cart flows.
  return product.colors.map((color) => ({ color, image: product.image }));
}

export function getProductVariant(product: Product, color: string): ProductVariant {
  return getProductVariants(product).find((variant) => variant.color === color)
    ?? getProductVariants(product)[0];
}

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

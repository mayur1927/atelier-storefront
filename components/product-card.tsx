"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/mockData";
import { useStore } from "@/context/store-context";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlistIds } = useStore();
  const inWishlist = wishlistIds.includes(product.id);

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100">
        <Link href={`/product/${product.id}`} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" /></Link>
        <button onClick={() => toggleWishlist(product.id)} className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 shadow-sm transition hover:scale-105" aria-label={`Add ${product.name} to wishlist`}>
          <Heart size={17} className={inWishlist ? "fill-zinc-950" : ""} />
        </button>
        <button onClick={() => addToCart(product)} className="absolute inset-x-3 bottom-3 flex translate-y-16 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-3 py-3 text-xs font-bold tracking-[0.12em] text-white transition duration-300 hover:bg-zinc-700 group-hover:translate-y-0" aria-label={`Add ${product.name} to cart`}>
          <ShoppingBag size={15} /> ADD TO CART
        </button>
      </div>
      <div className="pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{product.category}</p>
        <div className="mt-1 flex items-start justify-between gap-3"><Link href={`/product/${product.id}`} className="font-semibold leading-tight text-zinc-900 hover:underline">{product.name}</Link><span className="whitespace-nowrap font-bold">${product.price}</span></div>
        <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500"><Star size={14} className="fill-zinc-900 text-zinc-900" /><span className="font-semibold text-zinc-700">{product.rating.toFixed(1)}</span><span>({product.reviewCount})</span></div>
      </div>
    </article>
  );
}

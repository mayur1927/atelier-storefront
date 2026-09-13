"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/context/store-context";
import type { Product } from "@/lib/products";

export default function WishlistPage() {
  const { wishlistIds } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            setProducts(data.items);
          }
        }
      } catch (err) {
        console.error("Failed to load wishlist items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  const saved = products.filter((product) => wishlistIds.includes(product.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black tracking-[-0.06em]">Wishlist</h1>

      {loading ? (
        <div className="py-20 text-center text-sm text-zinc-500">
          Loading wishlist...
        </div>
      ) : saved.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <Heart size={38} className="mx-auto text-zinc-400" />
          <p className="mt-5 text-xl font-bold">Nothing saved yet.</p>
          <Link href="/category/all" className="mt-4 inline-block text-sm underline">
            Explore the collection
          </Link>
        </div>
      )}
    </div>
  );
}

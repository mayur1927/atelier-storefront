"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { products } from "@/lib/mockData";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/context/store-context";
export default function WishlistPage() { const { wishlistIds } = useStore(); const saved = products.filter((product) => wishlistIds.includes(product.id)); return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><h1 className="text-4xl font-black tracking-[-0.06em]">Wishlist</h1>{saved.length ? <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{saved.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="py-24 text-center"><Heart size={38} className="mx-auto" /><p className="mt-5 text-xl font-bold">Nothing saved yet.</p><Link href="/category/all" className="mt-4 inline-block text-sm underline">Explore the collection</Link></div>}</div>; }

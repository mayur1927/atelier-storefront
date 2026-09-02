"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/store-context";

const navigation = [
  { label: "New in", href: "#new-arrivals" },
  { label: "Men", href: "/category/men" },
  { label: "Women", href: "/category/women" },
  { label: "Footwear", href: "/category/footwear" },
  { label: "Accessories", href: "/category/accessories" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { cart, wishlistIds, user } = useStore();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const submitSearch = (event: FormEvent) => { event.preventDefault(); if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`); };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-[#fafafa]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button className="rounded-md p-2 lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link href="/" className="text-lg font-black tracking-[-0.12em] sm:text-xl">ATELIER<span className="text-zinc-400">/</span></Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 lg:flex">
          {navigation.map((item) => <Link className="transition hover:text-zinc-950" key={item.label} href={item.href}>{item.label}</Link>)}
        </nav>

        <form onSubmit={submitSearch} className="hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-zinc-400 md:flex">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400" placeholder="Search essentials" aria-label="Search products" />
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href={user ? "/profile" : "/login"} className="hidden rounded-full p-2 transition hover:bg-zinc-200 sm:block" aria-label="Account"><UserRound size={19} /></Link>
          <Link href="/wishlist" className="relative rounded-full p-2 transition hover:bg-zinc-200" aria-label="Wishlist">
            <Heart size={19} />
            {wishlistIds.length > 0 && <Badge count={wishlistIds.length} />}
          </Link>
          <Link href="/cart" className="relative rounded-full p-2 transition hover:bg-zinc-200" aria-label="Cart">
            <ShoppingBag size={19} />
            {cartCount > 0 && <Badge count={cartCount} />}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-200 bg-[#fafafa] px-4 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-zinc-400 md:hidden"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-zinc-900 outline-none" placeholder="Search essentials" /></form>
          <nav className="grid gap-1">{navigation.map((item) => <Link onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 text-sm font-medium" key={item.label} href={item.href}>{item.label}</Link>)}</nav>
        </div>
      )}
    </header>
  );
}

function Badge({ count }: { count: number }) {
  return <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-zinc-950 px-1 text-[9px] font-bold text-white">{count}</span>;
}

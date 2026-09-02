import Link from "next/link";
import { ArrowRight, Headphones, LockKeyhole, RotateCcw, Truck } from "lucide-react";
import { bestSellers, categories } from "@/lib/mockData";
import { ProductCard } from "@/components/product-card";

const features = [
  { label: "Free shipping", detail: "On orders over $75", icon: Truck },
  { label: "Easy returns", detail: "30-day returns", icon: RotateCcw },
  { label: "Secure payment", detail: "Safe & encrypted", icon: LockKeyhole },
  { label: "Here for you", detail: "Support, 24/7", icon: Headphones },
];

export function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        <div className="relative min-h-[530px] overflow-hidden rounded-3xl bg-zinc-200 sm:min-h-[590px]">
          <img src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1800&q=85" alt="Summer collection" className="absolute inset-0 h-full w-full object-cover grayscale" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/35 to-transparent" />
          <div className="relative flex min-h-[530px] max-w-xl flex-col justify-end p-7 text-white sm:min-h-[590px] sm:p-12 lg:p-16">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">Summer collection / 2026</p>
            <h1 className="max-w-lg text-4xl font-black leading-[0.98] tracking-[-0.065em] sm:text-6xl">New arrivals, made for slow summer days.</h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-zinc-200 sm:text-base">A refined edit of lightweight layers, easy tailoring, and pieces that feel right from morning through late evening.</p>
            <Link href="#best-selling" className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3.5 text-xs font-bold tracking-[0.13em] text-zinc-950 transition hover:bg-zinc-200">SHOP NOW <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {features.map(({ label, detail, icon: Icon }) => <div key={label} className="flex items-center gap-3 px-5 py-4"><Icon size={19} strokeWidth={1.7} /><div><p className="text-sm font-bold">{label}</p><p className="mt-0.5 text-xs text-zinc-500">{detail}</p></div></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Explore the edit</p><h2 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Top categories</h2></div><Link href="/category/all" className="hidden items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline sm:flex">View all <ArrowRight size={15} /></Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => <Link key={category.name} href={`/category/${category.name.toLowerCase()}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-200"><img src={category.image} alt={category.name} className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" /><div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-zinc-950/10 to-transparent" /><div className="absolute inset-x-4 bottom-4 text-white"><h3 className="text-lg font-bold">{category.name}</h3><p className="mt-0.5 text-xs text-zinc-200">{category.caption}</p></div></Link>)}
        </div>
      </section>

      <section id="best-selling" className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Chosen often</p><h2 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Best selling</h2></div><Link href="/category/all" className="flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">Shop all <ArrowRight size={15} /></Link></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"><ProductCard product={bestSellers[0]} />{bestSellers.slice(1).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-zinc-950 px-7 py-10 text-white sm:flex-row sm:items-end sm:px-12 sm:py-12"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">The Atelier note</p><h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.05em] sm:text-4xl">Get first access to new arrivals and private offers.</h2></div><form className="flex w-full max-w-sm gap-2"><input type="email" aria-label="Email address" placeholder="Your email address" className="min-w-0 flex-1 rounded-full bg-white px-4 py-3 text-sm text-zinc-950 outline-none" /><button className="rounded-full bg-zinc-700 px-5 text-xs font-bold tracking-[0.1em] transition hover:bg-zinc-600">JOIN</button></form></div>
      </section>
    </>
  );
}

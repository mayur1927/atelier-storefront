import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

const footerLinks = [
  { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Shipping & Returns", href: "/shipping" }, { label: "Terms", href: "/terms" }, { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-xl font-black tracking-[-0.12em]">ATELIER<span className="text-zinc-400">/</span></p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500">Thoughtful objects and modern essentials for a life well lived.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-900">Customer care</p>
          <div className="mt-4 grid gap-2.5">{footerLinks.map((link) => <Link href={link.href} key={link.label} className="w-fit text-sm text-zinc-500 transition hover:text-zinc-950">{link.label}</Link>)}</div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-900">Follow along</p>
          <div className="mt-4 flex gap-3">
            {[Instagram, Facebook, Twitter].map((Icon, index) => <a href="/contact" aria-label={["Instagram", "Facebook", "Twitter"][index]} key={index} className="rounded-full border border-zinc-200 p-2 text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"><Icon size={16} /></a>)}
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-100 py-5 text-center text-xs text-zinc-400">© {new Date().getFullYear()} Atelier. All rights reserved.</div>
    </footer>
  );
}

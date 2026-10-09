import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, FileText, Info } from "lucide-react";
import { Breadcrumbs } from "@/components/shared";

type InfoSection = {
  key: string;
  title: string;
  badge: string;
  text: string;
  bullets?: string[];
  icon: typeof Info;
};

const content: Record<string, InfoSection> = {
  about: {
    key: "about",
    title: "About Atelier",
    badge: "Our Philosophy",
    icon: Info,
    text: "Atelier is a considered edit of everyday pieces. We believe fewer, better things make room for a more intentional life.",
    bullets: [
      "Curated essentials designed for longevity and daily utility.",
      "Mindfully crafted with quality materials and clean proportions.",
      "Minimalist aesthetic prioritizing function, comfort, and ease.",
    ],
  },
  shipping: {
    key: "shipping",
    title: "Shipping & returns",
    badge: "Delivery & Returns Policy",
    icon: Truck,
    text: "Orders over $75 ship free. If something is not quite right, return it in original condition within 30 days of delivery.",
    bullets: [
      "Complimentary standard shipping on all orders over $75.",
      "Hassle-free 30-day return policy for unused, original condition items.",
      "Trackable delivery with email & account updates.",
    ],
  },
  terms: {
    key: "terms",
    title: "Terms of use",
    badge: "Customer Agreement",
    icon: FileText,
    text: "By shopping with Atelier, you agree to use this storefront responsibly and provide accurate information at checkout.",
    bullets: [
      "Accurate account registration and checkout details required.",
      "Transparent pricing with clear tax and shipping calculations.",
      "Fair use and consumer protection guaranteed across all purchases.",
    ],
  },
  privacy: {
    key: "privacy",
    title: "Privacy policy",
    badge: "Data Protection",
    icon: ShieldCheck,
    text: "We use your details only to process orders, provide account features, and send messages you choose to receive.",
    bullets: [
      "Secure cookie-based session protection.",
      "Zero selling or sharing of personal data with unauthorized third parties.",
      "Full control over your account settings and email subscriptions.",
    ],
  },
};

const tabs = [
  { key: "about", label: "About", href: "/about" },
  { key: "shipping", label: "Shipping & Returns", href: "/shipping" },
  { key: "terms", label: "Terms of Use", href: "/terms" },
  { key: "privacy", label: "Privacy Policy", href: "/privacy" },
];

export default async function InfoPage({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  const currentKey = content[info] ? info : "about";
  const page = content[currentKey] ?? content.about;
  const Icon = page.icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Information", href: "/about" },
          { label: page.title },
        ]}
      />

      {/* POLICY TABS NAVIGATION */}
      <nav aria-label="Policy pages" className="mt-6 flex overflow-x-auto gap-2 border-b border-zinc-200 pb-3 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.key === currentKey;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                isActive
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* MAIN POLICY CARD */}
      <main className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100 text-zinc-900">
            <Icon size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
              {page.badge}
            </p>
            <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl text-zinc-900">
              {page.title}
            </h1>
          </div>
        </div>

        <p className="mt-6 text-base leading-8 text-zinc-700 font-medium">
          {page.text}
        </p>

        {page.bullets && page.bullets.length > 0 && (
          <ul className="mt-6 space-y-3 rounded-2xl bg-zinc-50 p-5 text-sm leading-6 text-zinc-600">
            {page.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-950" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CALL TO ACTION BUTTONS */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-600 hover:text-zinc-950"
          >
            <ArrowLeft size={15} /> BACK TO HOME
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-xl border border-zinc-300 px-5 py-3 text-xs font-bold text-zinc-900 hover:bg-zinc-100"
            >
              CONTACT US
            </Link>
            <Link
              href="/category/all"
              className="flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-xs font-bold text-white hover:bg-zinc-800"
            >
              EXPLORE COLLECTION <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

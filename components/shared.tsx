"use client";

import Link from "next/link";
import { ChevronRight, Minus, Plus } from "lucide-react";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500"
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && (
            <ChevronRight size={13} className="text-zinc-300" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-zinc-950 hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function QuantityPicker({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white">
      <button
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="grid h-9 w-9 place-items-center transition hover:bg-zinc-100"
        aria-label="Decrease quantity"
      >
        <Minus size={15} />
      </button>

      <span className="grid h-9 min-w-9 place-items-center border-x border-zinc-200 text-sm font-semibold">
        {quantity}
      </span>

      <button
        onClick={() => onChange(quantity + 1)}
        className="grid h-9 w-9 place-items-center transition hover:bg-zinc-100"
        aria-label="Increase quantity"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

export function priceDetails(items: { price: number; quantity: number }[]) {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 8;
  const tax = subtotal * 0.06;

  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

export function Price({ value }: { value: number }) {
  return <>${value.toFixed(2)}</>;
}

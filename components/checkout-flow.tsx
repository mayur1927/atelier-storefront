"use client";

import { CreditCard, Landmark, Smartphone, WalletCards, Tag } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/store-context";
import { OrderDetails } from "@/components/cart-page";
import { priceDetails } from "@/components/shared";

export function CheckoutPage() {
  const router = useRouter();
  const { cart, user } = useStore();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm({ ...form, [key]: value });

  const applyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError("");
    setCouponMessage("");

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon.");
        setDiscountAmount(0);
        return;
      }

      setDiscountAmount(data.coupon.discountAmount);
      setCouponMessage(`Coupon applied: $${data.coupon.discountAmount} off`);
    } catch {
      setCouponError("Failed to validate coupon.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    sessionStorage.setItem("atelier_shipping", JSON.stringify(form));
    if (discountAmount > 0) {
      sessionStorage.setItem("atelier_coupon", couponCode.trim().toUpperCase());
    }
    router.push("/payment");
  };

  const details = priceDetails(cart, discountAmount);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-white">
          1 Shipping
        </span>
        <span className="text-zinc-400">—</span>
        <span className="rounded-full border border-zinc-200 px-3 py-1.5 text-zinc-400">
          2 Payment
        </span>
        <span className="text-zinc-400">—</span>
        <span className="rounded-full border border-zinc-200 px-3 py-1.5 text-zinc-400">
          3 Review
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8"
        >
          <h1 className="text-3xl font-black tracking-[-0.05em]">
            Shipping information
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Where should we send your order?
          </p>

          <div className="mt-7 grid gap-4">
            <Input
              label="Full name"
              value={form.name}
              onChange={(value) => update("name", value)}
            />
            <Input
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(value) => update("phone", value)}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(value) => update("address", value)}
              placeholder="House number, street name"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="City"
                value={form.city}
                onChange={(value) => update("city", value)}
              />
              <Input
                label="State"
                value={form.state}
                onChange={(value) => update("state", value)}
              />
            </div>
            <Input
              label="ZIP / Postal code"
              value={form.zip}
              onChange={(value) => update("zip", value)}
            />
          </div>

          <button className="mt-7 w-full rounded-xl bg-zinc-950 py-4 text-xs font-bold tracking-[0.12em] text-white hover:bg-zinc-700">
            CONTINUE TO PAYMENT
          </button>
        </form>

        <div className="space-y-4">
          <OrderPreview />

          {/* COUPON INPUT */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Tag size={16} /> Have a coupon?
            </div>
            <form onSubmit={applyCoupon} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="e.g. ATELIER100"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs uppercase outline-none focus:border-zinc-950"
              />
              <button
                type="submit"
                disabled={validatingCoupon}
                className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                APPLY
              </button>
            </form>
            {couponMessage && (
              <p className="mt-2 text-xs font-semibold text-green-700">{couponMessage}</p>
            )}
            {couponError && (
              <p className="mt-2 text-xs font-semibold text-red-600">{couponError}</p>
            )}
          </div>

          <OrderDetails action={false} details={details} />
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-3 text-sm font-normal outline-none focus:border-zinc-950"
      />
    </label>
  );
}

function OrderPreview() {
  const { cart } = useStore();

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm font-bold">Order summary</p>
      <div className="mt-4 space-y-3">
        {cart.length ? (
          cart.map((item) => (
            <div
              className="flex gap-3 text-xs"
              key={`${item.id}-${item.size}-${item.color}`}
            >
              <img
                src={item.image}
                alt=""
                className="h-12 w-10 rounded object-cover grayscale"
              />
              <p className="flex-1 font-semibold">
                {item.name}{" "}
                <span className="text-zinc-400">×{item.quantity}</span>
              </p>
              <p>${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Your bag is empty.</p>
        )}
      </div>
    </div>
  );
}

export function PaymentPage() {
  const [method, setMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { cart, clearCart } = useStore();
  const router = useRouter();

  const options = [
    {
      id: "card",
      label: "Credit / Debit card",
      icon: CreditCard,
      detail: "Visa · Mastercard · AMEX",
    },
    {
      id: "upi",
      label: "UPI",
      icon: Smartphone,
      detail: "Google Pay, PhonePe, Paytm",
    },
    {
      id: "bank",
      label: "Net banking",
      icon: Landmark,
      detail: "All major banks",
    },
    {
      id: "wallet",
      label: "Wallets",
      icon: WalletCards,
      detail: "Store credit and wallets",
    },
  ];

  const pay = async () => {
    setSubmitting(true);
    setError("");

    try {
      const couponCode = sessionStorage.getItem("atelier_coupon") || undefined;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order.");
        setSubmitting(false);
        return;
      }

      sessionStorage.removeItem("atelier_shipping");
      sessionStorage.removeItem("atelier_coupon");
      clearCart();
      router.push("/order-success");
    } catch {
      setError("An unexpected error occurred while processing your order.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
        Step 2 of 3
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">
        Select payment method
      </h1>

      <div className="mt-7 space-y-3">
        {options.map(({ id, label, icon: Icon, detail }) => (
          <button
            onClick={() => setMethod(id)}
            key={id}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
              method === id
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-zinc-200 bg-white"
            }`}
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-full ${
                method === id ? "bg-zinc-800" : "bg-zinc-100"
              }`}
            >
              <Icon size={19} />
            </span>
            <span>
              <b className="block text-sm">{label}</b>
              <span
                className={`mt-1 block text-xs ${
                  method === id ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                {detail}
              </span>
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={pay}
        disabled={submitting || !cart.length}
        className="mt-6 w-full rounded-xl bg-zinc-950 py-4 text-xs font-bold tracking-[0.12em] text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {submitting ? "PROCESSING..." : `PAY $${priceDetails(cart).total.toFixed(2)}`}
      </button>
    </div>
  );
}

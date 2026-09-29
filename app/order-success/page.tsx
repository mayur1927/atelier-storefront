"use client";

import Link from "next/link";
import { Check, ShoppingBag, ArrowRight, PackageCheck } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type OrderItem = {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  price: string | number;
  quantity: number;
  size?: string | null;
  colour?: string | null;
  image?: string | null;
};

type OrderDetail = {
  id: string;
  subtotal: string | number;
  discount: string | number;
  couponCode?: string | null;
  total: string | number;
  status: string;
  shippingFullName?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  shippingPhone?: string | null;
  createdAt: string;
  items: OrderItem[];
};

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderReceiptLoading />}>
      <OrderReceiptContent />
    </Suspense>
  );
}

function OrderReceiptLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-3xl border border-zinc-200 bg-white p-12 shadow-sm">
        <p className="text-sm font-semibold text-zinc-500">Loading your order receipt...</p>
      </div>
    </div>
  );
}

function OrderReceiptContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(orderId));
  const [error, setError] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const savedPm = sessionStorage.getItem(`atelier_pm_${orderId}`) || sessionStorage.getItem("atelier_last_pm");
    if (savedPm) {
      setPaymentMethod(savedPm);
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Could not retrieve order details.");
        } else if (data.order) {
          setOrder(data.order);
        } else {
          setError("Order not found.");
        }
      } catch {
        setError("Failed to fetch order confirmation.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <OrderReceiptLoading />;
  }

  if (!orderId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
          <PackageCheck className="mx-auto text-zinc-400" size={40} />
          <h1 className="mt-4 text-2xl font-black tracking-tight">Order Confirmed</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Thank you for shopping with Atelier. Check your email or profile for your order details.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/category/all"
              className="rounded-xl bg-zinc-950 px-5 py-3 text-xs font-bold tracking-wider text-white hover:bg-zinc-800"
            >
              EXPLORE COLLECTION
            </Link>
            <Link
              href="/profile"
              className="rounded-xl border border-zinc-300 px-5 py-3 text-xs font-bold tracking-wider text-zinc-900 hover:bg-zinc-100"
            >
              MY ORDERS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-black text-zinc-900">Order Notice</h1>
          <p className="mt-2 text-sm text-zinc-500">{error || "Unable to locate order details."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/category/all"
              className="rounded-xl bg-zinc-950 px-5 py-3 text-xs font-bold text-white hover:bg-zinc-800"
            >
              CONTINUE SHOPPING
            </Link>
            <Link
              href="/profile"
              className="rounded-xl border border-zinc-300 px-5 py-3 text-xs font-bold text-zinc-900 hover:bg-zinc-100"
            >
              MY ORDERS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = Number(order.subtotal);
  const discount = Number(order.discount);
  const total = Number(order.total);
  const shippingCost = subtotal === 0 || subtotal >= 75 ? 0 : 8;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

        {/* HEADER */}
        <div className="border-b border-zinc-100 bg-zinc-950 p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white">
              <Check size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Order Confirmed
              </p>
              <h1 className="text-2xl font-black tracking-tight">
                Thank you for your order
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-zinc-300">
            <div>
              Order ID: <span className="font-mono font-bold text-white">{order.id}</span>
            </div>
            <div>
              Date: <span className="font-medium text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            {paymentMethod && (
              <div>
                Payment: <span className="font-medium text-white">{paymentMethod}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">

          {/* ORDER ITEMS */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
              Items Ordered ({order.items.reduce((acc, item) => acc + item.quantity, 0)})
            </h2>

            <div className="divide-y divide-zinc-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-16 w-14 rounded-xl object-cover bg-zinc-100"
                    />
                  ) : (
                    <div className="grid h-16 w-14 place-items-center rounded-xl bg-zinc-100 text-zinc-400">
                      <ShoppingBag size={20} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-zinc-900 truncate">{item.productName}</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Qty: {item.quantity}
                      {item.size && ` · Size: ${item.size}`}
                      {item.colour && ` · Color: ${item.colour}`}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                  </div>

                  <div className="text-right font-bold text-sm text-zinc-900">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SHIPPING & SUMMARY GRID */}
          <div className="grid gap-6 border-t border-zinc-100 pt-6 sm:grid-cols-2">

            {/* SHIPPING ADDRESS */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                Delivery Address
              </h2>
              {order.shippingFullName ? (
                <div className="rounded-2xl bg-zinc-50 p-4 text-xs space-y-1 text-zinc-700">
                  <p className="font-bold text-zinc-900 text-sm">{order.shippingFullName}</p>
                  <p>{order.shippingAddress}</p>
                  <p>
                    {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                  </p>
                  <p>{order.shippingCountry}</p>
                  {order.shippingPhone && (
                    <p className="mt-2 text-zinc-500">Phone: {order.shippingPhone}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No shipping details specified.</p>
              )}
            </div>

            {/* PRICING BREAKDOWN */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                Price Breakdown
              </h2>
              <div className="rounded-2xl bg-zinc-50 p-4 text-xs space-y-2.5">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-zinc-900">
                    {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-600">
                  <span>Payment Method</span>
                  <span className="font-semibold text-zinc-900">{paymentMethod || "Credit / Debit Card"}</span>
                </div>

                <div className="flex justify-between border-t border-zinc-200 pt-2.5 text-sm font-black text-zinc-900">
                  <span>Total Paid</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-6">
            <Link
              href="/category/all"
              className="flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3.5 text-xs font-bold tracking-wider text-white hover:bg-zinc-800"
            >
              CONTINUE SHOPPING <ArrowRight size={15} />
            </Link>

            <Link
              href="/profile"
              className="rounded-xl border border-zinc-300 px-6 py-3.5 text-xs font-bold tracking-wider text-zinc-900 hover:bg-zinc-100"
            >
              VIEW ALL ORDERS
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

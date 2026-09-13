export type CartPriceItem = {
  price: number;
  quantity: number;
};

export type PricingSummary = {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
};

export function calculatePricing(
  items: CartPriceItem[],
  discountAmount: number = 0
): PricingSummary {
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const normalizedDiscount = Math.max(0, Math.min(discountAmount, subtotal));
  const discountedSubtotal = Math.max(0, subtotal - normalizedDiscount);

  const shipping =
    subtotal === 0 || subtotal >= 75 ? 0 : 8;

  const tax = Number((discountedSubtotal * 0.06).toFixed(2));

  const total = Number(
    (discountedSubtotal + shipping + tax).toFixed(2)
  );

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shipping,
    tax,
    discount: Number(normalizedDiscount.toFixed(2)),
    total,
  };
}

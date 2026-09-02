"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Product } from "@/lib/mockData";

export type CartItem = Product & { quantity: number; size: string; color: string };
export type User = { name: string; email: string };
type StoreContextValue = {
  cart: CartItem[];
  wishlistIds: string[];
  user: User | null;
  addToCart: (product: Product, selection?: { size?: string; color?: string }) => void;
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  toggleWishlist: (id: string) => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
  clearCart: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo(() => ({
    cart,
    wishlistIds,
    user,
    addToCart: (product: Product, selection: { size?: string; color?: string } = {}) => setCart((items) => {
      const size = selection.size ?? product.sizes[0];
      const color = selection.color ?? product.colors[0];
      const existing = items.find((item) => item.id === product.id && item.size === size && item.color === color);
      return existing
        ? items.map((item) => item.id === product.id && item.size === size && item.color === color ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...product, quantity: 1, size, color }];
    }),
    updateQuantity: (id: string, quantity: number, size?: string, color?: string) => {
      if (quantity < 1) { setCart((items) => items.filter((item) => !(item.id === id && (!size || item.size === size) && (!color || item.color === color)))); return; }
      setCart((items) => items.map((item) => item.id === id && (!size || item.size === size) && (!color || item.color === color) ? { ...item, quantity } : item));
    },
    removeFromCart: (id: string, size?: string, color?: string) => setCart((items) => items.filter((item) => !(item.id === id && (!size || item.size === size) && (!color || item.color === color)))),
    toggleWishlist: (id: string) => setWishlistIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]),
    login: (email: string, name?: string) => setUser({ email, name: name || email.split("@")[0].replace(/(^|[._-])(\w)/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`) }),
    logout: () => setUser(null),
    clearCart: () => setCart([]),
  }), [cart, wishlistIds, user]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}

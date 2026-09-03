"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/mockData";

export type CartItem = Product & {
  quantity: number;
  size: string;
  color: string;
  variantId?: string;
};

export type User = {
  name: string;
  email: string;
};

type StoreContextValue = {
  cart: CartItem[];
  wishlistIds: string[];
  user: User | null;
  addToCart: (
    product: Product,
    selection?: {
      size?: string;
      color?: string;
      image?: string;
      variantId?: string;
    }
  ) => Promise<void>;
  updateQuantity: (
    id: string,
    quantity: number,
    size?: string,
    color?: string
  ) => Promise<void>;
  removeFromCart: (
    id: string,
    size?: string,
    color?: string
  ) => Promise<void>;
  toggleWishlist: (id: string) => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
  clearCart: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function convertDatabaseCart(items: any[]): CartItem[] {
  return items.map((item) => {
    const product = item.product;

    return {
      ...product,
      image:
        item.variant?.images?.[0]?.url ||
        product.image,
      quantity: item.quantity,
      size: item.size || product.sizes[0],
      color:
        item.variant?.color ||
        product.colors?.[0] ||
        "",
      variantId: item.variantId || undefined,
    };
  });
}

export function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Load the real logged-in user.
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) return;

        const data = await response.json();

        if (data.user) {
          setUser({
            name: data.user.name,
            email: data.user.email,
          });
        }
      } catch {
        // User is simply not logged in.
      }
    };

    loadUser();
  }, []);

  // Load database cart whenever a user is available.
  useEffect(() => {
    if (!user) return;

    const loadCart = async () => {
      try {
        const response = await fetch("/api/cart");

        if (!response.ok) return;

        const data = await response.json();

        setCart(convertDatabaseCart(data.items || []));
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    loadCart();
  }, [user]);

  const value = useMemo(
    () => ({
      cart,
      wishlistIds,
      user,

      addToCart: async (
        product: Product,
        selection: {
          size?: string;
          color?: string;
          image?: string;
          variantId?: string;
        } = {}
      ) => {
        const size = selection.size ?? product.sizes[0];
        const color = selection.color ?? product.colors[0];
        const image = selection.image ?? product.image;

        try {
          const response = await fetch("/api/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: product.id,
              variantId: selection.variantId,
              size,
              quantity: 1,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            console.error(data.error || "Failed to add item.");
            return;
          }

          const data = await response.json();

          setCart(convertDatabaseCart(data.items || []));
        } catch (error) {
          console.error("Failed to add item to cart:", error);

          // Fallback to local state if the API cannot be reached.
          setCart((items) => {
            const existing = items.find(
              (item) =>
                item.id === product.id &&
                item.size === size &&
                item.color === color
            );

            return existing
              ? items.map((item) =>
                  item.id === product.id &&
                  item.size === size &&
                  item.color === color
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                      }
                    : item
                )
              : [
                  ...items,
                  {
                    ...product,
                    image,
                    quantity: 1,
                    size,
                    color,
                    variantId: selection.variantId,
                  },
                ];
          });
        }
      },

      updateQuantity: async (
        id: string,
        quantity: number,
        size?: string,
        color?: string
      ) => {
        const item = cart.find(
          (cartItem) =>
            cartItem.id === id &&
            (!size || cartItem.size === size) &&
            (!color || cartItem.color === color)
        );

        if (!item) return;

        // We need the database item ID for PATCH.
        // For now, update the UI immediately.
        setCart((items) =>
          quantity < 1
            ? items.filter(
                (cartItem) =>
                  !(
                    cartItem.id === id &&
                    (!size || cartItem.size === size) &&
                    (!color || cartItem.color === color)
                  )
              )
            : items.map((cartItem) =>
                cartItem.id === id &&
                (!size || cartItem.size === size) &&
                (!color || cartItem.color === color)
                  ? { ...cartItem, quantity }
                  : cartItem
              )
        );

        console.warn(
          "Quantity updated locally. Database quantity sync will be connected in the next cart step."
        );
      },

      removeFromCart: async (
        id: string,
        size?: string,
        color?: string
      ) => {
        const item = cart.find(
          (cartItem) =>
            cartItem.id === id &&
            (!size || cartItem.size === size) &&
            (!color || cartItem.color === color)
        );

        if (!item) return;

        setCart((items) =>
          items.filter(
            (cartItem) =>
              !(
                cartItem.id === id &&
                (!size || cartItem.size === size) &&
                (!color || cartItem.color === color)
              )
          )
        );

        console.warn(
          "Item removed locally. Database deletion will be connected in the next cart step."
        );
      },

      toggleWishlist: (id: string) =>
        setWishlistIds((ids) =>
          ids.includes(id)
            ? ids.filter((item) => item !== id)
            : [...ids, id]
        ),

      login: (email: string, name?: string) =>
        setUser({
          email,
          name:
            name ||
            email
              .split("@")[0]
              .replace(
                /(^|[._-])(\w)/g,
                (_, prefix, letter) =>
                  `${prefix}${letter.toUpperCase()}`
              ),
        }),

      logout: () => {
        setUser(null);
        setCart([]);
      },

      clearCart: () => setCart([]),
    }),
    [cart, wishlistIds, user]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const value = useContext(StoreContext);

  if (!value) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return value;
}
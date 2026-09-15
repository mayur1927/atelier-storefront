"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/products";

export type CartItem = Product & {
  cartItemId?: string;
  quantity: number;
  size: string;
  color: string;
  variantId?: string;
};

export type User = {
  name: string;
  email: string;
};

type DatabaseCartItem = {
  id: string;
  quantity: number;
  size?: string | null;
  variantId?: string | null;
  product: Product;
  variant?: {
    color?: string | null;
    images?: { url: string }[];
  } | null;
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
      quantity?: number;
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
  toggleWishlist: (id: string) => Promise<void>;
  login: (email: string, name?: string) => void;
  logout: () => void;
  clearCart: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function convertDatabaseCart(items: DatabaseCartItem[]): CartItem[] {
  return items.map((item) => {
    const product = item.product;

    return {
      ...product,
      cartItemId: item.id,
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

const GUEST_CART_KEY = "atelier_guest_cart";

export function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize: load user session and restore guest cart if guest
  useEffect(() => {
    const init = async () => {
      let loggedInUser: User | null = null;
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            loggedInUser = {
              name: data.user.name,
              email: data.user.email,
            };
            setUser(loggedInUser);
          }
        }
      } catch {
        // Unauthenticated
      }

      const savedGuestCart = localStorage.getItem(GUEST_CART_KEY);
      let guestItems: CartItem[] = [];
      if (savedGuestCart) {
        try {
          guestItems = JSON.parse(savedGuestCart);
        } catch {
          guestItems = [];
        }
      }

      if (loggedInUser) {
        // If logged in and guest items exist, merge them
        if (guestItems.length > 0) {
          try {
            const mergeRes = await fetch("/api/cart/merge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: guestItems }),
            });
            if (mergeRes.ok) {
              const data = await mergeRes.json();
              setCart(convertDatabaseCart(data.items || []));
              localStorage.removeItem(GUEST_CART_KEY);
            }
          } catch (e) {
            console.error("Failed to merge guest cart on init:", e);
          }
        } else {
          // Fetch existing database cart
          try {
            const cartRes = await fetch("/api/cart");
            if (cartRes.ok) {
              const data = await cartRes.json();
              setCart(convertDatabaseCart(data.items || []));
            }
          } catch (e) {
            console.error("Failed to load cart on init:", e);
          }
        }
      } else {
        // Guest mode: restore from localStorage
        if (guestItems.length > 0) {
          setCart(guestItems);
        }
      }

      setIsInitialized(true);
    };

    init();
  }, []);

  // Save guest cart to localStorage whenever it changes in unauthenticated mode
  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      if (cart.length > 0) {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      } else {
        localStorage.removeItem(GUEST_CART_KEY);
      }
    }
  }, [cart, user, isInitialized]);

  // Load database wishlist whenever user is available
  useEffect(() => {
    if (!user) {
      setWishlistIds([]);
      return;
    }

    const loadWishlist = async () => {
      try {
        const response = await fetch("/api/wishlist");
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.ids)) {
          setWishlistIds(data.ids);
        }
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      }
    };

    loadWishlist();
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
          quantity?: number;
        } = {}
      ) => {
        const defaultVariant = product.variants?.[0];
        const resolvedVariantId = selection.variantId ?? defaultVariant?.id;
        const size = selection.size ?? product.sizes?.[0] ?? "Standard";
        const color =
          selection.color ??
          defaultVariant?.color ??
          defaultVariant?.colour ??
          product.colors?.[0] ??
          "";
        const image = selection.image ?? defaultVariant?.image ?? product.image;
        const addQuantity = Math.max(1, selection.quantity ?? 1);

        if (user) {
          try {
            const response = await fetch("/api/cart", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: product.id,
                variantId: resolvedVariantId,
                size,
                quantity: addQuantity,
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
          }
        } else {
          // Guest Cart: update local state & localStorage with inventory check
          setCart((items) => {
            const existing = items.find(
              (item) =>
                item.id === product.id &&
                item.size === size &&
                item.color === color
            );

            const selectedVariant = product.variants?.find(
              (v) => v.id === resolvedVariantId || v.colour === color
            );
            const availableStock = selectedVariant ? selectedVariant.inventory : 999;

            if (existing) {
              const newQty = Math.min(availableStock, existing.quantity + addQuantity);
              return items.map((item) =>
                item.id === product.id &&
                item.size === size &&
                item.color === color
                  ? { ...item, quantity: newQty, variantId: resolvedVariantId }
                  : item
              );
            }

            const initialQty = Math.min(availableStock, addQuantity);
            return [
              ...items,
              {
                ...product,
                image,
                quantity: initialQty,
                size,
                color,
                variantId: resolvedVariantId,
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

        if (user) {
          if (!item.cartItemId) return;

          try {
            const response = await fetch("/api/cart", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                itemId: item.cartItemId,
                quantity,
              }),
            });

            if (!response.ok) {
              const data = await response.json();
              console.error(data.error || "Failed to update cart.");
              return;
            }

            const cartResponse = await fetch("/api/cart");
            if (cartResponse.ok) {
              const data = await cartResponse.json();
              setCart(convertDatabaseCart(data.items || []));
            }
          } catch (error) {
            console.error("Failed to update cart:", error);
          }
        } else {
          // Guest mode
          if (quantity <= 0) {
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
          } else {
            setCart((items) =>
              items.map((cartItem) => {
                if (
                  cartItem.id === id &&
                  (!size || cartItem.size === size) &&
                  (!color || cartItem.color === color)
                ) {
                  return { ...cartItem, quantity };
                }
                return cartItem;
              })
            );
          }
        }
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

        if (user) {
          if (!item.cartItemId) return;

          try {
            const response = await fetch("/api/cart", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                itemId: item.cartItemId,
              }),
            });

            if (!response.ok) {
              const data = await response.json();
              console.error(data.error || "Failed to remove item.");
              return;
            }

            setCart((items) =>
              items.filter((cartItem) => cartItem.cartItemId !== item.cartItemId)
            );
          } catch (error) {
            console.error("Failed to remove item:", error);
          }
        } else {
          // Guest mode
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
        }
      },

      toggleWishlist: async (id: string) => {
        setWishlistIds((ids) =>
          ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
        );

        try {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id }),
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.ids)) {
              setWishlistIds(data.ids);
            }
          }
        } catch (err) {
          console.error("Failed to sync wishlist:", err);
        }
      },

      login: async (email: string, name?: string) => {
        const loggedUser: User = {
          email,
          name:
            name ||
            email
              .split("@")[0]
              .replace(
                /(^|[._-])(\w)/g,
                (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`
              ),
        };
        setUser(loggedUser);

        // Perform guest-to-authenticated cart merge if guest items exist
        const savedGuestCart = localStorage.getItem(GUEST_CART_KEY);
        if (savedGuestCart) {
          try {
            const guestItems = JSON.parse(savedGuestCart);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const mergeRes = await fetch("/api/cart/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: guestItems }),
              });
              if (mergeRes.ok) {
                const data = await mergeRes.json();
                setCart(convertDatabaseCart(data.items || []));
                localStorage.removeItem(GUEST_CART_KEY);
                return;
              }
            }
          } catch (e) {
            console.error("Failed to merge guest cart on login:", e);
          }
        }

        // Otherwise load user cart from database
        try {
          const cartRes = await fetch("/api/cart");
          if (cartRes.ok) {
            const data = await cartRes.json();
            setCart(convertDatabaseCart(data.items || []));
          }
        } catch (e) {
          console.error("Failed to load user cart on login:", e);
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // Ignore
        }
        localStorage.removeItem(GUEST_CART_KEY);
        setUser(null);
        setCart([]);
        setWishlistIds([]);
      },

      clearCart: () => {
        localStorage.removeItem(GUEST_CART_KEY);
        setCart([]);
      },
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
    throw new Error(
      "useStore must be used within StoreProvider"
    );
  }

  return value;
}
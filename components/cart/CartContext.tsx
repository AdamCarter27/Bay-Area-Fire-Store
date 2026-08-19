"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  ReactNode,
} from "react";
import type { Product, ProductVariant } from "@/lib/data/types";

export type CartItem = {
  slug: string;
  title: string;
  // Wix catalog item ID, carried from Product.wixId. Wix's checkout resolves a
  // line item by catalogReference.catalogItemId + the variant ID — never by
  // slug or title — so the cart has to hold it from the moment an item is
  // added, not look it up again at checkout. Empty string for mock products.
  wixId: string;
  variantId: string;
  variantTitle: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  /*
   * False on the server and during the hydration render, true from the first
   * client render onward. Consumers that render "your cart is empty" or an item
   * count must gate on this: the server has no access to localStorage, so its
   * `items` is always [] — indistinguishable from a genuinely empty cart, and
   * rendering it would both flash the wrong UI and break hydration.
   */
  hydrated: boolean;
  addToCart: (product: Product, variant: ProductVariant) => void;
  removeFromCart: (slug: string, variantId: string) => void;
  updateQuantity: (slug: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

// Versioned so a change to CartItem's shape bumps the key rather than migrating
// carts written by an older build. v2 added wixId — a v1 cart has no way to
// reach Wix checkout, so those carts are dropped instead of carried forward.
const STORAGE_KEY = "bafs.cart.v2";

export const MAX_QUANTITY = 99;

/*
 * localStorage holds whatever an older build — or a curious user — left there,
 * so every field is checked before it reaches React state. Bad entries are
 * dropped rather than thrown: a corrupt saved cart should cost you the cart,
 * not the whole page.
 */
function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is CartItem => {
      if (typeof item !== "object" || item === null) return false;
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.slug === "string" &&
        typeof candidate.title === "string" &&
        typeof candidate.wixId === "string" &&
        typeof candidate.variantId === "string" &&
        typeof candidate.variantTitle === "string" &&
        typeof candidate.price === "number" &&
        Number.isFinite(candidate.price) &&
        typeof candidate.quantity === "number" &&
        Number.isInteger(candidate.quantity) &&
        candidate.quantity > 0
      );
    });
  } catch {
    return [];
  }
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return parseStoredCart(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Private mode / storage disabled — cart just stays in memory.
    return [];
  }
}

// Standard "am I past hydration?" signal: the server snapshot is false and the
// client snapshot is true, so the hydration render matches the server HTML and
// React flips it immediately afterwards. Nothing ever changes, hence the no-op
// subscribe.
const neverChanges = () => () => {};

export function CartProvider({ children }: { children: ReactNode }) {
  // Read synchronously on the client so the cart is already correct by the
  // first post-hydration render — no effect, no extra render, no flash. On the
  // server this is always [], which is why consumers gate on `hydrated`.
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const hydrated = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  );

  // Write back on every change. Idempotent on the first pass — it rewrites
  // exactly what was just read.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Quota or disabled storage — in-memory cart still works this visit.
    }
  }, [items]);

  function addToCart(product: Product, variant: ProductVariant) {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.slug === product.slug && item.variantId === variant.id
      );
      if (existing) {
        return prev.map((item) =>
          item.slug === product.slug && item.variantId === variant.id
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
            : item
        );
      }
      return [
        ...prev,
        {
          slug: product.slug,
          title: product.title,
          wixId: product.wixId,
          variantId: variant.id,
          variantTitle: variant.title,
          price: variant.price,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(slug: string, variantId: string) {
    setItems((prev) =>
      prev.filter((item) => !(item.slug === slug && item.variantId === variantId))
    );
  }

  function updateQuantity(slug: string, variantId: string, quantity: number) {
    if (quantity < 1) {
      removeFromCart(slug, variantId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.slug === slug && item.variantId === variantId
          ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

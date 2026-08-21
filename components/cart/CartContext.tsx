"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product, ProductVariant } from "@/lib/data/types";

export type CartItem = {
  slug: string;
  title: string;
  image: string;
  variantId: string;
  variantTitle: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  hydrated: boolean;
  lastAdded: CartItem | null;
  addToCart: (product: Product, variant: ProductVariant) => void;
  removeFromCart: (slug: string, variantId: string) => void;
  updateQuantity: (slug: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  clearLastAdded: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);

  // Read the saved cart once on mount. Until this runs, `hydrated` stays
  // false so CartLink and CheckoutForm show a loading state instead of a
  // count/cart that would otherwise flash empty on every page load.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Corrupt or unavailable storage — start with an empty cart.
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but only after hydration so we don't overwrite
  // a saved cart with the empty initial state during the very first render.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addToCart(product: Product, variant: ProductVariant) {
    const addedItem: CartItem = {
      slug: product.slug,
      title: product.title,
      image: product.image,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
    };

    setItems((prev) => {
      const existing = prev.find(
        (item) => item.slug === product.slug && item.variantId === variant.id
      );
      if (existing) {
        return prev.map((item) =>
          item.slug === product.slug && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, addedItem];
    });

    // Drives the "Added to bag" popup — cleared by the popup itself once shown.
    setLastAdded(addedItem);
  }

  function removeFromCart(slug: string, variantId: string) {
    setItems((prev) =>
      prev.filter((item) => !(item.slug === slug && item.variantId === variantId))
    );
  }

  function updateQuantity(slug: string, variantId: string, quantity: number) {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.slug === slug && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  function clearLastAdded() {
    setLastAdded(null);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated,
        lastAdded,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearLastAdded,
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
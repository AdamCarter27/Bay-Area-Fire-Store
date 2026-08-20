"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Product, ProductVariant } from "@/lib/data/types";

type CartItem = {
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
  addToCart: (product: Product, variant: ProductVariant) => void;
  removeFromCart: (slug: string, variantId: string) => void;
  updateQuantity: (slug: string, variantId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addToCart(product: Product, variant: ProductVariant) {
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
      return [
        ...prev,
        {
          slug: product.slug,
          title: product.title,
          image: product.image,
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
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.slug === slug && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  }

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity }}
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
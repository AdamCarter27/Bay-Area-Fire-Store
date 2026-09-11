"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product, ProductVariant } from "@/lib/data/types";

export type CartItem = {
  slug: string;
  title: string;
  image: string;
  // Wix catalog item ID, carried from Product.wixId. Wix's checkout resolves a
  // line item by catalogReference.catalogItemId + the variant ID — never by
  // slug or title — so the cart has to hold it from the moment an item is
  // added rather than look it up again at checkout. "" for mock-catalog items,
  // which lib/wix/checkout.ts refuses rather than sending on.
  wixId: string;
  variantId: string;
  variantTitle: string;
  price: number;
  quantity: number;
  isCustom?: boolean; // Flag to indicate if the item is a custom sticker
  /*
   * Answers to the product's Wix custom text fields, keyed by the exact field
   * title (see ProductCustomTextField). Wix drops a line item whose mandatory
   * fields are missing without reporting an error, so this travels with the
   * item from the moment it is added.
   */
  customText?: Record<string, string>;
};

/*
 * Identity of a cart line. Two of the same variant with different embroidery
 * text are different lines — not one line of quantity two — so the key has to
 * include the text as well as the slug and variant.
 */
export function lineKey(item: {
  slug: string;
  variantId: string;
  customText?: Record<string, string>;
}): string {
  return `${item.slug}|${item.variantId}|${JSON.stringify(item.customText ?? {})}`;
}

type CartContextType = {
  items: CartItem[];
  hydrated: boolean;
  lastAdded: CartItem | null;
  addToCart: (
    product: Product,
    variant: ProductVariant,
    customText?: Record<string, string>
  ) => void;
  addCustomItem: (item: { title: string; price: number; quantity: number }) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  clearLastAdded: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
/*
 * Versioned: carts saved before wixId existed can't reach Wix checkout, so
 * bumping the key drops them instead of leaving someone with a cart that looks
 * fine and then refuses to check out. v3 does the same for carts saved before
 * customText, whose embroidery items Wix would drop at checkout.
 */
const STORAGE_KEY = "cart.v3";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);

  // Read the saved cart once on mount. Until this runs, `hydrated` stays
  // false so CartLink and the cart page show a loading state instead of a
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

  function addToCart(
    product: Product,
    variant: ProductVariant,
    customText?: Record<string, string>
  ) {
    const addedItem: CartItem = {
      slug: product.slug,
      title: product.title,
      image: product.image,
      wixId: product.wixId,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      ...(customText && Object.keys(customText).length > 0
        ? { customText }
        : {}),
    };

    const key = lineKey(addedItem);

    setItems((prev) => {
      const existing = prev.find((item) => lineKey(item) === key);
      if (existing) {
        return prev.map((item) =>
          lineKey(item) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, addedItem];
    });

    // Drives the "Added to bag" popup — cleared by the popup itself once shown.
    setLastAdded(addedItem);
  }

  function addCustomItem(item: { title: string; price: number; quantity: number }) {
  const addedItem: CartItem = {
    slug: `custom-${Date.now()}`,
    title: item.title,
    image: "",
    wixId: "",
    variantId: "custom",
    variantTitle: "",
    price: item.price,
    quantity: item.quantity,
    isCustom: true,
  };

  setItems((prev) => [...prev, addedItem]);
  setLastAdded(addedItem);
}

  function removeFromCart(key: string) {
    setItems((prev) => prev.filter((item) => lineKey(item) !== key));
  }

  function updateQuantity(key: string, quantity: number) {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (lineKey(item) === key ? { ...item, quantity } : item))
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
        addCustomItem,
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
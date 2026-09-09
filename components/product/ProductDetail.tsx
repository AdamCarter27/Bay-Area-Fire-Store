"use client";

import { useState, useEffect } from "react";
import type { Product, ProductVariant } from "@/lib/data/types";
import { useCart } from "@/components/cart/CartContext";
import { ProductImage } from "@/components/product/ProductImage";

/*
 * The variant a set of choices resolves to. Wix does not guarantee a variant
 * for every combination — an owner can delete one — so this can miss, and the
 * caller has to handle that rather than assume the matrix is complete.
 */
function findVariant(
  variants: ProductVariant[],
  choices: Record<string, string>
): ProductVariant | undefined {
  return variants.find((variant) =>
    Object.entries(choices).every(
      ([axis, choice]) => variant.choices?.[axis] === choice
    )
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const defaultVariant =
    product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [variantId, setVariantId] = useState(defaultVariant.id);
  /*
   * Answers to the product's Wix custom text fields, keyed by field title.
   * Mandatory ones gate the Add to Cart button: Wix throws the whole line item
   * away when one is missing, and does it without an error, so the only place
   * this can be caught is before the item ever reaches the cart.
   */
  const [customText, setCustomText] = useState<Record<string, string>>({});
  const [showTextErrors, setShowTextErrors] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addToCart } = useCart();

  const variant =
    product.variants.find((v) => v.id === variantId) ?? defaultVariant;
  const soldOut = !product.inStock || !variant.inStock;

  /*
   * One picker per option axis. Wix models variants as the full matrix of
   * choices, so without this the page offers a single list of every
   * combination under a "Size" label — "S / No", "Black / M / Yes" — which
   * tells a shopper nothing about what they're choosing.
   */
  const options = product.options ?? [];
  const selected = variant.choices ?? {};

  /*
   * Picking a choice on one axis can land on a combination that has no
   * variant. Rather than refuse the click, keep the choice and move the other
   * axes to the nearest variant that has it, preferring one in stock — the
   * same thing a shopper would do by hand.
   */
  const selectChoice = (axis: string, choice: string) => {
    const exact = findVariant(product.variants, { ...selected, [axis]: choice });
    const nearest =
      exact ??
      product.variants.find((v) => v.choices?.[axis] === choice && v.inStock) ??
      product.variants.find((v) => v.choices?.[axis] === choice);

    if (nearest) setVariantId(nearest.id);
  };

  // Whether a choice is buyable given what's picked on the other axes, so the
  // dropdown can say "sold out" against the specific combination rather than
  // against the product as a whole.
  const choiceState = (axis: string, choice: string) => {
    const rest = Object.fromEntries(
      Object.entries(selected).filter(([key]) => key !== axis)
    );
    const match = findVariant(product.variants, { ...rest, [axis]: choice });
    if (match) return match.inStock ? "" : " — sold out";

    // No variant for this combination at all; it exists on its own axis but
    // not alongside the current picks.
    return product.variants.some((v) => v.choices?.[axis] === choice)
      ? " — unavailable in this combination"
      : " — unavailable";
  };

  const textFields = product.customTextFields ?? [];

  /*
   * These products sell with or without embroidery — the Yes/No axis is a real
   * choice, not a formality — but Wix marks the embroidery questions mandatory
   * at the product level, so it asks them either way. Hide them on "No".
   */
  const embroideryDeclined = options.some(
    (option) =>
      /embroider/i.test(option.name) &&
      (selected[option.name] ?? "").toLowerCase() === "no"
  );
  const visibleTextFields = embroideryDeclined ? [] : textFields;

  const missingText = visibleTextFields.filter(
    (field) => field.mandatory && !(customText[field.title] ?? "").trim()
  );

  /*
   * What a hidden-but-mandatory field is answered with. Wix throws the whole
   * line item away when a mandatory field arrives empty, so declining
   * embroidery still has to say something — this is the site answering on the
   * shopper's behalf, and it shows on the order so the owner can see the
   * jacket ships plain. Once the fields are marked optional in Wix this stops
   * being sent at all, with no change here.
   */
  const NO_EMBROIDERY_ANSWER = "No embroidery selected";

  const handleAddToCart = () => {
    if (missingText.length > 0) {
      setShowTextErrors(true);
      return;
    }
    // Trimmed: Wix stores these verbatim on the order and the owner reads them
    // to set up the embroidery.
    const answers = Object.fromEntries(
      textFields
        .map((field) => [
          field.title,
          embroideryDeclined
            ? field.mandatory
              ? NO_EMBROIDERY_ANSWER
              : ""
            : (customText[field.title] ?? "").trim(),
        ])
        .filter(([, value]) => value)
    );
    addToCart(product, variant, answers);
    setCustomText({});
    setShowTextErrors(false);
  };

  const images = product.images ?? [];
  const showPrev = () =>
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const showNext = () =>
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  // Close on Escape, lock page scroll while open
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {images.length > 1 && (
          <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`View photo ${i + 1}`}
                className={`shrink-0 overflow-hidden rounded-lg border transition-colors ${
                  i === activeIndex
                    ? "border-ink"
                    : "border-line hover:border-line-strong"
                }`}
              >
                <ProductImage
                  src={img}
                  alt={`${product.title} thumbnail ${i + 1}`}
                  sizes="64px"
                  className="h-16 w-16 object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative order-1 min-w-0 flex-1 sm:self-start sm:order-2">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="View full-size photo"
            className="block w-full cursor-zoom-in"
          >
            <ProductImage
              src={images[activeIndex]}
              alt={product.title}
              label={product.categories[0]}
              priority
              sizes="(min-width: 640px) 45vw, 90vw"
              className={`aspect-square w-full rounded-xl border border-line ${
                product.inStock ? "" : "opacity-60"
              }`}
            />
          </button>
          {!product.inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.7rem] font-semibold text-ash shadow-sm backdrop-blur-sm">
              Sold out
            </span>
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label="Previous photo"
                className="absolute bottom-3 right-14 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-opacity hover:opacity-80"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Next photo"
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-opacity hover:opacity-80"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs capitalize text-ash">{product.categories[0]}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          {product.title}
        </h1>
        <p className="mt-2 text-lg text-ink">${variant.price.toFixed(2)}</p>

        {product.description && (
          <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>
        )}

        {options.length > 0
          ? options.map((option) => (
              <div key={option.name} className="mt-6">
                <label
                  htmlFor={`option-${option.name.replace(/\W+/g, "-")}`}
                  className="text-sm font-medium text-ink"
                >
                  {option.name}
                </label>
                <select
                  id={`option-${option.name.replace(/\W+/g, "-")}`}
                  value={selected[option.name] ?? ""}
                  onChange={(e) => selectChoice(option.name, e.target.value)}
                  className="mt-2 block w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
                >
                  {option.choices.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                      {choiceState(option.name, choice)}
                    </option>
                  ))}
                </select>
              </div>
            ))
          : product.variants.length > 1 && (
              /* No option metadata (mock catalog): fall back to one list of
                 the variants as they come. */
              <div className="mt-6">
                <label htmlFor="variant" className="text-sm font-medium text-ink">
                  Size
                </label>
                <select
                  id="variant"
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id} disabled={!v.inStock}>
                      {v.title}
                      {v.inStock ? "" : " — sold out"}
                    </option>
                  ))}
                </select>
              </div>
            )}

        {visibleTextFields.length > 0 && (
          <div className="mt-6 flex flex-col gap-4">
            {visibleTextFields.map((field) => {
              const value = customText[field.title] ?? "";
              const invalid =
                showTextErrors && field.mandatory && !value.trim();
              const inputId = `custom-text-${field.title.replace(/\W+/g, "-")}`;

              return (
                <div key={field.title}>
                  <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-ink"
                  >
                    {field.title}
                    {field.mandatory && (
                      <span className="text-signal" aria-hidden="true">
                        {" "}
                        *
                      </span>
                    )}
                  </label>
                  <textarea
                    id={inputId}
                    value={value}
                    rows={2}
                    maxLength={field.maxLength}
                    required={field.mandatory}
                    aria-invalid={invalid || undefined}
                    onChange={(e) =>
                      setCustomText((prev) => ({
                        ...prev,
                        [field.title]: e.target.value,
                      }))
                    }
                    className={`mt-2 block w-full rounded-md border bg-paper px-3 py-2 text-sm text-ink ${
                      invalid ? "border-signal" : "border-line"
                    }`}
                  />
                  {invalid && (
                    <p className="mt-1 text-xs text-signal">
                      This is required to place the order.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={soldOut}
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? "Sold out" : "Add to Cart"}
        </button>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink shadow-md hover:opacity-80"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div
            className="relative max-h-[90vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductImage
              src={images[activeIndex]}
              alt={product.title}
              sizes="90vw"
              className="aspect-square w-full rounded-xl"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink shadow-md hover:opacity-80"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink shadow-md hover:opacity-80"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { useCart, type CartItem } from "@/components/cart/CartContext";
import {
  calculateTotals,
  startCheckout,
  type CheckoutPayload,
} from "@/lib/start-checkout";

const inputBase =
  "w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ash transition-colors hover:border-ash aria-invalid:border-signal";

const labelBase = "mb-1.5 block text-xs font-medium tracking-[0.05em] text-ink";

type FormValues = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
};

type FieldName = keyof FormValues;

const initialValues: FormValues = {
  email: "",
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  notes: "",
};

function validate(values: FormValues): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.phone.trim()) errors.phone = "Enter a phone number.";
  if (!values.address.trim()) errors.address = "Enter a street address.";
  if (!values.city.trim()) errors.city = "Enter a city.";
  if (!values.state.trim()) errors.state = "Enter a state.";
  if (!/^\d{5}(-\d{4})?$/.test(values.zip.trim()))
    errors.zip = "Enter a 5-digit ZIP code.";

  return errors;
}

// What was bought, frozen at the moment the order went through. The cart is
// emptied on success, so the confirmation can't read from it.
type PlacedOrder = {
  orderNumber: string;
  email: string;
  items: CartItem[];
  total: number;
};

export function CheckoutForm() {
  const { items, hydrated, clearCart } = useCart();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const totals = calculateTotals(items);

  useEffect(() => {
    if (placed) successHeadingRef.current?.focus();
  }, [placed]);

  const setValue = <K extends FieldName>(field: K, value: FormValues[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // Clear the field's error as soon as it becomes valid — don't nag
    // mid-correction.
    if (errors[field] && !validate(next)[field]) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[field];
        return rest;
      });
    }
  };

  const validateField = (field: FieldName) => {
    const fieldError = validate(values)[field];
    setErrors((prev) => {
      const rest = { ...prev };
      if (fieldError) rest[field] = fieldError;
      else delete rest[field];
      return rest;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors = validate(values);
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      // Let React paint the aria-invalid attributes before we look them up.
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }

    setStatus("submitting");
    try {
      const payload: CheckoutPayload = {
        contact: {
          email: values.email.trim(),
          name: values.name.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          city: values.city.trim(),
          state: values.state.trim(),
          zip: values.zip.trim(),
          notes: values.notes.trim() || undefined,
        },
        items,
        ...totals,
      };
      const { orderNumber } = await startCheckout(payload);

      // Snapshot before clearing — the confirmation below renders from this.
      setPlaced({
        orderNumber,
        email: payload.contact.email,
        items,
        total: totals.total,
      });
      clearCart();
    } catch {
      // The stub never rejects; once Wix's createCheckout lands, surface a
      // form-level error here instead of silently returning to the form.
      setStatus("idle");
    }
  };

  if (placed) {
    const itemCount = placed.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
      <div
        role="status"
        className="mt-10 rounded-lg border border-line bg-surface px-8 py-12 text-center"
      >
        <FiCheckCircle aria-hidden className="mx-auto h-8 w-8 text-ink" />
        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink"
        >
          Order placed
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ash">
          Order{" "}
          <span className="font-medium text-ink">{placed.orderNumber}</span> —{" "}
          {itemCount} {itemCount === 1 ? "item" : "items"}, $
          {placed.total.toFixed(2)}. A confirmation is on its way to{" "}
          <span className="font-medium text-ink">{placed.email}</span>.
        </p>
        <div className="mt-8">
          <Button variant="secondary" href="/shop">
            Back to the shop
          </Button>
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <p className="mt-10 text-sm text-ash" role="status">
        Loading your cart…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <p className="text-ash">
          There&apos;s nothing to check out — your cart is empty.
        </p>
        <Link href="/shop" className="mt-6 inline-block text-ink underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-10">
      <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="text-xs text-ash">
            All fields are required unless marked optional.
          </p>

          <h2 className="mt-8 font-display text-xl font-semibold text-ink">
            Contact
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <Field label="Email" name="email" error={errors.email}>
              {(props) => (
                <input
                  {...props}
                  type="email"
                  autoComplete="email"
                  className={inputBase}
                  value={values.email}
                  onChange={(e) => setValue("email", e.target.value)}
                  onBlur={() => validateField("email")}
                />
              )}
            </Field>
            <Field label="Phone" name="phone" error={errors.phone}>
              {(props) => (
                <input
                  {...props}
                  type="tel"
                  autoComplete="tel"
                  className={inputBase}
                  value={values.phone}
                  onChange={(e) => setValue("phone", e.target.value)}
                  onBlur={() => validateField("phone")}
                />
              )}
            </Field>
          </div>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            Shipping address
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <Field label="Full name" name="name" error={errors.name}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  autoComplete="name"
                  className={inputBase}
                  value={values.name}
                  onChange={(e) => setValue("name", e.target.value)}
                  onBlur={() => validateField("name")}
                />
              )}
            </Field>
            <Field label="Street address" name="address" error={errors.address}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  autoComplete="street-address"
                  className={inputBase}
                  value={values.address}
                  onChange={(e) => setValue("address", e.target.value)}
                  onBlur={() => validateField("address")}
                />
              )}
            </Field>
            <Field label="City" name="city" error={errors.city}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  autoComplete="address-level2"
                  className={inputBase}
                  value={values.city}
                  onChange={(e) => setValue("city", e.target.value)}
                  onBlur={() => validateField("city")}
                />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-6">
              <Field label="State" name="state" error={errors.state}>
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    autoComplete="address-level1"
                    className={inputBase}
                    value={values.state}
                    onChange={(e) => setValue("state", e.target.value)}
                    onBlur={() => validateField("state")}
                  />
                )}
              </Field>
              <Field label="ZIP" name="zip" error={errors.zip}>
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={inputBase}
                    value={values.zip}
                    onChange={(e) => setValue("zip", e.target.value)}
                    onBlur={() => validateField("zip")}
                  />
                )}
              </Field>
            </div>
          </div>

          <div className="mt-6">
            <Field label="Order notes" name="notes" optional>
              {(props) => (
                <textarea
                  {...props}
                  rows={3}
                  className={inputBase}
                  placeholder="Department, delivery instructions, anything we should know."
                  value={values.notes}
                  onChange={(e) => setValue("notes", e.target.value)}
                />
              )}
            </Field>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold text-ink">
              Order summary
            </h2>

            <ul className="mt-5 flex flex-col gap-4 border-b border-line pb-5">
              {items.map((item) => (
                <li
                  key={`${item.slug}-${item.variantId}`}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span className="min-w-0 text-ink">
                    {item.title}
                    <span className="block text-xs text-ash">
                      {item.variantTitle} · Qty {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-ink">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ash">Subtotal</dt>
                <dd className="tabular-nums text-ink">
                  ${totals.subtotal.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ash">Shipping</dt>
                <dd className="tabular-nums text-ink">
                  {totals.shipping === 0
                    ? "Free"
                    : `$${totals.shipping.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ash">Estimated tax</dt>
                <dd className="tabular-nums text-ink">
                  ${totals.tax.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="font-medium tabular-nums text-ink">
                  ${totals.total.toFixed(2)}
                </dd>
              </div>
            </dl>

            <Button
              type="submit"
              size="lg"
              disabled={status === "submitting"}
              className="mt-6 w-full"
            >
              {status === "submitting" ? "Placing order…" : "Place order"}
            </Button>

            <p className="mt-3 text-center text-xs text-ash">
              Demo checkout — no card is collected and nothing is charged.
            </p>

            <Link
              href="/cart"
              className="mt-4 block text-center text-sm text-ink underline"
            >
              Back to cart
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  optional = false,
  error,
  children,
}: {
  label: string;
  name: string;
  optional?: boolean;
  error?: string;
  children: (props: {
    id: string;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
  }) => ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className={labelBase}>
        {label}
        {optional && <span className="font-normal text-ash"> (optional)</span>}
      </label>
      {children({
        id: name,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-signal-deep">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Field, inputBase, labelBase } from "@/components/ui/Field";
import {
  STICKER_TYPE_OPTIONS,
  submitStickerOrder,
  type StickerOrderPayload,
} from "@/lib/submit-sticker-order";
import {
  STANDARD_SIZE_LABEL,
  QUANTITY_TIERS,
  getStandardPrice,
} from "@/lib/data/sticker-pricing";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { getStickerProduct, findStickerVariant } from "@/lib/wix/sticker-prod";
const SIZE_OPTIONS = [
  { value: STANDARD_SIZE_LABEL, label: `${STANDARD_SIZE_LABEL} — instant pricing` },
  { value: 'Larger than 3"', label: 'Larger than 3" — custom quote' },
] as const;



type FormValues = {
  name: string;
  email: string;
  phone: string;
  organization: string;
  neededByDate: string;
  stickerType: string;
  size: string;
  quantity: string;
  description: string;
  consent: boolean;
};

type FieldName = keyof FormValues;

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  organization: "",
  neededByDate: "",
  stickerType: "",
  size: "",
  quantity: "",
  description: "",
  consent: false,
};

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function validate(values: FormValues): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (!values.phone.trim()) errors.phone = "Enter a phone number.";
  else if (values.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Enter a full phone number, including area code.";
  if (!values.neededByDate || values.neededByDate < todayISO())
    errors.neededByDate = "Choose a date — today or later.";
  if (!values.stickerType) errors.stickerType = "Choose a sticker type.";
  if (!values.size) errors.size = "Choose an approximate size.";
  const qty = Number(values.quantity);
  if (!values.quantity.trim() || !Number.isInteger(qty) || qty < 1)
    errors.quantity = "Choose or enter a quantity.";
  if (!values.description.trim())
    errors.description = "Tell us about your design.";
  if (!values.consent)
    errors.consent = "Please agree to the terms before submitting.";

  return errors;
}

export function StickerOrderForm() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const isStandardSize = values.size === STANDARD_SIZE_LABEL;
  const quantityNum = Number(values.quantity);
  const computedPrice = isStandardSize ? getStandardPrice(quantityNum) : null;

  useEffect(() => {
    if (status === "success") successHeadingRef.current?.focus();
  }, [status]);

  const setValue = <K extends FieldName>(field: K, value: FormValues[K]) => {
    const next = { ...values, [field]: value };
    if (field === "size" && value !== values.size) {
      next.quantity = "";
    }
    setValues(next);
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
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }
    setStatus("submitting");
    try {
      const payload: StickerOrderPayload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        organization: values.organization.trim() || undefined,
        neededByDate: values.neededByDate,
        stickerType: values.stickerType,
        size: values.size,
        quantity: Number(values.quantity),
        description: values.description.trim(),
        file: file ?? undefined,
        consent: true,
      };

      await submitStickerOrder(payload, computedPrice ?? undefined);

      if (isStandardSize && computedPrice != null) {
        const stickerProduct = await getStickerProduct();
        const variant = stickerProduct
          ? findStickerVariant(stickerProduct, quantityNum)
          : undefined;

        if (!stickerProduct || !variant) {
          console.error("[sticker-order] could not find matching Wix variant", {
            quantityNum,
          });
          setStatus("error");
          return;
        }

        addToCart(stickerProduct, variant);
        router.push("/cart");
        return;
      }

      setStatus("success");
    } catch (error) {
      console.error("[sticker-order] submission failed", error);
      setStatus("error");
    }
};

  if (status === "success") {
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
          Request received
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ash">
          We&apos;ll review your sticker design and get back to you at{" "}
          <span className="font-medium text-ink">{values.email.trim()}</span>{" "}
          within a couple of business days.
        </p>
        <div className="mt-8">
          <Button variant="secondary" href="/shop">
            Back to the shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-10">
      <p className="text-xs text-ash">
        All fields are required unless marked optional.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" error={errors.name}>
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

        <Field
          label="Organization"
          name="organization"
          optional
          error={errors.organization}
        >
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="organization"
              className={inputBase}
              value={values.organization}
              onChange={(e) => setValue("organization", e.target.value)}
            />
          )}
        </Field>

        <Field label="Needed by" name="neededByDate" error={errors.neededByDate}>
          {(props) => (
            <input
              {...props}
              type="date"
              min={todayISO()}
              className={inputBase}
              value={values.neededByDate}
              onChange={(e) => setValue("neededByDate", e.target.value)}
              onBlur={() => validateField("neededByDate")}
            />
          )}
        </Field>

        {isStandardSize ? (
          <Field label="Quantity" name="quantity" error={errors.quantity}>
            {(props) => (
              <select
                {...props}
                className={inputBase}
                value={values.quantity}
                onChange={(e) => setValue("quantity", e.target.value)}
                onBlur={() => validateField("quantity")}
              >
                <option value="">Select a quantity</option>
                {QUANTITY_TIERS.map((tier) => (
                  <option key={tier.quantity} value={tier.quantity}>
                    {tier.quantity} stickers — ${tier.price}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : (
          <Field
            label="Approximate quantity"
            name="quantity"
            error={errors.quantity}
          >
            {(props) => (
              <input
                {...props}
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                className={inputBase}
                value={values.quantity}
                onChange={(e) => setValue("quantity", e.target.value)}
                onBlur={() => validateField("quantity")}
              />
            )}
          </Field>
        )}
      </div>

      <fieldset className="mt-8">
        <legend className={labelBase}>Sticker type</legend>
        <div className="mt-1 grid gap-0.5 sm:grid-cols-2">
          {STICKER_TYPE_OPTIONS.map((option, i) => (
            <label
              key={option.value}
              className="flex items-center gap-2.5 py-1 text-sm text-ink"
            >
              <input
                type="radio"
                name="stickerType"
                className="h-4 w-4 shrink-0 accent-[var(--ink)]"
                checked={values.stickerType === option.value}
                aria-invalid={i === 0 && errors.stickerType ? true : undefined}
                aria-describedby={
                  i === 0 && errors.stickerType ? "sticker-type-error" : undefined
                }
                onChange={() => setValue("stickerType", option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.stickerType && (
          <p id="sticker-type-error" className="mt-1.5 text-xs text-signal-deep">
            {errors.stickerType}
          </p>
        )}
      </fieldset>

      <fieldset className="mt-8">
        <legend className={labelBase}>Size</legend>
        <div className="mt-1 grid gap-0.5 sm:grid-cols-2">
          {SIZE_OPTIONS.map((option, i) => (
            <label
              key={option.value}
              className="flex items-center gap-2.5 py-1 text-sm text-ink"
            >
              <input
                type="radio"
                name="stickerSize"
                className="h-4 w-4 shrink-0 accent-[var(--ink)]"
                checked={values.size === option.value}
                aria-invalid={i === 0 && errors.size ? true : undefined}
                aria-describedby={i === 0 && errors.size ? "size-error" : undefined}
                onChange={() => setValue("size", option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.size && (
          <p id="size-error" className="mt-1.5 text-xs text-signal-deep">
            {errors.size}
          </p>
        )}
      </fieldset>

      {computedPrice != null && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
          <span className="text-sm text-ink-soft">Order total</span>
          <span className="font-display text-lg font-semibold text-ink">
            ${computedPrice.toFixed(2)}
          </span>
        </div>
      )}

      <div className="mt-8">
        <label htmlFor="sticker-design-file" className={labelBase}>
          Design Upload <span className="font-normal text-ash">(optional)</span>
        </label>
        <input
          id="sticker-design-file"
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs text-ash file:mr-3 file:rounded-full file:border file:border-line-strong file:bg-transparent file:px-4 file:py-2 file:text-xs file:font-medium file:text-ink file:transition-colors hover:file:border-ink"
        />
      </div>

      <div className="mt-8">
        <Field
          label="Tell us about your design"
          name="description"
          error={errors.description}
        >
          {(props) => (
            <textarea
              {...props}
              placeholder="Colors, artwork details, intended use…"
              className={`${inputBase} min-h-32 resize-y`}
              value={values.description}
              onChange={(e) => setValue("description", e.target.value)}
              onBlur={() => validateField("description")}
            />
          )}
        </Field>
      </div>

      <div className="mt-8">
        <label className="flex items-start gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]"
            checked={values.consent}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            onChange={(e) => setValue("consent", e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 transition-colors hover:text-signal"
            >
              Terms &amp; Conditions
            </Link>{" "}
            for custom orders.
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="mt-1.5 text-xs text-signal-deep">
            {errors.consent}
          </p>
        )}
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="mt-8 rounded-md border border-signal/40 bg-signal/5 px-4 py-3.5 text-sm text-ink"
        >
          <p className="font-medium">We couldn&apos;t send your request.</p>
          <p className="mt-1 text-ink-soft">
            Nothing was submitted — your answers are still here, so you can try
            again. If it keeps failing, email us at{" "}
            <a 
              href="mailto:Info@bayareafirestore.com"
              className="underline underline-offset-2 transition-colors hover:text-signal"
            >
              Info@bayareafirestore.com
            </a>
            .
          </p>
        </div>
      )}

      <div className="mt-10">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status === "submitting"}
        >
          {status === "submitting"
            ? "Sending…"
            : status === "error"
            ? "Try again"
            : isStandardSize && computedPrice != null
            ? `Submit order — $${computedPrice.toFixed(2)}`
            : "Add to cart"}
        </Button>
      </div>
    </form>
  );
}
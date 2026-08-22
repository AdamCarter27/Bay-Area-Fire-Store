"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import {
  OTHER_VALUE,
  SERVICE_OPTIONS,
  submitCustomOrder,
  type CustomOrderPayload,
} from "@/lib/submit-custom-order";

const inputBase =
  "w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ash transition-colors hover:border-ash aria-invalid:border-signal";

const labelBase = "mb-1.5 block text-xs font-medium tracking-[0.05em] text-ink";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  organization: string;
  completionDate: string;
  services: string[];
  otherService: string;
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
  completionDate: "",
  services: [],
  otherService: "",
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
  // Wix validates this as a real dialable number, so catch an obviously wrong
  // one here rather than letting the submission fail after they hit send.
  else if (values.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Enter a full phone number, including area code.";
  if (!values.completionDate || values.completionDate < todayISO())
    errors.completionDate = "Choose a completion date — today or later.";
  if (values.services.includes(OTHER_VALUE) && !values.otherService.trim())
    errors.otherService = "Tell us what you have in mind.";
  if (values.services.length === 0)
    errors.services = "Select at least one service.";
  const qty = Number(values.quantity);
  if (!values.quantity.trim() || !Number.isInteger(qty) || qty < 1)
    errors.quantity = "Enter a quantity of at least 1.";
  if (!values.description.trim())
    errors.description = "Tell us about your project.";
  if (!values.consent)
    errors.consent = "Please agree to the terms before submitting.";

  return errors;
}

export function CustomOrderForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >(
    "idle"
  );

  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "success") successHeadingRef.current?.focus();
  }, [status]);

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
      const payload: CustomOrderPayload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        organization: values.organization.trim() || undefined,
        completionDate: values.completionDate,
        services: values.services,
        otherService: values.services.includes(OTHER_VALUE)
          ? values.otherService.trim()
          : undefined,
        quantity: Number(values.quantity),
        description: values.description.trim(),
        file: file ?? undefined,
        consent: true,
      };
      await submitCustomOrder(payload);
      setStatus("success");
    } catch (error) {
      // Never fall back to "idle" here: an idle form after a failed submit is
      // indistinguishable from one the visitor never sent, and they'd have no
      // idea their request vanished. Show it, keep their answers, and give
      // them a way to reach the shop that doesn't depend on this form.
      console.error("[custom-order] submission failed", error);
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
          We&apos;ll review your project and get back to you at{" "}
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

        <Field
          label="Project completion"
          name="completionDate"
          error={errors.completionDate}
        >
          {(props) => (
            <input
              {...props}
              type="date"
              min={todayISO()}
              className={inputBase}
              value={values.completionDate}
              onChange={(e) => setValue("completionDate", e.target.value)}
              onBlur={() => validateField("completionDate")}
            />
          )}
        </Field>

        <Field label="Quantity" name="quantity" error={errors.quantity}>
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
      </div>

      <fieldset className="mt-8">
        <legend className={labelBase}>What are you looking to do?</legend>
        <div className="mt-1 grid gap-0.5 sm:grid-cols-2">
          {SERVICE_OPTIONS.map((service, i) => (
            <label
              key={service.value}
              className="flex items-center gap-2.5 py-1 text-sm text-ink"
            >
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-[var(--ink)]"
                checked={values.services.includes(service.value)}
                aria-invalid={i === 0 && errors.services ? true : undefined}
                aria-describedby={
                  i === 0 && errors.services ? "services-error" : undefined
                }
                onChange={(e) =>
                  setValue(
                    "services",
                    e.target.checked
                      ? [...values.services, service.value]
                      : values.services.filter((s) => s !== service.value)
                  )
                }
              />
              {service.label}
            </label>
          ))}
        </div>
        {errors.services && (
          <p id="services-error" className="mt-1.5 text-xs text-signal-deep">
            {errors.services}
          </p>
        )}

        {/* His form's "Other" opens a free-text box; what gets typed here is
            submitted in place of "Other" itself. */}
        {values.services.includes(OTHER_VALUE) && (
          <div className="mt-3 max-w-sm">
            <Field
              label="What else can we make for you?"
              name="otherService"
              error={errors.otherService}
            >
              {(props) => (
                <input
                  {...props}
                  type="text"
                  autoFocus
                  placeholder="Banners, blankets, patches…"
                  className={inputBase}
                  value={values.otherService}
                  onChange={(e) => setValue("otherService", e.target.value)}
                  onBlur={() => validateField("otherService")}
                />
              )}
            </Field>
          </div>
        )}
      </fieldset>

      <div className="mt-8">
        <label htmlFor="design-file" className={labelBase}>
          File Upload <span className="font-normal text-ash">(optional)</span>
        </label>
        <input
          id="design-file"
          type="file"
          // Mirrors the file types his Wix form's field accepts: Video, Image,
          // and Document. Offering a type he hasn't enabled means the file
          // uploads and the submission then fails validation.
          accept="image/*,video/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs text-ash file:mr-3 file:rounded-full file:border file:border-line-strong file:bg-transparent file:px-4 file:py-2 file:text-xs file:font-medium file:text-ink file:transition-colors hover:file:border-ink"
        />
      </div>

      <div className="mt-8">
        <Field
          label="Custom order description"
          name="description"
          error={errors.description}
        >
          {(props) => (
            <textarea
              {...props}
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
            I hereby give my consent to use my photographs according to the{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 transition-colors hover:text-signal"
            >
              Terms &amp; Conditions
            </Link>
            .
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
            : "Submit request"}
        </Button>
      </div>
    </form>
  );
}

/*
 * Wires label/control/error together: ids, htmlFor, aria-invalid, and
 * aria-describedby stay consistent so the markup can't lie to a screen
 * reader. Render-prop keeps the actual control fully in the caller's hands.
 */
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

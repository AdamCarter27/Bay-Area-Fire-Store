"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Field, inputBase, labelBase } from "@/components/ui/Field";
import {
  TOPIC_OPTIONS,
  submitContact,
  type ContactPayload,
} from "@/lib/submit-contact";

type FormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  email: string;
  topic: string;
  message: string;
};

type FieldName = keyof FormValues;

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  company: "",
  email: "",
  topic: "",
  message: "",
};

function validate(values: FormValues): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  if (!values.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (!values.phone.trim()) errors.phone = "Enter a phone number.";
  // Wix validates this as a real dialable number, so catch an obviously wrong
  // one here rather than letting the submission fail after they hit send.
  else if (values.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Enter a full phone number, including area code.";
  if (!values.company.trim())
    errors.company = "Enter your company, department, or station.";
  if (!values.topic) errors.topic = "Choose a topic.";
  if (!values.message.trim()) errors.message = "Write us a message.";

  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

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
      const payload: ContactPayload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim() || undefined,
        phone: values.phone.trim(),
        company: values.company.trim(),
        email: values.email.trim(),
        topic: values.topic,
        message: values.message.trim(),
        file: file ?? undefined,
      };
      await submitContact(payload);
      setStatus("success");
    } catch (error) {
      // Never fall back to "idle" here: an idle form after a failed submit is
      // indistinguishable from one the visitor never sent, and they'd have no
      // idea their message vanished.
      console.error("[contact] submission failed", error);
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
          Message sent
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ash">
          Thanks for reaching out — we&apos;ll get back to you at{" "}
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
        <Field label="First name" name="firstName" error={errors.firstName}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="given-name"
              className={inputBase}
              value={values.firstName}
              onChange={(e) => setValue("firstName", e.target.value)}
              onBlur={() => validateField("firstName")}
            />
          )}
        </Field>

        <Field label="Last name" name="lastName" optional error={errors.lastName}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="family-name"
              className={inputBase}
              value={values.lastName}
              onChange={(e) => setValue("lastName", e.target.value)}
            />
          )}
        </Field>

        <Field label="Phone" name="phone" error={errors.phone}>
          {(props) => (
            <input
              {...props}
              type="tel"
              autoComplete="tel"
              placeholder="(415) 555-0100"
              className={inputBase}
              value={values.phone}
              onChange={(e) => setValue("phone", e.target.value)}
              onBlur={() => validateField("phone")}
            />
          )}
        </Field>

        {/* Required on his form, so it's required here — labelled for the
            audience, most of whom belong to a department or station rather
            than a company. */}
        <Field
          label="Company, department, or station"
          name="company"
          error={errors.company}
        >
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="organization"
              className={inputBase}
              value={values.company}
              onChange={(e) => setValue("company", e.target.value)}
              onBlur={() => validateField("company")}
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

        {/* His field's key is misspelled (topic_of_disccusion) but the label a
            visitor reads shouldn't be. */}
        <Field label="Topic of discussion" name="topic" error={errors.topic}>
          {(props) => (
            <select
              {...props}
              className={inputBase}
              value={values.topic}
              onChange={(e) => setValue("topic", e.target.value)}
              onBlur={() => validateField("topic")}
            >
              <option value="">Choose a topic…</option>
              {TOPIC_OPTIONS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="mt-8">
        <Field label="Write a message" name="message" error={errors.message}>
          {(props) => (
            <textarea
              {...props}
              className={`${inputBase} min-h-32 resize-y`}
              value={values.message}
              onChange={(e) => setValue("message", e.target.value)}
              onBlur={() => validateField("message")}
            />
          )}
        </Field>
      </div>

      <div className="mt-8">
        <label htmlFor="contact-file" className={labelBase}>
          File Upload <span className="font-normal text-ash">(optional)</span>
        </label>
        {/* Mirrors the file types his form's field accepts: Video, Image, and
            Document. Offering a type he hasn't enabled means the file uploads
            and the submission then fails validation. */}
        <input
          id="contact-file"
          type="file"
          accept="image/*,video/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs text-ash file:mr-3 file:rounded-full file:border file:border-line-strong file:bg-transparent file:px-4 file:py-2 file:text-xs file:font-medium file:text-ink file:transition-colors hover:file:border-ink"
        />
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="mt-8 rounded-md border border-signal/40 bg-signal/5 px-4 py-3.5 text-sm text-ink"
        >
          <p className="font-medium">We couldn&apos;t send your message.</p>
          <p className="mt-1 text-ink-soft">
            Nothing was sent — your answers are still here, so you can try
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
            : "Send message"}
        </Button>
      </div>
    </form>
  );
}

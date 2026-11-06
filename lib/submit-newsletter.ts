// Newsletter signups go to the active standalone Wix form so new subscribers
// are added to the same Wix email audience the owner already manages.
import { submitWixForm } from "@/lib/wix/forms";

export const NEWSLETTER_FORM_ID = "d42ead90-d124-488f-8f9e-faaeb5dc480e";

const TARGET = {
  email: "email_842a",
  subscribe: "form_field_a593",
} as const;

export async function submitNewsletterSignup(email: string): Promise<void> {
  await submitWixForm(NEWSLETTER_FORM_ID, {
    [TARGET.email]: email.trim(),
    [TARGET.subscribe]: true,
  });
}

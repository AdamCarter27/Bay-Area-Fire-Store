// Custom order submission.
//
// Posts to the owner's EXISTING custom-order form (the one behind
// bayareafirestore.com/about-4), so requests land in the dashboard inbox he
// already checks. The Wix plumbing — auth, file upload, error parsing, phone
// normalization — lives in lib/wix/forms.ts and is shared with the contact form.

import { submitWixForm, toE164, uploadFormFile } from "@/lib/wix/forms";

/*
 * His live form. If he ever rebuilds it in the Wix editor this ID changes and
 * every submission starts 404-ing — recover the new one from the form's page
 * source, or from Get Form with an admin key.
 */
export const FORM_ID = "9118588c-3abb-4584-b660-03fea56d66d1";

/*
 * The keys of his form's `submissions` map. These are field *targets*, not
 * labels — they don't change when he relabels a field, and sending a key that
 * isn't one of them fails the entire submission rather than just that value.
 */
const TARGET = {
  name: "first_name",
  email: "email",
  phone: "phone_65ae",
  organization: "organization",
  completionDate: "project_completion",
  services: "what_are_you_looking_to_do",
  quantity: "quantity",
  description: "custom_order_request",
  consent: "form_field",
  file: "file_upload_f9d8",
} as const;

/*
 * The services his form offers. `value` matches his option strings verbatim —
 * the cramped spacing is his — while `label` is what we render.
 *
 * The field itself validates as an array of plain strings with no enum, so it
 * would accept anything; these mirror his checkboxes so a submission lines up
 * with a real option in his dashboard rather than arriving as a loose value.
 * "Other" is his too (Wix renders it from the field's `addOtherLabel`), and it
 * carries whatever the visitor types — see OTHER_VALUE below.
 */
export const SERVICE_OPTIONS = [
  { label: "Embroidery", value: "Embroidery" },
  { label: "DTF Heat Press — Shirts", value: "DTF Heat Press- Shirts" },
  { label: "Custom Coffee Mugs & Tumblers", value: "Custom Coffee Mugs/ Tumblers" },
  { label: "Other", value: "Other" },
] as const;

// The option that opens a free-text box instead of standing on its own.
export const OTHER_VALUE = "Other";

export type ServiceValue = (typeof SERVICE_OPTIONS)[number]["value"];

export type CustomOrderPayload = {
  name: string;
  email: string;
  phone: string;
  organization?: string;
  completionDate: string; // ISO yyyy-mm-dd from <input type="date">
  services: string[]; // `value` entries from SERVICE_OPTIONS
  otherService?: string; // what "Other" means, present when services includes it
  quantity: number;
  description: string;
  file?: File;
  consent: true; // literal true — the form is unsubmittable without it
};

export async function submitCustomOrder(
  payload: CustomOrderPayload
): Promise<void> {
  const uploaded = payload.file
    ? await uploadFormFile(FORM_ID, payload.file)
    : undefined;

  /*
   * "Other" is replaced by what the visitor typed rather than sent alongside
   * it, which is how his own form behaves: the dashboard then reads "Banners"
   * under "What are you looking to do?" instead of a bare "Other" he has to
   * decode from the description. Safe because the field has no enum.
   */
  const services = payload.services.map((service) =>
    service === OTHER_VALUE && payload.otherService?.trim()
      ? payload.otherService.trim()
      : service
  );

  const submissions: Record<string, unknown> = {
    [TARGET.name]: payload.name,
    [TARGET.email]: payload.email,
    [TARGET.phone]: toE164(payload.phone),
    [TARGET.completionDate]: payload.completionDate,
    [TARGET.services]: services,
    [TARGET.quantity]: payload.quantity,
    [TARGET.description]: payload.description,
    [TARGET.consent]: payload.consent,
  };

  // Optional fields are omitted rather than sent empty — an empty string can
  // trip validation on a field his form treats as unset.
  if (payload.organization) {
    submissions[TARGET.organization] = payload.organization;
  }
  if (uploaded) {
    // Always an array — his field is single-file, but the value shape is a
    // list regardless.
    submissions[TARGET.file] = [uploaded];
  }

  await submitWixForm(FORM_ID, submissions);
}

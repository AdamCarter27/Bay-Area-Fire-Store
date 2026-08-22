// Contact form submission.
//
// Posts to the owner's EXISTING "Contact Form" (the one behind
// bayareafirestore.com/contact-8), so messages land in the dashboard inbox he
// already checks. Shares its Wix plumbing with lib/submit-custom-order.ts via
// lib/wix/forms.ts.

import { submitWixForm, toE164, uploadFormFile } from "@/lib/wix/forms";

/*
 * His live contact form. Rebuilding it in the Wix editor changes this ID and
 * every submission starts 404-ing — recover the new one from the form's page
 * source, or from Get Form with an admin key.
 */
export const CONTACT_FORM_ID = "732d1574-4840-4eb5-a3bb-43cd977a511c";

/*
 * Field targets on his form. Note `topic_of_disccusion`: the misspelling is
 * his and the key must match it exactly, so don't "fix" it — only the label we
 * render is spelled correctly.
 */
const TARGET = {
  firstName: "first_name",
  lastName: "last_name",
  phone: "phone_1674",
  company: "company_name_b693",
  email: "email_d952",
  topic: "topic_of_disccusion",
  message: "write_a_message",
  file: "file_upload_cd14",
} as const;

/*
 * Unlike the custom-order services field, this dropdown carries a real enum:
 * his form accepts these four values and rejects anything else, failing the
 * whole submission. Adding an option here means adding it to his Wix form
 * first.
 */
export const TOPIC_OPTIONS = [
  "Partnership",
  "Product Request",
  "Bulk Order Request",
  "Other",
] as const;

export type Topic = (typeof TOPIC_OPTIONS)[number];

export type ContactPayload = {
  firstName: string;
  lastName?: string;
  phone: string;
  company: string; // required on his form, even for a private buyer
  email: string;
  topic: string; // one of TOPIC_OPTIONS
  message: string;
  file?: File;
};

export async function submitContact(payload: ContactPayload): Promise<void> {
  const uploaded = payload.file
    ? await uploadFormFile(CONTACT_FORM_ID, payload.file)
    : undefined;

  const submissions: Record<string, unknown> = {
    [TARGET.firstName]: payload.firstName,
    [TARGET.phone]: toE164(payload.phone),
    [TARGET.company]: payload.company,
    [TARGET.email]: payload.email,
    [TARGET.topic]: payload.topic,
    [TARGET.message]: payload.message,
  };

  // Optional fields are omitted rather than sent empty — an empty string can
  // trip validation on a field his form treats as unset.
  if (payload.lastName?.trim()) {
    submissions[TARGET.lastName] = payload.lastName.trim();
  }
  if (uploaded) {
    // Always an array — his field is single-file, but the value shape is a
    // list regardless.
    submissions[TARGET.file] = [uploaded];
  }

  await submitWixForm(CONTACT_FORM_ID, submissions);
}

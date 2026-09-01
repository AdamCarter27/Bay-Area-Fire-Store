// Sticker order submission.
//
// There's no separate sticker form in Wix — this reuses the owner's existing
// custom-order form (same FORM_ID, same dashboard inbox) since the `services`
// field has no fixed enum and safely accepts a freeform value. Sticker-specific
// details (type, size, computed price) get folded into the description so
// they show up readably in the dashboard alongside everything else.
//
// Payment happens through the cart: the form adds a custom line item via
// CartContext.addCustomItem and the customer checks out from /cart, same as
// any other item — see StickerOrderForm.tsx.

import { submitWixForm, toE164, uploadFormFile } from "@/lib/wix/forms";
import { FORM_ID } from "@/lib/submit-custom-order";

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

const STICKER_SERVICE_VALUE = "Custom Stickers";

export const STICKER_TYPE_OPTIONS = [
  { value: "Die-cut", label: "Die-cut" },
  { value: "Kiss-cut", label: "Kiss-cut" },
  { value: "Holographic", label: "Holographic" },
  { value: "Clear/Transparent", label: "Clear / Transparent" },
  { value: "Not sure", label: "Not sure" },
] as const;

export type StickerOrderPayload = {
  name: string;
  email: string;
  phone: string;
  organization?: string;
  neededByDate: string;
  stickerType: string;
  size: string;
  quantity: number;
  description: string;
  file?: File;
  consent: true;
};

export async function submitStickerOrder(
  payload: StickerOrderPayload,
  computedPrice?: number
): Promise<void> {
  const uploaded = payload.file
    ? await uploadFormFile(FORM_ID, payload.file)
    : undefined;

  const fullDescription = [
    `Sticker type: ${payload.stickerType}`,
    `Size: ${payload.size}`,
    computedPrice != null ? `Calculated price: $${computedPrice.toFixed(2)}` : null,
    "",
    payload.description,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const submissions: Record<string, unknown> = {
    [TARGET.name]: payload.name,
    [TARGET.email]: payload.email,
    [TARGET.phone]: toE164(payload.phone),
    [TARGET.completionDate]: payload.neededByDate,
    [TARGET.services]: [STICKER_SERVICE_VALUE],
    [TARGET.quantity]: payload.quantity,
    [TARGET.description]: fullDescription,
    [TARGET.consent]: payload.consent,
  };

  if (payload.organization) {
    submissions[TARGET.organization] = payload.organization;
  }
  if (uploaded) {
    submissions[TARGET.file] = [uploaded];
  }

  await submitWixForm(FORM_ID, submissions);
}
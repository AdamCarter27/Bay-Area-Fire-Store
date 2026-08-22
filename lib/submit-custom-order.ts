// Custom order submission — the Wix Forms swap-in point, now live.
//
// Submissions go to the owner's EXISTING custom-order form (the one on
// bayareafirestore.com/about-4), not to a new form of ours, so requests land in
// the dashboard inbox he already checks. Nothing here needs a server route: the
// Wix visitor token is minted from the public client ID and already carries
// WIX_FORMS.SUBMISSION_CREATE, which covers both the submission and the file
// upload. Submission *reads* are correctly forbidden to visitors.

import { wixClient } from "@/lib/wix/client";

/*
 * His live form. If he ever rebuilds it in the Wix editor this ID changes and
 * every submission starts 404-ing — recover the new one from the form's page
 * source, or from Get Form with an admin key.
 */
export const FORM_ID = "9118588c-3abb-4584-b660-03fea56d66d1";

const SUBMISSIONS_URL =
  "https://www.wixapis.com/form-submission-service/v4/submissions";
const MEDIA_UPLOAD_URL_ENDPOINT = `${SUBMISSIONS_URL}/media-upload-url`;

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

/*
 * His form validates the phone field as a real, dialable number: it wants
 * E.164 ("+14155550100") and rejects both a bare "4155550100" and a formatted
 * "(415) 555-0100". People type the formatted version, so normalize rather
 * than making them get it right.
 *
 * Anything already carrying a "+" is passed through untouched — that's an
 * international number the visitor typed deliberately, and guessing at it
 * would do more harm than leaving it alone.
 */
export function toE164(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("+")) return "+" + trimmed.slice(1).replace(/\D/g, "");

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  // Not a shape we recognize — send the digits with a US prefix and let Wix's
  // validation reject it, which surfaces as the form's error state.
  return `+${digits}`;
}

async function authHeader(): Promise<string> {
  const tokens = await wixClient.auth.generateVisitorTokens();
  return tokens.accessToken.value;
}

/*
 * Wix returns its failure detail in a JSON envelope; surface the useful part so
 * a validation failure says which field it hated instead of "500".
 */
async function readError(response: Response): Promise<string> {
  const body = await response.text();
  try {
    const parsed = JSON.parse(body);
    return (
      parsed.message ||
      parsed.details?.applicationError?.description ||
      parsed.details?.validationError?.fieldViolations?.[0]?.description ||
      body.slice(0, 200)
    );
  } catch {
    return body.slice(0, 200);
  }
}

/*
 * The shape his form's file field expects. `fileType` is the file's MIME type
 * ("image/jpeg") — NOT one of the UploadFileFormat enum values (IMAGE/VIDEO/
 * DOCUMENT), which the field rejects with "The declared file type does not
 * match this field".
 */
type UploadedFile = {
  fileId: string;
  displayName: string;
  url: string;
  fileType: string;
};

/*
 * Two-step upload: ask the forms service for a signed URL, then send the bytes
 * to it. This is the forms-scoped endpoint on purpose — the general Media
 * Manager upload API rejects a visitor token outright.
 */
async function uploadFile(file: File, token: string): Promise<UploadedFile> {
  const urlResponse = await fetch(MEDIA_UPLOAD_URL_ENDPOINT, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({
      formId: FORM_ID,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
    }),
  });

  if (!urlResponse.ok) {
    throw new Error(`Could not prepare the file upload: ${await readError(urlResponse)}`);
  }

  const { uploadUrl } = (await urlResponse.json()) as { uploadUrl: string };

  // The signed URL carries its own auth, so this request must NOT include the
  // visitor token. The filename rides as a query param per the Upload API.
  const putResponse = await fetch(
    `${uploadUrl}?filename=${encodeURIComponent(file.name)}`,
    {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    }
  );

  if (!putResponse.ok) {
    throw new Error(`File upload failed: ${await readError(putResponse)}`);
  }

  const uploaded = await putResponse.json();
  // Wix has returned this under a couple of shapes over time; take whichever
  // is present rather than assuming, and fail loudly if neither is.
  const fileId: string | undefined =
    uploaded?.file?.id ?? uploaded?.fileId ?? uploaded?.file?.fileId;

  if (!fileId) {
    throw new Error("File uploaded but Wix returned no file id");
  }

  return {
    fileId,
    displayName: file.name,
    url: uploaded?.file?.url ?? "",
    fileType: file.type || "application/octet-stream",
  };
}

export async function submitCustomOrder(
  payload: CustomOrderPayload
): Promise<void> {
  const token = await authHeader();

  const uploaded = payload.file
    ? await uploadFile(payload.file, token)
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
    // Always an array — his field is single-file (fileLimit 1), but the value
    // shape is a list regardless.
    submissions[TARGET.file] = [uploaded];
  }

  const response = await fetch(SUBMISSIONS_URL, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ submission: { formId: FORM_ID, submissions } }),
  });

  if (!response.ok) {
    // Must throw: the form shows its success screen on resolve, so swallowing
    // this would tell the customer their request went through when it didn't.
    throw new Error(`Submission failed: ${await readError(response)}`);
  }
}

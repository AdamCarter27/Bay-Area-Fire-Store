// Custom order submission — THE Wix Headless swap-in point.
//
// Today this is a stub so the demo form works end-to-end with no backend.
// When the site goes live on Wix Headless, only this file changes:
//
//   1. Create a client: createClient({ modules: { submissions }, auth:
//      OAuthStrategy({ clientId }) }) from @wix/sdk + @wix/forms.
//   2. If `payload.file` exists, upload it via the Wix Media API first
//      (generate upload URL → PUT the file → keep the returned media ID).
//   3. Call submissions.createSubmission with the dashboard form's field
//      mappings, attaching the media ID from step 2.
//
// The form component, validation, and success UI never need to change.

export const SERVICE_OPTIONS = [
  "Embroidery",
  "DTF Heat Press – Shirts",
  "Custom Coffee Mugs / Tumblers",
  "Other",
] as const;

export type CustomOrderPayload = {
  name: string;
  email: string;
  phone: string;
  organization?: string;
  completionDate: string; // ISO yyyy-mm-dd from <input type="date">
  services: string[]; // entries from SERVICE_OPTIONS
  otherService?: string; // what "Other" means, present when services includes it
  quantity: number;
  description: string;
  file?: File; // uploaded via Wix Media at go-live, see header comment
  consent: true; // literal true — the form is unsubmittable without it
};

export async function submitCustomOrder(
  _payload: CustomOrderPayload
): Promise<void> {
  // Fake latency so the "Sending…" state is visible in the demo.
  await new Promise((resolve) => setTimeout(resolve, 900));
}

/*
 * Shared plumbing for posting to the owner's Wix Forms.
 *
 * Both public forms on this site — the custom order request and the contact
 * form — submit to forms that already exist on bayareafirestore.com, so their
 * entries land in the dashboard inbox he already checks rather than in some
 * second place he'd have to remember.
 *
 * None of this needs a server route. The Wix visitor token is minted from the
 * public client ID and already carries WIX_FORMS.SUBMISSION_CREATE, which
 * covers both creating a submission and uploading a file to one. Submission
 * *reads* are correctly forbidden to visitors.
 */

import { wixClient } from "@/lib/wix/client";

const SUBMISSIONS_URL =
  "https://www.wixapis.com/form-submission-service/v4/submissions";
const MEDIA_UPLOAD_URL_ENDPOINT = `${SUBMISSIONS_URL}/media-upload-url`;

async function visitorToken(): Promise<string> {
  const tokens = await wixClient.auth.generateVisitorTokens();
  return tokens.accessToken.value;
}

/*
 * Wix returns its failure detail in a nested envelope; surface the useful part
 * so a validation failure says which field it hated instead of "400".
 */
export async function readError(response: Response): Promise<string> {
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
 * His phone fields validate as real, dialable numbers: they want E.164
 * ("+14155550100") and reject both a bare "4155550100" and a formatted
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

/*
 * The shape a Wix form's file field expects. `fileType` is the file's MIME
 * type ("image/jpeg") — NOT one of the UploadFileFormat enum values
 * (IMAGE/VIDEO/DOCUMENT), which the field rejects with "The declared file type
 * does not match this field".
 */
export type UploadedFile = {
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
export async function uploadFormFile(
  formId: string,
  file: File
): Promise<UploadedFile> {
  const token = await visitorToken();
  const mimeType = file.type || "application/octet-stream";

  const urlResponse = await fetch(MEDIA_UPLOAD_URL_ENDPOINT, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ formId, filename: file.name, mimeType }),
  });

  if (!urlResponse.ok) {
    throw new Error(
      `Could not prepare the file upload: ${await readError(urlResponse)}`
    );
  }

  const { uploadUrl } = (await urlResponse.json()) as { uploadUrl: string };

  // The signed URL carries its own auth, so this request must NOT include the
  // visitor token. The filename rides as a query param per the Upload API.
  const putResponse = await fetch(
    `${uploadUrl}?filename=${encodeURIComponent(file.name)}`,
    { method: "PUT", headers: { "Content-Type": mimeType }, body: file }
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
    fileType: mimeType,
  };
}

/**
 * Creates a submission on one of his forms. Keys of `submissions` must be that
 * form's field *targets* — sending a key that isn't one fails the entire
 * submission rather than just that value.
 *
 * Throws on failure, deliberately: every caller shows a success screen when
 * this resolves, so swallowing an error would tell someone their message went
 * through when it didn't.
 */
export async function submitWixForm(
  formId: string,
  submissions: Record<string, unknown>
): Promise<void> {
  const token = await visitorToken();

  const response = await fetch(SUBMISSIONS_URL, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ submission: { formId, submissions } }),
  });

  if (!response.ok) {
    throw new Error(`Submission failed: ${await readError(response)}`);
  }
}

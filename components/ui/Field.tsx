import type { ReactNode } from "react";

// Shared control styling, so every form on the site reads as one system.
export const inputBase =
  "w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ash transition-colors hover:border-ash aria-invalid:border-signal";

export const labelBase =
  "mb-1.5 block text-xs font-medium tracking-[0.05em] text-ink";

/*
 * Wires label/control/error together: ids, htmlFor, aria-invalid, and
 * aria-describedby stay consistent so the markup can't lie to a screen
 * reader. Render-prop keeps the actual control fully in the caller's hands.
 */
export function Field({
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

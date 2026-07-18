import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  // The one red. Primary CTA only — see The Single Spark Rule.
  primary: "bg-signal text-on-signal hover:bg-signal-deep",
  secondary: "border border-line-strong text-ink hover:border-ink",
  ghost: "text-ink hover:text-signal",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">;

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, "className"> & {
    href?: undefined;
  };

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "md", className = "", children } = props;
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } =
      props;
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } =
    props;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

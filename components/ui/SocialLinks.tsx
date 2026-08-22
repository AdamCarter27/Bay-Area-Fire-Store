import { FiFacebook, FiInstagram } from "react-icons/fi";
import { socialLinks, type SocialLink } from "@/lib/data/social";

// Feather icons, matching the set already in use across the site (FiSearch in
// the shop, FiShoppingBag in the header) rather than importing a second icon
// family for two marks.
const ICONS: Record<SocialLink["id"], typeof FiFacebook> = {
  facebook: FiFacebook,
  instagram: FiInstagram,
};

/*
 * Circular hairline icon buttons — the same shape and hover as the carousel's
 * arrow controls, so they read as part of one system. The accessible name
 * lives on the link, since the icon itself is decorative.
 */
export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {socialLinks.map((social) => {
        const Icon = ICONS[social.id];
        return (
          <li key={social.id}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.label} (opens in a new tab)`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <Icon aria-hidden className="h-[1.15rem] w-[1.15rem]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

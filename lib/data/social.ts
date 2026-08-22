// The shop's social accounts. Single source of truth — the footer and the
// contact page both read from here, so a changed handle is a one-line edit
// rather than a hunt through the codebase.

export type SocialLink = {
  id: "facebook" | "instagram";
  label: string;
  href: string;
};

export const socialLinks: SocialLink[] = [
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61568764863734",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/bayareafirestore/",
  },
];

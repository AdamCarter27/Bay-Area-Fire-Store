export type Collab = {
  slug: string;
  name: string;
  description: string;
  href: string;
  image: string; // path in /media once you have real photos
};

export const collabs: Collab[] = [
  {
    slug: "fire-nuggets",
    name: "Fire Nuggets",
    description: "A firefighter-led nonprofit and nationwide fire-service training resource that provides access to high-quality education, training courses, instructors, and fire-service resources.",
    href: "https://www.firenuggets.com/",
    image: "/media/collabs1.jpg",
  },
  {
    slug: "st-michaels-hero-bookings",
    name: "St. Michael's Hero Bookings",
    description: "A Bay Area training provider offering hands-on certifications and courses for first responders and healthcare providers, including BLS, ACLS, PALS, AMLS, PHTLS, and Stop the Bleed.",
    href: "https://stmichaels-hero-bookings.lovable.app/#courses",
    image: "/media/collabs2.jpeg",
  },
];
export type Brand = {
  slug: string;
  label: string;
  logo?: string;
};

export const brands: Brand[] = [
  { slug: "asian-firefighters-association", label: "Asian Firefighters Association", logo: "/media/AsianFire.webp" },
  { slug: "colma-fire", label: "Colma Fire District", logo:"/media/Colma-Fire.JPG"},
  { slug: "fight-fire-get-dirty", label: "Fight Fire, Get Dirty", logo: "/media/FightFireGetDirty.webp" },
  { slug: "fire-nuggets", label: "Fire Nuggets", logo: "/media/FireNuggets.webp" },
  { slug: "front-seat-academy", label: "Front Seat Academy", logo: "/media/FrontSeatAcademy.webp" },
  { slug: "hmb-volunteer-fire", label: "HMB Volunteer Fire Dept.", logo: "/media/HMB-Volunteer.webp" },
  { slug: "bay-area-fire-store", label: "Bay Area Fire Store Apparel", logo: "/media/BayAreaFireStoreBrand.webp" },
  { slug: "palo-alto-fire", label: "Palo Alto Fire Dept.", logo: "/media/Palo-Alto.JPG" },
  { slug: "richmond-fire", label: "Richmond Fire Dept." },
  { slug: "richmond-youth-academy", label: "Richmond Youth Academy", logo: "/media/RichmondYouthAcademy.webp"},
  { slug: "sffd", label: "San Francisco Fire Department", logo: "/media/SFFD.webp"},
  { slug: "sfpd", label: "San Francisco Police Department", logo: "/media/SFPD.JPEG"},
  { slug: "sf-behavioral-health", label: "SF Behavioral Health Foundation", logo: "/media/Behave.JPG"},
  { slug: "sf-fire-ner-tamid", label: "SF Fire Ner Tamid Society", logo:"/media/Ner-Tamid.webp" },
  { slug: "sffd-golf-club", label: "SFFD Golf Club", logo: "/media/SFFDGolfClub.webp"},
  { slug: "sffd-k9", label: "SFFD K9", logo: "/media/SFK9.webp"},
  { slug: "sffd-los-bomberos", label: "SFFD Los Bomberos", logo: "/media/SanFranBomberos.webp"},
  { slug: "sffd-station-apparel", label: "SFFD Station Apparel", logo: "/media/SFFD-Logo.webp"},
  { slug: "ufsw", label: "United Fire Service Women Apparel", logo : "/media/UnitedFireServiceWomen.webp"},
  { slug: "vallejo-leatherheads", label: "Vallejo Leatherheads", logo: "/media/VallejoLeather.jpeg"},
];

export type BrandGroup = {
  slug: string;
  label: string;
  brands: string[];
};

export const brandGroups: BrandGroup[] = [
  {
    slug: "fire-departments",
    label: "Fire Departments",
    brands: [
      "sffd", "richmond-fire", "colma-fire", "palo-alto-fire",
      "hmb-volunteer-fire", "vallejo-leatherheads",
    ],
  },
  { slug: "police-departments", label: "Police Departments", brands: ["sfpd"] },
  {
    slug: "sffd-clubs-teams",
    label: "SFFD Clubs & Teams",
    brands: [
      "sffd-cross-axe", "sffd-golf-club", "sffd-hockey", "sffd-k9",
      "sffd-los-bomberos", "sffd-station-apparel", "sffcpf", "sf-fire-ner-tamid",
    ],
  },
  { slug: "academies", label: "Academies", brands: ["front-seat-academy", "richmond-youth-academy"] },
  {
    slug: "community-causes",
    label: "Community & Causes",
    brands: ["sf-behavioral-health", "street-crisis", "ufsw", "asian-firefighters-association"],
  },
  {
    slug: "special-collections",
    label: "Special Collections",
    brands: [
      "2-eleven-shields", "bay-area-fire-store", "bay-area-fire-conference",
      "fight-fire-get-dirty", "keep-fire-in-your-life", "fire-nuggets",
    ],
  },
];
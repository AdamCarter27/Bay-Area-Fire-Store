// Service manifest for the custom-order page — machine/process photos are
// owner-supplied. Drop files under /public/media/services (e.g.
// /media/services/embroidery.jpg) and reference them in `image` below.
// "" renders the branded placeholder frame with the service name.

export type Service = {
  name: string; // keep consistent with VerticalTextCarousel / CustomOrderCallout
  image: string; //image path
  items: string[]; // what the service covers
};

export const services: Service[] = [
  {
    name: "Embroidery",
    image: "/media/BayAreaFireStoreEmbroidery.avif",
    items: ["Hats", "Polos", "Shirts", "Sweatshirts", "Patches"],
  },
  {
    name: "Heat Press",
    image: "/media/BayAreaFireStoreHeatPress.avif",
    items: [
      "Shirts",
      "Hats",
      "Sweatshirts",
      "Coffee Mugs & Tumblers",
      "Personalized Sport Bags",
    ],
  },
  {
    name: "Screen Print",
    image: "/media/BayAreaFireStoreScreenPrint.jpg",
    items: ["Shirts", "Sweatshirts", "Polos", "Youth Team Sports"],
  },
];

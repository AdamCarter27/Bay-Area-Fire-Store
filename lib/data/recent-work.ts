// Custom work the shop has actually produced — the owner's own photos, carried
// over from the rotating gallery beside "Got a Custom Job?" on his current
// site, plus the three job shots already on hand.
//
// Two surfaces read this list, and they read different amounts of it:
//   - components/home/CustomWorkDeck.tsx — DECK_COUNT for the fan (the spread
//     only has room for so many cards), the whole list for the mobile strip
//   - components/custom/RecentWork.tsx   — the first three, as a sidebar strip
//
// Ordered strongest and most varied first, since that is what the deck shows.
// New photos go under /public/media as BayAreaFireStoreCustomWork*.jpg.

export type RecentWorkPhoto = {
  src: string; // "/media/..." under /public; "" = placeholder frame
  alt: string; // what is actually in the photo — read aloud by screen readers
  label?: string; // service name; captions a placeholder frame
};

export const recentWork: RecentWorkPhoto[] = [
  {
    src: "/media/BayAreaFireStoreCustomWork1.jpeg",
    alt: 'Navy Carhartt quarter-zip embroidered with the name "McDermott" and an SFFD Ocean\'s Engine, Truck and Battalion 9 shield',
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork10.jpg",
    alt: "Black tee screen printed with a Badfish Beerfest shark graphic in sunset colors",
    label: "Screen print",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork14.jpg",
    alt: "NB Fire Tactics caps beside a run of matching embroidered patches",
    label: "Patches",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork2.jpeg",
    alt: "Black snapback embroidered with the Fire Nuggets California mark — by firefighters, for firefighters",
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork4.jpg",
    alt: "Navy cap embroidered with a green San Francisco shamrock monogram",
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork3.png",
    alt: 'Two-tone work shirt with a "Bay Area Mechanic" patch and Acura & Honda Certified Specialist embroidery',
    label: "Patches",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork13.jpg",
    alt: "Grey cap embroidered with an SFFD Truck 5 Engine roundel, held up in the firehouse",
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork12.jpg",
    alt: 'Light blue cap embroidered with a green "43", resting against a firehouse wall',
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork5.jpg",
    alt: "Navy seven-panel cap with a gold San Francisco monogram",
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork6.jpg",
    alt: "Navy trucker cap embroidered with a red MA monogram",
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork7.jpg",
    alt: "Black rope cap embroidered with the Bay Area Fire Store script mark",
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork8.jpg",
    alt: "Navy trucker cap embroidered with a white San Francisco shark monogram",
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork9.jpg",
    alt: "Navy rope cap with the Bay Area Fire Store script embroidered across the front",
    label: "Embroidery",
  },
  {
    src: "/media/BayAreaFireStoreCustomWork11.jpg",
    alt: "Navy cap embroidered with a red and white MC monogram",
    label: "Embroidery",
  },
];

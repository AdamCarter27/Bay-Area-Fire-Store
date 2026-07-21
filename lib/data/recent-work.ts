// Recent custom work — owner-supplied photos of past jobs. Drop files under
// /public/media/recent-work (e.g. /media/recent-work/caps.jpg) and reference
// them in `src` below. "" renders the branded placeholder frame with the
// caption as its label.

export type RecentWorkPhoto = {
  src: string; // "/media/..." under /public; "" = placeholder
};

export const recentWork: RecentWorkPhoto[] = [
  { src: "/media/BayAreaFireStoreCustomWork1.jpeg" },
  { src: "/media/BayAreaFireStoreCustomWork2.jpeg" },
  { src: "/media/BayAreaFireStoreCustomWork3.png" },
];

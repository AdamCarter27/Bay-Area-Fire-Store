// Culture media manifest — the full-bleed background video and the team /
// SF-fire photos for the carousel. Assets are owner-supplied.
// Video:  /public/media/backgroundvid.mp4   + /public/media/backgroundvid-poster.jpg
// Photos: /public/media/team/01.jpg … (reference each under `src` below)

export type BackgroundVideo = {
  src: string; // e.g. "/media/culture.mp4"; "" = poster/placeholder only
  poster: string; // e.g. "/media/culture-poster.jpg"; "" = placeholder
};

export type CulturePhoto = {
  src: string; // e.g. "/media/team/01.jpg" under /public; "" = placeholder
};

export const backgroundVideo: BackgroundVideo = {
  src: "/media/backgroundvid.mp4",
  poster: "/media/backgroundvid-poster.jpg",
};

export const culturePhotos: CulturePhoto[] = [
  { src: "/media/BayAreaFireStoreImage1.png" },
  { src: "/media/BayAreaFireStoreImage2.png" },
  { src: "/media/BayAreaFireStoreImage3.png" },
  { src: "/media/BayAreaFireStoreImage4.png" },
  { src: "/media/BayAreaFireStoreImage6.png" },
  { src: "/media/BayAreaFireStoreImage7.png" },
  { src: "/media/BayAreaFireStoreImage8.png" },
];

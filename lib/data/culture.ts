// Culture media manifest — the full-bleed background video and the crew /
// SF-fire photos for the About page carousel. Every asset is the owner's own,
// carried over from the photos on his current site.
//
// Photos: /public/media/BayAreaFireStoreImage*.jpg. Ordered on purpose —
// strongest frames first, since the carousel opens on the left.

export type BackgroundVideo = {
  src: string; // e.g. "/media/culture.mp4"; "" = poster/placeholder only
  poster: string; // e.g. "/media/culture-poster.jpg"; "" = placeholder
};

export type CulturePhoto = {
  src: string; // "/media/..." under /public; "" = placeholder
  alt: string; // what is in the frame — read aloud by screen readers
};

export const backgroundVideo: BackgroundVideo = {
  src: "/media/backgroundvid.mp4",
  poster: "/media/backgroundvid-poster.jpg",
};

export const culturePhotos: CulturePhoto[] = [
  {
    src: "/media/BayAreaFireStoreImage1.jpg",
    alt: "A Presidio fire engine parked in the steel shadow of the Golden Gate Bridge approach",
  },
  {
    src: "/media/BayAreaFireStoreImage15.jpg",
    alt: "A full company in turnouts posed on and around their engine at the coast",
  },
  {
    src: "/media/BayAreaFireStoreImage4.jpg",
    alt: "Three firefighters in turnouts standing against a wall of graffiti",
  },
  {
    src: "/media/BayAreaFireStoreImage2.jpg",
    alt: "A crew standing on the stacked ladders of a truck on a San Francisco street",
  },
  {
    src: "/media/BayAreaFireStoreImage20.jpg",
    alt: "Four firefighters in turnouts outside a training tower",
  },
  {
    src: "/media/BayAreaFireStoreImage13.jpg",
    alt: "Two firefighters in station hoodies leaning against the front of their rig",
  },
  {
    src: "/media/BayAreaFireStoreImage10.jpg",
    alt: "The SFFD hockey club posed on the ice in full kit",
  },
  {
    src: "/media/BayAreaFireStoreImage19.jpg",
    alt: "A firehouse lit up at night with the apparatus bay open",
  },
  {
    src: "/media/BayAreaFireStoreImage3.jpg",
    alt: "An engine pulled up outside a brick firehouse",
  },
  {
    src: "/media/BayAreaFireStoreImage8.jpg",
    alt: "A crew raising a ground ladder to the upper floors of a city building",
  },
  {
    src: "/media/BayAreaFireStoreImage18.jpg",
    alt: "Members gathered in the apparatus bay in front of Truck 15",
  },
  {
    src: "/media/BayAreaFireStoreImage14.jpg",
    alt: "The store's booth at a community event, table laid out with department apparel",
  },
  {
    src: "/media/BayAreaFireStoreImage17.jpg",
    alt: "Asian Firefighters Association members at an event tent holding up a shirt",
  },
  {
    src: "/media/BayAreaFireStoreImage11.jpg",
    alt: "A large group photo in front of the rigs outside the El Capitan theatre",
  },
  {
    src: "/media/BayAreaFireStoreImage9.jpg",
    alt: "An engine working a street in a San Francisco neighborhood",
  },
  {
    src: "/media/BayAreaFireStoreImage16.jpg",
    alt: "The hockey club lined up on the ice in an empty arena",
  },
  {
    src: "/media/BayAreaFireStoreImage7.jpg",
    alt: "Members on stage in dress uniform receiving a department award",
  },
  {
    src: "/media/BayAreaFireStoreImage12.jpg",
    alt: "The Golden Gate Bridge from the water on a clear morning",
  },
  {
    src: "/media/BayAreaFireStoreImage6.jpg",
    alt: 'San Francisco Fire Department "We\'ll take anyone" caps on a diamond-plate counter',
  },
];

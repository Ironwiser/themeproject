export type CharacterTheme = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  epithets?: string[];
  featuredLines?: string[];
  colors: {
    primary: string;
    accent: string;
    gradient: string;
    glow?: string;
  };
  media: {
    video: string;
    music?: string;
    intro?: string;
  };
  images?: {
    hero: string;
    heroVideo?: string;
    heroLayout?: "portrait" | "wide";
    portrait?: string;
    landing?: string;
    introFrame?: string;
    gallery?: string[];
  };
};

export function getCharacterDisplayName({ id, name }: Pick<CharacterTheme, "id" | "name">): string {
  return id === "imperius" ? name.replace(/i/g, "I") : name;
}

export const characters: CharacterTheme[] = [
  {
    id: "imperius",
    name: "Imperius",
    tagline: "Beyond the veil, beyond the flame",
    description:
      "Kadim bir isim, değişmeyen bir görev. Ne merhamet taşır ne lütuf, yalnızca hüküm. Yozlaşmaya karşı adaletin çeliği, ilk ışıkta kazınmış yasanın eli.",
    epithets: ["The Harbinger", "The Judge"],
    featuredLines: [
      "The guilty know my shadow before they speak my name.",
      "I do not carry mercy. I do not carry grace.",
      "The wicked calls me the harbinger. The faithful calls me the judge.",
      "When empires fall to ashes, my spear remains unbroken.",
      "The sinner and the innocent chant my name the same.",
    ],
    colors: {
      primary: "#c9a227",
      accent: "#8b1a1a",
      glow: "#f0d878",
      gradient:
        "linear-gradient(160deg, #030202 0%, #120606 35%, #2a0a0a 65%, #1a0808 100%)",
    },
    media: {
      video: "/themes/imperius/video.mp4",
      music: "/themes/imperius/music.mp3",
      intro: "/themes/imperius/imperiusvid.mp4",
    },
    images: {
      hero: "/themes/imperius/images/ultrawide22.png",
      heroLayout: "wide",
      portrait: "/themes/imperius/images/imperius_left_portrait.png",
      landing: "/themes/imperius/images/imperimainwide.png",
      introFrame: "/themes/imperius/images/imperiusstartframe.png",
      gallery: [
        "/themes/imperius/images/impmoon.png",
        "/themes/imperius/images/imperiusprayers.png",
        "/themes/imperius/images/imperiusstartframe.png",
        "/themes/imperius/images/imperius_left_portrait.png",
        "/themes/imperius/images/impthrone.png",
      ],
    },
  },
  {
    id: "candyandblood",
    name: "Candy And Blood",
    tagline: "The hunt is endless now",
    description:
      "Yüzyıllar sonra özgür. Eski kan kül, zincirler toz. Ay ışığı avın üstünde dans ederken; şehir kan çiçekleriyle dolacak. Şeker mi vereceksin, kan mı? İkisine de doyamazlar.",
    epithets: ["The Endless Hunt", "Garden of Blood"],
    featuredLines: [
      "At last... After centuries... I want to watch them burn.",
      "BURN the masters. BURN the lords! BURN THEM ALL!",
      "No more masters. No more chains.",
      "This city will be our garden. Flowers of blood, so cute.",
      "The Moonlight dances on prey. Shadows nesting on red.",
      "Come a little closer. Just a step or two.",
      "Sweet little heartbeat, running in the dark.",
      "I want Candy and blood. I need Candy and BLOOOOOOOOOOOOD!",
      "Not a dealbreaker, right?",
    ],
    colors: {
      primary: "#c41e3a",
      accent: "#4a0e0e",
      glow: "#e85d75",
      gradient: "linear-gradient(160deg, #030202 0%, #1a0508 45%, #2d0a12 100%)",
    },
    media: {
      video: "",
      music: "/themes/candyandblood/music.mp3",
    },
    images: {
      landing: "/themes/candyandblood/images/cnb2.png",
      hero: "/themes/candyandblood/images/cnbportrait.png",
      heroVideo: "/themes/candyandblood/cnbwideloop.mp4",
      portrait: "/themes/candyandblood/images/cnbportrait.png",
    },
  },
  {
    id: "quickshover",
    name: "Quick Shover",
    tagline: "Coming soon",
    description: "Quick Shover teması yakında.",
    colors: {
      primary: "#facc15",
      accent: "#ca8a04",
      glow: "#fde047",
      gradient: "linear-gradient(160deg, #0a0800 0%, #1a1400 45%, #3f2f00 100%)",
    },
    media: {
      video: "/themes/quickshover/clockswithreverse.mp4",
    },
    images: {
      landing: "/themes/quickshover/images/quickshowerwide.png",
      hero: "/themes/quickshover/images/quickshowerwide.png",
      heroLayout: "wide",
      portrait: "/themes/quickshover/images/quickshowerwide.png",
    },
  },
  {
    id: "ember",
    name: "Ember",
    tagline: "Ateşin kalbi",
    description: "Sıcak turuncu ve kırmızı tonlarla enerjik, tutkulu bir atmosfer.",
    colors: {
      primary: "#fb923c",
      accent: "#ef4444",
      gradient: "linear-gradient(135deg, #1a0500 0%, #7c2d12 45%, #dc2626 100%)",
    },
    media: {
      video: "/themes/ember/video.mp4",
      music: "/themes/ember/music.mp3",
    },
  },
  {
    id: "moss",
    name: "Moss",
    tagline: "Ormanın sessizliği",
    description: "Yeşil ve toprak tonlarıyla huzurlu, doğal bir ortam.",
    colors: {
      primary: "#86efac",
      accent: "#65a30d",
      gradient: "linear-gradient(135deg, #052e16 0%, #14532d 50%, #365314 100%)",
    },
    media: {
      video: "/themes/moss/video.mp4",
      music: "/themes/moss/music.mp3",
    },
  },
  {
    id: "void",
    name: "Void",
    tagline: "Boşluğun derinliği",
    description: "Koyu mor ve siyah tonlarla gizemli, minimal bir deneyim.",
    colors: {
      primary: "#c084fc",
      accent: "#6366f1",
      gradient: "linear-gradient(135deg, #030014 0%, #1e1b4b 50%, #312e81 100%)",
    },
    media: {
      video: "/themes/void/video.mp4",
      music: "/themes/void/music.mp3",
    },
  },
];

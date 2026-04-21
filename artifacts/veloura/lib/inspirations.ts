import type { ImageSourcePropType } from "react-native";

import type { Occasion } from "./types";

export interface InspirationPiece {
  category: "top" | "bottom" | "shoes" | "dress" | "outerwear" | "accessory";
  name: string;
  color: string;
}

export interface Inspiration {
  id: string;
  name: string;
  caption: string;
  occasion: Occasion;
  matchScore: number;
  hero: ImageSourcePropType;
  palette: string[];
  pieces: InspirationPiece[];
  tip: string;
}

export const INSPIRATIONS: Inspiration[] = [
  {
    id: "insp-brunch",
    name: "Brunch Chic",
    caption: "Linen ease meets golden-hour sunlight",
    occasion: "casual",
    matchScore: 94,
    hero: require("../assets/images/insp-brunch.png"),
    palette: ["#E5D6BE", "#F1E7D6", "#B8956A", "#6B4A2B"],
    pieces: [
      { category: "top", name: "Camel cashmere knit", color: "#C9A47A" },
      { category: "bottom", name: "Ivory wide-leg trousers", color: "#F1E7D6" },
      { category: "shoes", name: "Beige leather loafers", color: "#A18763" },
    ],
    tip: "Half-tuck the knit and roll the cuff — relaxed, never sloppy.",
  },
  {
    id: "insp-boardroom",
    name: "Boardroom Power",
    caption: "Sharp tailoring softened by a silk shell",
    occasion: "business",
    matchScore: 96,
    hero: require("../assets/images/insp-boardroom.png"),
    palette: ["#1C1A18", "#3A3530", "#B8956A", "#F8F5EF"],
    pieces: [
      { category: "outerwear", name: "Charcoal wool blazer", color: "#3A3530" },
      { category: "bottom", name: "Slim tailored trousers", color: "#1C1A18" },
      { category: "shoes", name: "Black leather pumps", color: "#1C1A18" },
    ],
    tip: "One gold piece — never two. Let the silhouette speak.",
  },
  {
    id: "insp-gallery",
    name: "Gallery Opening",
    caption: "Black silk anchors hammered gold",
    occasion: "evening",
    matchScore: 98,
    hero: require("../assets/images/insp-gallery.png"),
    palette: ["#0F0E0D", "#1C1A18", "#D4B186", "#B8956A"],
    pieces: [
      { category: "dress", name: "Black silk slip dress", color: "#0F0E0D" },
      { category: "shoes", name: "Strappy gold sandals", color: "#D4B186" },
      { category: "accessory", name: "Hammered gold cuff", color: "#B8956A" },
    ],
    tip: "Warm the look with gold against bare skin — collarbone first.",
  },
  {
    id: "insp-wanderer",
    name: "City Wanderer",
    caption: "Oversized layers with a clean shoe",
    occasion: "streetwear",
    matchScore: 91,
    hero: require("../assets/images/insp-wanderer.png"),
    palette: ["#8A8782", "#E5DFD3", "#1B2A49", "#FFFFFF"],
    pieces: [
      { category: "outerwear", name: "Stone-grey wool coat", color: "#8A8782" },
      { category: "bottom", name: "Dark relaxed denim", color: "#1B2A49" },
      { category: "shoes", name: "White leather sneakers", color: "#F8F5EF" },
    ],
    tip: "Oversized over fitted — never both. Anchor with a clean shoe.",
  },
  {
    id: "insp-garden",
    name: "Garden Party",
    caption: "A floral whisper in soft cream",
    occasion: "formal",
    matchScore: 93,
    hero: require("../assets/images/insp-garden.png"),
    palette: ["#F1E7D6", "#D6C2A4", "#3F5D3A", "#A18763"],
    pieces: [
      { category: "dress", name: "Cream embroidered midi", color: "#F1E7D6" },
      { category: "shoes", name: "Nude block-heel sandals", color: "#D6C2A4" },
      { category: "accessory", name: "Natural straw bag", color: "#C9A47A" },
    ],
    tip: "Echo the embroidery tone in your accessory — quiet, not matched.",
  },
];

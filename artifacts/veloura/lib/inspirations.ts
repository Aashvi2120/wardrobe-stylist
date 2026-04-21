import type { ImageSourcePropType } from "react-native";

import type { InspirationCategory } from "./types";

export interface InspirationPiece {
  category: "Top" | "Bottom" | "Dress" | "Outerwear" | "Shoes" | "Accessory";
  description: string;
}

export interface Inspiration {
  id: string;
  title: string;
  category: InspirationCategory;
  occasion: string;
  caption: string;
  palette: string[];
  pieces: InspirationPiece[];
  image: ImageSourcePropType;
}

export const INSPIRATIONS: Inspiration[] = [
  // ── DAILY WEAR ──────────────────────────────────────────────
  {
    id: "insp-brunch",
    title: "Chic Brunch",
    category: "daily",
    occasion: "Weekend brunch",
    caption: "A linen blazer thrown over a silk slip — easy, elevated, undone.",
    palette: ["#EFE5D2", "#C4A07A", "#8A6B4F"],
    pieces: [
      { category: "Outerwear", description: "Oversized cream linen blazer" },
      { category: "Dress", description: "Champagne silk slip dress" },
      { category: "Shoes", description: "Tan leather slingback flats" },
      { category: "Accessory", description: "Tortoise round sunglasses" },
    ],
    image: require("../assets/images/insp-brunch.png"),
  },
  {
    id: "insp-sunday",
    title: "Sunday Errands",
    category: "daily",
    occasion: "Weekend errands",
    caption: "Cashmere comfort with denim that looks borrowed in the best way.",
    palette: ["#E8DDC8", "#C8A981", "#7A6650"],
    pieces: [
      { category: "Top", description: "Soft beige oversized hoodie" },
      { category: "Bottom", description: "Light wash boyfriend jeans" },
      { category: "Shoes", description: "Minimalist white leather sneakers" },
      { category: "Accessory", description: "Canvas tote in natural" },
    ],
    image: require("../assets/images/insp-sunday.png"),
  },
  {
    id: "insp-coffee",
    title: "Coffee Run",
    category: "daily",
    occasion: "Morning errands",
    caption: "Stripes, mules, and a half-tucked sweater. The whole point is looking unbothered.",
    palette: ["#F0E8D6", "#1F2D44", "#9B7C56"],
    pieces: [
      { category: "Top", description: "Navy & cream striped knit sweater" },
      { category: "Bottom", description: "Tailored cream linen shorts" },
      { category: "Shoes", description: "Caramel leather mules" },
      { category: "Accessory", description: "Small leather crossbody" },
    ],
    image: require("../assets/images/insp-coffee.png"),
  },
  {
    id: "insp-park",
    title: "Park Stroll",
    category: "daily",
    occasion: "Afternoon walk",
    caption: "Wide-leg linen catches the breeze — the easiest way to feel put-together.",
    palette: ["#E8E2CE", "#9DA988", "#C2A781"],
    pieces: [
      { category: "Top", description: "Cream cropped cotton tank" },
      { category: "Bottom", description: "Sage linen wide-leg trousers" },
      { category: "Shoes", description: "Beige espadrilles" },
      { category: "Accessory", description: "Woven straw mini bag" },
    ],
    image: require("../assets/images/insp-park.png"),
  },

  // ── OFFICE LOOKS ────────────────────────────────────────────
  {
    id: "insp-boardroom",
    title: "Boardroom Power",
    category: "office",
    occasion: "Important meeting",
    caption: "Sharp tailoring softened by silk — quiet confidence reads loudest.",
    palette: ["#1C1A18", "#E8DCC1", "#6B4A2B"],
    pieces: [
      { category: "Top", description: "Cream silk shell" },
      { category: "Outerwear", description: "Tailored black single-breasted blazer" },
      { category: "Bottom", description: "Black wide-leg trousers" },
      { category: "Shoes", description: "Pointed black leather pumps" },
    ],
    image: require("../assets/images/insp-boardroom.png"),
  },
  {
    id: "insp-creative",
    title: "Creative Director",
    category: "office",
    occasion: "Studio day",
    caption: "Rust silk and a pleated camel skirt — color as quiet authority.",
    palette: ["#B45A2A", "#C9A47A", "#3E2A1F"],
    pieces: [
      { category: "Top", description: "Rust silk button-down" },
      { category: "Bottom", description: "Pleated camel midi skirt" },
      { category: "Shoes", description: "Tan leather ankle boots" },
      { category: "Accessory", description: "Gold cuff bracelet" },
    ],
    image: require("../assets/images/insp-creative.png"),
  },
  {
    id: "insp-lunch",
    title: "Client Lunch",
    category: "office",
    occasion: "Polished lunch meeting",
    caption: "Cream and chocolate, tucked and tailored. The trousers do the work.",
    palette: ["#F0E5D2", "#4A2E1B", "#C9B596"],
    pieces: [
      { category: "Top", description: "Cream silk blouse" },
      { category: "Bottom", description: "Chocolate brown high-waisted trousers" },
      { category: "Shoes", description: "Nude pointed flats" },
      { category: "Accessory", description: "Slim leather belt in tan" },
    ],
    image: require("../assets/images/insp-lunch.png"),
  },
  {
    id: "insp-drinks",
    title: "Desk to Drinks",
    category: "office",
    occasion: "Evening meeting",
    caption: "One sleek black knit dress and the day rolls into the night.",
    palette: ["#1C1A18", "#B8956A", "#3D3530"],
    pieces: [
      { category: "Dress", description: "Fitted black knit midi dress" },
      { category: "Shoes", description: "Sleek black heeled boots" },
      { category: "Accessory", description: "Gold drop earrings" },
      { category: "Outerwear", description: "Long camel wool coat" },
    ],
    image: require("../assets/images/insp-drinks.png"),
  },

  // ── DATE NIGHT ──────────────────────────────────────────────
  {
    id: "insp-gallery",
    title: "Gallery Opening",
    category: "date",
    occasion: "Cocktails & art",
    caption: "Architectural shoulders meet a slip — sculptural without trying.",
    palette: ["#1C1A18", "#7A6E63", "#B8956A"],
    pieces: [
      { category: "Dress", description: "Ink-black silk midi slip" },
      { category: "Outerwear", description: "Structured charcoal cropped jacket" },
      { category: "Shoes", description: "Black sling-back stilettos" },
      { category: "Accessory", description: "Gold geometric drop earrings" },
    ],
    image: require("../assets/images/insp-gallery.png"),
  },
  {
    id: "insp-wine",
    title: "Wine Bar",
    category: "date",
    occasion: "Intimate evening",
    caption: "Burgundy silk and leather pants — warm, low-lit, devastating.",
    palette: ["#5C1F2A", "#1C1A18", "#9B7458"],
    pieces: [
      { category: "Top", description: "Deep burgundy silk wrap blouse" },
      { category: "Bottom", description: "Slim black leather pants" },
      { category: "Shoes", description: "Strappy black heels" },
      { category: "Accessory", description: "Small gold hoop earrings" },
    ],
    image: require("../assets/images/insp-wine.png"),
  },
  {
    id: "insp-rooftop",
    title: "Rooftop Dinner",
    category: "date",
    occasion: "Golden hour dinner",
    caption: "Emerald silk catches the light — let the dress do the talking.",
    palette: ["#1F4D3A", "#D4B07A", "#0E1A14"],
    pieces: [
      { category: "Dress", description: "Emerald silk midi dress" },
      { category: "Shoes", description: "Gold strappy heels" },
      { category: "Accessory", description: "Delicate gold chain necklace" },
      { category: "Outerwear", description: "Soft camel cashmere wrap" },
    ],
    image: require("../assets/images/insp-rooftop.png"),
  },

  // ── PARTY GLAM ──────────────────────────────────────────────
  {
    id: "insp-cocktail",
    title: "Cocktail Hour",
    category: "party",
    occasion: "Cocktail party",
    caption: "Sequins are a posture. Wear them like you mean it.",
    palette: ["#C0C0C0", "#1C1A18", "#E8DCC1"],
    pieces: [
      { category: "Dress", description: "Silver sequined mini dress" },
      { category: "Shoes", description: "Classic black patent pumps" },
      { category: "Accessory", description: "Crystal drop earrings" },
      { category: "Outerwear", description: "Black tuxedo blazer" },
    ],
    image: require("../assets/images/insp-cocktail.png"),
  },
  {
    id: "insp-velvet",
    title: "Velvet Soirée",
    category: "party",
    occasion: "Black-tie optional",
    caption: "Navy velvet against gold — old Hollywood with a lower neckline.",
    palette: ["#0F1E3A", "#B8956A", "#1C1A18"],
    pieces: [
      { category: "Dress", description: "Navy velvet jumpsuit, plunging neckline" },
      { category: "Shoes", description: "Gold strappy heels" },
      { category: "Accessory", description: "Gold statement earrings" },
      { category: "Accessory", description: "Black satin clutch" },
    ],
    image: require("../assets/images/insp-velvet.png"),
  },
  {
    id: "insp-champagne",
    title: "Champagne Toast",
    category: "party",
    occasion: "Celebratory dinner",
    caption: "Skyline behind you, silk catching the last of the light.",
    palette: ["#1F4D3A", "#D4B07A", "#0E1A14"],
    pieces: [
      { category: "Dress", description: "Emerald silk slip with cowl back" },
      { category: "Shoes", description: "Gold metallic heels" },
      { category: "Accessory", description: "Diamond stud earrings" },
      { category: "Accessory", description: "Gold mesh evening bag" },
    ],
    image: require("../assets/images/insp-rooftop.png"),
  },

  // ── TRAVEL FITS ─────────────────────────────────────────────
  {
    id: "insp-wanderer",
    title: "City Wanderer",
    category: "travel",
    occasion: "City exploration",
    caption: "A trench, denim, and good boots. Rain forecast? Even better.",
    palette: ["#C9A47A", "#3F4B57", "#1C1A18"],
    pieces: [
      { category: "Outerwear", description: "Camel double-breasted trench" },
      { category: "Top", description: "White cotton crewneck tee" },
      { category: "Bottom", description: "Indigo straight-leg jeans" },
      { category: "Shoes", description: "Black leather Chelsea boots" },
    ],
    image: require("../assets/images/insp-wanderer.png"),
  },
  {
    id: "insp-european",
    title: "European Stroll",
    category: "travel",
    occasion: "Old city wandering",
    caption: "Cobblestone-tested mules and a sweater that flatters every photo.",
    palette: ["#F0E8D6", "#1F2D44", "#9B7C56"],
    pieces: [
      { category: "Top", description: "Cream knit polo" },
      { category: "Bottom", description: "High-waisted linen shorts" },
      { category: "Shoes", description: "Caramel leather mules" },
      { category: "Accessory", description: "Vintage scarf as headband" },
    ],
    image: require("../assets/images/insp-coffee.png"),
  },
  {
    id: "insp-weekend",
    title: "Weekend Getaway",
    category: "travel",
    occasion: "Carry-on only",
    caption: "Cashmere, denim, sneakers — a uniform that survives any flight.",
    palette: ["#E8DDC8", "#C8A981", "#7A6650"],
    pieces: [
      { category: "Top", description: "Beige cashmere crewneck" },
      { category: "Bottom", description: "Light wash boyfriend jeans" },
      { category: "Shoes", description: "White leather sneakers" },
      { category: "Outerwear", description: "Soft taupe puffer vest" },
    ],
    image: require("../assets/images/insp-sunday.png"),
  },

  // ── MINIMAL AESTHETIC ───────────────────────────────────────
  {
    id: "insp-garden",
    title: "Garden Soirée",
    category: "minimal",
    occasion: "Romantic afternoon",
    caption: "Tea-length organza, golden light, and very little else.",
    palette: ["#F1E5D6", "#B8956A", "#3F5D3A"],
    pieces: [
      { category: "Dress", description: "Blush organza tea-length dress" },
      { category: "Outerwear", description: "Cropped ivory wool cardigan" },
      { category: "Shoes", description: "Nude leather block-heel sandals" },
      { category: "Accessory", description: "Pearl drop earrings" },
    ],
    image: require("../assets/images/insp-garden.png"),
  },
  {
    id: "insp-quietmorning",
    title: "Quiet Morning",
    category: "minimal",
    occasion: "Slow Sunday",
    caption: "All neutrals, all the time. A study in beige done properly.",
    palette: ["#EFE5D2", "#C4A07A", "#8A6B4F"],
    pieces: [
      { category: "Outerwear", description: "Cream linen blazer, sleeves pushed" },
      { category: "Top", description: "Ivory ribbed tank" },
      { category: "Bottom", description: "Sand-colored wide trousers" },
      { category: "Shoes", description: "Tan leather slingback flats" },
    ],
    image: require("../assets/images/insp-brunch.png"),
  },
  {
    id: "insp-tonal",
    title: "Tonal Tailoring",
    category: "minimal",
    occasion: "Quiet luxury",
    caption: "One tone, head to toe. Let the cut be the only thing speaking.",
    palette: ["#1C1A18", "#3D3530", "#B8956A"],
    pieces: [
      { category: "Top", description: "Black silk shell" },
      { category: "Outerwear", description: "Black tailored blazer" },
      { category: "Bottom", description: "Black wide-leg trousers" },
      { category: "Shoes", description: "Black leather loafers" },
    ],
    image: require("../assets/images/insp-boardroom.png"),
  },
];

export function getOutfitOfTheDay(): Inspiration {
  // Deterministic pick based on the calendar day so it changes once per day
  // but stays stable for everyone viewing the app on the same date.
  const now = new Date();
  const dayKey = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000,
  );
  const idx = ((dayKey % INSPIRATIONS.length) + INSPIRATIONS.length) % INSPIRATIONS.length;
  return INSPIRATIONS[idx];
}

export function getInspirationsByCategory(category: InspirationCategory): Inspiration[] {
  return INSPIRATIONS.filter((i) => i.category === category);
}

export function getInspiration(id: string): Inspiration | undefined {
  return INSPIRATIONS.find((i) => i.id === id);
}

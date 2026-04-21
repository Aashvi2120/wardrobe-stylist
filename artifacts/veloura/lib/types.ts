export type Category = "top" | "bottom" | "dress" | "outerwear" | "shoes" | "accessory";

export type Occasion = "casual" | "formal" | "business" | "evening" | "ethnic" | "athleisure" | "streetwear";

export type ColorName =
  | "black"
  | "white"
  | "beige"
  | "brown"
  | "navy"
  | "gray"
  | "pink"
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "purple"
  | "gold"
  | "silver";

export interface WardrobeItem {
  id: string;
  imageUri: string;
  category: Category;
  color: ColorName;
  tags: Occasion[];
  name?: string;
  createdAt: number;
}

export interface Outfit {
  id: string;
  itemIds: string[];
  occasion: Occasion;
  score: number;
  savedAt?: number;
  wornDates?: number[];
}

export type BodyType = "slim" | "athletic" | "curvy" | "plus" | "petite" | "tall";
export type SkinTone = "fair" | "light" | "medium" | "olive" | "tan" | "deep";
export type StylePreference = "minimalist" | "classic" | "bohemian" | "streetwear" | "romantic" | "edgy";

export interface UserProfile {
  name: string;
  email?: string;
  bodyType?: BodyType;
  skinTone?: SkinTone;
  style?: StylePreference;
  createdAt: number;
}

export type InspirationCategory =
  | "daily"
  | "office"
  | "date"
  | "party"
  | "travel"
  | "minimal";

export const INSPIRATION_CATEGORY_LABELS: Record<InspirationCategory, string> = {
  daily: "Daily Wear",
  office: "Office Looks",
  date: "Date Night",
  party: "Party Glam",
  travel: "Travel Fits",
  minimal: "Minimal Aesthetic",
};

export const INSPIRATION_CATEGORY_ORDER: InspirationCategory[] = [
  "daily",
  "office",
  "date",
  "party",
  "travel",
  "minimal",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  top: "Top",
  bottom: "Bottom",
  dress: "Dress",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessory: "Accessory",
};

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: "Casual",
  formal: "Formal",
  business: "Business",
  evening: "Evening",
  ethnic: "Ethnic",
  athleisure: "Athleisure",
  streetwear: "Streetwear",
};

export const COLOR_SWATCHES: Record<ColorName, string> = {
  black: "#1C1A18",
  white: "#F8F5EF",
  beige: "#D6C2A4",
  brown: "#6B4A2B",
  navy: "#1B2A49",
  gray: "#8A8782",
  pink: "#E5B3BA",
  red: "#9C2A2A",
  green: "#3F5D3A",
  blue: "#3A6BA5",
  yellow: "#D9B441",
  purple: "#5B3A6E",
  gold: "#B8956A",
  silver: "#BFC1C2",
};

import type { ColorName, Occasion, Outfit, WardrobeItem } from "./types";
import { uid } from "./uuid";

const NEUTRALS: ColorName[] = ["black", "white", "beige", "gray", "brown", "navy"];
const METALLICS: ColorName[] = ["gold", "silver"];

const HARMONY: Partial<Record<ColorName, ColorName[]>> = {
  pink: ["beige", "gray", "white", "navy", "gold"],
  red: ["black", "white", "beige", "navy", "gold"],
  green: ["beige", "white", "brown", "gold", "navy"],
  blue: ["white", "beige", "gray", "brown", "silver"],
  yellow: ["white", "navy", "gray", "brown"],
  purple: ["gray", "black", "white", "silver"],
  navy: ["white", "beige", "brown", "gold", "pink"],
  brown: ["beige", "white", "green", "gold", "navy"],
  beige: ["black", "white", "brown", "navy", "gold", "green"],
  gray: ["white", "black", "pink", "navy", "silver"],
  black: ["white", "beige", "gold", "silver", "red", "pink"],
  white: ["black", "navy", "beige", "brown", "gold", "red", "blue"],
  gold: ["black", "white", "beige", "navy", "brown"],
  silver: ["black", "white", "gray", "blue", "navy"],
};

function colorScore(a: ColorName, b: ColorName): number {
  if (a === b) return 0.6;
  if (NEUTRALS.includes(a) && NEUTRALS.includes(b)) return 1;
  if (METALLICS.includes(a) || METALLICS.includes(b)) return 0.85;
  if (HARMONY[a]?.includes(b) || HARMONY[b]?.includes(a)) return 0.9;
  if (NEUTRALS.includes(a) || NEUTRALS.includes(b)) return 0.75;
  return 0.4;
}

function matchOccasion(item: WardrobeItem, occasion: Occasion): number {
  if (item.tags.includes(occasion)) return 1;
  if (item.tags.length === 0) return 0.6;
  return 0.45;
}

interface Combo {
  items: WardrobeItem[];
  score: number;
}

function pickShoes(items: WardrobeItem[], occasion: Occasion): WardrobeItem[] {
  return items.filter((i) => i.category === "shoes").sort((a, b) => matchOccasion(b, occasion) - matchOccasion(a, occasion));
}

export function generateOutfits(
  items: WardrobeItem[],
  occasion: Occasion,
  count = 6,
): Outfit[] {
  const tops = items.filter((i) => i.category === "top");
  const bottoms = items.filter((i) => i.category === "bottom");
  const dresses = items.filter((i) => i.category === "dress");
  const outerwear = items.filter((i) => i.category === "outerwear");
  const shoesPool = pickShoes(items, occasion);

  const combos: Combo[] = [];

  // Top + Bottom (+ optional outerwear) + Shoes
  for (const top of tops) {
    for (const bottom of bottoms) {
      const shoe = shoesPool[0];
      if (!shoe) break;
      const base =
        colorScore(top.color, bottom.color) * 0.45 +
        colorScore(bottom.color, shoe.color) * 0.25 +
        colorScore(top.color, shoe.color) * 0.15 +
        (matchOccasion(top, occasion) + matchOccasion(bottom, occasion) + matchOccasion(shoe, occasion)) / 3 * 0.15;

      const set: WardrobeItem[] = [top, bottom, shoe];

      const layer = outerwear.find(
        (o) => colorScore(o.color, top.color) >= 0.75 && matchOccasion(o, occasion) >= 0.6,
      );
      let score = base;
      if (layer && (occasion === "formal" || occasion === "business" || occasion === "evening")) {
        set.splice(1, 0, layer);
        score += 0.05;
      }
      combos.push({ items: set, score });
    }
  }

  // Dress + Shoes
  for (const dress of dresses) {
    const shoe = shoesPool.find((s) => colorScore(dress.color, s.color) >= 0.7) ?? shoesPool[0];
    if (!shoe) break;
    const score =
      colorScore(dress.color, shoe.color) * 0.55 +
      (matchOccasion(dress, occasion) + matchOccasion(shoe, occasion)) / 2 * 0.45;
    combos.push({ items: [dress, shoe], score });
  }

  combos.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const outfits: Outfit[] = [];
  for (const c of combos) {
    const key = c.items.map((i) => i.id).sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    outfits.push({
      id: uid(),
      itemIds: c.items.map((i) => i.id),
      occasion,
      score: Math.round(c.score * 100),
    });
    if (outfits.length >= count) break;
  }
  return outfits;
}

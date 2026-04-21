import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Outfit, UserProfile, WardrobeItem } from "@/lib/types";

const KEYS = {
  profile: "veloura.profile.v1",
  items: "veloura.items.v1",
  outfits: "veloura.outfits.v1",
};

interface VelouraState {
  ready: boolean;
  profile: UserProfile | null;
  items: WardrobeItem[];
  outfits: Outfit[];
  saveProfile: (profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  addItem: (item: WardrobeItem) => Promise<void>;
  updateItem: (id: string, patch: Partial<WardrobeItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  saveOutfit: (outfit: Outfit) => Promise<void>;
  removeOutfit: (id: string) => Promise<void>;
  wearOutfit: (id: string) => Promise<void>;
}

const VelouraContext = createContext<VelouraState | null>(null);

export function VelouraProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, i, o] = await Promise.all([
          AsyncStorage.getItem(KEYS.profile),
          AsyncStorage.getItem(KEYS.items),
          AsyncStorage.getItem(KEYS.outfits),
        ]);
        if (p) setProfile(JSON.parse(p));
        if (i) setItems(JSON.parse(i));
        if (o) setOutfits(JSON.parse(o));
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persistItems = useCallback(async (next: WardrobeItem[]) => {
    setItems(next);
    await AsyncStorage.setItem(KEYS.items, JSON.stringify(next));
  }, []);

  const persistOutfits = useCallback(async (next: Outfit[]) => {
    setOutfits(next);
    await AsyncStorage.setItem(KEYS.outfits, JSON.stringify(next));
  }, []);

  const saveProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    await AsyncStorage.setItem(KEYS.profile, JSON.stringify(p));
  }, []);

  const signOut = useCallback(async () => {
    setProfile(null);
    setItems([]);
    setOutfits([]);
    await AsyncStorage.multiRemove([KEYS.profile, KEYS.items, KEYS.outfits]);
  }, []);

  const addItem = useCallback(
    async (item: WardrobeItem) => {
      await persistItems([item, ...items]);
    },
    [items, persistItems],
  );

  const updateItem = useCallback(
    async (id: string, patch: Partial<WardrobeItem>) => {
      await persistItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    },
    [items, persistItems],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await persistItems(items.filter((i) => i.id !== id));
      await persistOutfits(outfits.filter((o) => !o.itemIds.includes(id)));
    },
    [items, outfits, persistItems, persistOutfits],
  );

  const saveOutfit = useCallback(
    async (outfit: Outfit) => {
      const exists = outfits.some((o) => o.id === outfit.id);
      const stamped = { ...outfit, savedAt: outfit.savedAt ?? Date.now() };
      const next = exists ? outfits.map((o) => (o.id === outfit.id ? stamped : o)) : [stamped, ...outfits];
      await persistOutfits(next);
    },
    [outfits, persistOutfits],
  );

  const removeOutfit = useCallback(
    async (id: string) => {
      await persistOutfits(outfits.filter((o) => o.id !== id));
    },
    [outfits, persistOutfits],
  );

  const wearOutfit = useCallback(
    async (id: string) => {
      const next = outfits.map((o) =>
        o.id === id ? { ...o, wornDates: [...(o.wornDates ?? []), Date.now()] } : o,
      );
      await persistOutfits(next);
    },
    [outfits, persistOutfits],
  );

  const value = useMemo<VelouraState>(
    () => ({
      ready,
      profile,
      items,
      outfits,
      saveProfile,
      signOut,
      addItem,
      updateItem,
      removeItem,
      saveOutfit,
      removeOutfit,
      wearOutfit,
    }),
    [ready, profile, items, outfits, saveProfile, signOut, addItem, updateItem, removeItem, saveOutfit, removeOutfit, wearOutfit],
  );

  return <VelouraContext.Provider value={value}>{children}</VelouraContext.Provider>;
}

export function useVeloura() {
  const ctx = useContext(VelouraContext);
  if (!ctx) throw new Error("useVeloura must be used inside VelouraProvider");
  return ctx;
}

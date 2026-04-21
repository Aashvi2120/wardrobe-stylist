import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
  AUTH_KEYS,
  hashPassword,
  loadAccounts,
  loadSession,
  normalizeEmail,
  persistAccounts,
  persistSession,
  userScopedKey,
  type Account,
} from "@/lib/auth";
import type { Outfit, UserProfile, WardrobeItem } from "@/lib/types";

const BASE_KEYS = {
  items: "veloura.items.v1",
  outfits: "veloura.outfits.v1",
  saved: "veloura.savedInsp.v1",
};

interface VelouraState {
  ready: boolean;
  profile: UserProfile | null;
  items: WardrobeItem[];
  outfits: Outfit[];
  savedInspirationIds: string[];
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  addItem: (item: WardrobeItem) => Promise<void>;
  updateItem: (id: string, patch: Partial<WardrobeItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  saveOutfit: (outfit: Outfit) => Promise<void>;
  removeOutfit: (id: string) => Promise<void>;
  wearOutfit: (id: string) => Promise<void>;
  toggleSavedInspiration: (id: string) => Promise<void>;
  isInspirationSaved: (id: string) => boolean;
}

const VelouraContext = createContext<VelouraState | null>(null);

export function VelouraProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<Record<string, Account>>({});
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [savedInspirationIds, setSavedInspirationIds] = useState<string[]>([]);

  // Track which session's data we've loaded to avoid stale writes.
  const loadedFor = useRef<string | null>(null);

  const profile: UserProfile | null = sessionEmail ? accounts[sessionEmail] ?? null : null;

  // Initial load: accounts + session
  useEffect(() => {
    (async () => {
      try {
        const [accs, sess] = await Promise.all([loadAccounts(), loadSession()]);
        setAccounts(accs);
        if (sess && accs[sess]) {
          setSessionEmail(sess);
        } else if (sess && !accs[sess]) {
          // Stale session — clear it
          await persistSession(null);
        }
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Load per-user data whenever the session changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const target = sessionEmail;
      if (loadedFor.current === target) return;
      try {
        const [i, o, s] = await Promise.all([
          AsyncStorage.getItem(userScopedKey(BASE_KEYS.items, target)),
          AsyncStorage.getItem(userScopedKey(BASE_KEYS.outfits, target)),
          AsyncStorage.getItem(userScopedKey(BASE_KEYS.saved, target)),
        ]);
        if (cancelled) return;
        loadedFor.current = target;
        setItems(i ? (JSON.parse(i) as WardrobeItem[]) : []);
        setOutfits(o ? (JSON.parse(o) as Outfit[]) : []);
        setSavedInspirationIds(s ? (JSON.parse(s) as string[]) : []);
      } catch {
        if (!cancelled) {
          loadedFor.current = target;
          setItems([]);
          setOutfits([]);
          setSavedInspirationIds([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionEmail]);

  const persistItems = useCallback(
    async (next: WardrobeItem[]) => {
      setItems(next);
      await AsyncStorage.setItem(
        userScopedKey(BASE_KEYS.items, sessionEmail),
        JSON.stringify(next),
      );
    },
    [sessionEmail],
  );

  const persistOutfits = useCallback(
    async (next: Outfit[]) => {
      setOutfits(next);
      await AsyncStorage.setItem(
        userScopedKey(BASE_KEYS.outfits, sessionEmail),
        JSON.stringify(next),
      );
    },
    [sessionEmail],
  );

  const persistSaved = useCallback(
    async (next: string[]) => {
      setSavedInspirationIds(next);
      await AsyncStorage.setItem(
        userScopedKey(BASE_KEYS.saved, sessionEmail),
        JSON.stringify(next),
      );
    },
    [sessionEmail],
  );

  const signIn = useCallback<VelouraState["signIn"]>(
    async (email, password) => {
      const e = normalizeEmail(email);
      const acc = accounts[e];
      if (!acc) return { ok: false, error: "We couldn't find an account with that email." };
      if (acc.passwordHash !== hashPassword(password, e)) {
        return { ok: false, error: "Incorrect password. Try again." };
      }
      await persistSession(e);
      setSessionEmail(e);
      return { ok: true };
    },
    [accounts],
  );

  const signUp = useCallback<VelouraState["signUp"]>(
    async (name, email, password) => {
      const e = normalizeEmail(email);
      if (accounts[e]) {
        return { ok: false, error: "An account with that email already exists." };
      }
      const account: Account = {
        name: name.trim(),
        email: e,
        passwordHash: hashPassword(password, e),
        createdAt: Date.now(),
      };
      const next = { ...accounts, [e]: account };
      await persistAccounts(next);
      setAccounts(next);
      await persistSession(e);
      setSessionEmail(e);
      return { ok: true };
    },
    [accounts],
  );

  const saveProfile = useCallback(
    async (p: UserProfile) => {
      if (!sessionEmail) return;
      const existing = accounts[sessionEmail];
      if (!existing) return;
      const next = {
        ...accounts,
        [sessionEmail]: { ...existing, ...p, email: sessionEmail, passwordHash: existing.passwordHash },
      };
      setAccounts(next);
      await persistAccounts(next);
    },
    [sessionEmail, accounts],
  );

  const signOut = useCallback(async () => {
    await persistSession(null);
    setSessionEmail(null);
    setItems([]);
    setOutfits([]);
    setSavedInspirationIds([]);
    loadedFor.current = null;
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
      const next = exists
        ? outfits.map((o) => (o.id === outfit.id ? stamped : o))
        : [stamped, ...outfits];
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

  const toggleSavedInspiration = useCallback(
    async (id: string) => {
      const next = savedInspirationIds.includes(id)
        ? savedInspirationIds.filter((x) => x !== id)
        : [id, ...savedInspirationIds];
      await persistSaved(next);
    },
    [savedInspirationIds, persistSaved],
  );

  const isInspirationSaved = useCallback(
    (id: string) => savedInspirationIds.includes(id),
    [savedInspirationIds],
  );

  const value = useMemo<VelouraState>(
    () => ({
      ready,
      profile,
      items,
      outfits,
      savedInspirationIds,
      signIn,
      signUp,
      saveProfile,
      signOut,
      addItem,
      updateItem,
      removeItem,
      saveOutfit,
      removeOutfit,
      wearOutfit,
      toggleSavedInspiration,
      isInspirationSaved,
    }),
    [
      ready,
      profile,
      items,
      outfits,
      savedInspirationIds,
      signIn,
      signUp,
      saveProfile,
      signOut,
      addItem,
      updateItem,
      removeItem,
      saveOutfit,
      removeOutfit,
      wearOutfit,
      toggleSavedInspiration,
      isInspirationSaved,
    ],
  );

  return <VelouraContext.Provider value={value}>{children}</VelouraContext.Provider>;
}

export function useVeloura() {
  const ctx = useContext(VelouraContext);
  if (!ctx) throw new Error("useVeloura must be used inside VelouraProvider");
  return ctx;
}

// Re-export so callers don't need to know storage internals.
export { AUTH_KEYS };

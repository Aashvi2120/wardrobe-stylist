import AsyncStorage from "@react-native-async-storage/async-storage";

import type { UserProfile } from "./types";

export const AUTH_KEYS = {
  accounts: "veloura.accounts.v1",
  session: "veloura.session.v1",
};

export interface Account extends UserProfile {
  email: string;
  passwordHash: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  const e = normalizeEmail(email);
  if (!e) return "Email is required.";
  if (!EMAIL_RE.test(e)) return "That doesn't look like a valid email.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return "Name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return null;
}

// NOTE: This is a local-device-only hash for an offline AsyncStorage demo.
// It is intentionally simple. A production app would use a real auth service.
export function hashPassword(password: string, email: string): string {
  const salted = `${normalizeEmail(email)}::veloura::${password}`;
  let hash = 5381;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash << 5) + hash + salted.charCodeAt(i);
    hash = hash | 0;
  }
  return `vh1$${(hash >>> 0).toString(36)}$${salted.length}`;
}

export async function loadAccounts(): Promise<Record<string, Account>> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEYS.accounts);
    return raw ? (JSON.parse(raw) as Record<string, Account>) : {};
  } catch {
    return {};
  }
}

export async function persistAccounts(accounts: Record<string, Account>): Promise<void> {
  await AsyncStorage.setItem(AUTH_KEYS.accounts, JSON.stringify(accounts));
}

export async function loadSession(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_KEYS.session);
  } catch {
    return null;
  }
}

export async function persistSession(email: string | null): Promise<void> {
  if (!email) await AsyncStorage.removeItem(AUTH_KEYS.session);
  else await AsyncStorage.setItem(AUTH_KEYS.session, normalizeEmail(email));
}

export function userScopedKey(base: string, email: string | null): string {
  if (!email) return base;
  return `${base}.${encodeURIComponent(normalizeEmail(email))}`;
}

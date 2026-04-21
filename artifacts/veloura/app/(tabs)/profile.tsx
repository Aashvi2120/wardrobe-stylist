import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Header } from "@/components/Header";
import { useVeloura } from "@/contexts/VelouraContext";
import { useColors } from "@/hooks/useColors";
import type { BodyType, SkinTone, StylePreference } from "@/lib/types";

const BODY_TYPES: { key: BodyType; label: string }[] = [
  { key: "slim", label: "Slim" },
  { key: "athletic", label: "Athletic" },
  { key: "curvy", label: "Curvy" },
  { key: "plus", label: "Plus" },
  { key: "petite", label: "Petite" },
  { key: "tall", label: "Tall" },
];

const SKIN_TONES: { key: SkinTone; label: string; swatch: string }[] = [
  { key: "fair", label: "Fair", swatch: "#F2D9C2" },
  { key: "light", label: "Light", swatch: "#E5BFA0" },
  { key: "medium", label: "Medium", swatch: "#C99878" },
  { key: "olive", label: "Olive", swatch: "#A07A57" },
  { key: "tan", label: "Tan", swatch: "#7A4F33" },
  { key: "deep", label: "Deep", swatch: "#4A2A1B" },
];

const STYLES: { key: StylePreference; label: string }[] = [
  { key: "minimalist", label: "Minimalist" },
  { key: "classic", label: "Classic" },
  { key: "bohemian", label: "Bohemian" },
  { key: "streetwear", label: "Streetwear" },
  { key: "romantic", label: "Romantic" },
  { key: "edgy", label: "Edgy" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, items, outfits, saveProfile, signOut } = useVeloura();
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const update = async (patch: Partial<typeof profile>) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setSaving(true);
    await saveProfile({ ...profile, ...patch });
    setSaving(false);
  };

  const totalWorn = outfits.reduce((sum, o) => sum + (o.wornDates?.length ?? 0), 0);
  const tabBarPad = Platform.OS === "web" ? 110 : 110 + insets.bottom * 0.4;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header eyebrow="Your style" title={profile.name} subtitle="Refine how Veloura styles you" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: tabBarPad, gap: 22 }}
      >
        <View style={styles.statsRow}>
          <Stat value={items.length} label="Pieces" colors={colors} />
          <Stat value={outfits.length} label="Looks" colors={colors} />
          <Stat value={totalWorn} label="Worn" colors={colors} />
        </View>

        <Section title="Body type" subtitle="Helps tailor proportions and silhouettes.">
          <View style={styles.chipWrap}>
            {BODY_TYPES.map((b) => (
              <Chip key={b.key} label={b.label} selected={profile.bodyType === b.key} onPress={() => update({ bodyType: b.key })} />
            ))}
          </View>
        </Section>

        <Section title="Skin tone" subtitle="Used to suggest flattering color harmonies.">
          <View style={styles.chipWrap}>
            {SKIN_TONES.map((s) => (
              <Chip
                key={s.key}
                label={s.label}
                selected={profile.skinTone === s.key}
                swatch={s.swatch}
                onPress={() => update({ skinTone: s.key })}
              />
            ))}
          </View>
        </Section>

        <Section title="Style preference" subtitle="The mood Veloura leans into when generating looks.">
          <View style={styles.chipWrap}>
            {STYLES.map((s) => (
              <Chip key={s.key} label={s.label} selected={profile.style === s.key} onPress={() => update({ style: s.key })} />
            ))}
          </View>
        </Section>

        <Pressable
          onPress={() => {
            Alert.alert("Sign out", "This will erase your wardrobe and outfits on this device.", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign out", style: "destructive", onPress: () => signOut() },
            ]);
          }}
          style={({ pressed }) => [
            styles.signOut,
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign out</Text>
        </Pressable>

        {saving ? null : null}
      </ScrollView>
    </View>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ gap: 10 }}>
      <View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Stat({ value, label, colors }: { value: number; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.6,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  signOut: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
  },
  signOutText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    letterSpacing: 0.4,
  },
});

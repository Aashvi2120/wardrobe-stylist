import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { INSPIRATIONS } from "@/lib/inspirations";
import { CATEGORY_LABELS, OCCASION_LABELS } from "@/lib/types";

export default function InspirationScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const inspo = INSPIRATIONS.find((i) => i.id === id) ?? INSPIRATIONS[0]!;
  const topPad = Platform.OS === "web" ? 67 : insets.top + 4;

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const recreate = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
    setTimeout(() => router.push("/add-item"), 280);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <Feather name="chevron-down" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>STYLE INSPIRATION</Text>
          <Text style={[styles.topTitle, { color: colors.foreground }]}>{inspo.name}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
        style={{ opacity: fade, transform: [{ translateY: slide }] }}
      >
        <View style={styles.heroWrap}>
          <View style={[styles.hero, { borderColor: colors.border, shadowColor: "#1C1A18" }]}>
            <Image source={inspo.hero} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient colors={["transparent", "rgba(15,14,13,0.7)"]} style={styles.heroGradient} />
            <View style={styles.heroBadgeRow}>
              <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.94)" }]}>
                <Feather name="star" size={11} color={colors.accent} />
                <Text style={styles.heroBadgeText}>Match {inspo.matchScore}</Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: "rgba(15,14,13,0.55)" }]}>
                <Text style={[styles.heroBadgeText, { color: "#fff" }]}>{OCCASION_LABELS[inspo.occasion]}</Text>
              </View>
            </View>
            <View style={styles.heroFoot}>
              <Text style={styles.heroName}>{inspo.name}</Text>
              <Text style={styles.heroCaption}>{inspo.caption}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionEyebrow, { color: colors.accent }]}>VELOURA SAYS</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{inspo.caption}</Text>
          <View style={styles.swatchRow}>
            {inspo.palette.map((c, i) => (
              <View key={i} style={[styles.paletteSwatch, { backgroundColor: c, borderColor: colors.background }]} />
            ))}
            <Text style={[styles.paletteLabel, { color: colors.mutedForeground }]}>
              {inspo.palette.length} tones · curated palette
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.h2, { color: colors.foreground }]}>The pieces</Text>
          <View style={{ gap: 10, marginTop: 14 }}>
            {inspo.pieces.map((p, idx) => (
              <View key={idx} style={[styles.pieceRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.pieceColor, { backgroundColor: p.color, borderColor: colors.border }]} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.pieceCategory, { color: colors.mutedForeground }]}>
                    {CATEGORY_LABELS[p.category].toUpperCase()}
                  </Text>
                  <Text style={[styles.pieceName, { color: colors.foreground }]}>{p.name}</Text>
                </View>
                <Feather name="bookmark" size={16} color={colors.mutedForeground} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tipHeader}>
            <View style={[styles.tipIcon, { backgroundColor: colors.primary }]}>
              <Feather name="zap" size={12} color={colors.primaryForeground} />
            </View>
            <Text style={[styles.h2, { color: colors.foreground }]}>Stylist tip</Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.tipText, { color: colors.foreground }]}>{inspo.tip}</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      <View
        style={[
          styles.actionDock,
          { backgroundColor: colors.background, borderColor: colors.border, paddingBottom: 22 + insets.bottom * 0.4 },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: colors.card, borderColor: colors.border, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <Feather name="bookmark" size={16} color={colors.foreground} />
          <Text style={[styles.saveText, { color: colors.foreground }]}>Save</Text>
        </Pressable>
        <Pressable
          onPress={recreate}
          style={({ pressed }) => [styles.wearBtn, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        >
          <LinearGradient
            colors={[colors.primary, "#2C2723"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.wearBtnInner, { borderColor: colors.accent, shadowColor: colors.accent }]}
          >
            <View style={[styles.wearIconWrap, { backgroundColor: colors.accent }]}>
              <Feather name="camera" size={14} color={colors.accentForeground} />
            </View>
            <Text style={[styles.wearText, { color: colors.primaryForeground }]}>Recreate in my wardrobe</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  iconBtn: { padding: 4 },
  eyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 2 },
  topTitle: { fontFamily: "Inter_700Bold", fontSize: 17, letterSpacing: -0.2, marginTop: 2 },

  heroWrap: { paddingHorizontal: 22, paddingTop: 8 },
  hero: {
    width: "100%",
    height: 460,
    borderRadius: 26,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  heroGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" },
  heroBadgeRow: { position: "absolute", top: 16, left: 16, flexDirection: "row", gap: 8 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#1C1A18",
    letterSpacing: 0.4,
  },
  heroFoot: { position: "absolute", left: 22, right: 22, bottom: 22 },
  heroName: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#fff",
    letterSpacing: -0.6,
  },
  heroCaption: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    lineHeight: 18,
  },

  section: { paddingHorizontal: 22, marginTop: 28 },
  sectionEyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 2 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5, marginTop: 8, lineHeight: 28 },
  swatchRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  paletteSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, marginLeft: -6 },
  paletteLabel: { fontFamily: "Inter_400Regular", fontSize: 11, letterSpacing: 0.3, marginLeft: 8 },
  h2: { fontFamily: "Inter_600SemiBold", fontSize: 16, letterSpacing: -0.2 },

  pieceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  pieceColor: { width: 36, height: 36, borderRadius: 18, borderWidth: 1 },
  pieceCategory: { fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 1.4 },
  pieceName: { fontFamily: "Inter_600SemiBold", fontSize: 14, letterSpacing: -0.1 },

  tipHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  tipIcon: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tipCard: { borderRadius: 22, borderWidth: 1, padding: 18 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  tipText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },

  actionDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  saveText: { fontFamily: "Inter_600SemiBold", fontSize: 14, letterSpacing: 0.3 },
  wearBtn: { flex: 1.6, borderRadius: 999, overflow: "hidden" },
  wearBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  wearIconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  wearText: { fontFamily: "Inter_700Bold", fontSize: 13, letterSpacing: 0.3 },
});

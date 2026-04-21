import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef } from "react";
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

import { useVeloura } from "@/contexts/VelouraContext";
import { useColors } from "@/hooks/useColors";
import {
  CATEGORY_LABELS,
  COLOR_SWATCHES,
  OCCASION_LABELS,
  type Occasion,
  type WardrobeItem,
} from "@/lib/types";
import { uid } from "@/lib/uuid";

const STYLING_TIPS: Record<Occasion, string[]> = {
  casual: [
    "Roll the sleeves a half turn for an effortless line.",
    "Tuck the front of the top to define the waist.",
    "Soft, undone hair completes the off-duty mood.",
  ],
  business: [
    "Half-tuck the top for relaxed authority.",
    "Polish the silhouette with structured shoes.",
    "Add a single gold accessory — never two.",
  ],
  formal: [
    "Keep accessories minimal — let the fabric speak.",
    "Choose a clutch in a tone within the palette.",
    "A muted lip and clean nails finish the look.",
  ],
  evening: [
    "Layer warm gold jewelry against the skin.",
    "A slim heel elongates without overstating.",
    "Carry a structured mini for sculptural balance.",
  ],
  ethnic: [
    "Let one heritage piece anchor the outfit.",
    "Echo the embroidery tone in your accessory.",
    "Soft kohl liner deepens the palette beautifully.",
  ],
  athleisure: [
    "Stack textures — ribbed knit over smooth jersey.",
    "A clean white sneaker keeps it intentional.",
    "Hair pulled back lets the silhouette breathe.",
  ],
  streetwear: [
    "Oversized over fitted — never both at once.",
    "Anchor with a sharp shoe to avoid slouch.",
    "One bold accessory; let the proportions speak.",
  ],
};

export default function OutfitPreview() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    ids?: string;
    occasion?: string;
    caption?: string;
    score?: string;
  }>();
  const { items, saveOutfit, wearOutfit, outfits } = useVeloura();

  const occasion = (params.occasion as Occasion) || "casual";
  const caption = params.caption || "A look styled for you";
  const score = Number(params.score ?? 0);
  const ids = useMemo(() => (params.ids ? params.ids.split(",").filter(Boolean) : []), [params.ids]);

  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const lookItems = useMemo(
    () => ids.map((id) => itemMap.get(id)).filter(Boolean) as WardrobeItem[],
    [ids, itemMap],
  );

  const tips = STYLING_TIPS[occasion];
  const topPad = Platform.OS === "web" ? 67 : insets.top + 4;

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const buildOutfitId = useMemo(() => `look-${ids.join("-")}-${occasion}`, [ids, occasion]);
  const alreadySaved = outfits.some((o) => o.id === buildOutfitId);

  const handleSave = async () => {
    if (lookItems.length === 0) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveOutfit({
      id: buildOutfitId,
      itemIds: ids,
      occasion,
      score,
    });
  };

  const handleWear = async () => {
    if (lookItems.length === 0) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const id = alreadySaved ? buildOutfitId : buildOutfitId;
    if (!alreadySaved) {
      await saveOutfit({ id, itemIds: ids, occasion, score });
    }
    await wearOutfit(id);
    router.back();
  };

  const palette = lookItems.map((it) => COLOR_SWATCHES[it.color]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <Feather name="chevron-down" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>STYLED FOR YOU</Text>
          <Text style={[styles.topTitle, { color: colors.foreground }]}>{OCCASION_LABELS[occasion]}</Text>
        </View>
        <Pressable
          onPress={handleSave}
          hitSlop={12}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Feather name={alreadySaved ? "check" : "bookmark"} size={20} color={alreadySaved ? colors.accent : colors.foreground} />
        </Pressable>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
        style={{ opacity: fade, transform: [{ translateY: slide }] }}
      >
        <View style={styles.heroSection}>
          <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: "#1C1A18" }]}>
            {lookItems.length > 0 ? (
              <View style={styles.heroCollage}>
                <View style={[styles.heroMain, { backgroundColor: colors.muted }]}>
                  {lookItems[0] ? (
                    <Image source={{ uri: lookItems[0].imageUri }} style={styles.heroImg} contentFit="cover" />
                  ) : null}
                </View>
                <View style={styles.heroSide}>
                  {lookItems.slice(1, 3).map((it) => (
                    <View key={it.id} style={[styles.heroSideCell, { backgroundColor: colors.muted }]}>
                      <Image source={{ uri: it.imageUri }} style={styles.heroImg} contentFit="cover" />
                    </View>
                  ))}
                  {lookItems.length === 2 ? (
                    <View style={[styles.heroSideCell, { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }]}>
                      <Feather name="more-horizontal" size={18} color={colors.mutedForeground} />
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}
            <LinearGradient colors={["transparent", "rgba(15,14,13,0.6)"]} style={styles.heroGradient} />
            <View style={styles.heroBadgeRow}>
              <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.94)" }]}>
                <Feather name="star" size={11} color={colors.accent} />
                <Text style={styles.heroBadgeText}>Match {score || 92}</Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
            <Text style={[styles.captionEyebrow, { color: colors.accent }]}>VELOURA SAYS</Text>
            <Text style={[styles.captionTitle, { color: colors.foreground }]}>{caption}</Text>
            <View style={styles.swatchRow}>
              {palette.map((c, i) => (
                <View
                  key={i}
                  style={[styles.paletteSwatch, { backgroundColor: c, borderColor: colors.background }]}
                />
              ))}
              <Text style={[styles.paletteLabel, { color: colors.mutedForeground }]}>
                {palette.length} tones · curated palette
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>The pieces</Text>
          <View style={{ gap: 12, marginTop: 14 }}>
            {lookItems.map((it) => (
              <View
                key={it.id}
                style={[styles.pieceRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.pieceThumb, { backgroundColor: colors.muted }]}>
                  <Image source={{ uri: it.imageUri }} style={styles.heroImg} contentFit="cover" />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.pieceCategory, { color: colors.mutedForeground }]}>
                    {CATEGORY_LABELS[it.category].toUpperCase()}
                  </Text>
                  <Text style={[styles.pieceName, { color: colors.foreground }]} numberOfLines={1}>
                    {it.name?.trim() || `${CATEGORY_LABELS[it.category]} · ${it.color}`}
                  </Text>
                  {it.tags.length > 0 ? (
                    <View style={styles.pieceTagRow}>
                      {it.tags.slice(0, 3).map((t) => (
                        <View key={t} style={[styles.pieceTag, { backgroundColor: colors.muted }]}>
                          <Text style={[styles.pieceTagText, { color: colors.foreground }]}>{OCCASION_LABELS[t]}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
                <View style={[styles.pieceColorDot, { backgroundColor: COLOR_SWATCHES[it.color], borderColor: colors.border }]} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tipHeader}>
            <View style={[styles.tipIcon, { backgroundColor: colors.primary }]}>
              <Feather name="zap" size={12} color={colors.primaryForeground} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Styling tips</Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      <View style={[styles.actionDock, { backgroundColor: colors.background, borderColor: colors.border, paddingBottom: 22 + insets.bottom * 0.4 }]}>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor: colors.card,
              borderColor: alreadySaved ? colors.accent : colors.border,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Feather name={alreadySaved ? "check" : "bookmark"} size={16} color={alreadySaved ? colors.accent : colors.foreground} />
          <Text style={[styles.saveText, { color: alreadySaved ? colors.accent : colors.foreground }]}>
            {alreadySaved ? "Saved" : "Save"}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleWear}
          style={({ pressed }) => [styles.wearBtn, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        >
          <LinearGradient
            colors={[colors.primary, "#2C2723"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.wearBtnInner, { borderColor: colors.accent, shadowColor: colors.accent }]}
          >
            <View style={[styles.wearIconWrap, { backgroundColor: colors.accent }]}>
              <Feather name="sun" size={14} color={colors.accentForeground} />
            </View>
            <Text style={[styles.wearText, { color: colors.primaryForeground }]}>Wear Today</Text>
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
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
  },
  topTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    letterSpacing: -0.2,
    marginTop: 2,
  },

  heroSection: {
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  hero: {
    width: "100%",
    height: 380,
    borderRadius: 26,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  heroCollage: {
    flex: 1,
    flexDirection: "row",
  },
  heroMain: { flex: 1.5, overflow: "hidden" },
  heroSide: { flex: 1 },
  heroSideCell: { flex: 1, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%" },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  heroBadgeRow: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
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

  captionEyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
  },
  captionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.6,
    lineHeight: 32,
    marginTop: 8,
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  paletteSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginLeft: -6,
  },
  paletteLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 0.3,
    marginLeft: 8,
  },

  section: {
    paddingHorizontal: 22,
    marginTop: 28,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    letterSpacing: -0.2,
  },

  pieceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  pieceThumb: {
    width: 56,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
  },
  pieceCategory: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.4,
  },
  pieceName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: -0.1,
  },
  pieceTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  pieceTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pieceTagText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  pieceColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },

  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },

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
  saveText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  wearBtn: {
    flex: 1.4,
    borderRadius: 999,
    overflow: "hidden",
  },
  wearBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  wearIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  wearText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 0.4,
  },
});

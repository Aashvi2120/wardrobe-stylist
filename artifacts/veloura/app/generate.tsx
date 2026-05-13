import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/api";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { SwipeActions, SwipeCard } from "@/components/SwipeCard";
import { useVeloura } from "@/contexts/VelouraContext";
import { useColors } from "@/hooks/useColors";
import { generateOutfits } from "@/lib/outfitGenerator";
import { OCCASION_LABELS, type Occasion, type Outfit } from "@/lib/types";

const OCCASIONS: Occasion[] = ["casual", "business", "formal", "evening", "ethnic", "athleisure", "streetwear"];

export default function Generate() {
  console.log("Backend URL:", API_URL);
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, saveOutfit, wearOutfit } = useVeloura();
  const [occasion, setOccasion] = useState<Occasion>("casual");
  const [queue, setQueue] = useState<Outfit[]>([]);
  const [index, setIndex] = useState(0);

  const pool = useMemo(() => generateOutfits(items, occasion, 8), [items, occasion]);

  useEffect(() => {
  setQueue(pool);
  setIndex(0);
  fetch(`${API_URL}/api/healthz`)
    .then((res) => res.json())
    .then((data) => console.log("Backend Connected:", data))
    .catch((err) => console.log("Backend Error:", err));
}, [pool]);

  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const current = queue[index];
  const next1 = queue[index + 1];
  const next2 = queue[index + 2];

  const advance = () => setIndex((i) => i + 1);

  const onPass = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    advance();
  };
  const onSave = async () => {
    if (!current) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveOutfit(current);
    advance();
  };
  const onWear = async () => {
    if (!current) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveOutfit(current);
    await wearOutfit(current.id);
    advance();
  };

  const reshuffle = () => {
    setQueue(generateOutfits(items, occasion, 8));
    setIndex(0);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 4;
  const screenH = Dimensions.get("window").height;
  const cardAreaH = Math.min(screenH * 0.55, 540);

  const insufficient = items.filter((i) => i.category === "shoes").length === 0
    || (items.filter((i) => i.category === "top").length === 0
        && items.filter((i) => i.category === "bottom").length === 0
        && items.filter((i) => i.category === "dress").length === 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>AI STYLIST</Text>
          <Text style={[styles.topTitle, { color: colors.foreground }]}>Tonight&apos;s edit</Text>
        </View>
        <Pressable onPress={reshuffle} hitSlop={12} style={styles.iconBtn}>
          <Feather name="refresh-cw" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {OCCASIONS.map((o) => (
          <Chip key={o} label={OCCASION_LABELS[o]} selected={occasion === o} onPress={() => setOccasion(o)} />
        ))}
      </ScrollView>

      <View style={[styles.cardArea, { height: cardAreaH }]}>
        {insufficient ? (
          <EmptyState
            icon="package"
            title="Add a few more pieces"
            description="Veloura needs at least one pair of shoes plus a top + bottom (or a dress) to generate looks."
            ctaLabel="Add a piece"
            onCta={() => {
              router.back();
              setTimeout(() => router.push("/add-item"), 280);
            }}
          />
        ) : !current ? (
          <View style={styles.endWrap}>
            <Feather name="check-circle" size={40} color={colors.accent} />
            <Text style={[styles.endTitle, { color: colors.foreground }]}>That&apos;s the edit</Text>
            <Text style={[styles.endSub, { color: colors.mutedForeground }]}>
              Reshuffle for a new set or change the occasion.
            </Text>
            <View style={{ width: "70%", marginTop: 18 }}>
              <Button label="Reshuffle" icon={<Feather name="refresh-cw" size={16} color={colors.primaryForeground} />} onPress={reshuffle} />
            </View>
          </View>
        ) : (
          <View style={styles.stack}>
            {next2 ? (
              <SwipeCard
                outfit={next2}
                items={next2.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as never}
                topOffset={20}
                zIndex={1}
              />
            ) : null}
            {next1 ? (
              <SwipeCard
                outfit={next1}
                items={next1.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as never}
                topOffset={10}
                zIndex={2}
              />
            ) : null}
            <SwipeCard
              key={current.id}
              outfit={current}
              items={current.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as never}
              topOffset={0}
              zIndex={3}
              onSwipeLeft={onPass}
              onSwipeRight={onSave}
            />
          </View>
        )}
      </View>

      {current && !insufficient ? (
        <View style={styles.actionsWrap}>
          <SwipeActions onPass={onPass} onSave={onSave} onWear={onWear} />
          <Text style={[styles.swipeHint, { color: colors.mutedForeground }]}>
            Swipe right to save · Swipe left to pass
          </Text>
        </View>
      ) : null}
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
  filterRow: {
    paddingHorizontal: 22,
    gap: 8,
    paddingVertical: 8,
  },
  cardArea: {
    marginTop: 8,
    marginHorizontal: 22,
    position: "relative",
  },
  stack: {
    flex: 1,
    position: "relative",
  },
  actionsWrap: {
    paddingTop: 18,
    paddingBottom: 28,
    gap: 10,
    alignItems: "center",
  },
  swipeHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 0.4,
  },
  endWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  endTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
    marginTop: 12,
  },
  endSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});

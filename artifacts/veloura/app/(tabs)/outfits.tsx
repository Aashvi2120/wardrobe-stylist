import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, Dimensions, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { useVeloura } from "@/contexts/VelouraContext";
import { useColors } from "@/hooks/useColors";
import { CATEGORY_LABELS, COLOR_SWATCHES, OCCASION_LABELS } from "@/lib/types";

export default function OutfitsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { outfits, items, removeOutfit, wearOutfit } = useVeloura();

  const screenW = Dimensions.get("window").width;
  const cardW = screenW - 44;
  const tabBarPad = Platform.OS === "web" ? 110 : 110 + insets.bottom * 0.4;

  const itemMap = new Map(items.map((i) => [i.id, i]));

  const handleWear = (id: string) => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    wearOutfit(id);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remove outfit", "Remove this look from your saved outfits?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeOutfit(id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        eyebrow="Saved looks"
        title="Outfits"
        subtitle={outfits.length > 0 ? `${outfits.length} curated looks` : "Build a collection of looks you love"}
        trailing={
          <Pressable
            onPress={() => router.push("/generate")}
            style={({ pressed }) => [
              styles.sparkBtn,
              { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="zap" size={16} color={colors.accentForeground} />
          </Pressable>
        }
      />

      {outfits.length === 0 ? (
        <EmptyState
          icon="star"
          title="No saved looks yet"
          description="Generate outfits from your wardrobe and save the ones you love."
          ctaLabel="Generate outfits"
          onCta={() => router.push("/generate")}
        />
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: tabBarPad, gap: 18, paddingTop: 4 }}
          renderItem={({ item }) => {
            const its = item.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof itemMap.get>>[];
            const lastWorn = item.wornDates?.length ? new Date(item.wornDates[item.wornDates.length - 1]!) : null;
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, width: cardW }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.eyebrow, { color: colors.accent }]}>
                      {OCCASION_LABELS[item.occasion].toUpperCase()}
                    </Text>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                      Look #{item.id.slice(-4).toUpperCase()}
                    </Text>
                    <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                      Match score {item.score} · {its.length} pieces
                      {lastWorn ? ` · Worn ${lastWorn.toLocaleDateString()}` : ""}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDelete(item.id)}
                    hitSlop={10}
                    style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]}
                  >
                    <Feather name="trash-2" size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>

                <View style={styles.thumbRow}>
                  {its.map((it) => (
                    <View
                      key={it.id}
                      style={[styles.thumb, { backgroundColor: colors.muted, borderColor: colors.border }]}
                    >
                      <Image source={{ uri: it.imageUri }} style={styles.thumbImg} contentFit="cover" />
                      <View style={[styles.thumbDot, { backgroundColor: COLOR_SWATCHES[it.color], borderColor: colors.card }]} />
                    </View>
                  ))}
                </View>

                <View style={styles.tagRow}>
                  {its.map((it) => (
                    <View key={it.id} style={[styles.tag, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.tagText, { color: colors.foreground }]}>{CATEGORY_LABELS[it.category]}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.actions}>
                  <Button
                    label="Wear today"
                    icon={<Feather name="sun" size={16} color={colors.primaryForeground} />}
                    onPress={() => handleWear(item.id)}
                  />
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sparkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
  iconBtn: {
    padding: 6,
  },
  thumbRow: {
    flexDirection: "row",
    gap: 10,
  },
  thumb: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  thumbDot: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  actions: {
    marginTop: 4,
  },
});

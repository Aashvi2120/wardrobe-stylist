import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { CATEGORY_LABELS, COLOR_SWATCHES, WardrobeItem } from "@/lib/types";

interface Props {
  item: WardrobeItem;
  onPress?: () => void;
  onLongPress?: () => void;
  width: number;
}

export function ItemCard({ item, onPress, onLongPress, width }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.imageWrap, { backgroundColor: colors.muted, height: width * 1.2 }]}>
        <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="cover" />
        <View style={[styles.swatch, { backgroundColor: COLOR_SWATCHES[item.color], borderColor: colors.background }]} />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.category, { color: colors.mutedForeground }]} numberOfLines={1}>
          {CATEGORY_LABELS[item.category].toUpperCase()}
        </Text>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {item.name?.trim() || `${CATEGORY_LABELS[item.category]} · ${item.color}`}
        </Text>
        {item.tags.length > 0 ? (
          <View style={styles.tagRow}>
            <Feather name="tag" size={10} color={colors.mutedForeground} />
            <Text style={[styles.tags, { color: colors.mutedForeground }]} numberOfLines={1}>
              {item.tags.slice(0, 2).join(" · ")}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageWrap: {
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  swatch: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  meta: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  category: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: -0.1,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  tags: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textTransform: "capitalize",
  },
});

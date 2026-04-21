import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { useVeloura } from "@/contexts/VelouraContext";
import { useColors } from "@/hooks/useColors";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

const FILTERS: ({ key: "all" | Category; label: string })[] = [
  { key: "all", label: "All" },
  { key: "top", label: "Tops" },
  { key: "bottom", label: "Bottoms" },
  { key: "dress", label: "Dresses" },
  { key: "outerwear", label: "Outerwear" },
  { key: "shoes", label: "Shoes" },
  { key: "accessory", label: "Accessories" },
];

export default function WardrobeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, profile, removeItem } = useVeloura();
  const [filter, setFilter] = useState<"all" | Category>("all");

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const screenW = Dimensions.get("window").width;
  const gap = 14;
  const horizontalPadding = 22;
  const cardW = (screenW - horizontalPadding * 2 - gap) / 2;

  const tabBarPad = Platform.OS === "web" ? 100 : 100 + insets.bottom * 0.4;

  const handleDelete = (id: string, name: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Remove piece", `Remove ${name} from your wardrobe?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeItem(id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        eyebrow={`Hello, ${profile?.name ?? "Friend"}`}
        title="Your Atelier"
        subtitle={items.length > 0 ? `${items.length} pieces · ${new Set(items.map((i) => i.category)).size} categories` : "Curate your timeless wardrobe"}
        trailing={
          <Pressable
            onPress={() => router.push("/generate")}
            style={({ pressed }) => [
              styles.sparkBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="zap" size={16} color={colors.primaryForeground} />
          </Pressable>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            selected={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </ScrollView>

      {items.length === 0 ? (
        <EmptyState
          icon="camera"
          title="Your atelier is empty"
          description="Add your first piece to begin building a wardrobe Veloura can style for you."
          ctaLabel="Add a piece"
          onCta={() => router.push("/add-item")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="filter"
          title={`No ${CATEGORY_LABELS[filter as Category].toLowerCase()}s yet`}
          description="Add a piece to this category to keep building your wardrobe."
          ctaLabel="Add a piece"
          onCta={() => router.push("/add-item")}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap, paddingHorizontal: horizontalPadding }}
          contentContainerStyle={{ gap, paddingTop: 8, paddingBottom: tabBarPad }}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              width={cardW}
              onLongPress={() => handleDelete(item.id, item.name?.trim() || CATEGORY_LABELS[item.category])}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        onPress={() => router.push("/add-item")}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: tabBarPad - 6,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}
      >
        <Feather name="plus" size={24} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: {
    paddingHorizontal: 22,
    gap: 8,
    paddingVertical: 12,
  },
  sparkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 22,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});

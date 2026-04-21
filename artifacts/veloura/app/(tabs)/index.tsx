import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { useVeloura } from "@/contexts/VelouraContext";
import { useColors } from "@/hooks/useColors";
import { generateOutfits } from "@/lib/outfitGenerator";
import {
  CATEGORY_LABELS,
  COLOR_SWATCHES,
  OCCASION_LABELS,
  type Category,
  type Occasion,
  type WardrobeItem,
} from "@/lib/types";

const FILTERS: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "top", label: "Tops" },
  { key: "bottom", label: "Bottoms" },
  { key: "dress", label: "Dresses" },
  { key: "outerwear", label: "Outerwear" },
  { key: "shoes", label: "Shoes" },
  { key: "accessory", label: "Accessories" },
];

const CAPTIONS: Record<Occasion, string> = {
  casual: "Effortless weekend ease",
  formal: "Quiet evening elegance",
  business: "Boardroom-ready tailoring",
  evening: "Soft glow after dark",
  ethnic: "Heritage with a modern edge",
  athleisure: "Relaxed urban motion",
  streetwear: "Sharp city silhouette",
};

interface StyledLook {
  id: string;
  caption: string;
  occasion: Occasion;
  score?: number;
  itemIds?: string[];
  items?: WardrobeItem[];
  placeholder?: { tone: string; accent: string };
}

const PLACEHOLDER_LOOKS: StyledLook[] = [
  {
    id: "p1",
    caption: "Camel coat over ivory knit",
    occasion: "business",
    placeholder: { tone: "#E5D6BE", accent: "#B8956A" },
  },
  {
    id: "p2",
    caption: "Silk slip with gold accents",
    occasion: "evening",
    placeholder: { tone: "#1C1A18", accent: "#D4B186" },
  },
  {
    id: "p3",
    caption: "Linen ease in soft cream",
    occasion: "casual",
    placeholder: { tone: "#F1E7D6", accent: "#A18763" },
  },
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

  const styledLooks: StyledLook[] = useMemo(() => {
    const real: StyledLook[] = [];
    if (items.length > 0) {
      const itemMap = new Map(items.map((i) => [i.id, i]));
      const occs: Occasion[] = ["business", "evening", "casual"];
      for (const occ of occs) {
        const [first] = generateOutfits(items, occ, 1);
        if (!first) continue;
        const its = first.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as WardrobeItem[];
        if (its.length === 0) continue;
        real.push({
          id: first.id,
          caption: CAPTIONS[occ],
          occasion: occ,
          score: first.score,
          itemIds: first.itemIds,
          items: its,
        });
        if (real.length === 3) break;
      }
    }
    if (real.length === 3) return real;
    return [...real, ...PLACEHOLDER_LOOKS].slice(0, 3);
  }, [items]);

  const screenW = Dimensions.get("window").width;
  const gridGap = 14;
  const horizontalPadding = 22;
  const cardW = (screenW - horizontalPadding * 2 - gridGap) / 2;
  const tabBarPad = Platform.OS === "web" ? 110 : 110 + insets.bottom * 0.4;

  const handleDelete = (id: string, name: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Remove piece", `Remove ${name} from your wardrobe?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeItem(id) },
    ]);
  };

  const openLook = (look: StyledLook) => {
    if (!look.items || !look.itemIds) {
      router.push("/generate");
      return;
    }
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push({
      pathname: "/outfit-preview",
      params: {
        ids: look.itemIds.join(","),
        occasion: look.occasion,
        caption: look.caption,
        score: String(look.score ?? 0),
      },
    });
  };

  const headerComponent = (
    <View>
      <StyledForYouSection looks={styledLooks} onPressLook={openLook} onSeeAll={() => router.push("/generate")} />
      <View style={styles.filterHeader}>
        <Text style={[styles.sectionEyebrow, { color: colors.accent }]}>YOUR ATELIER</Text>
        <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
          {items.length} {items.length === 1 ? "piece" : "pieces"}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <FilterTab key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </ScrollView>
    </View>
  );

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

      {items.length === 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarPad + 20 }}
        >
          <StyledForYouSection looks={styledLooks} onPressLook={openLook} onSeeAll={() => router.push("/generate")} />
          <PremiumEmptyState onCta={() => router.push("/add-item")} />
        </ScrollView>
      ) : filtered.length === 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarPad + 20 }}
        >
          {headerComponent}
          <View style={{ paddingTop: 40 }}>
            <EmptyState
              icon="filter"
              title={`No ${CATEGORY_LABELS[filter as Category].toLowerCase()}s yet`}
              description="Add a piece to this category to keep building your wardrobe."
              ctaLabel="Add a piece"
              onCta={() => router.push("/add-item")}
            />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: gridGap, paddingHorizontal: horizontalPadding }}
          contentContainerStyle={{ gap: gridGap, paddingBottom: tabBarPad + 20 }}
          ListHeaderComponent={headerComponent}
          renderItem={({ item, index }) => (
            <FadeIn delay={index * 60}>
              <ItemCard
                item={item}
                width={cardW}
                onLongPress={() => handleDelete(item.id, item.name?.trim() || CATEGORY_LABELS[item.category])}
              />
            </FadeIn>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingAddButton onPress={() => router.push("/add-item")} bottom={tabBarPad - 14} />
    </View>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 460, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 460, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, delay]);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function FilterTab({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useColors();
  if (selected) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.filterTab, { opacity: pressed ? 0.9 : 1 }]}>
        <LinearGradient
          colors={[colors.primary, "#3A3530"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.filterTabInner, styles.filterTabSelected, { borderColor: colors.accent, shadowColor: colors.accent }]}
        >
          <View style={[styles.filterDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.filterText, { color: colors.primaryForeground }]}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterTab,
        styles.filterTabInner,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.filterText, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

function StyledForYouSection({
  looks,
  onPressLook,
  onSeeAll,
}: {
  looks: StyledLook[];
  onPressLook: (look: StyledLook) => void;
  onSeeAll: () => void;
}) {
  const colors = useColors();
  return (
    <FadeIn>
      <View style={styles.styledWrap}>
        <View style={styles.styledHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionEyebrow, { color: colors.accent }]}>CURATED FOR YOU</Text>
            <Text style={[styles.styledTitle, { color: colors.foreground }]}>
              AI Styled For You <Text style={{ color: colors.accent }}>✨</Text>
            </Text>
            <Text style={[styles.styledSub, { color: colors.mutedForeground }]}>
              Veloura styled these looks for you today <Text style={{ color: colors.accent }}>✨</Text>
            </Text>
          </View>
        </View>
        <View style={styles.seeAllRow}>
          <Pressable
            onPress={onSeeAll}
            style={({ pressed }) => [
              styles.seeAllBtn,
              { borderColor: colors.accent, backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.seeAllText, { color: colors.foreground }]}>See all looks</Text>
            <Feather name="arrow-right" size={14} color={colors.accent} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.styledRow}
          decelerationRate="fast"
          snapToInterval={244}
        >
          {looks.map((look, i) => (
            <FadeIn key={look.id} delay={140 + i * 110}>
              <StyledLookCard look={look} onPress={() => onPressLook(look)} />
            </FadeIn>
          ))}
        </ScrollView>
      </View>
    </FadeIn>
  );
}

function StyledLookCard({ look, onPress }: { look: StyledLook; onPress: () => void }) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.965, friction: 6, tension: 140, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }).start();

  // Map items by category for explicit top/bottom/shoes layout.
  const byCat = useMemo(() => {
    const m = new Map<Category, WardrobeItem>();
    look.items?.forEach((it) => {
      if (!m.has(it.category)) m.set(it.category, it);
    });
    return m;
  }, [look.items]);

  const dress = byCat.get("dress");
  const top = byCat.get("top");
  const bottom = byCat.get("bottom");
  const outer = byCat.get("outerwear");
  const shoes = byCat.get("shoes");

  const left = dress ?? outer ?? top;
  const rightTop = dress ? shoes : top && left !== top ? top : bottom;
  const rightBottom = dress ? null : bottom && left !== bottom ? bottom : shoes;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.lookCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: "#1C1A18",
          },
        ]}
      >
        <View style={styles.lookImageWrap}>
          {look.items ? (
            <View style={styles.lookCollage}>
              {left ? (
                <View style={[styles.lookMain, { backgroundColor: colors.muted }]}>
                  <Image source={{ uri: left.imageUri }} style={styles.lookImg} contentFit="cover" />
                  <View style={[styles.thumbLabel, { backgroundColor: "rgba(15,14,13,0.55)" }]}>
                    <Text style={styles.thumbLabelText}>{CATEGORY_LABELS[left.category].toUpperCase()}</Text>
                  </View>
                </View>
              ) : null}
              <View style={styles.lookSide}>
                {rightTop ? (
                  <View style={[styles.lookSideCell, { backgroundColor: colors.muted }]}>
                    <Image source={{ uri: rightTop.imageUri }} style={styles.lookImg} contentFit="cover" />
                    <View style={[styles.thumbLabelSmall, { backgroundColor: "rgba(15,14,13,0.55)" }]}>
                      <Text style={styles.thumbLabelText}>{CATEGORY_LABELS[rightTop.category].toUpperCase()}</Text>
                    </View>
                  </View>
                ) : null}
                {rightBottom ? (
                  <View style={[styles.lookSideCell, { backgroundColor: colors.muted }]}>
                    <Image source={{ uri: rightBottom.imageUri }} style={styles.lookImg} contentFit="cover" />
                    <View style={[styles.thumbLabelSmall, { backgroundColor: "rgba(15,14,13,0.55)" }]}>
                      <Text style={styles.thumbLabelText}>{CATEGORY_LABELS[rightBottom.category].toUpperCase()}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <PlaceholderCollage tone={look.placeholder!.tone} accent={look.placeholder!.accent} />
          )}
          <LinearGradient colors={["transparent", "rgba(15,14,13,0.55)"]} style={styles.lookGradient} />
          <View style={styles.lookBadge}>
            <Feather name="star" size={10} color={colors.accent} />
            <Text style={[styles.lookBadgeText, { color: "#fff" }]}>{OCCASION_LABELS[look.occasion]}</Text>
          </View>
        </View>
        <View style={styles.lookMeta}>
          <Text style={[styles.lookCaption, { color: colors.foreground }]} numberOfLines={2}>
            {look.caption}
          </Text>
          <View style={styles.lookFooter}>
            {look.items ? (
              <View style={styles.lookSwatchRow}>
                {look.items.slice(0, 4).map((it) => (
                  <View
                    key={it.id}
                    style={[styles.lookSwatch, { backgroundColor: COLOR_SWATCHES[it.color], borderColor: colors.card }]}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.lookSwatchRow}>
                {[look.placeholder!.tone, look.placeholder!.accent, "#1C1A18"].map((c, i) => (
                  <View key={i} style={[styles.lookSwatch, { backgroundColor: c, borderColor: colors.card }]} />
                ))}
              </View>
            )}
            <View style={[styles.lookArrow, { backgroundColor: colors.accent }]}>
              <Feather name="arrow-up-right" size={12} color={colors.accentForeground} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function PlaceholderCollage({ tone, accent }: { tone: string; accent: string }) {
  return (
    <View style={[styles.lookCollage, { backgroundColor: tone }]}>
      <LinearGradient
        colors={[tone, accent + "55", "#1C1A18"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.95 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.placeholderShapes}>
        <View style={[styles.placeholderTop, { backgroundColor: "#FFFFFF18", borderColor: "#FFFFFF24" }]} />
        <View style={[styles.placeholderBottom, { backgroundColor: "#00000022", borderColor: "#00000033" }]} />
        <View style={[styles.placeholderShoe, { backgroundColor: accent }]} />
      </View>
    </View>
  );
}

function PremiumEmptyState({ onCta }: { onCta: () => void }) {
  const colors = useColors();
  return (
    <FadeIn>
      <View style={styles.emptyWrap}>
        <View style={[styles.emptyIllustration, { borderColor: colors.border }]}>
          <LinearGradient
            colors={[colors.secondary, colors.background]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.emptyHanger, { borderColor: colors.accent }]}>
            <View style={[styles.emptyHangerHook, { backgroundColor: colors.accent }]} />
            <View style={[styles.emptyHangerBar, { backgroundColor: colors.foreground }]} />
            <View style={[styles.emptyHangerGarment, { backgroundColor: colors.foreground, borderColor: colors.accent }]} />
          </View>
          <View style={[styles.emptySparkle, { top: 28, left: 38 }]}>
            <Feather name="star" size={12} color={colors.accent} />
          </View>
          <View style={[styles.emptySparkle, { top: 56, right: 44 }]}>
            <Feather name="star" size={9} color={colors.accent} />
          </View>
          <View style={[styles.emptySparkle, { bottom: 36, left: 56 }]}>
            <Feather name="star" size={8} color={colors.accent} />
          </View>
        </View>

        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          Let&apos;s build your dream wardrobe <Text style={{ color: colors.accent }}>✨</Text>
        </Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
          Snap a few pieces you already own and Veloura&apos;s AI stylist will compose looks tailored to you.
        </Text>

        <Pressable
          onPress={onCta}
          style={({ pressed }) => [styles.emptyCta, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        >
          <LinearGradient
            colors={[colors.accent, "#9A7A52"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyCtaInner}
          >
            <Feather name="camera" size={16} color="#fff" />
            <Text style={styles.emptyCtaText}>Add your first piece</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </FadeIn>
  );
}

function FloatingAddButton({ onPress, bottom }: { onPress: () => void; bottom: number }) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true, delay: 220 }),
      Animated.timing(opacity, { toValue: 1, duration: 280, delay: 220, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[styles.fabWrap, { bottom, opacity, transform: [{ scale }] }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={({ pressed }) => [styles.fabPressable, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
      >
        <LinearGradient
          colors={[colors.primary, "#2C2723"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fab, { shadowColor: colors.accent, borderColor: colors.accent }]}
        >
          <View style={[styles.fabIconWrap, { backgroundColor: colors.accent }]}>
            <Feather name="plus" size={16} color={colors.accentForeground} />
          </View>
          <Text style={[styles.fabLabel, { color: colors.primaryForeground }]}>Add Item</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
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

  // Curated section
  styledWrap: {
    paddingTop: 6,
    paddingBottom: 10,
  },
  styledHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 22,
    marginBottom: 8,
  },
  styledTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.5,
    marginTop: 6,
  },
  styledSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 6,
    lineHeight: 17,
  },
  seeAllRow: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 10,
  },
  seeAllBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  seeAllText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.4,
  },
  styledRow: {
    paddingHorizontal: 22,
    gap: 14,
    paddingBottom: 8,
    paddingTop: 4,
  },
  sectionEyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
  },

  // Look card
  lookCard: {
    width: 230,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  lookImageWrap: {
    width: "100%",
    height: 240,
    position: "relative",
  },
  lookCollage: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  lookMain: {
    flex: 1.4,
    overflow: "hidden",
    position: "relative",
  },
  lookSide: {
    flex: 1,
  },
  lookSideCell: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  lookImg: { width: "100%", height: "100%" },
  thumbLabel: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  thumbLabelSmall: {
    position: "absolute",
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  thumbLabelText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 0.8,
    color: "#fff",
  },
  lookGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
  },
  lookBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(15,14,13,0.55)",
  },
  lookBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 0.6,
  },
  lookMeta: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  lookCaption: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  lookFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lookSwatchRow: {
    flexDirection: "row",
  },
  lookSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    marginLeft: -4,
  },
  lookArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  // Placeholder collage
  placeholderShapes: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 24,
    gap: 6,
  },
  placeholderTop: {
    width: 90,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  placeholderBottom: {
    width: 70,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
  },
  placeholderShoe: {
    width: 44,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
  },

  // Filter tabs
  filterHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionCount: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.4,
  },
  filterRow: {
    paddingHorizontal: 22,
    gap: 10,
    paddingVertical: 12,
  },
  filterTab: {
    borderRadius: 999,
  },
  filterTabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterTabSelected: {
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12.5,
    letterSpacing: 0.3,
  },

  // Premium empty state
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 14,
    gap: 16,
  },
  emptyIllustration: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyHanger: {
    width: 110,
    height: 90,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  emptyHangerHook: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: -4,
    zIndex: 2,
  },
  emptyHangerBar: {
    width: 90,
    height: 4,
    borderRadius: 2,
  },
  emptyHangerGarment: {
    width: 100,
    height: 56,
    borderRadius: 12,
    marginTop: -2,
    borderWidth: 1,
    opacity: 0.92,
  },
  emptySparkle: {
    position: "absolute",
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
    textAlign: "center",
    lineHeight: 30,
    marginTop: 4,
  },
  emptyDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 320,
  },
  emptyCta: {
    marginTop: 12,
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#B8956A",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  emptyCtaInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 26,
    paddingVertical: 16,
  },
  emptyCtaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.3,
    color: "#fff",
  },

  // Floating Add button
  fabWrap: {
    position: "absolute",
    right: 22,
    alignItems: "flex-end",
  },
  fabPressable: {
    borderRadius: 999,
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 6,
    paddingRight: 18,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  fabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  fabLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

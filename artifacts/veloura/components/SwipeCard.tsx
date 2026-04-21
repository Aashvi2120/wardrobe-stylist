import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { CATEGORY_LABELS, COLOR_SWATCHES, OCCASION_LABELS, type Outfit, type WardrobeItem } from "@/lib/types";

const SWIPE_THRESHOLD = 120;
const { width: SCREEN_W } = Dimensions.get("window");

interface Props {
  outfit: Outfit;
  items: WardrobeItem[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  topOffset?: number;
  zIndex?: number;
}

export function SwipeCard({ outfit, items, onSwipeLeft, onSwipeRight, topOffset = 0, zIndex = 1 }: Props) {
  const colors = useColors();
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_e, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: { x: SCREEN_W * 1.4, y: g.dy }, duration: 220, useNativeDriver: false }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            onSwipeRight?.();
          });
        } else if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: { x: -SCREEN_W * 1.4, y: g.dy }, duration: 220, useNativeDriver: false }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            onSwipeLeft?.();
          });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 6 }).start();
        }
      },
    }),
  ).current;

  const rotate = pan.x.interpolate({ inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2], outputRange: ["-9deg", "0deg", "9deg"] });
  const likeOpacity = pan.x.interpolate({ inputRange: [0, 80, 200], outputRange: [0, 0.6, 1] });
  const nopeOpacity = pan.x.interpolate({ inputRange: [-200, -80, 0], outputRange: [1, 0.6, 0] });

  const shoes = items.find((i) => i.category === "shoes");
  const dress = items.find((i) => i.category === "dress");
  const top = items.find((i) => i.category === "top");
  const bottom = items.find((i) => i.category === "bottom");
  const layer = items.find((i) => i.category === "outerwear");

  const heroItems = dress
    ? [dress, shoes].filter(Boolean) as WardrobeItem[]
    : [layer, top, bottom, shoes].filter(Boolean) as WardrobeItem[];

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          top: topOffset,
          zIndex,
          transform: [...pan.getTranslateTransform(), { rotate }],
        },
      ]}
    >
      <View style={styles.collage}>
        {heroItems.length === 2 ? (
          heroItems.map((it, idx) => (
            <View key={it.id} style={[styles.cell, { backgroundColor: colors.muted, height: idx === 0 ? "70%" : "30%" }]}>
              <Image source={{ uri: it.imageUri }} style={styles.img} contentFit="cover" />
            </View>
          ))
        ) : (
          <View style={styles.gridWrap}>
            <View style={styles.gridLeft}>
              {heroItems.slice(0, Math.min(2, heroItems.length)).map((it) => (
                <View key={it.id} style={[styles.gridCell, { backgroundColor: colors.muted }]}>
                  <Image source={{ uri: it.imageUri }} style={styles.img} contentFit="cover" />
                </View>
              ))}
            </View>
            <View style={styles.gridRight}>
              {heroItems.slice(2).map((it) => (
                <View key={it.id} style={[styles.gridCell, { backgroundColor: colors.muted }]}>
                  <Image source={{ uri: it.imageUri }} style={styles.img} contentFit="cover" />
                </View>
              ))}
              {heroItems.length === 3 ? (
                <View style={[styles.gridCell, { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }]}>
                  <Feather name="more-horizontal" size={20} color={colors.mutedForeground} />
                </View>
              ) : null}
            </View>
          </View>
        )}
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.55)"]} style={styles.gradient} />

        <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity, borderColor: colors.accent }]}>
          <Text style={[styles.stampText, { color: colors.accent }]}>SAVE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity, borderColor: colors.destructive }]}>
          <Text style={[styles.stampText, { color: colors.destructive }]}>PASS</Text>
        </Animated.View>

        <View style={styles.overlay}>
          <View style={styles.scoreRow}>
            <View style={[styles.scorePill, { backgroundColor: "rgba(255,255,255,0.92)" }]}>
              <Feather name="star" size={11} color="#1C1A18" />
              <Text style={styles.scoreText}>{outfit.score}</Text>
            </View>
            <View style={[styles.scorePill, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
              <Text style={[styles.occasionText, { color: "#fff" }]}>
                {OCCASION_LABELS[outfit.occasion]}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>Look #{outfit.id.slice(-4).toUpperCase()}</Text>
          <View style={styles.itemRow}>
            {items.map((it) => (
              <View key={it.id} style={styles.itemTag}>
                <View style={[styles.dot, { backgroundColor: COLOR_SWATCHES[it.color] }]} />
                <Text style={styles.itemTagText}>{CATEGORY_LABELS[it.category]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

interface ActionsProps {
  onPass: () => void;
  onSave: () => void;
  onWear: () => void;
}

export function SwipeActions({ onPass, onSave, onWear }: ActionsProps) {
  const colors = useColors();
  return (
    <View style={actionStyles.row}>
      <Pressable
        onPress={onPass}
        style={({ pressed }) => [
          actionStyles.btn,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}
      >
        <Feather name="x" size={26} color={colors.destructive} />
      </Pressable>
      <Pressable
        onPress={onWear}
        style={({ pressed }) => [
          actionStyles.btnLarge,
          {
            backgroundColor: colors.primary,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <Feather name="sun" size={22} color={colors.primaryForeground} />
      </Pressable>
      <Pressable
        onPress={onSave}
        style={({ pressed }) => [
          actionStyles.btn,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}
      >
        <Feather name="bookmark" size={22} color={colors.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "100%",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  collage: {
    flex: 1,
  },
  cell: {
    width: "100%",
    overflow: "hidden",
  },
  gridWrap: {
    flex: 1,
    flexDirection: "row",
  },
  gridLeft: { flex: 1.4, gap: 0 },
  gridRight: { flex: 1, gap: 0 },
  gridCell: { flex: 1, overflow: "hidden" },
  img: { width: "100%", height: "100%" },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 22,
    gap: 10,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 8,
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  scoreText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#1C1A18",
    letterSpacing: 0.5,
  },
  occasionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: "Inter_700Bold",
    color: "#fff",
    fontSize: 26,
    letterSpacing: -0.4,
  },
  itemRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  itemTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
  },
  itemTagText: {
    fontFamily: "Inter_500Medium",
    color: "#fff",
    fontSize: 11,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stamp: {
    position: "absolute",
    top: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 3,
    borderRadius: 8,
    transform: [{ rotate: "-12deg" }],
  },
  stampLike: { right: 24 },
  stampNope: { left: 24, transform: [{ rotate: "12deg" }] },
  stampText: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: 2,
  },
});

const actionStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 22,
    paddingVertical: 8,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});

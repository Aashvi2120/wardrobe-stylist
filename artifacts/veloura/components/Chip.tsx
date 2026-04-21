import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  swatch?: string;
  compact?: boolean;
}

export function Chip({ label, selected, onPress, swatch, compact }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          paddingVertical: compact ? 8 : 10,
          paddingHorizontal: compact ? 12 : 14,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {swatch ? (
        <View
          style={[
            styles.swatch,
            { backgroundColor: swatch, borderColor: selected ? colors.primaryForeground : colors.border },
          ]}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          {
            color: selected ? colors.primaryForeground : colors.foreground,
            fontSize: compact ? 12 : 13,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  label: {
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
});

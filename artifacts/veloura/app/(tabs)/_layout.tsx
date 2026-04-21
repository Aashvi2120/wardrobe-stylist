import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "square.grid.2x2", selected: "square.grid.2x2.fill" }} />
        <Label>Wardrobe</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="outfits">
        <Icon sf={{ default: "sparkles", selected: "sparkles" }} />
        <Label>Outfits</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} />
        <Label>You</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

interface TabIconProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  focused: boolean;
}

function TabBarItem({ icon, label, focused }: TabIconProps) {
  const colors = useColors();
  return (
    <View style={tabStyles.itemWrap}>
      <View style={[tabStyles.dot, { backgroundColor: focused ? colors.accent : "transparent" }]} />
      {focused ? (
        <LinearGradient
          colors={[colors.primary, "#2C2723"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[tabStyles.iconBubble, tabStyles.iconBubbleActive, { borderColor: colors.accent, shadowColor: colors.accent }]}
        >
          <Feather name={icon} size={18} color={colors.primaryForeground} />
        </LinearGradient>
      ) : (
        <View style={tabStyles.iconBubble}>
          <Feather name={icon} size={20} color={colors.mutedForeground} />
        </View>
      )}
      <Text
        style={[
          tabStyles.label,
          {
            color: focused ? colors.foreground : colors.mutedForeground,
            fontFamily: focused ? "Inter_600SemiBold" : "Inter_500Medium",
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const TABS: { name: "index" | "outfits" | "profile"; title: string; icon: keyof typeof Feather.glyphMap }[] = [
    { name: "index", title: "Wardrobe", icon: "grid" },
    { name: "outfits", title: "Outfits", icon: "star" },
    { name: "profile", title: "You", icon: "user" },
  ];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarItemStyle: { height: 76 },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0.5,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 92 : undefined,
          paddingTop: 6,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused }) => <TabBarItem icon={t.icon} label={t.title} focused={focused} />,
            tabBarButton: (props) => (
              <Pressable
                onPress={props.onPress}
                onLongPress={props.onLongPress}
                style={({ pressed }) => [
                  { flex: 1, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.85 : 1 },
                ]}
              >
                {props.children}
              </Pressable>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const tabStyles = StyleSheet.create({
  itemWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: 70,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  iconBubble: {
    width: 42,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBubbleActive: {
    borderWidth: 1,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.4,
    marginTop: 2,
  },
});

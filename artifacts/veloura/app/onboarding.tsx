import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { useVeloura } from "@/contexts/VelouraContext";
import { useColors } from "@/hooks/useColors";
import type { StylePreference } from "@/lib/types";

const STYLES: { key: StylePreference; label: string }[] = [
  { key: "minimalist", label: "Minimalist" },
  { key: "classic", label: "Classic" },
  { key: "bohemian", label: "Bohemian" },
  { key: "streetwear", label: "Streetwear" },
  { key: "romantic", label: "Romantic" },
  { key: "edgy", label: "Edgy" },
];

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveProfile } = useVeloura();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [name, setName] = useState("");
  const [style, setStyle] = useState<StylePreference | null>(null);

  const next = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (!name.trim()) return;
      setStep(2);
    } else {
      await saveProfile({
        name: name.trim(),
        style: style ?? undefined,
        createdAt: Date.now(),
      });
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 12;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.heroWrap}>
        <Image
          source={require("../assets/images/onboarding-hero.png")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={[
            "rgba(15,14,13,0.05)",
            colors.background + "00",
            colors.background,
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.brandRow, { paddingTop: topPad }]}>
          <View style={[styles.logo, { backgroundColor: colors.foreground }]}>
            <Text style={[styles.logoText, { color: colors.background }]}>V</Text>
          </View>
          <Text style={[styles.brand, { color: colors.foreground }]}>VELOURA</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>
          {step === 0 ? "WELCOME" : step === 1 ? "STEP 02" : "STEP 03"}
        </Text>

        {step === 0 ? (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Your personal{`\n`}AI atelier.
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Photograph the pieces you own. Veloura composes outfits with the eye of a quiet, confident stylist.
            </Text>
          </>
        ) : step === 1 ? (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>What should we call you?</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              We&apos;ll use this to address your daily edits.
            </Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Feather name="user" size={16} color={colors.mutedForeground} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground }]}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={next}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>What is your style?</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Optional — Veloura will lean into this aesthetic.
            </Text>
            <View style={styles.chipWrap}>
              {STYLES.map((s) => (
                <Chip key={s.key} label={s.label} selected={style === s.key} onPress={() => setStyle(s.key)} />
              ))}
            </View>
          </>
        )}

        <View style={{ flex: 1 }} />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: step >= i ? colors.foreground : colors.border,
                    width: step === i ? 24 : 6,
                  },
                ]}
              />
            ))}
          </View>
          <Button
            label={step === 0 ? "Begin" : step === 1 ? "Continue" : "Enter Veloura"}
            onPress={next}
            disabled={step === 1 && !name.trim()}
            icon={<Feather name="arrow-right" size={16} color={colors.primaryForeground} />}
          />
          {step === 2 ? (
            <Pressable onPress={() => saveProfile({ name: name.trim(), createdAt: Date.now() })}>
              <Text style={[styles.skip, { color: colors.mutedForeground }]}>Skip for now</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroWrap: {
    height: "42%",
    width: "100%",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 22,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -1,
  },
  brand: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 16,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 2.6,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 38,
    letterSpacing: -1.2,
    lineHeight: 42,
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  footer: {
    gap: 18,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  skip: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    paddingVertical: 6,
  },
});

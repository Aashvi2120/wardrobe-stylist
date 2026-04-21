import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import {
  CATEGORY_LABELS,
  COLOR_SWATCHES,
  OCCASION_LABELS,
  type Category,
  type ColorName,
  type Occasion,
} from "@/lib/types";
import { uid } from "@/lib/uuid";

const CATEGORIES: Category[] = ["top", "bottom", "dress", "outerwear", "shoes", "accessory"];
const OCCASIONS: Occasion[] = ["casual", "formal", "business", "evening", "ethnic", "athleisure", "streetwear"];
const COLORS_LIST: ColorName[] = Object.keys(COLOR_SWATCHES) as ColorName[];

// Naive heuristic to suggest a category based on the chosen filename or aspect.
function guessCategory(): Category {
  return "top";
}

export default function AddItem() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem } = useVeloura();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("top");
  const [color, setColor] = useState<ColorName>("black");
  const [tags, setTags] = useState<Occasion[]>(["casual"]);
  const [saving, setSaving] = useState(false);

  const pick = async (source: "library" | "camera") => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Camera access needed", "Allow camera access to photograph your pieces.");
        return;
      }
      const r = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [4, 5] });
      if (!r.canceled && r.assets?.[0]) {
        setImageUri(r.assets[0].uri);
        setCategory((prev) => (prev === "top" ? guessCategory() : prev));
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Photos access needed", "Allow photo library access to choose a piece.");
        return;
      }
      const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: true, aspect: [4, 5] });
      if (!r.canceled && r.assets?.[0]) setImageUri(r.assets[0].uri);
    }
  };

  const toggleTag = (t: Occasion) => {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  const canSave = useMemo(() => !!imageUri, [imageUri]);

  const save = async () => {
    if (!imageUri) return;
    setSaving(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addItem({
      id: uid(),
      imageUri,
      name: name.trim() || undefined,
      category,
      color,
      tags,
      createdAt: Date.now(),
    });
    setSaving(false);
    router.back();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 4;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>New piece</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 22, gap: 22, paddingBottom: 60 }}
      >
        {imageUri ? (
          <View style={[styles.imageBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <Pressable
              onPress={() => setImageUri(null)}
              style={[styles.imageOverlay, { backgroundColor: "rgba(0,0,0,0.55)" }]}
            >
              <Feather name="refresh-cw" size={14} color="#fff" />
              <Text style={styles.imageOverlayText}>Change photo</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.imageBox, { backgroundColor: colors.card, borderColor: colors.border, borderStyle: "dashed" }]}>
            <View style={styles.pickRow}>
              <Pressable
                onPress={() => pick("camera")}
                style={({ pressed }) => [styles.pickBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              >
                <Feather name="camera" size={18} color={colors.primaryForeground} />
                <Text style={[styles.pickBtnText, { color: colors.primaryForeground }]}>Camera</Text>
              </Pressable>
              <Pressable
                onPress={() => pick("library")}
                style={({ pressed }) => [
                  styles.pickBtn,
                  { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Feather name="image" size={18} color={colors.foreground} />
                <Text style={[styles.pickBtnText, { color: colors.foreground }]}>Library</Text>
              </Pressable>
            </View>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>Use a clean background for the most flattering edits.</Text>
          </View>
        )}

        <Field label="Name" hint="Optional">
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Camel wool blazer"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
            />
          </View>
        </Field>

        <Field label="Category">
          <View style={styles.chipWrap}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={CATEGORY_LABELS[c]} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </Field>

        <Field label="Dominant color">
          <View style={styles.chipWrap}>
            {COLORS_LIST.map((c) => (
              <Chip
                key={c}
                label={c.charAt(0).toUpperCase() + c.slice(1)}
                selected={color === c}
                swatch={COLOR_SWATCHES[c]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </Field>

        <Field label="Occasion" hint="Choose all that apply">
          <View style={styles.chipWrap}>
            {OCCASIONS.map((o) => (
              <Chip key={o} label={OCCASION_LABELS[o]} selected={tags.includes(o)} onPress={() => toggleTag(o)} />
            ))}
          </View>
        </Field>

        <Button label={saving ? "Saving…" : "Save piece"} onPress={save} disabled={!canSave} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        {hint ? <Text style={[styles.hintInline, { color: colors.mutedForeground }]}>{hint}</Text> : null}
      </View>
      {children}
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
    paddingBottom: 8,
  },
  iconBtn: { padding: 4 },
  topTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    letterSpacing: 0.4,
  },
  imageBox: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    padding: 22,
  },
  pickRow: {
    flexDirection: "row",
    gap: 12,
  },
  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  pickBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
  hintInline: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
  },
  imageOverlayText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#fff",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: -0.1,
  },
  inputWrap: {
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
  },
  input: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});

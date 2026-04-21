import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
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
import { useVeloura } from "@/contexts/VelouraContext";
import { useColors } from "@/hooks/useColors";
import { validateEmail, validateName, validatePassword } from "@/lib/auth";

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useVeloura();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const submit = async () => {
    if (busy) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    if (nErr) return setError(nErr);
    if (eErr) return setError(eErr);
    if (pErr) return setError(pErr);

    setBusy(true);
    const result = await signUp(name, email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 12;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.heroWrap}>
        <Image
          source={require("../../assets/images/onboarding-hero.png")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(15,14,13,0.05)", colors.background + "00", colors.background]}
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

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.accent }]}>JOIN VELOURA</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Create your{`\n`}atelier.</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          A few details and we&apos;ll start composing looks tailored to you.
        </Text>

        <View style={{ gap: 12, marginTop: 10 }}>
          <Field
            icon="user"
            placeholder="Your name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError(null);
            }}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <Field
            ref={emailRef}
            icon="mail"
            placeholder="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
            }}
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <Field
            ref={passwordRef}
            icon="lock"
            placeholder="Password (6+ characters)"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError(null);
            }}
            secureTextEntry={!showPwd}
            autoComplete="password-new"
            returnKeyType="go"
            onSubmitEditing={submit}
            trailing={
              <Pressable onPress={() => setShowPwd((s) => !s)} hitSlop={10}>
                <Feather name={showPwd ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </Pressable>
            }
          />
        </View>

        {error ? (
          <View style={[styles.errorBox, { borderColor: colors.destructive + "55", backgroundColor: colors.destructive + "12" }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 18 }}>
          <Button
            label={busy ? "Creating account…" : "Create account"}
            onPress={submit}
            disabled={busy}
            icon={<Feather name="arrow-right" size={16} color={colors.primaryForeground} />}
          />
        </View>

        <View style={styles.footRow}>
          <Text style={[styles.footText, { color: colors.mutedForeground }]}>Already with us?</Text>
          <Link href="/(auth)/login" replace asChild>
            <Pressable hitSlop={8}>
              <Text style={[styles.footLink, { color: colors.foreground }]}>Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Field = React.forwardRef<TextInput, {
  icon: keyof typeof Feather.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: React.ComponentProps<typeof TextInput>["autoComplete"];
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  returnKeyType?: React.ComponentProps<typeof TextInput>["returnKeyType"];
  onSubmitEditing?: () => void;
  trailing?: React.ReactNode;
}>(function Field(
  {
    icon,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    autoCapitalize = "none",
    autoComplete,
    keyboardType,
    returnKeyType,
    onSubmitEditing,
    trailing,
  },
  ref,
) {
  const colors = useColors();
  return (
    <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Feather name={icon} size={16} color={colors.mutedForeground} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { color: colors.foreground }]}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
      {trailing}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroWrap: { height: "26%", width: "100%" },
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
  logoText: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -1 },
  brand: { fontFamily: "Inter_700Bold", fontSize: 14, letterSpacing: 4 },
  body: { paddingHorizontal: 26, paddingTop: 12, paddingBottom: 40, gap: 12 },
  eyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 2.6 },
  title: { fontFamily: "Inter_700Bold", fontSize: 32, letterSpacing: -1.2, lineHeight: 38 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  errorText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 17 },
  footRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
  },
  footText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  footLink: { fontFamily: "Inter_600SemiBold", fontSize: 13, letterSpacing: 0.2 },
});

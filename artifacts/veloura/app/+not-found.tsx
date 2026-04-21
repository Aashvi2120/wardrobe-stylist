import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function NotFoundScreen() {
  const colors = useColors();
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>This page does not exist.</Text>
        <Link href="/" style={[styles.link, { color: colors.accent }]}>
          Go back to your atelier
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  link: { fontFamily: "Inter_500Medium", fontSize: 14 },
});

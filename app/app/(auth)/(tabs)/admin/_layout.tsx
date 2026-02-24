import { BackButtonLayout } from "@components/back-button";
import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <BackButtonLayout>
      <Stack.Screen name="roles" options={{ headerShown: false }} />
    </BackButtonLayout>
  );
}

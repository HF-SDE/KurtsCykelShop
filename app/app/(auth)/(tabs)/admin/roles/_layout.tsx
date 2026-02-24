import { BackButtonLayout } from "@components/back-button";
import { Text } from "@components/ui/text";
import { Stack } from "expo-router";

export default function StorageLayout() {
  return (
    <BackButtonLayout>
      <Stack.Screen name="new" options={{ headerTitle: () => <Text size="2xl">Ny rolle</Text> }} />
      <Stack.Screen name="[id]/edit" options={{ headerTitle: () => <Text size="2xl">Rediger rolle</Text> }} />
    </BackButtonLayout>
  );
}

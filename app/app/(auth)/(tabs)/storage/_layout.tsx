import { BackButtonLayout } from "@components/back-button";
import { Text } from "@components/ui/text";
import { Stack } from "expo-router";

import StorageProvider from "./ctx";

export default function StorageLayout() {
  return (
    <StorageProvider>
      <BackButtonLayout>
        <Stack.Screen name="new-item" options={{ headerTitle: () => <Text size="2xl">Ny genstand</Text> }} />
        <Stack.Screen name="[id]/edit-item" options={{ headerTitle: () => <Text size="2xl">Rediger genstand</Text> }} />
      </BackButtonLayout>
    </StorageProvider>
  );
}

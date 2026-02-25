import { BackButtonLayout } from "@components/back-button";
import { Button, ButtonIcon } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { Stack } from "expo-router";
import { Save } from "lucide-react-native";

import RoleProvider from "./ctx";

export const unstable_settings = {
  initialRouteName: "roles",
};

export default function StorageLayout() {
  return (
    <RoleProvider>
      <BackButtonLayout>
        <Stack.Screen name="roles" options={{ headerShown: true, headerTitle: () => <Text size="2xl">Roller</Text> }} />
        <Stack.Screen name="new" options={{ headerTitle: () => <Text size="2xl">Ny rolle</Text> }} />
        <Stack.Screen
          name="[id]/edit"
          options={{
            headerTitle: () => <Text size="2xl">Rediger rolle</Text>,
            headerRight: () => (
              <Button variant="link" action="secondary" className="px-0">
                <ButtonIcon as={Save} size="xl" />
              </Button>
            ),
          }}
        />
      </BackButtonLayout>
    </RoleProvider>
  );
}

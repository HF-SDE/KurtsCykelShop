import { Platform } from "react-native";

import { BackButtonLayout } from "@components/back-button";
import { Text } from "@components/ui/text";
import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useRouter } from "expo-router";

import RoleProvider from "./ctx";

export const unstable_settings = {
  initialRouteName: "roles",
};

export default function RolesLayout() {
  const router = useRouter();
  const useCustomBackButton = Platform.OS === "ios";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(auth)/(tabs)/admin");
  };

  return (
    <RoleProvider>
      <BackButtonLayout>
        <Stack.Screen
          name="roles"
          options={{
            headerShown: true,
            headerTitle: () => <Text size="2xl">Roller</Text>,
            headerBackVisible: !useCustomBackButton,
            headerLeft: useCustomBackButton
              ? (props) => <HeaderBackButton {...props} onPress={handleBack} />
              : undefined,
          }}
        />
        <Stack.Screen
          name="new"
          options={{
            headerShown: true,
            headerTitle: () => <Text size="2xl">Ny rolle</Text>,
            headerBackVisible: !useCustomBackButton,
            headerLeft: useCustomBackButton
              ? (props) => <HeaderBackButton {...props} onPress={handleBack} />
              : undefined,
          }}
        />
        <Stack.Screen
          name="[id]/edit"
          options={{
            headerShown: true,
            headerTitle: () => <Text size="2xl">Rediger rolle</Text>,
            headerBackVisible: !useCustomBackButton,
            headerLeft: useCustomBackButton
              ? (props) => <HeaderBackButton {...props} onPress={handleBack} />
              : undefined,
          }}
        />
      </BackButtonLayout>
    </RoleProvider>
  );
}

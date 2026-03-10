import { Platform } from "react-native";

import { BackButtonLayout } from "@components/back-button";
import { Text } from "@components/ui/text";
import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useRouter } from "expo-router";

import UsersProvider from "./ctx";

export const unstable_settings = {
  initialRouteName: "users",
};

export default function UsersLayout() {
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
    <UsersProvider>
      <BackButtonLayout>
        <Stack.Screen
          name="users"
          options={{
            headerShown: true,
            headerTitle: () => <Text size="2xl">Brugere</Text>,
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
            headerTitle: () => <Text size="2xl">Ny bruger</Text>,
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
            headerTitle: () => <Text size="2xl">Rediger bruger</Text>,
            headerBackVisible: !useCustomBackButton,
            headerLeft: useCustomBackButton
              ? (props) => <HeaderBackButton {...props} onPress={handleBack} />
              : undefined,
          }}
        />
      </BackButtonLayout>
    </UsersProvider>
  );
}

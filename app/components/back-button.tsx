import { Platform, View } from "react-native";

import { Box } from "@components/ui/box";
import { Button, ButtonIcon } from "@components/ui/button";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

export function BackButtonLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,
        headerTitle: "",
        headerBackground: () => <Box className="bg-background-0 flex-1" />,
        headerLeft: () => (
          <View style={{ marginTop: Platform.OS === "android" ? -20 : 0 }}>
            <Button
              onPress={() => router.back()}
              size="4xl"
              action="secondary"
              variant="link"
              className="h-10 w-10 !border-0"
            >
              <ButtonIcon as={ChevronLeft} />
            </Button>
          </View>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

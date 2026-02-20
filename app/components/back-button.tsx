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
          <Button onPress={() => router.back()} size="4xl" action="secondary" variant="link">
            <ButtonIcon as={ChevronLeft} />
          </Button>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

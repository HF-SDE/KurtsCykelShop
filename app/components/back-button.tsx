import { Box } from "@components/ui/box";
import { Button, ButtonIcon } from "@components/ui/button";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { Center } from "./ui/center";

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
          <Button
            onPress={() => router.back()}
            action="secondary"
            variant="link"
            className="flex items-center justify-center !border-0"
          >
            <Center>
              <ButtonIcon size="3xl" className="ml-1" as={ChevronLeft} />
            </Center>
          </Button>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

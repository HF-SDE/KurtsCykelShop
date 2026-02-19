import { Box } from "@components/ui/box";
import { Button, ButtonIcon } from "@components/ui/button";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function StorageLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,
        headerTitle: "",
        headerBackground: () => <Box className="bg-background-0 flex-1" />,
        headerLeft: () => (
          <Button onPress={() => router.back()} size="3xl" className="p-3" variant="link">
            <ButtonIcon as={ArrowLeft} />
          </Button>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

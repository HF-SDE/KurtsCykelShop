import { Button, View } from "react-native";

import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View
      className="bg-background-0"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-typography-900 mb-4">
        Edit app/index.tsx to edit this screen.
      </Text>
      <Box className="bg-primary-500 mb-4 p-5">
        <Text className="text-typography-0">This is the Box</Text>
      </Box>
      <Input variant="outline" size="md" className="w-64">
        <InputField placeholder="Enter Text here..." />
      </Input>

      <Button title="Go to tabs" onPress={() => router.push("/tabs/tab1")} />
    </View>
  );
}

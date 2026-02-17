import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      className="bg-background-0"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-typography-900 mb-4">Edit app/index.tsx to edit this screen.</Text>
      <Box className="bg-primary-500 p-5 mb-4">
        <Text className="text-typography-0">This is the Box</Text>
      </Box>
      <Input
        variant="outline"
        size="md"
        className="w-64"
      >
        <InputField placeholder="Enter Text here..." />
      </Input>
    </View>
  );
}

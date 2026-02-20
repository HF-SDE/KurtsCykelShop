import { View } from "react-native";

import { NewCase } from "@components/cases/new/newCase";

export default function NewCaseScreen() {
  return (
    <View className="bg-background-0 flex-1">
      <NewCase />
    </View>
  );
}

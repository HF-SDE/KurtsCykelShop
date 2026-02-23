import { View } from "react-native";

import { CasesSection } from "@/components/cases/casesSection";
import { Text } from "@/components/ui/text";

export default function Tab1() {
  return (
    <View className="bg-background-0 flex-1 p-4">
      <CasesSection />
    </View>
  );
}

import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CasesSection } from "@/components/cases/casesSection";
import { Text } from "@/components/ui/text";

export default function Tab1() {
  return (
    <SafeAreaView className="bg-background-0 flex-1 p-4">
      <CasesSection />
    </SafeAreaView>
  );
}

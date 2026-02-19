import { ScrollView } from "react-native";

import { Text } from "@components/ui/text";
import { VStack } from "@components/ui/vstack";

import { CasesActionRow } from "./casesActionRow";
import { CasesTable } from "./casesTable";

export function CasesSection() {
  return (
    <>
      <VStack>
        <Text size="3xl" bold>
          Sager
        </Text>
        <Text className="mb-4 mt-2">Se overblik over alle reperationer og serviceeftersyn.</Text>
      </VStack>
      <CasesActionRow />
      <ScrollView>
        <CasesTable />
      </ScrollView>
    </>
  );
}

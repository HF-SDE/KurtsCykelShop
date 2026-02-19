import { Input } from "@components/ui/input";

import { Button } from "../ui/button";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text/index";

export function CasesActionRow() {
  return (
    <HStack space="md" className="flex gap-4">
      <Button variant="solid" className="bg-typography-900  flex-1 ">
        <Text bold className="text-typography-100">
          Opret ny
        </Text>
      </Button>
      <Button variant="solid" className="text-typography-900 border- flex-1  bg-transparent">
        <Text>Filtre</Text>
      </Button>
    </HStack>
  );
}

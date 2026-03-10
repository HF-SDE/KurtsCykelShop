import { Button } from "../ui/button";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text/index";

export function CasesActionRow() {
  return (
    <HStack space="md" className="flex gap-4">
      <Button action="default" variant="solid" className="bg-secondary-950 flex-1">
        <Text bold className="text-typography-100">
          Opret ny
        </Text>
      </Button>
      <Button action="default" variant="outline" className="text-typography-900 border-typography-900 flex-1">
        <Text>Filtre</Text>
      </Button>
    </HStack>
  );
}

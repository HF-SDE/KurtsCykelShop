import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";

export function CaseTableHeader() {
  return (
    <Box className="border-outline-200 bg-background-0 flex-row border-b">
      <Text className="text-typography-800 flex-[2] px-6 py-[14px] text-left text-[16px] font-bold leading-[22px]">
        Kunde
      </Text>
      <Text className="text-typography-800 flex-1 px-6 py-[14px] text-left text-[16px] font-bold leading-[22px]">
        Dato
      </Text>
      <Text className="text-typography-800 flex-1 px-6 py-[14px] text-left text-[16px] font-bold leading-[22px]">
        Status
      </Text>
    </Box>
  );
}

import { Pressable } from "react-native";

import { ServiceOrderData } from "@/types/serviceOrders/Extentions/ServiceOrderData";

import { Badge, BadgeText } from "@components/ui/badge";
import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";
import { formatDate } from "@utils/formatDate";

const statusConfig: Record<string, { action: "success" | "warning" | "info" | "error"; label: string }> = {
  completed: { action: "success", label: "Afsluttet" },
  cancelled: { action: "error", label: "Annuleret" },
  "in-progress": { action: "info", label: "I gang" },
  pending: { action: "warning", label: "Afventer" },
};

export function CaseRow({ caseItem, onPress }: { caseItem: ServiceOrderData; onPress: () => void }) {
  const statusInfo = statusConfig[caseItem.status] || {
    action: "info" as const,
    label: caseItem.status,
  };

  return (
    <Pressable onPress={onPress}>
      {({ hovered, pressed }) => (
        <Box
          className={`border-outline-200 flex-row border-b ${pressed ? "bg-background-100" : hovered ? "bg-background-50" : "bg-background-0"}`}
        >
          <Box className="flex-[2] justify-center" pointerEvents="none">
            <Text className="text-typography-800 px-6 py-[14px] text-left text-[16px] font-medium leading-[22px]">
              {caseItem.customer ? `${caseItem.customer.firstName} ${caseItem.customer.lastName}` : "Ukendt kunde"}
            </Text>
          </Box>
          <Box className="flex-1 justify-center" pointerEvents="none">
            <Text className="text-typography-800 px-6 py-[14px] text-left text-[16px] font-medium leading-[22px]">
              {formatDate(caseItem.createdAt)}
            </Text>
          </Box>
          <Box className="flex-1 items-start justify-center px-6 py-[7px]">
            <Badge action={statusInfo.action}>
              <BadgeText>{statusInfo.label}</BadgeText>
            </Badge>
          </Box>
        </Box>
      )}
    </Pressable>
  );
}

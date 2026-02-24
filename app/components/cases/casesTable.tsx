import { Pressable } from "react-native";

import { Table, TableBody, TableData, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ServiceOrderData } from "@/types/serviceOrders/Extentions/ServiceOrderData";

import { Badge, BadgeText } from "@components/ui/badge";
import { Text } from "@components/ui/text";
import { useRouter } from "expo-router";

interface CasesTableProps {
  serviceOrders: ServiceOrderData[];
}

const statusConfig: Record<string, { action: "success" | "warning" | "info" | "error"; label: string }> = {
  completed: { action: "success", label: "Afsluttet" },
  cancelled: { action: "error", label: "Annuleret" },
  "in-progress": { action: "info", label: "I gang" },
  pending: { action: "warning", label: "Afventer" },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function CasesTable({ serviceOrders }: CasesTableProps) {
  const router = useRouter();

  if (serviceOrders.length === 0) {
    return <Text className="text-typography-500 py-8 text-center">Ingen sager fundet med de valgte filtre</Text>;
  }

  return (
    <Table className="w-full">
      <TableBody>
        {serviceOrders.map((serviceOrder) => {
          const statusInfo = statusConfig[serviceOrder.status] || {
            action: "info" as const,
            label: serviceOrder.status,
          };

          return (
            <Pressable key={serviceOrder.id} onPress={() => router.push(`/case/${serviceOrder.id}`)}>
              <TableRow>
                <TableData>
                  {serviceOrder.customer
                    ? `${serviceOrder.customer.firstName} ${serviceOrder.customer.lastName}`
                    : "Ukendt kunde"}
                </TableData>
                <TableData>{formatDate(serviceOrder.createdAt)}</TableData>
                <TableData>
                  <Badge action={statusInfo.action}>
                    <BadgeText>{statusInfo.label}</BadgeText>
                  </Badge>
                </TableData>
              </TableRow>
            </Pressable>
          );
        })}
      </TableBody>
    </Table>
  );
}

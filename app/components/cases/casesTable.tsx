import { Pressable } from "react-native";

import { Table, TableBody, TableData, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Badge, BadgeText } from "@components/ui/badge";
import { Text } from "@components/ui/text";
import { useRouter } from "expo-router";

import type { Case } from "./casesSection";

interface CasesTableProps {
  cases: Case[];
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

export function CasesTable({ cases }: CasesTableProps) {
  const router = useRouter();

  if (cases.length === 0) {
    return <Text className="text-typography-500 py-8 text-center">Ingen sager fundet med de valgte filtre</Text>;
  }

  return (
    <Table className="w-full">
      <TableBody>
        {cases.map((caseItem) => {
          const statusInfo = statusConfig[caseItem.status] || {
            action: "info" as const,
            label: caseItem.status,
          };

          return (
            <Pressable key={caseItem.id} onPress={() => router.push(`/case/${caseItem.id}`)}>
              <TableRow>
                <TableData>{caseItem.customerName}</TableData>
                <TableData>{formatDate(caseItem.date)}</TableData>
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

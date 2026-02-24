import React from "react";
import { Alert } from "react-native";

import { type Employee, EmployeeSelectField } from "@/components/cases/new/EmployeeSelectField";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

import { User } from "lucide-react-native";

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
}

interface EmployeeAssignmentCardProps {
  assignedTo: UserInfo | null;
  assignedBy: UserInfo;
  serviceOrderId: string;
  onAssignmentUpdated?: () => void;
}

export function EmployeeAssignmentCard({
  assignedTo,
  assignedBy,
  serviceOrderId,
  onAssignmentUpdated,
}: EmployeeAssignmentCardProps) {
  const toast = useToast();

  const handleEmployeeChange = async (employee: Employee | null) => {
    try {
      // TODO: Call API
      // await apiClient.patch(`/service-orders/${serviceOrderId}`, { assignedToId: employee?.id || null });
      console.log("Updating assigned employee:", employee);
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Medarbejder opdateret</ToastTitle>
          </Toast>
        ),
      });

      onAssignmentUpdated?.();
    } catch (error) {
      console.error("Error updating employee:", error);
      Alert.alert("Fejl", "Kunne ikke opdatere medarbejder");
    }
  };

  return (
    <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
      <Heading size="lg" className="text-typography-900">
        Tildeling
      </Heading>

      <EmployeeSelectField
        selectedEmployee={
          assignedTo
            ? {
                id: assignedTo.id,
                firstName: assignedTo.firstName,
                lastName: assignedTo.lastName,
                initials: assignedTo.initials,
              }
            : null
        }
        onEmployeeChange={handleEmployeeChange}
      />

      <VStack space="xs" className="border-outline-100 mt-2 border-t pt-4">
        <Text className="text-typography-500 text-sm">Oprettet af</Text>
        <HStack space="sm" className="items-center">
          <Icon as={User} size="sm" className="text-typography-500" />
          <Text className="text-typography-700">
            {assignedBy.firstName} {assignedBy.lastName} ({assignedBy.initials})
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );
}

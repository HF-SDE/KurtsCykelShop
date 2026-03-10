import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ChevronDownIcon, Icon } from "@/components/ui/icon";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
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

interface Employee {
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(assignedTo);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get("/user");
        if (response.data?.data) {
          const users = response.data.data.map((user: any) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            initials: user.initials,
          }));
          setEmployees(users);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Sync selectedEmployee with assignedTo prop
  useEffect(() => {
    setSelectedEmployee(assignedTo);
  }, [assignedTo]);

  const handleEmployeeChange = async (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId) || null;

    // Optimistically update UI
    setSelectedEmployee(employee);
    setIsUpdating(true);

    try {
      await apiClient.patch(`/service-orders/${serviceOrderId}`, {
        assignedToId: employee?.id || null,
      });

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
      // Revert on error
      setSelectedEmployee(assignedTo);
      Alert.alert("Fejl", "Kunne ikke opdatere medarbejder");
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedLabel = selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "";

  return (
    <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
      <Heading size="lg" className="text-typography-900">
        Tildeling
      </Heading>

      <VStack space="sm">
        <Text className="text-typography-700 font-medium">Medarbejder</Text>

        {/* Show current assignment with avatar when not in select mode */}
        {selectedEmployee && !isUpdating && (
          <HStack space="md" className="mb-2 items-center">
            <Avatar size="sm">
              <AvatarFallbackText>{selectedEmployee.initials}</AvatarFallbackText>
            </Avatar>
            <VStack>
              <Text className="text-typography-900 font-medium">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </Text>
              <Text className="text-typography-500 text-sm">{selectedEmployee.initials}</Text>
            </VStack>
          </HStack>
        )}

        {isLoading ? (
          <HStack space="sm" className="items-center py-2">
            <Spinner size="small" />
            <Text className="text-typography-500">Henter medarbejdere...</Text>
          </HStack>
        ) : (
          <Select
            onValueChange={handleEmployeeChange}
            selectedValue={selectedEmployee?.id || ""}
            selectedLabel={selectedLabel}
            isDisabled={isUpdating}
          >
            <SelectTrigger variant="outline" size="md">
              <SelectInput placeholder="Vælg medarbejder" />
              {isUpdating ? (
                <Spinner size="small" className="mr-2" />
              ) : (
                <SelectIcon className="ml-auto mr-2" as={ChevronDownIcon} />
              )}
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {employees.map((employee) => (
                  <SelectItem
                    key={employee.id}
                    value={employee.id}
                    label={`${employee.firstName} ${employee.lastName} (${employee.initials})`}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        )}
      </VStack>

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

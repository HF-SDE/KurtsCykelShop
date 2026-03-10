import React, { useEffect, useState } from "react";

import { Combobox } from "@/components/combobox";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
}

interface EmployeeSelectFieldProps {
  selectedEmployee: Employee | null;
  onEmployeeChange: (employee: Employee | null) => void;
}

export function EmployeeSelectField({ selectedEmployee, onEmployeeChange }: EmployeeSelectFieldProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get("/user");
        if (response.data?.data) {
          const users: Employee[] = response.data.data.map((user: any) => ({
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

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId) || null;
    onEmployeeChange(employee);
  };

  const comboboxOptions = employees.map((e) => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName} (${e.initials})`,
  }));

  if (isLoading) {
    return (
      <VStack space="sm">
        <Text className="text-typography-700 font-medium">Medarbejder</Text>
        <HStack space="sm" className="items-center py-2">
          <Spinner size="small" />
          <Text className="text-typography-500">Henter medarbejdere...</Text>
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack space="sm">
      <Combobox
        label="Medarbejder"
        placeholder="Tildel til medarbejder"
        searchPlaceholder="Søg medarbejder..."
        emptyStateText="Ingen medarbejdere fundet"
        options={comboboxOptions}
        value={selectedEmployee?.id || ""}
        onChange={handleEmployeeSelect}
      />
    </VStack>
  );
}

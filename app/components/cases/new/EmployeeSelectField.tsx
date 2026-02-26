import React, { useState } from "react";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

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

// Mock employee data - replace with API call in production
const mockEmployees: Employee[] = [
  { id: "1", firstName: "Hans", lastName: "Hansen", initials: "HHA" },
  { id: "2", firstName: "Mette", lastName: "Jensen", initials: "MJE" },
  { id: "3", firstName: "Peter", lastName: "Nielsen", initials: "PNI" },
];

export function EmployeeSelectField({ selectedEmployee, onEmployeeChange }: EmployeeSelectFieldProps) {
  const [showEmployeeSheet, setShowEmployeeSheet] = useState(false);

  const handleEmployeeSelect = (employee: Employee) => {
    onEmployeeChange(employee);
    setShowEmployeeSheet(false);
  };

  return (
    <VStack space="sm">
      <Text className="text-typography-700 font-medium">Medarbejder</Text>
      <Button action="primary" variant="solid" onPress={() => setShowEmployeeSheet(true)}>
        <ButtonText>
          {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "Tildel til medarbejder"}
        </ButtonText>
      </Button>

      {/* Employee Selection Actionsheet */}
      <Actionsheet isOpen={showEmployeeSheet} onClose={() => setShowEmployeeSheet(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack space="sm" className="w-full p-4">
            <Heading size="lg" className="text-typography-900 mb-2">
              Vælg medarbejder
            </Heading>
            <ActionsheetScrollView>
              {mockEmployees.map((employee) => (
                <ActionsheetItem key={employee.id} onPress={() => handleEmployeeSelect(employee)}>
                  <VStack space="xs" className="flex-1">
                    <ActionsheetItemText className="text-typography-900 font-semibold">
                      {employee.firstName} {employee.lastName}
                    </ActionsheetItemText>
                    <Text className="text-typography-500 text-sm">{employee.initials}</Text>
                  </VStack>
                </ActionsheetItem>
              ))}
            </ActionsheetScrollView>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </VStack>
  );
}

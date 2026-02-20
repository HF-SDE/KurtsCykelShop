import React, { useState } from "react";
import { Platform, ScrollView } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";

import { type CustomerData, CustomerSearchSection } from "./CustomerSearchSection";
import { type Employee, EmployeeSelectField } from "./EmployeeSelectField";
import { type TaskType, TaskTypeRadio } from "./TaskTypeRadio";

export function NewCase() {
  // Customer state
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Task info state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("service");
  const [expectedCompletion, setExpectedCompletion] = useState("");

  const handleSubmit = () => {
    // TODO: Implement submission logic
    console.log("Submitting case:", {
      customer: customerData,
      employee: selectedEmployee,
      description,
      taskType,
      expectedCompletion,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // For demo purposes, set a default date
  React.useEffect(() => {
    const defaultDate = new Date("2026-03-15");
    setExpectedCompletion(formatDate(defaultDate));
  }, []);

  return (
    <ScrollView className="bg-background-50 flex-1" showsVerticalScrollIndicator={false}>
      <VStack space="lg" className="p-4 pb-8">
        {/* Customer Section */}
        <CustomerSearchSection customerData={customerData} onCustomerChange={setCustomerData} />

        {/* Task Info Section */}
        <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
          <Heading size="lg" className="text-typography-900">
            Opgave info
          </Heading>

          {/* Employee Assignment */}
          <EmployeeSelectField selectedEmployee={selectedEmployee} onEmployeeChange={setSelectedEmployee} />

          {/* Description */}
          <VStack space="sm">
            <Text className="text-typography-700 font-medium">Beskrivelse</Text>
            <Textarea size="md">
              <TextareaInput placeholder="Yap yap..." value={description} onChangeText={setDescription} />
            </Textarea>
          </VStack>

          {/* Task Type Radio */}
          <TaskTypeRadio value={taskType} onChange={setTaskType} />

          {/* Expected Completion Date */}
          <VStack space="sm">
            <Text className="text-typography-700 font-medium">Forventet færdig</Text>
            <Input variant="outline" size="md">
              <InputField placeholder="15. mar 2026" value={expectedCompletion} onChangeText={setExpectedCompletion} />
            </Input>
          </VStack>
        </VStack>

        {/* Submit Button */}
        <Button action="primary" variant="solid" size="lg" onPress={handleSubmit} className="mt-4">
          <ButtonText>Opret sag</ButtonText>
        </Button>
      </VStack>
    </ScrollView>
  );
}

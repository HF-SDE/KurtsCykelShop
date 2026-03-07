import React, { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { DatePickerDrawer } from "@/components/cases/DatePickerDrawer";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

import { CustomerData, CustomerSearchSection } from "@components/cases/new/CustomerSearchSection";
import { Employee, EmployeeSelectField } from "@components/cases/new/EmployeeSelectField";
import { TaskType, TaskTypeRadio } from "@components/cases/new/TaskTypeRadio";
import { createServiceOrder } from "@components/cases/new/createAction";
import { formatDate } from "@utils/formatDate";
import { router } from "expo-router";

export default function NewCaseScreen() {
  // states
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [taskType, setTaskType] = useState<TaskType>("service");
  const [customerData, setCustomerData] = useState<CustomerData>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [description, setDescription] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [expectedCompletion, setExpectedCompletion] = useState<Date>(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    return defaultDate;
  });

  const handleSubmit = async () => {
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await createServiceOrder({
      description,
      estimatedCompletion: expectedCompletion,
      assignedToId: selectedEmployee?.id ?? null,
      customerData,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>{result.message}</ToastTitle>
          </Toast>
        ),
      });
      return;
    }

    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Toast nativeID={id} action="success" variant="solid">
          <ToastTitle>Sag oprettet</ToastTitle>
        </Toast>
      ),
    });

    if (result.id) {
      router.replace(`/case/${result.id}`);
    } else {
      router.back();
    }
  };

  return (
    <ScrollView className="bg-background-50 flex-1" showsVerticalScrollIndicator={false}>
      <VStack space="lg" className="p-4 pb-8">
        {/* General error */}
        {fieldErrors["general"]?.[0] && (
          <VStack className="bg-error-50 border-error-200 rounded-lg border p-3">
            <Text className="text-error-700 text-sm font-medium">{fieldErrors["general"][0]}</Text>
          </VStack>
        )}

        {/* Customer Section */}
        <CustomerSearchSection
          customerData={customerData}
          onCustomerChange={(data) => {
            setCustomerData(data);
          }}
          errors={{
            firstName: fieldErrors["customerFirstName"]?.[0],
            lastName: fieldErrors["customerLastName"]?.[0],
            email: fieldErrors["customerEmail"]?.[0],
          }}
        />

        {/* Task Info Section */}
        <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
          <Heading size="lg" className="text-typography-900">
            Opgave info
          </Heading>

          {/* Employee Assignment */}
          <EmployeeSelectField selectedEmployee={selectedEmployee} onEmployeeChange={setSelectedEmployee} />

          {/* Description */}
          <VStack space="sm">
            <Text className="text-typography-700 font-medium">Beskrivelse *</Text>
            <Textarea size="md" isInvalid={!!fieldErrors["description"]?.[0]}>
              <TextareaInput placeholder="Beskriv opgaven..." value={description} onChangeText={setDescription} />
            </Textarea>
            {fieldErrors["description"]?.[0] && (
              <Text className="text-error-500 text-xs">{fieldErrors["description"][0]}</Text>
            )}
          </VStack>

          {/* Task Type Radio */}
          <TaskTypeRadio value={taskType} onChange={setTaskType} />

          {/* Expected Completion Date */}
          <VStack space="sm">
            <Text className="text-typography-700 font-medium">Forventet færdig *</Text>
            <Button
              action="secondary"
              variant="outline"
              size="md"
              onPress={() => setIsDatePickerOpen(true)}
              className={fieldErrors["estimatedCompletion"]?.[0] ? "border-error-500" : ""}
            >
              <ButtonText>{formatDate(expectedCompletion)}</ButtonText>
            </Button>
            {fieldErrors["estimatedCompletion"]?.[0] && (
              <Text className="text-error-500 text-xs">{fieldErrors["estimatedCompletion"][0]}</Text>
            )}
          </VStack>

          <DatePickerDrawer
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            currentDate={expectedCompletion}
            onDateChange={setExpectedCompletion}
            title="Forventet færdig"
            subtitle="Vælg dato"
            confirmLabel="Vælg"
          />
        </VStack>

        {/* Submit Button */}
        <Button
          action="primary"
          variant="solid"
          size="lg"
          onPress={handleSubmit}
          className="mt-4"
          isDisabled={isSubmitting}
        >
          {isSubmitting ? <Spinner size="small" className="mr-2" color="white" /> : null}
          <ButtonText>{isSubmitting ? "Opretter..." : "Opret sag"}</ButtonText>
        </Button>
      </VStack>
    </ScrollView>
  );
}

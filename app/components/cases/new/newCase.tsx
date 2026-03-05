import React, { useState } from "react";
import { ScrollView } from "react-native-gesture-handler";

import { DatePickerDrawer } from "@/components/cases/DatePickerDrawer";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

import { ServiceOrderCreateSchema } from "@schemas/serviceOrder.schemas";
import { useRouter } from "expo-router";

import { type CustomerData, CustomerSearchSection } from "./CustomerSearchSection";
import { type Employee, EmployeeSelectField } from "./EmployeeSelectField";
import { type TaskType, TaskTypeRadio } from "./TaskTypeRadio";

export function NewCase() {
  const toast = useToast();
  const router = useRouter();

  // Customer state
  const [customerData, setCustomerData] = useState<CustomerData>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Task info state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("service");
  const [expectedCompletion, setExpectedCompletion] = useState<Date>(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    return defaultDate;
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async () => {
    const estimatedCompletionISO = expectedCompletion.toISOString();

    const payload: Record<string, unknown> = {
      description,
      estimatedCompletion: estimatedCompletionISO,
      assignedToId: selectedEmployee?.id ?? null,
    };

    if (customerData.id) {
      payload.customerId = customerData.id;
    } else {
      payload.customerFirstName = customerData.firstName.trim();
      payload.customerLastName = customerData.lastName.trim();
      payload.customerEmail = customerData.email.trim();
      if (customerData.phone?.trim()) {
        payload.customerPhone = customerData.phone.trim();
      }
    }

    const result = ServiceOrderCreateSchema.safeParse(payload);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/service-orders", result.data);

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Sag oprettet</ToastTitle>
          </Toast>
        ),
      });

      // Navigate back or to the new case
      if (response.data?.data?.id) {
        router.replace(`/case/${response.data.data.id}`);
      } else {
        router.back();
      }
    } catch (error: any) {
      console.error("Error creating service order:", error);

      const errorMessage = error?.response?.data?.message || "Kunne ikke oprette sagen. Prøv igen.";

      setFieldErrors({ general: [errorMessage] });

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>{errorMessage}</ToastTitle>
          </Toast>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
          onCustomerChange={setCustomerData}
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

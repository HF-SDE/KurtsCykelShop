import React, { useState } from "react";
import { Alert, Platform, ScrollView } from "react-native";

import { DatePickerDrawer } from "@/components/cases/DatePickerDrawer";
import { Button, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

import { useRouter } from "expo-router";

import { type CustomerData, CustomerSearchSection } from "./CustomerSearchSection";
import { type Employee, EmployeeSelectField } from "./EmployeeSelectField";
import { type TaskType, TaskTypeRadio } from "./TaskTypeRadio";

interface FormErrors {
  customer?: Partial<Record<keyof CustomerData, string>>;
  description?: string;
  estimatedCompletion?: string;
  general?: string;
}

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
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Client-side validation before submitting
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate customer
    if (!customerData.id) {
      const customerErrors: Partial<Record<keyof CustomerData, string>> = {};

      if (!customerData.firstName.trim()) {
        customerErrors.firstName = "Fornavn er påkrævet";
        isValid = false;
      }
      if (!customerData.lastName.trim()) {
        customerErrors.lastName = "Efternavn er påkrævet";
        isValid = false;
      }
      if (!customerData.email.trim()) {
        customerErrors.email = "Email er påkrævet";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
        customerErrors.email = "Ugyldig email-adresse";
        isValid = false;
      }

      if (Object.keys(customerErrors).length > 0) {
        newErrors.customer = customerErrors;
      }
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = "Beskrivelse er påkrævet";
      isValid = false;
    }

    // Validate estimated completion
    if (!expectedCompletion) {
      newErrors.estimatedCompletion = "Forventet færdigdato er påkrævet";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const estimatedCompletionISO = expectedCompletion.toISOString();

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: Record<string, any> = {
        description,
        estimatedCompletion: estimatedCompletionISO,
        assignedToId: selectedEmployee?.id || null,
      };

      // If we have an existing customer ID, use it; otherwise pass customer details
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

      const response = await apiClient.post("/service-orders", payload);

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

      setErrors({ general: errorMessage });

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
        {errors.general && (
          <VStack className="bg-error-50 border-error-200 rounded-lg border p-3">
            <Text className="text-error-700 text-sm font-medium">{errors.general}</Text>
          </VStack>
        )}

        {/* Customer Section */}
        <CustomerSearchSection
          customerData={customerData}
          onCustomerChange={setCustomerData}
          errors={errors.customer}
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
            <Textarea size="md" isInvalid={!!errors.description}>
              <TextareaInput placeholder="Beskriv opgaven..." value={description} onChangeText={setDescription} />
            </Textarea>
            {errors.description && <Text className="text-error-500 text-xs">{errors.description}</Text>}
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
              className={errors.estimatedCompletion ? "border-error-500" : ""}
            >
              <ButtonText>{formatDate(expectedCompletion)}</ButtonText>
            </Button>
            {errors.estimatedCompletion && <Text className="text-error-500 text-xs">{errors.estimatedCompletion}</Text>}
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

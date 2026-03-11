import React, { useState } from "react";
import { Alert, Linking, TouchableOpacity } from "react-native";

import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

import { DatePickerDrawer } from "@components/cases/date-picker-drawer";
import CheckPermission from "@components/check-permission";
import { formatDate, formatDateTime } from "@utils/formatDate";
import { Calendar, Mail, Phone } from "lucide-react-native";

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

interface CustomerInfoCardProps {
  customer: Customer;
  createdAt: string;
  estimatedCompletion: string;
  serviceOrderId: string;
  onDataUpdated?: () => void;
}

export function CustomerInfoCard({
  customer,
  createdAt,
  estimatedCompletion,
  serviceOrderId,
  onDataUpdated,
}: CustomerInfoCardProps) {
  const toast = useToast();
  const [showDateDrawer, setShowDateDrawer] = useState(false);

  const handleDateChange = async (newDate: Date) => {
    try {
      await apiClient.patch(`/service-orders/${serviceOrderId}`, {
        estimatedCompletion: newDate.toISOString(),
      });

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Dato opdateret</ToastTitle>
            <ToastDescription>Kunden vil modtage en email</ToastDescription>
          </Toast>
        ),
      });

      onDataUpdated?.();
    } catch (error) {
      console.error("Error updating date:", error);
      Alert.alert("Fejl", "Kunne ikke opdatere datoen");
    }
  };

  return (
    <>
      <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
        <Heading size="lg" className="text-typography-900">
          Kundeinfo
        </Heading>

        <VStack space="sm">
          <Text className="text-typography-900 text-lg font-semibold">
            {customer.firstName} {customer.lastName}
          </Text>

          <HStack space="md">
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${customer.email}`)}>
              <HStack space="sm" className="items-center">
                <Icon as={Mail} size="sm" className="text-primary-500" />
                <Text className="text-primary-500">{customer.email}</Text>
              </HStack>
            </TouchableOpacity>
          </HStack>

          {customer.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${customer.phone}`)}>
              <HStack space="sm" className="items-center">
                <Icon as={Phone} size="sm" className="text-primary-500" />
                <Text className="text-primary-500">{customer.phone}</Text>
              </HStack>
            </TouchableOpacity>
          )}
        </VStack>

        {/* Dates */}
        <VStack space="sm" className="border-outline-100 mt-4 border-t pt-4">
          <HStack className="items-center justify-between">
            <Text className="text-typography-500 text-sm">Oprettet</Text>
            <Text className="text-typography-700">{formatDateTime(createdAt)}</Text>
          </HStack>
          <CheckPermission requiredPermission={["case:update"]} showIfNotPermitted={true}>
            <TouchableOpacity onPress={() => setShowDateDrawer(true)}>
              <HStack className="items-center justify-between">
                <Text className="text-typography-500 text-sm">Forventet færdig</Text>
                <HStack space="sm" className="items-center">
                  <Text className="text-primary-500 font-medium">{formatDate(estimatedCompletion)}</Text>
                  <Icon as={Calendar} size="sm" className="text-primary-500" />
                </HStack>
              </HStack>
            </TouchableOpacity>
          </CheckPermission>
        </VStack>
      </VStack>

      <DatePickerDrawer
        isOpen={showDateDrawer}
        onClose={() => setShowDateDrawer(false)}
        currentDate={estimatedCompletion}
        onDateChange={handleDateChange}
      />
    </>
  );
}

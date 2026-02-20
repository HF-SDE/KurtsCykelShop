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
import { FormControl } from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export interface CustomerData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface CustomerSearchSectionProps {
  customerData: CustomerData;
  onCustomerChange: (data: CustomerData) => void;
}

// Mock customer data - replace with API call in production
const mockCustomers: CustomerData[] = [
  { id: "1", firstName: "Anders", lastName: "Andersen", email: "anders@example.dk", phone: "+45 12345678" },
  { id: "2", firstName: "Bent", lastName: "Bentsen", email: "bent@example.dk", phone: "+45 87654321" },
  { id: "3", firstName: "Carla", lastName: "Carlsen", email: "carla@example.dk", phone: "+45 11223344" },
];

export function CustomerSearchSection({ customerData, onCustomerChange }: CustomerSearchSectionProps) {
  const [showSearchSheet, setShowSearchSheet] = useState(false);

  const handleCustomerSelect = (customer: CustomerData) => {
    onCustomerChange(customer);
    setShowSearchSheet(false);
  };

  return (
    <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
      <Heading size="lg" className="text-typography-900">
        Kunde
      </Heading>

      <Button action="primary" variant="solid" onPress={() => setShowSearchSheet(true)} className="w-full">
        <ButtonText>Søg efter kunde</ButtonText>
      </Button>

      <FormControl>
        <Text className="text-typography-700 mb-1 text-sm font-medium">Fornavn</Text>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Placeholder Text"
            value={customerData.firstName}
            onChangeText={(text) => onCustomerChange({ ...customerData, firstName: text })}
          />
        </Input>
      </FormControl>

      <FormControl>
        <Text className="text-typography-700 mb-1 text-sm font-medium">Efternavn</Text>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Placeholder Text"
            value={customerData.lastName}
            onChangeText={(text) => onCustomerChange({ ...customerData, lastName: text })}
          />
        </Input>
      </FormControl>

      <FormControl>
        <Text className="text-typography-700 mb-1 text-sm font-medium">Email</Text>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Placeholder Text"
            value={customerData.email}
            onChangeText={(text) => onCustomerChange({ ...customerData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Input>
      </FormControl>

      {/* Customer Search Actionsheet */}
      <Actionsheet isOpen={showSearchSheet} onClose={() => setShowSearchSheet(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack space="sm" className="w-full p-4">
            <Heading size="lg" className="text-typography-900 mb-2">
              Vælg kunde
            </Heading>
            <ActionsheetScrollView>
              {mockCustomers.map((customer) => (
                <ActionsheetItem key={customer.id} onPress={() => handleCustomerSelect(customer)}>
                  <VStack space="xs" className="flex-1">
                    <ActionsheetItemText className="text-typography-900 font-semibold">
                      {customer.firstName} {customer.lastName}
                    </ActionsheetItemText>
                    <Text className="text-typography-500 text-sm">{customer.email}</Text>
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

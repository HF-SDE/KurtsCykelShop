import React, { useCallback, useEffect, useRef, useState } from "react";

import { Combobox } from "@/components/combobox";
import { FormControl } from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

export interface CustomerData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface CustomerOption {
  id: string;
  name: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
}

interface CustomerSearchSectionProps {
  customerData: CustomerData;
  onCustomerChange: (data: CustomerData) => void;
  errors?: Partial<Record<keyof CustomerData, string>>;
}

export function CustomerSearchSection({ customerData, onCustomerChange, errors }: CustomerSearchSectionProps) {
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch customers from backend (empty query returns first 20)
  const fetchCustomers = useCallback(async (query?: string) => {
    setIsSearching(true);
    try {
      const params: Record<string, string> = {};
      if (query && query.trim().length > 0) {
        params.q = query.trim();
      }

      const response = await apiClient.get("/customers/search", { params });

      if (response.data?.data) {
        const options: CustomerOption[] = response.data.data.map((customer: any) => ({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
          firstName: customer.firstName,
          lastName: customer.lastName,
        }));
        setCustomerOptions(options);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search — call from external trigger if needed
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        fetchCustomers(query);
      }, 300);
    },
    [fetchCustomers],
  );

  // Load initial customer list on mount
  useEffect(() => {
    fetchCustomers();
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchCustomers]);

  const handleCustomerSelect = (selectedId: string) => {
    const selected = customerOptions.find((c) => c.id === selectedId);
    if (selected) {
      onCustomerChange({
        id: selected.id,
        firstName: selected.firstName,
        lastName: selected.lastName,
        email: selected.email,
        phone: selected.phone || "",
      });
    } else {
      // Cleared selection
      onCustomerChange({
        id: undefined,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    }
  };

  // When user modifies the manual fields, clear the id (marking as new customer)
  const handleManualFieldChange = (field: keyof CustomerData, value: string) => {
    onCustomerChange({
      ...customerData,
      id: undefined, // Clear customer ID so backend knows to create new
      [field]: value,
    });
  };

  // Map options so the Combobox can use them
  const comboboxOptions = customerOptions.map((c) => ({
    id: c.id,
    name: `${c.name} — ${c.email}`,
  }));

  return (
    <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
      <Heading size="lg" className="text-typography-900">
        Kunde
      </Heading>

      <Combobox
        label="Søg efter eksisterende kunde"
        placeholder="Vælg kunde"
        searchPlaceholder="Søg på navn, email eller telefon..."
        emptyStateText="Ingen kunder fundet — udfyld felterne manuelt"
        options={comboboxOptions}
        value={customerData.id || ""}
        onChange={handleCustomerSelect}
        onSearchChange={debouncedSearch}
      />

      {!customerData.id && (
        <Text className="text-typography-500 text-sm">
          Ingen kunde valgt — udfyld felterne for at oprette en ny kunde
        </Text>
      )}

      <FormControl isInvalid={!!errors?.firstName}>
        <Text className="text-typography-700 mb-1 text-sm font-medium">Fornavn *</Text>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Fornavn"
            value={customerData.firstName}
            onChangeText={(text) => handleManualFieldChange("firstName", text)}
            editable={!customerData.id}
          />
        </Input>
        {errors?.firstName && <Text className="text-error-500 mt-1 text-xs">{errors.firstName}</Text>}
      </FormControl>

      <FormControl isInvalid={!!errors?.lastName}>
        <Text className="text-typography-700 mb-1 text-sm font-medium">Efternavn *</Text>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Efternavn"
            value={customerData.lastName}
            onChangeText={(text) => handleManualFieldChange("lastName", text)}
            editable={!customerData.id}
          />
        </Input>
        {errors?.lastName && <Text className="text-error-500 mt-1 text-xs">{errors.lastName}</Text>}
      </FormControl>

      <FormControl isInvalid={!!errors?.email}>
        <Text className="text-typography-700 mb-1 text-sm font-medium">Email *</Text>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Email"
            value={customerData.email}
            onChangeText={(text) => handleManualFieldChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!customerData.id}
          />
        </Input>
        {errors?.email && <Text className="text-error-500 mt-1 text-xs">{errors.email}</Text>}
      </FormControl>

      <FormControl>
        <Text className="text-typography-700 mb-1 text-sm font-medium">Telefon</Text>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Telefonnummer"
            value={customerData.phone || ""}
            onChangeText={(text) => handleManualFieldChange("phone", text)}
            keyboardType="phone-pad"
            editable={!customerData.id}
          />
        </Input>
      </FormControl>
    </VStack>
  );
}

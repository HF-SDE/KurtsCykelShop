import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, TouchableOpacity } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { AddProductDrawer } from "@/components/cases/AddProductDrawer";
import { AddRepairDrawer } from "@/components/cases/AddRepairDrawer";
import { DatePickerDrawer } from "@/components/cases/DatePickerDrawer";
import { type Employee, EmployeeSelectField } from "@/components/cases/new/EmployeeSelectField";
import {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, ChevronDown, ChevronLeft, ChevronUp, Mail, Phone, Plus, User } from "lucide-react-native";

const statusConfig: Record<string, { action: "success" | "warning" | "info" | "error"; label: string }> = {
  completed: { action: "success", label: "Afsluttet" },
  cancelled: { action: "error", label: "Annuleret" },
  "in-progress": { action: "info", label: "I gang" },
  pending: { action: "warning", label: "Afventer" },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CaseDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  // State
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [savingDescription, setSavingDescription] = useState(false);

  // Drawer states
  const [showDateDrawer, setShowDateDrawer] = useState(false);
  const [showRepairDrawer, setShowRepairDrawer] = useState(false);
  const [showProductDrawer, setShowProductDrawer] = useState(false);

  // Load case data
  useEffect(() => {
    loadCaseData();
  }, [id]);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/service-orders/${id}`);
      // const data = response.data.data;

      // Mock data for now
      console.log("Loading case:", id);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = {
        id,
        description: "Standard serviceeftersyn af cykel. Gennemgået alle dele og smurt kæde.",
        estimatedCompletion: "2026-03-15T10:00:00Z",
        completedAt: null,
        createdAt: "2026-02-10T14:30:00Z",
        customer: {
          id: "cust-1",
          firstName: "Anders",
          lastName: "Sand",
          email: "ben@dover.com",
          phone: "+45 12 34 56 78",
        },
        assignedTo: {
          id: "emp-1",
          firstName: "Hans",
          lastName: "Hansen",
          initials: "HHA",
          email: "hans@kurts.dk",
        },
        assignedBy: {
          id: "emp-2",
          firstName: "Mette",
          lastName: "Jensen",
          initials: "MJE",
        },
        serviceRepairs: [
          {
            id: "rep-1",
            title: "Klippet bremser",
            description: "Jeg kiggede skævt på mig da han kom med cyklen, så jeg har klippet hans bremser over.",
            createdAt: "2026-02-11T10:00:00Z",
            createdBy: {
              firstName: "Hans",
              lastName: "Hansen",
              initials: "HHA",
            },
          },
          {
            id: "rep-2",
            title: "Skiftet kæde",
            description: "Gammel kæde var slidt. Monteret ny kæde og justeret gearing.",
            createdAt: "2026-02-11T11:30:00Z",
            createdBy: {
              firstName: "Hans",
              lastName: "Hansen",
              initials: "HHA",
            },
          },
        ],
        servicePartsUsed: [
          {
            id: "part-1",
            quantity: 1,
            item: {
              id: "item-1",
              sku: "ck45729582902",
              name: "Cykelkæde",
              price: 15000,
            },
          },
          {
            id: "part-2",
            quantity: 1,
            item: {
              id: "item-2",
              sku: "35567299552",
              name: "Olie",
              price: 8000,
            },
          },
          {
            id: "part-3",
            quantity: 67,
            item: {
              id: "item-3",
              sku: "SP001",
              name: 'Støvvibrator "Spinel" med 5-delt tilbehør',
              price: 2500,
            },
          },
        ],
      };

      setCaseData(mockData);
      setDescription(mockData.description);
      setOriginalDescription(mockData.description);
    } catch (error) {
      console.error("Error loading case:", error);
      Alert.alert("Fejl", "Kunne ikke indlæse sagen");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    if (description === originalDescription) return;

    setSavingDescription(true);
    try {
      // TODO: Call API
      // await apiClient.patch(`/service-orders/${id}`, { description });
      console.log("Saving description:", description);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setOriginalDescription(description);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Gemt</ToastTitle>
            <ToastDescription>Beskrivelsen er opdateret</ToastDescription>
          </Toast>
        ),
      });
    } catch (error) {
      console.error("Error saving description:", error);
      Alert.alert("Fejl", "Kunne ikke gemme beskrivelsen");
    } finally {
      setSavingDescription(false);
    }
  };

  const handleDateChange = async (newDate: string) => {
    try {
      // TODO: Call API
      // await apiClient.patch(`/service-orders/${id}`, {
      //   estimatedCompletion: new Date(newDate).toISOString()
      // });
      console.log("Updating date:", newDate);
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Dato opdateret</ToastTitle>
            <ToastDescription>Kunden vil modtage en e-mail</ToastDescription>
          </Toast>
        ),
      });

      loadCaseData();
    } catch (error) {
      console.error("Error updating date:", error);
      Alert.alert("Fejl", "Kunne ikke opdatere datoen");
    }
  };

  const handleEmployeeChange = async (employee: Employee | null) => {
    try {
      // TODO: Call API
      // await apiClient.patch(`/service-orders/${id}`, { assignedToId: employee?.id || null });
      console.log("Updating assigned employee:", employee);
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Medarbejder opdateret</ToastTitle>
          </Toast>
        ),
      });

      loadCaseData();
    } catch (error) {
      console.error("Error updating employee:", error);
      Alert.alert("Fejl", "Kunne ikke opdatere medarbejder");
    }
  };

  if (loading) {
    return (
      <VStack className="bg-background-50 flex-1 items-center justify-center">
        <Spinner size="large" />
        <Text className="text-typography-500 mt-4">Indlæser sag...</Text>
      </VStack>
    );
  }

  if (!caseData) {
    return (
      <VStack className="bg-background-50 flex-1 items-center justify-center p-4">
        <Text className="text-typography-700 text-lg">Sag ikke fundet</Text>
      </VStack>
    );
  }

  const descriptionChanged = description !== originalDescription;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sag",
          headerLeft: () => (
            <Button onPress={() => router.back()} action="secondary" variant="link">
              <ButtonIcon as={ChevronLeft} size="xl" />
            </Button>
          ),
        }}
      />

      <ScrollView className="bg-background-50 flex-1" showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="p-4 pb-8">
          {/* Customer Card */}
          <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
            <Heading size="lg" className="text-typography-900">
              Kundeinfo
            </Heading>

            <VStack space="sm">
              <Text className="text-typography-900 text-lg font-semibold">
                {caseData.customer.firstName} {caseData.customer.lastName}
              </Text>

              <HStack space="md">
                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${caseData.customer.email}`)}>
                  <HStack space="sm" className="items-center">
                    <Icon as={Mail} size="sm" className="text-primary-500" />
                    <Text className="text-primary-500">{caseData.customer.email}</Text>
                  </HStack>
                </TouchableOpacity>
              </HStack>

              {caseData.customer.phone && (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${caseData.customer.phone}`)}>
                  <HStack space="sm" className="items-center">
                    <Icon as={Phone} size="sm" className="text-primary-500" />
                    <Text className="text-primary-500">{caseData.customer.phone}</Text>
                  </HStack>
                </TouchableOpacity>
              )}
            </VStack>

            {/* Dates */}
            <VStack space="sm" className="border-outline-100 mt-4 border-t pt-4">
              <HStack className="items-center justify-between">
                <Text className="text-typography-500 text-sm">Oprettet</Text>
                <Text className="text-typography-700">{formatDateTime(caseData.createdAt)}</Text>
              </HStack>

              <TouchableOpacity onPress={() => setShowDateDrawer(true)}>
                <HStack className="items-center justify-between">
                  <Text className="text-typography-500 text-sm">Forventet færdig</Text>
                  <HStack space="sm" className="items-center">
                    <Text className="text-primary-500 font-medium">{formatDate(caseData.estimatedCompletion)}</Text>
                    <Icon as={Calendar} size="sm" className="text-primary-500" />
                  </HStack>
                </HStack>
              </TouchableOpacity>
            </VStack>

            {/* Description */}
            <VStack space="sm" className="border-outline-100 mt-4 border-t pt-4">
              <Text className="text-typography-700 font-medium">Beskrivelse</Text>
              <Textarea size="md" className="min-h-24">
                <TextareaInput placeholder="Beskriv sagen..." value={description} onChangeText={setDescription} />
              </Textarea>

              {descriptionChanged && (
                <Button
                  action="primary"
                  variant="solid"
                  size="md"
                  onPress={handleSaveDescription}
                  isDisabled={savingDescription}
                >
                  {savingDescription ? (
                    <Spinner color="white" size="small" />
                  ) : (
                    <ButtonText>Gem beskrivelse</ButtonText>
                  )}
                </Button>
              )}
            </VStack>
          </VStack>

          {/* Employee Assignment Section */}
          <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
            <Heading size="lg" className="text-typography-900">
              Tildeling
            </Heading>

            <EmployeeSelectField
              selectedEmployee={
                caseData.assignedTo
                  ? {
                      id: caseData.assignedTo.id,
                      firstName: caseData.assignedTo.firstName,
                      lastName: caseData.assignedTo.lastName,
                      initials: caseData.assignedTo.initials,
                    }
                  : null
              }
              onEmployeeChange={handleEmployeeChange}
            />

            <VStack space="xs" className="border-outline-100 mt-2 border-t pt-4">
              <Text className="text-typography-500 text-sm">Oprettet af</Text>
              <HStack space="sm" className="items-center">
                <Icon as={User} size="sm" className="text-typography-500" />
                <Text className="text-typography-700">
                  {caseData.assignedBy.firstName} {caseData.assignedBy.lastName} ({caseData.assignedBy.initials})
                </Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Repairs Section */}
          <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
            <HStack className="items-center justify-between">
              <Heading size="lg" className="text-typography-900">
                Reparationer
              </Heading>
              <Button action="primary" variant="solid" size="sm" onPress={() => setShowRepairDrawer(true)}>
                <ButtonIcon as={Plus} />
                <ButtonText>Tilføj</ButtonText>
              </Button>
            </HStack>

            {caseData.serviceRepairs.length === 0 ? (
              <Text className="text-typography-500 py-4 text-center">Ingen reparationer endnu</Text>
            ) : (
              <Accordion variant="filled" size="md" type="multiple" className="mt-2">
                {caseData.serviceRepairs.map((repair: any, index: number) => (
                  <AccordionItem key={repair.id} value={`item-${index}`}>
                    <AccordionHeader>
                      <AccordionTrigger>
                        {({ isExpanded }: { isExpanded: boolean }) => (
                          <>
                            <AccordionTitleText>{repair.title}</AccordionTitleText>
                            <AccordionIcon as={isExpanded ? ChevronUp : ChevronDown} />
                          </>
                        )}
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                      <VStack space="sm">
                        <AccordionContentText>{repair.description}</AccordionContentText>
                        <HStack space="sm" className="mt-2 items-center">
                          <Text className="text-typography-500 text-xs">{formatDateTime(repair.createdAt)}</Text>
                          <Text className="text-typography-500 text-xs">•</Text>
                          <Text className="text-typography-500 text-xs">
                            {repair.createdBy.firstName} {repair.createdBy.lastName}
                          </Text>
                        </HStack>
                      </VStack>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </VStack>

          {/* Products Section */}
          <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
            <HStack className="items-center justify-between">
              <Heading size="lg" className="text-typography-900">
                Produkter brugt
              </Heading>
              <Button action="primary" variant="solid" size="sm" onPress={() => setShowProductDrawer(true)}>
                <ButtonIcon as={Plus} />
                <ButtonText>Tilføj</ButtonText>
              </Button>
            </HStack>

            {caseData.servicePartsUsed.length === 0 ? (
              <Text className="text-typography-500 py-4 text-center">Ingen produkter endnu</Text>
            ) : (
              <Table className="mt-2 w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Text className="text-typography-700 text-sm font-semibold">Produkt</Text>
                    </TableHead>
                    <TableHead>
                      <Text className="text-typography-700 text-sm font-semibold">Antal</Text>
                    </TableHead>
                    <TableHead>
                      <Text className="text-typography-700 text-right text-sm font-semibold">Total</Text>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caseData.servicePartsUsed.map((part: any) => (
                    <TableRow key={part.id}>
                      <TableData>
                        <VStack space="xs">
                          <Text className="text-typography-900 font-medium">{part.item.name}</Text>
                          <Text className="text-typography-500 text-xs">SKU: {part.item.sku}</Text>
                        </VStack>
                      </TableData>
                      <TableData>
                        <Text className="text-typography-700">{part.quantity}</Text>
                      </TableData>
                      <TableData>
                        <Text className="text-typography-700 text-right">
                          {((part.item.price * part.quantity) / 100).toFixed(2)} kr
                        </Text>
                      </TableData>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Drawers */}
      <DatePickerDrawer
        isOpen={showDateDrawer}
        onClose={() => setShowDateDrawer(false)}
        currentDate={formatDate(caseData.estimatedCompletion)}
        onDateChange={handleDateChange}
      />

      <AddRepairDrawer
        isOpen={showRepairDrawer}
        onClose={() => setShowRepairDrawer(false)}
        serviceOrderId={id || ""}
        onRepairAdded={loadCaseData}
      />

      <AddProductDrawer
        isOpen={showProductDrawer}
        onClose={() => setShowProductDrawer(false)}
        serviceOrderId={id || ""}
        onProductAdded={loadCaseData}
      />
    </>
  );
}

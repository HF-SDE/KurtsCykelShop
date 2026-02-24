import React, { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";

import {
  CustomerInfoCard,
  DescriptionCard,
  EmployeeAssignmentCard,
  ProductsCard,
  RepairsCard,
} from "@/components/cases/details";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

import { ServiceOrderData } from "@/types/serviceOrders/Extentions/ServiceOrderData";

import FoxLoader from "@components/fox";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CaseDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // State
  const [caseData, setCaseData] = useState<ServiceOrderData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load case data
  useEffect(() => {
    loadCaseData();
  }, [id]);
  console.log("🚀 ~ CaseDetailsPage ~ id:", id);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      //add manuel delay to show loading state
      const result = await apiClient.get(`/service-orders/${id}`);
      const data = result.data.data as ServiceOrderData;

      console.log("🚀 ~ loadCaseData ~ data:", data);
      setCaseData(data);
    } catch (error) {
      console.error("🚀 ~ loadCaseData ~ error:", error);
      console.error("Error loading case:", error);
      Alert.alert("Fejl", "Kunne ikke indlæse sagen");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <VStack className="bg-background-50 flex-1 items-center justify-center">
        <FoxLoader />
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

  return (
    <>
      <ScrollView className="bg-background-50 flex-1" showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="p-4 pb-8">
          <CustomerInfoCard
            customer={caseData.customer}
            createdAt={caseData.createdAt}
            estimatedCompletion={caseData.estimatedCompletion}
            serviceOrderId={id || ""}
            onDataUpdated={loadCaseData}
          />

          <DescriptionCard
            initialDescription={caseData.description}
            serviceOrderId={id || ""}
            onDescriptionUpdated={loadCaseData}
          />

          <EmployeeAssignmentCard
            assignedTo={caseData.assignedTo}
            assignedBy={caseData.assignedBy}
            serviceOrderId={id || ""}
            onAssignmentUpdated={loadCaseData}
          />

          <RepairsCard repairs={caseData.serviceRepairs} serviceOrderId={id || ""} onRepairAdded={loadCaseData} />

          <ProductsCard products={caseData.servicePartsUsed} serviceOrderId={id || ""} onProductAdded={loadCaseData} />
        </VStack>
      </ScrollView>
    </>
  );
}

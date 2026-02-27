import React, { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";

import {
  CancelOrderButton,
  CompleteOrderButton,
  CustomerInfoCard,
  DescriptionCard,
  EmployeeAssignmentCard,
  ProductsCard,
  RepairsCard,
} from "@/components/cases/details";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

import { ServiceOrderData } from "@/types/serviceOrders/Extentions/ServiceOrderData";

import CheckPermission from "@components/check-permission";
import FoxLoader from "@components/fox";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, FileQuestion } from "lucide-react-native";

export default function CaseDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // State
  const [caseData, setCaseData] = useState<ServiceOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load case data with proper cleanup and error handling
  useEffect(() => {
    if (!id) {
      setError("Mangler sags-ID");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadCaseData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiClient.get(`/service-orders/${id}`);

        if (!cancelled) {
          const data = result.data.data as ServiceOrderData;
          setCaseData(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading case:", error);
          setError("Kunne ikke indlæse sagen");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCaseData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Memoized reload function for child components
  const reloadCaseData = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      const result = await apiClient.get(`/service-orders/${id}`);
      const data = result.data.data as ServiceOrderData;
      setCaseData(data);
    } catch (error) {
      console.error("Error reloading case:", error);
      setError("Kunne ikke genindlæse sagen");
    }
  }, [id]);

  if (loading) {
    return (
      <VStack className="bg-background-50 flex-1 items-center justify-center">
        <FoxLoader />
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack className="bg-background-50 flex-1 items-center justify-center p-4" space="md">
        <Icon as={AlertCircle} size="xl" className="text-error-500" />
        <VStack space="sm" className="items-center">
          <Text className="text-typography-900 text-xl font-semibold">Noget gik galt</Text>
          <Text className="text-typography-500 text-center">{error}</Text>
        </VStack>
        <Button
          action="primary"
          variant="solid"
          onPress={() => {
            setError(null);
            setLoading(true);
            reloadCaseData();
          }}
        >
          <ButtonText>Prøv igen</ButtonText>
        </Button>
      </VStack>
    );
  }

  if (!caseData) {
    return (
      <VStack className="bg-background-50 flex-1 items-center justify-center p-4" space="md">
        <Icon as={FileQuestion} size="xl" className="text-typography-400" />
        <VStack space="sm" className="items-center">
          <Text className="text-typography-700 text-xl font-semibold">Sag ikke fundet</Text>
          <Text className="text-typography-500 text-center">Denne sag eksisterer ikke eller er blevet slettet</Text>
        </VStack>
        <Button action="secondary" variant="outline" onPress={() => router.back()}>
          <ButtonText>Gå tilbage</ButtonText>
        </Button>
      </VStack>
    );
  }

  return (
    <>
      <ScrollView className="bg-background-50 flex-1" showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="p-4 pb-8">
          <CheckPermission requiredPermission={["case:update"]} showIfNotPermitted={true}>
            <CustomerInfoCard
              customer={caseData.customer}
              createdAt={caseData.createdAt}
              estimatedCompletion={caseData.estimatedCompletion}
              serviceOrderId={id || ""}
              onDataUpdated={reloadCaseData}
            />

            <DescriptionCard
              initialDescription={caseData.description}
              serviceOrderId={id || ""}
              onDescriptionUpdated={reloadCaseData}
            />
          </CheckPermission>
          <CheckPermission requiredPermission={["case:assign"]} showIfNotPermitted={true}>
            <EmployeeAssignmentCard
              assignedTo={caseData.assignedTo}
              assignedBy={caseData.assignedBy}
              serviceOrderId={id || ""}
              onAssignmentUpdated={reloadCaseData}
            />
          </CheckPermission>

          <CheckPermission requiredPermission={["case:update"]} showIfNotPermitted={true}>
            <RepairsCard repairs={caseData.serviceRepairs} serviceOrderId={id || ""} onRepairAdded={reloadCaseData} />
          </CheckPermission>

          <CheckPermission requiredPermission={["case:update:items"]} showIfNotPermitted={true}>
            <ProductsCard
              products={caseData.servicePartsUsedWithItem}
              serviceOrderId={id || ""}
              onProductAdded={reloadCaseData}
            />
          </CheckPermission>

          <CheckPermission requiredPermission={["case:update"]}>
            <CompleteOrderButton
              serviceOrderId={id || ""}
              currentStatus={caseData.status}
              onStatusUpdated={reloadCaseData}
            />
            <CancelOrderButton
              serviceOrderId={id || ""}
              currentStatus={caseData.status}
              onStatusUpdated={reloadCaseData}
            />
          </CheckPermission>
        </VStack>
      </ScrollView>
    </>
  );
}

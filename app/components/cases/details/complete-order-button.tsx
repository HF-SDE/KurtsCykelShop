import React, { useState } from "react";

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import apiClient from "@/utils/apiClient";

import { CheckCircle } from "lucide-react-native";

interface CompleteOrderButtonProps {
  serviceOrderId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

export default function CompleteOrderButton({
  serviceOrderId,
  currentStatus,
  onStatusUpdated,
}: CompleteOrderButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isAlreadyCompleted = currentStatus === "completed";
  const hidden = currentStatus === "cancelled";

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await apiClient.patch(`/service-orders/${serviceOrderId}`, {
        status: "completed",
      });
      setShowDialog(false);
      onStatusUpdated();
    } catch (error) {
      console.error("Error completing service order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (hidden) return null;

  return (
    <>
      <Button
        action="positive"
        variant="solid"
        onPress={() => setShowDialog(true)}
        isDisabled={isAlreadyCompleted}
        className="w-full"
      >
        <Icon as={CheckCircle} size="sm" className="text-typography-0 mr-2" />
        <ButtonText>{isAlreadyCompleted ? "Sagen er afsluttet" : "Afslut sag"}</ButtonText>
      </Button>

      <AlertDialog isOpen={showDialog} onClose={() => setShowDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Afslut sag</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-typography-500">
              Er du sikker på, at du vil markere denne sag som afsluttet? Denne handling kan ikke fortrydes.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <HStack space="md" className="w-full justify-end">
              <Button variant="outline" action="secondary" onPress={() => setShowDialog(false)} isDisabled={submitting}>
                <ButtonText>Annuller</ButtonText>
              </Button>
              <Button action="positive" onPress={handleConfirm} isDisabled={submitting}>
                {submitting && <ButtonSpinner className="mr-2" />}
                <ButtonText>Bekræft</ButtonText>
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

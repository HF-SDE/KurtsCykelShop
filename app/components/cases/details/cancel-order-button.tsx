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

import { XCircle } from "lucide-react-native";

interface CancelOrderButtonProps {
  serviceOrderId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

export default function CancelOrderButton({ serviceOrderId, currentStatus, onStatusUpdated }: CancelOrderButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAlreadyCancelled = currentStatus === "cancelled";
  const isCompleted = currentStatus === "completed";
  const isDisabled = isAlreadyCancelled;
  const hidden = currentStatus === "completed";

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await apiClient.patch(`/service-orders/${serviceOrderId}`, {
        status: "cancelled",
      });
      setShowDialog(false);
      onStatusUpdated();
    } catch (error) {
      console.error("Error cancelling service order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getButtonLabel = () => {
    if (isAlreadyCancelled) return "Sagen er annulleret";
    if (isCompleted) return "Sagen er afsluttet";
    return "Annuller sag";
  };

  if (hidden) return null;

  return (
    <>
      <Button
        action="negative"
        variant="outline"
        onPress={() => setShowDialog(true)}
        isDisabled={isDisabled}
        className="w-full"
      >
        <Icon as={XCircle} size="sm" className="text-error-600 mr-2" />
        <ButtonText>{getButtonLabel()}</ButtonText>
      </Button>

      <AlertDialog isOpen={showDialog} onClose={() => setShowDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Annuller sag</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-typography-500">
              Er du sikker på, at du vil annullere denne sag? Denne handling kan ikke fortrydes.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <HStack space="md" className="w-full justify-end">
              <Button variant="outline" action="secondary" onPress={() => setShowDialog(false)} isDisabled={submitting}>
                <ButtonText>Luk</ButtonText>
              </Button>
              <Button action="negative" onPress={handleConfirm} isDisabled={submitting}>
                {submitting && <ButtonSpinner className="mr-2" />}
                <ButtonText>Annuller sag</ButtonText>
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

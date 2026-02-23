import React, { useEffect, useState } from "react";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";

import { cn } from "tailwind-variants";

interface AddRepairDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOrderId: string;
  onRepairAdded: () => void;
}

export function AddRepairDrawer({ isOpen, onClose, serviceOrderId, onRepairAdded }: AddRepairDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when drawer closes
      setTitle("");
      setDescription("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to add repair
      // await apiClient.post(`/service-orders/${serviceOrderId}/repairs`, { title, description });
      console.log("Adding repair:", { serviceOrderId, title, description });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onRepairAdded();
      onClose();
    } catch (error) {
      console.error("Error adding repair:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <VStack space="lg" className={"w-full p-6 pb-[320px]"}>
          <Heading size="lg" className="text-typography-900">
            Tilføj reparation
          </Heading>

          <VStack space="md">
            <VStack space="sm">
              <Text className="text-typography-700 font-medium">Titel</Text>
              <Input variant="outline" size="md">
                <InputField placeholder="F.eks. Skiftet kæde" value={title} onChangeText={setTitle} />
              </Input>
            </VStack>

            <VStack space="sm">
              <Text className="text-typography-700 font-medium">Beskrivelse</Text>
              <Textarea size="md" className="min-h-24">
                <TextareaInput
                  placeholder="Beskriv reparationen..."
                  value={description}
                  onChangeText={setDescription}
                />
              </Textarea>
            </VStack>
          </VStack>

          <Button
            action="primary"
            variant="solid"
            size="lg"
            onPress={handleConfirm}
            isDisabled={!title.trim() || !description.trim() || loading}
          >
            {loading ? <Spinner color="white" /> : <ButtonText>Tilføj</ButtonText>}
          </Button>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
}

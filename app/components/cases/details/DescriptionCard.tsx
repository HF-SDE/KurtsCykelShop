import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

interface DescriptionCardProps {
  initialDescription: string;
  serviceOrderId: string;
  onDescriptionUpdated?: () => void;
}

export function DescriptionCard({ initialDescription, serviceOrderId, onDescriptionUpdated }: DescriptionCardProps) {
  const toast = useToast();
  const [description, setDescription] = useState(initialDescription);
  const [originalDescription, setOriginalDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);

  // Update when prop changes
  useEffect(() => {
    setDescription(initialDescription);
    setOriginalDescription(initialDescription);
  }, [initialDescription]);

  const handleSave = async () => {
    if (description === originalDescription) return;

    setSaving(true);
    try {
      // TODO: Call API
      // await apiClient.patch(`/service-orders/${serviceOrderId}`, { description });
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

      onDescriptionUpdated?.();
    } catch (error) {
      console.error("Error saving description:", error);
      Alert.alert("Fejl", "Kunne ikke gemme beskrivelsen");
    } finally {
      setSaving(false);
    }
  };

  const descriptionChanged = description !== originalDescription;

  return (
    <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
      <Heading size="lg" className="text-typography-900">
        Beskrivelse
      </Heading>

      <Textarea size="md" className="min-h-24">
        <TextareaInput placeholder="Beskriv sagen..." value={description} onChangeText={setDescription} />
      </Textarea>

      {descriptionChanged && (
        <Button action="primary" variant="solid" size="md" onPress={handleSave} isDisabled={saving}>
          {saving ? <Spinner color="white" size="small" /> : <ButtonText>Gem beskrivelse</ButtonText>}
        </Button>
      )}
    </VStack>
  );
}

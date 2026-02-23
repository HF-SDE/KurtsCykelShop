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
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface DatePickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onDateChange: (newDate: string) => void;
}

export function DatePickerDrawer({ isOpen, onClose, currentDate, onDateChange }: DatePickerDrawerProps) {
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(currentDate);
    }
  }, [isOpen, currentDate]);

  const handleConfirm = () => {
    onDateChange(selectedDate);
    onClose();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <VStack space="lg" className="w-full p-6 pb-[320px]">
          <Heading size="lg" className="text-typography-900">
            Opdater forventet færdig
          </Heading>

          <VStack space="sm">
            <Text className="text-typography-700 font-medium">Ny dato</Text>
            <Input variant="outline" size="md">
              <InputField placeholder="15. mar 2026" value={selectedDate} onChangeText={setSelectedDate} />
            </Input>
            <Text className="text-typography-500 text-sm">Kunden vil modtage en e-mail med den opdaterede dato</Text>
          </VStack>

          <Button action="primary" variant="solid" size="lg" onPress={handleConfirm}>
            <ButtonText>Bekræft</ButtonText>
          </Button>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
}

import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import DateTimePicker from "@react-native-community/datetimepicker";

interface DatePickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string; // Expects ISO 8601 string (e.g., "2024-03-15T10:00:00.000Z")
  onDateChange: (newDate: Date) => void;
}

export function DatePickerDrawer({ isOpen, onClose, currentDate, onDateChange }: DatePickerDrawerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        // Parse ISO 8601 date string to Date object
        const parsedDate = new Date(currentDate);

        if (isNaN(parsedDate.getTime())) {
          console.error("Invalid date format received:", currentDate);
          setSelectedDate(new Date());
        } else {
          setSelectedDate(parsedDate);
        }
      } catch (error) {
        console.error("Error parsing date:", error);
        setSelectedDate(new Date());
      }

      // Auto-show picker on iOS
      if (Platform.OS === "ios") {
        setShowPicker(true);
      }
    }
  }, [isOpen, currentDate]);

  const handleDateChangeNative = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && date) {
        setSelectedDate(date);
      }
    } else if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    onDateChange(selectedDate);
    onClose();
    setShowPicker(false);
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <VStack space="lg" className="w-full p-6 pb-8">
          <Heading size="lg" className="text-typography-900">
            Opdater forventet færdig
          </Heading>

          <VStack space="sm">
            <Text className="text-typography-700 font-medium">Valgt dato</Text>

            {Platform.OS === "android" && (
              <Button action="secondary" variant="outline" size="lg" onPress={() => setShowPicker(true)}>
                <ButtonText>{formatDateDisplay(selectedDate)}</ButtonText>
              </Button>
            )}

            {(Platform.OS === "ios" || showPicker) && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChangeNative}
                minimumDate={new Date()}
                locale="da-DK"
              />
            )}

            {Platform.OS === "ios" && (
              <HStack className="bg-background-50 items-center justify-center rounded-lg p-3">
                <Text className="text-typography-700 text-center font-medium">{formatDateDisplay(selectedDate)}</Text>
              </HStack>
            )}

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

import { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable } from "react-native";

import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ChevronDownIcon, CloseIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Modal, ModalBackdrop, ModalCloseButton, ModalContent, ModalHeader } from "@/components/ui/modal";

import { cn } from "@gluestack-ui/utils/nativewind-utils";

import { Box } from "./ui/box";
import { Text } from "./ui/text";

interface ComboboxOption {
  id: string;
  name: string;
}

interface ComboboxProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyStateText?: string;
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

const MAX_SHORT_NAME_LENGTH = 18;

export function Combobox({
  label,
  placeholder = "Vælg",
  searchPlaceholder = "Søg...",
  emptyStateText = "Ingen resultater fundet",
  options,
  value,
  onChange,
  isDisabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const selectedOption = useMemo(() => options.find((option) => option.id === value), [options, value]);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return options;

    return options.filter((option) => option.name.toLowerCase().includes(normalizedSearch));
  }, [options, searchValue]);

  const shortName = useMemo(() => {
    if (!selectedOption) return null;
    return selectedOption.name.length > MAX_SHORT_NAME_LENGTH
      ? selectedOption.name.slice(0, MAX_SHORT_NAME_LENGTH - 3) + "..."
      : selectedOption.name;
  }, [selectedOption]);

  return (
    <Box>
      {label && <Text className="text-typography-500 mb-1 text-xs font-medium uppercase">{label}</Text>}
      <Button
        variant="outline"
        className="justify-between px-2"
        onPress={() => setIsOpen(true)}
        isDisabled={isDisabled}
      >
        <ButtonText className={cn("text-typography-700", { "text-typography-500": !selectedOption })}>
          {shortName ?? placeholder}
        </ButtonText>
        <ButtonIcon as={ChevronDownIcon} />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearchValue("");
        }}
        size="full"
      >
        <ModalBackdrop />

        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={24}
        >
          <ModalContent className="h-[90%] w-[24rem] rounded-b-none rounded-tl-3xl rounded-tr-3xl p-4">
            <ModalHeader className="mb-2">
              <Text>{placeholder}</Text>
              <ModalCloseButton>
                <Icon as={CloseIcon} />
              </ModalCloseButton>
            </ModalHeader>

            <Box className="mb-3">
              <Input size="md">
                <InputField
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChangeText={setSearchValue}
                  autoFocus
                />
              </Input>
            </Box>

            {filteredOptions.length > 0 ? (
              <FlatList
                data={filteredOptions}
                keyExtractor={(option) => option.id}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentContainerStyle={{ paddingBottom: 12 }}
                renderItem={({ item }) => (
                  <Pressable
                    className={cn("active:bg-background-100 w-full rounded-lg px-3 py-2", {
                      "bg-background-50": item.id === value,
                    })}
                    onPress={() => {
                      onChange(item.id);
                      setIsOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <Text className="text-typography-700">{item.name}</Text>
                  </Pressable>
                )}
              />
            ) : (
              <Box className="px-2 py-2">
                <Text className="text-typography-500">{emptyStateText}</Text>
              </Box>
            )}
          </ModalContent>
        </KeyboardAvoidingView>
      </Modal>
    </Box>
  );
}

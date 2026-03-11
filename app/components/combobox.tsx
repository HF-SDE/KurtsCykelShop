import { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable } from "react-native";

import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ChevronDownIcon, CloseIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Modal, ModalBackdrop, ModalCloseButton, ModalContent, ModalHeader } from "@/components/ui/modal";

import { cn } from "@gluestack-ui/utils/nativewind-utils";
import { CheckIcon } from "lucide-react-native";

import { Box } from "./ui/box";
import { Divider } from "./ui/divider";
import { Text } from "./ui/text";

interface ComboboxOption {
  id: string;
  name: string;
}

interface ComboboxBaseProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyStateText?: string;
  options: ComboboxOption[];
  isDisabled?: boolean;
  onSearchChange?: (query: string) => void;
  onCreateNew?: (name: string) => void;
}

type SingleSelectProps = {
  multiSelect?: false;
  value?: string;
  onChange: (value: string) => void;
  values?: never;
  onChangeValues?: never;
};

type MultiSelectProps = {
  multiSelect: true;
  values: string[];
  onChangeValues: (values: string[]) => void;
  value?: never;
  onChange?: never;
};

type ComboboxProps = ComboboxBaseProps & (SingleSelectProps | MultiSelectProps);

const MAX_SHORT_NAME_LENGTH = 18;
const CHIP_HORIZONTAL_PADDING_AND_ICON_WIDTH = 30;
const CHIP_CHARACTER_WIDTH = 6.5;
const CHIP_MIN_WIDTH = 44;
const CHIP_MAX_WIDTH = 180;
const CHIP_GAP_WIDTH = 8;
const OVERFLOW_CHIP_BASE_WIDTH = 24;

export function Combobox({
  label,
  placeholder = "Vælg",
  searchPlaceholder = "Søg...",
  emptyStateText = "Ingen resultater fundet",
  options,
  value,
  onChange,
  values,
  onChangeValues,
  multiSelect = false,
  onCreateNew,
  isDisabled = false,
  onSearchChange,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [chipContainerWidth, setChipContainerWidth] = useState(0);
  const [optionsWithNewItems, setOptionsWithNewItems] = useState<ComboboxOption[]>(options);

  // Sync when external options change (e.g. after async fetch), preserving locally created items
  useEffect(() => {
    setOptionsWithNewItems((prev) => {
      const newItems = prev.filter((o) => o.id.startsWith("new-"));
      return [...options, ...newItems];
    });
  }, [options]);
  const selectedIds = useMemo<string[]>(() => {
    if (multiSelect) {
      return values || [];
    }
    return value ? [value] : [];
  }, [multiSelect, value, values]);

  const selectedOptions = useMemo(
    () => optionsWithNewItems.filter((option) => selectedIds.includes(option.id)),
    [optionsWithNewItems, selectedIds],
  );

  const selectedOption = multiSelect ? undefined : selectedOptions[0];

  const searchOptionExists = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return optionsWithNewItems.some((option) => option.name.toLowerCase() === normalizedSearch);
  }, [optionsWithNewItems, searchValue]);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return optionsWithNewItems;

    return optionsWithNewItems.filter((option) => option.name.toLowerCase().includes(normalizedSearch));
  }, [optionsWithNewItems, searchValue]);

  const shortName = useMemo(() => {
    if (!selectedOption) return null;
    return selectedOption.name.length > MAX_SHORT_NAME_LENGTH
      ? selectedOption.name.slice(0, MAX_SHORT_NAME_LENGTH - 3) + "..."
      : selectedOption.name;
  }, [selectedOption]);

  const displayedMultiSelect = useMemo(() => {
    if (!multiSelect) {
      return { visibleOptions: [] as ComboboxOption[], hiddenCount: 0 };
    }

    if (selectedOptions.length === 0) {
      return { visibleOptions: [] as ComboboxOption[], hiddenCount: 0 };
    }

    const availableWidth = chipContainerWidth > 0 ? chipContainerWidth : Infinity;

    const estimateChipWidth = (label: string) =>
      Math.min(
        CHIP_MAX_WIDTH,
        Math.max(CHIP_MIN_WIDTH, label.length * CHIP_CHARACTER_WIDTH + CHIP_HORIZONTAL_PADDING_AND_ICON_WIDTH),
      );

    const computeVisibleCount = (reservedOverflowWidth: number) => {
      let usedWidth = 0;
      let visibleCount = 0;

      for (const option of selectedOptions) {
        const chipWidth = estimateChipWidth(option.name);
        const nextWidth = usedWidth + (visibleCount > 0 ? CHIP_GAP_WIDTH : 0) + chipWidth;

        if (nextWidth > availableWidth - reservedOverflowWidth) {
          break;
        }

        usedWidth = nextWidth;
        visibleCount += 1;
      }

      return visibleCount;
    };

    let visibleCount = computeVisibleCount(0);

    if (visibleCount < selectedOptions.length) {
      const hiddenCount = selectedOptions.length - visibleCount;
      const overflowChipWidth = Math.max(44, `${hiddenCount}`.length * CHIP_CHARACTER_WIDTH + OVERFLOW_CHIP_BASE_WIDTH);
      visibleCount = computeVisibleCount(overflowChipWidth);

      if (visibleCount === 0 && selectedOptions.length > 0) {
        visibleCount = 1;
      }
    }

    const visibleOptions = selectedOptions.slice(0, visibleCount);
    const hiddenCount = selectedOptions.length - visibleOptions.length;

    return { visibleOptions, hiddenCount };
  }, [chipContainerWidth, multiSelect, selectedOptions]);

  function handleCreateNew(name: string) {
    if (!onCreateNew) return;

    onCreateNew(name);
    const newOption = { id: `new-${Date.now()}`, name };
    setOptionsWithNewItems((prev) => [...prev, newOption]);
    setSearchValue("");
  }

  const newItems = useMemo(() => {
    return optionsWithNewItems.filter((option) => option.id.startsWith("new-"));
  }, [optionsWithNewItems]);

  return (
    <Box>
      {label && <Text className="text-typography-500 mb-1 text-xs font-medium uppercase">{label}</Text>}
      <Button
        variant="outline"
        className="justify-between px-2"
        onPress={() => setIsOpen(true)}
        isDisabled={isDisabled}
      >
        {multiSelect ? (
          <Box
            className="min-h-8 flex-1 flex-row items-center gap-2 overflow-hidden py-1"
            onLayout={(event) => setChipContainerWidth(event.nativeEvent.layout.width)}
          >
            {selectedOptions.length > 0 ? (
              <>
                {displayedMultiSelect.visibleOptions.map((option) => (
                  <Pressable
                    key={option.id}
                    className="bg-background-100 border-outline-200 flex-row items-center gap-2 rounded-full border px-3 py-1"
                    onPress={(event) => {
                      event.stopPropagation();

                      const nextValues = selectedIds.filter((selectedId) => selectedId !== option.id);
                      onChangeValues?.(nextValues);
                    }}
                  >
                    <Text className="text-typography-700 text-sm font-medium">{option.name}</Text>
                    <Icon as={CloseIcon} className="text-typography-400" size="xs" />
                  </Pressable>
                ))}

                {displayedMultiSelect.hiddenCount > 0 ? (
                  <Box className="bg-background-100 border-outline-200 rounded-full border px-3 py-1">
                    <Text className="text-typography-700 text-sm font-medium">+{displayedMultiSelect.hiddenCount}</Text>
                  </Box>
                ) : null}
              </>
            ) : (
              <Text className="text-typography-500">{placeholder}</Text>
            )}
          </Box>
        ) : (
          <ButtonText
            className={cn("text-typography-700", {
              "text-typography-500": !selectedOption,
            })}
          >
            {shortName ?? placeholder}
          </ButtonText>
        )}
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
                  onChangeText={(text) => {
                    setSearchValue(text);
                    onSearchChange?.(text);
                  }}
                  autoFocus
                />
                {onCreateNew && (
                  <Button
                    variant="outline"
                    className={cn("mx-2 h-auto", {
                      "cursor-not-allowed opacity-50": searchOptionExists || searchValue.trim() === "",
                    })}
                    onPress={() => handleCreateNew(searchValue.trim())}
                    disabled={searchOptionExists || searchValue.trim() === ""}
                  >
                    <ButtonText>Opret</ButtonText>
                  </Button>
                )}
              </Input>
            </Box>

            {newItems && newItems.length > 0 && (
              <>
                <Text className="text-typography-500 px-1 text-xs uppercase">Nye elementer</Text>
                <FlatList
                  data={newItems}
                  keyExtractor={(option) => option.id}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="interactive"
                  contentContainerStyle={{ paddingBottom: 12 }}
                  renderItem={({ item }) => (
                    <Pressable
                      className={cn("active:bg-background-100 w-full flex-row justify-between rounded-lg px-3 py-2", {
                        "bg-background-50": selectedIds.includes(item.id),
                      })}
                      onPress={() => {
                        if (multiSelect) {
                          const nextValues = selectedIds.includes(item.id)
                            ? selectedIds.filter((selectedId) => selectedId !== item.id)
                            : [...selectedIds, item.id];

                          onChangeValues?.(nextValues);
                          return;
                        }

                        onChange?.(item.id);
                        setIsOpen(false);
                        setSearchValue("");
                      }}
                    >
                      <Text className="text-typography-700">{item.name}</Text>
                      {selectedIds.includes(item.id) && <Icon as={CheckIcon} className="text-primary-500" />}
                    </Pressable>
                  )}
                />
                <Divider className="my-4" />
              </>
            )}

            {filteredOptions.length > 0 ? (
              <FlatList
                data={filteredOptions}
                keyExtractor={(option) => option.id}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentContainerStyle={{ paddingBottom: 12 }}
                renderItem={({ item }) => (
                  <Pressable
                    className={cn("active:bg-background-100 w-full flex-row justify-between rounded-lg px-3 py-2", {
                      "bg-background-50": selectedIds.includes(item.id),
                    })}
                    onPress={() => {
                      if (multiSelect) {
                        const nextValues = selectedIds.includes(item.id)
                          ? selectedIds.filter((selectedId) => selectedId !== item.id)
                          : [...selectedIds, item.id];

                        onChangeValues?.(nextValues);
                        return;
                      }

                      onChange?.(item.id);
                      setIsOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <Text className="text-typography-700">{item.name}</Text>
                    {selectedIds.includes(item.id) && <Icon as={CheckIcon} className="text-primary-500" />}
                  </Pressable>
                )}
              />
            ) : (
              <Box className="px-2 py-2">
                <Text className="text-typography-500">{emptyStateText}</Text>
                {onCreateNew && searchValue.trim() !== "" && !searchOptionExists && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onPress={() => handleCreateNew(searchValue.trim())}
                  >
                    <ButtonText>{`Opret "${searchValue.trim()}"`}</ButtonText>
                  </Button>
                )}
              </Box>
            )}
          </ModalContent>
        </KeyboardAvoidingView>
      </Modal>
    </Box>
  );
}

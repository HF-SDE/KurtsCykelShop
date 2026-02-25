import { useEffect, useState } from "react";

import { Button, ButtonText } from "@/components/ui/button";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";

import { Heading } from "@components/ui/heading";
import { HStack } from "@components/ui/hstack";
import { Icon } from "@components/ui/icon";
import { Text } from "@components/ui/text";
import { VStack } from "@components/ui/vstack";
import { CheckIcon, XIcon } from "lucide-react-native";

interface CasesFilterDrawerProps {
  showDrawer: boolean;
  setShowDrawer: (value: boolean) => void;
  selectedStatuses: CaseStatus[];
  setSelectedStatuses: (statuses: CaseStatus[]) => void;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
}

const statusOptions = [
  { value: "completed", label: "Afsluttet", color: "success" },
  { value: "in-progress", label: "I gang", color: "info" },
  { value: "pending", label: "Afventer", color: "warning" },
  { value: "cancelled", label: "Annuleret", color: "error" },
] as const;

export type CaseStatus = (typeof statusOptions)[number]["value"];

export const CaseStatusValues: CaseStatus[] = statusOptions.map((option) => option.value);

const timeRangeOptions = [
  { value: "all", label: "Alle" },
  { value: "today", label: "I dag" },
  { value: "week", label: "Sidste uge" },
  { value: "month", label: "Sidste måned" },
  { value: "quarter", label: "Sidste kvartal" },
  { value: "year", label: "Sidste år" },
] as const;

export type TimeRange = (typeof timeRangeOptions)[number]["value"];

export function CasesFilterDrawer({
  showDrawer,
  setShowDrawer,
  selectedStatuses,
  setSelectedStatuses,
  timeRange,
  setTimeRange,
}: CasesFilterDrawerProps) {
  // Local state for filter selections (only applied when "Anvend" is clicked)
  const [localStatuses, setLocalStatuses] = useState<CaseStatus[]>(selectedStatuses);
  const [localTimeRange, setLocalTimeRange] = useState<TimeRange>(timeRange);

  // Sync local state with parent state when drawer opens
  useEffect(() => {
    if (showDrawer) {
      setLocalStatuses(selectedStatuses);
      setLocalTimeRange(timeRange);
    }
  }, [showDrawer, selectedStatuses, timeRange]);

  const toggleStatus = (status: CaseStatus) => {
    if (localStatuses.includes(status)) {
      setLocalStatuses(localStatuses.filter((s) => s !== status));
    } else {
      setLocalStatuses([...localStatuses, status]);
    }
  };

  const handleReset = () => {
    setLocalStatuses(CaseStatusValues);
    setLocalTimeRange("all");
  };

  const handleApply = () => {
    setSelectedStatuses(localStatuses);
    setTimeRange(localTimeRange);
    setShowDrawer(false);
  };

  const handleClose = () => {
    // Reset local state to parent state when closing without applying
    setLocalStatuses(selectedStatuses);
    setLocalTimeRange(timeRange);
    setShowDrawer(false);
  };
  return (
    <Drawer isOpen={showDrawer} size="lg" anchor="right" onClose={handleClose}>
      <DrawerBackdrop />
      <DrawerContent className="px-8">
        <DrawerHeader className="mt-16">
          <Heading size="lg">Filtre</Heading>
          <DrawerCloseButton>
            <Icon as={XIcon} />
          </DrawerCloseButton>
        </DrawerHeader>
        <DrawerBody>
          <VStack space="xl" className="py-4">
            {/* Status Filter */}
            <VStack space="md">
              <Text size="lg" bold>
                Status
              </Text>
              <VStack space="sm">
                {statusOptions.map((option) => (
                  <Checkbox
                    key={option.value}
                    value={option.value}
                    isChecked={localStatuses.includes(option.value)}
                    onChange={() => toggleStatus(option.value)}
                    size="md"
                  >
                    <CheckboxIndicator>
                      <CheckboxIcon as={CheckIcon} />
                    </CheckboxIndicator>
                    <CheckboxLabel>{option.label}</CheckboxLabel>
                  </Checkbox>
                ))}
              </VStack>
            </VStack>

            {/* Time Range Filter */}
            <VStack space="md">
              <Text size="lg" bold>
                Tidsperiode
              </Text>
              <VStack space="xs">
                {timeRangeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={localTimeRange === option.value ? "solid" : "outline"}
                    action={localTimeRange === option.value ? "primary" : "secondary"}
                    onPress={() => setLocalTimeRange(option.value)}
                    className="justify-start"
                  >
                    <ButtonText>{option.label}</ButtonText>
                  </Button>
                ))}
              </VStack>
            </VStack>
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <HStack space="md" className="w-full">
            <Button variant="outline" onPress={handleReset} className="flex-1">
              <ButtonText>Nulstil</ButtonText>
            </Button>
            <Button variant="solid" action="primary" onPress={handleApply} className="flex-1">
              <ButtonText>Anvend</ButtonText>
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

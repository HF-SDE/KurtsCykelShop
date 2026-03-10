import { useEffect, useState } from "react";

import { Button, ButtonText } from "@/components/ui/button";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";

import { ItemStatus } from "@/types/Inventory/ItemStatus";
import { Location } from "@/types/Inventory/Location";
import { Vendor } from "@/types/Inventory/Vendor";

import { Combobox } from "@components/combobox";
import { Box } from "@components/ui/box";
import { Heading } from "@components/ui/heading";
import { HStack } from "@components/ui/hstack";
import { Icon } from "@components/ui/icon";
import { Text } from "@components/ui/text";
import { VStack } from "@components/ui/vstack";
import { useData } from "@hooks/useData";
import { ItemFiltersType } from "@schemas/item.schemas";
import { XIcon } from "lucide-react-native";

interface StorageFilterDrawerProps {
  showDrawer: boolean;
  setShowDrawer: (value: boolean) => void;
  filters: ItemFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<ItemFiltersType>>;
}

const isPublicOptions = {
  true: "Offentlig",
  false: "Privat",
  off: "Fra",
} as const;

type IsPublicOptionValue = keyof typeof isPublicOptions;

export function StorageFilterDrawer({ showDrawer, setShowDrawer, filters, setFilters }: StorageFilterDrawerProps) {
  const [vendors] = useData<Vendor>("/vendors");
  const [statuses] = useData<ItemStatus>("/item-statuses");
  const [locations] = useData<Location>("/locations");

  const [localFilters, setLocalFilters] = useState<ItemFiltersType>(filters);
  const [currentIsPublic, setCurrentIsPublic] = useState<IsPublicOptionValue>(
    filters.isPublic === true ? "true" : filters.isPublic === false ? "false" : "off",
  );

  function cycleIsPublic() {
    const nextValue: IsPublicOptionValue =
      currentIsPublic === "off" ? "true" : currentIsPublic === "true" ? "false" : "off";

    setCurrentIsPublic(nextValue);

    if (nextValue === "off") {
      setLocalFilters((prev) => {
        const { isPublic, ...rest } = prev;
        return rest;
      });
    } else {
      setLocalFilters((prev) => ({ ...prev, isPublic: nextValue === "true" }));
    }
  }

  useEffect(() => {
    if (showDrawer) setLocalFilters(filters);
  }, [showDrawer, filters]);

  function handleChange<K extends keyof ItemFiltersType>(key: K, value: ItemFiltersType[K]) {
    setLocalFilters((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  }

  function handleReset() {
    setLocalFilters({});
    setCurrentIsPublic("off");
  }

  function handleApply() {
    setFilters(localFilters);
    setShowDrawer(false);
  }

  function handleClose() {
    setLocalFilters(filters);
    setShowDrawer(false);
    setCurrentIsPublic(filters.isPublic === true ? "true" : filters.isPublic === false ? "false" : "off");
  }

  return (
    <Drawer isOpen={showDrawer} size="lg" anchor="right" onClose={handleClose}>
      <DrawerBackdrop />
      <DrawerContent className="px-8 max-w-md">
        <DrawerHeader className="mt-16">
          <Heading size="lg">Filtre</Heading>
          <DrawerCloseButton>
            <Icon as={XIcon} />
          </DrawerCloseButton>
        </DrawerHeader>
        <DrawerBody>
          <VStack space="xl" className="py-4">
            <Combobox
              label="Leverandør"
              options={vendors}
              value={localFilters.vendorId}
              onChange={(value) => handleChange("vendorId", value)}
            />

            <Combobox
              label="Lokationer"
              options={locations}
              value={localFilters.locationId}
              onChange={(value) => handleChange("locationId", value)}
            />

            <Combobox
              label="Status"
              options={statuses.map((status) => ({ id: status.id, name: status.code }))}
              value={localFilters.statusId}
              onChange={(value) => handleChange("statusId", value)}
            />

            <Box className="flex-1 flex-row justify-between">
              <Text size="lg" bold className="mb-2">
                Synlighed
              </Text>

              <Button variant="outline" onPress={cycleIsPublic}>
                <ButtonText>{isPublicOptions[currentIsPublic]}</ButtonText>
              </Button>
            </Box>
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

import { useEffect, useState } from "react";
import { Alert, FlatList } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SafeAreaView } from "react-native-safe-area-context";

import { Location } from "@api-types/Inventory/Location";
import { Unit } from "@api-types/Inventory/Unit";
import { Vendor } from "@api-types/Inventory/Vendor";
import { ListTableColumn } from "@api-types/ui";
import { FoxLoader } from "@components/fox";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@components/ui/button";
import { HStack } from "@components/ui/hstack";
import { CloseIcon, Icon } from "@components/ui/icon";
import { Input, InputField } from "@components/ui/input";
import { ListTableHeader, ListTableRow } from "@components/ui/list-table";
import { Modal, ModalBackdrop, ModalCloseButton, ModalContent, ModalHeader } from "@components/ui/modal";
import { Text } from "@components/ui/text";
import { useData } from "@hooks/useData";
import apiClient from "@utils/apiClient";
import { Pencil, Plus, Trash2 } from "lucide-react-native";

type ManageableEntity = {
  id: string;
  name: string;
};

type EditState = {
  type: "vendors" | "locations" | "units";
  id: string;
};

const cachedDataOptions = { cacheTimeMs: 5 * 60 * 1000 };
const columns: ListTableColumn<ManageableEntity>[] = [
  {
    key: "name",
    header: "Navn",
    flexClassName: "flex-[2]",
  },
];

export default function ManagementScreen() {
  const [activeType, setActiveType] = useState<EditState["type"]>("vendors");
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingItemKey, setDeletingItemKey] = useState<string | null>(null);

  const [vendors, setVendors, vendorsLoading, refreshVendors] = useData<Vendor>("/vendors", [], cachedDataOptions);
  const [locations, setLocations, locationsLoading, refreshLocations] = useData<Location>(
    "/locations",
    [],
    cachedDataOptions,
  );
  const [units, setUnits, unitsLoading, refreshUnits] = useData<Unit>("/units", [], cachedDataOptions);

  const currentItems: ManageableEntity[] =
    activeType === "vendors" ? vendors : activeType === "locations" ? locations : units;
  const isLoading =
    activeType === "vendors" ? vendorsLoading : activeType === "locations" ? locationsLoading : unitsLoading;
  const refresh =
    activeType === "vendors" ? refreshVendors : activeType === "locations" ? refreshLocations : refreshUnits;
  const emptyStateText =
    activeType === "vendors"
      ? "Ingen leverandorer fundet."
      : activeType === "locations"
        ? "Ingen lokationer fundet."
        : "Ingen enheder fundet.";

  function endpoint(type: EditState["type"]) {
    switch (type) {
      case "vendors":
        return "/vendors";
      case "locations":
        return "/locations";
      case "units":
        return "/units";
    }
  }

  useEffect(() => {
    if (!isLoading && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [isLoading, isRefreshing]);

  function openEditModal(type: EditState["type"], item: ManageableEntity) {
    setEditState({ type, id: item.id });
    setEditValue(item.name);
  }

  function openCreateModal() {
    setCreateName("");
    setCreateCode("");
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (isCreating) return;
    setIsCreateModalOpen(false);
    setCreateName("");
    setCreateCode("");
  }

  async function handleCreateItem() {
    if (isCreating) return;

    const name = createName.trim();
    if (!name) return;

    const code = createCode.trim();
    if (activeType === "units" && !code) {
      Alert.alert("Fejl", "Kode er paakraevet for enheder.");
      return;
    }

    setIsCreating(true);

    try {
      const payload = activeType === "units" ? { name, code } : { name };
      const response = await apiClient.post(endpoint(activeType), payload);
      const createdItem = response.data?.data as Vendor | Location | Unit | undefined;

      if (!createdItem || !createdItem.id) {
        throw new Error("Invalid create response");
      }

      if (activeType === "vendors") {
        setVendors((current) => [...current, createdItem as Vendor]);
      } else if (activeType === "locations") {
        setLocations((current) => [...current, createdItem as Location]);
      } else {
        setUnits((current) => [...current, createdItem as Unit]);
      }

      setIsCreateModalOpen(false);
      setCreateName("");
      setCreateCode("");
    } catch (error) {
      console.error("Error creating item:", error);
      Alert.alert("Fejl", "Kunne ikke oprette elementet. Proev igen.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveEdit() {
    if (!editState || isSaving) return;

    const nextName = editValue.trim();
    if (!nextName) return;

    setIsSaving(true);

    try {
      await apiClient.put(`${endpoint(editState.type)}/${editState.id}`, {
        name: nextName,
      });

      if (editState.type === "vendors") {
        setVendors((current) => current.map((item) => (item.id === editState.id ? { ...item, name: nextName } : item)));
      } else if (editState.type === "locations") {
        setLocations((current) =>
          current.map((item) => (item.id === editState.id ? { ...item, name: nextName } : item)),
        );
      } else {
        setUnits((current) => current.map((item) => (item.id === editState.id ? { ...item, name: nextName } : item)));
      }

      setEditState(null);
      setEditValue("");
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Fejl", "Kunne ikke opdatere elementet. Proev igen.");
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(type: EditState["type"], item: ManageableEntity) {
    Alert.alert("Slet", `Er du sikker pa, at du vil slette "${item.name}"?`, [
      { text: "Annuller", style: "cancel" },
      {
        text: "Slet",
        style: "destructive",
        onPress: () => handleDelete(type, item.id),
      },
    ]);
  }

  async function handleDelete(type: EditState["type"], id: string) {
    const deletingKey = `${type}:${id}`;
    setDeletingItemKey(deletingKey);

    try {
      await apiClient.delete(`${endpoint(type)}/${id}`);

      if (type === "vendors") {
        setVendors((current) => current.filter((item) => item.id !== id));
      } else if (type === "locations") {
        setLocations((current) => current.filter((item) => item.id !== id));
      } else {
        setUnits((current) => current.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Fejl", "Kunne ikke slette elementet. Proev igen.");
    } finally {
      setDeletingItemKey(null);
    }
  }

  if (isLoading && currentItems.length === 0 && !isRefreshing) {
    return (
      <SafeAreaView className="bg-background-0 w-full flex-1 px-2" edges={{ top: "additive" }}>
        <FoxLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background-0 w-full flex-1 px-2" edges={{ top: "additive" }}>
      <Box className="mb-4 h-14 w-full flex-row justify-between gap-3 lg:mt-5">
        <ButtonGroup className="h-full flex-row gap-2">
          <Button
            size="sm"
            className="h-full"
            variant={activeType === "vendors" ? "solid" : "outline"}
            onPress={() => setActiveType("vendors")}
          >
            <ButtonText>Leverandører</ButtonText>
          </Button>
          <Button
            size="sm"
            className="h-full"
            variant={activeType === "locations" ? "solid" : "outline"}
            onPress={() => setActiveType("locations")}
          >
            <ButtonText>Lokationer</ButtonText>
          </Button>
          <Button
            size="sm"
            className="h-full"
            variant={activeType === "units" ? "solid" : "outline"}
            onPress={() => setActiveType("units")}
          >
            <ButtonText>Enheder</ButtonText>
          </Button>
        </ButtonGroup>

        <Button variant="outline" className="h-full" onPress={openCreateModal}>
          <ButtonIcon as={Plus} />
        </Button>
      </Box>

      <Box className="flex-1">
        <FlatList
          style={{ flex: 1 }}
          data={currentItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable
              overshootRight={false}
              rightThreshold={40}
              renderRightActions={() => (
                <Button
                  action="negative"
                  size="lg"
                  className="h-full w-[110px] rounded-none"
                  onPress={() => confirmDelete(activeType, item)}
                  isDisabled={deletingItemKey === `${activeType}:${item.id}`}
                >
                  <ButtonIcon className="text-typography-700" as={Trash2} />
                  <ButtonText className="text-typography-700">
                    {deletingItemKey === `${activeType}:${item.id}` ? "..." : "Slet"}
                  </ButtonText>
                </Button>
              )}
            >
              <ListTableRow
                item={item}
                columns={columns}
                onPress={() => openEditModal(activeType, item)}
                action={
                  <Button variant="outline" action="secondary" className="!border-0">
                    <ButtonIcon size="3xl" as={Pencil} />
                  </Button>
                }
              />
            </Swipeable>
          )}
          ListHeaderComponent={<ListTableHeader columns={columns} action={<Box />} />}
          stickyHeaderIndices={[0]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
          canCancelContentTouches
          directionalLockEnabled
          onRefresh={() => {
            setIsRefreshing(true);
            refresh();
          }}
          refreshing={isRefreshing}
          ListEmptyComponent={
            <Box className="bg-background-0 items-center justify-center py-10">
              <Text size="lg">{emptyStateText}</Text>
            </Box>
          }
        />
      </Box>

      <Modal
        isOpen={Boolean(editState)}
        onClose={() => {
          if (isSaving) return;
          setEditState(null);
          setEditValue("");
        }}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader className="items-center">
            <Text size="lg" bold>
              Rediger navn
            </Text>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <Box className="p-4 pt-0">
            <Input>
              <InputField value={editValue} onChangeText={setEditValue} autoFocus />
            </Input>
            <HStack className="mt-4 justify-end gap-2">
              <Button
                variant="outline"
                action="secondary"
                className="mr-3"
                onPress={() => {
                  setEditState(null);
                  setEditValue("");
                }}
                isDisabled={isSaving}
              >
                <ButtonText>Annuller</ButtonText>
              </Button>
              <Button onPress={handleSaveEdit} isDisabled={isSaving || editValue.trim() === ""}>
                <ButtonText>{isSaving ? "Gemmer..." : "Gem"}</ButtonText>
              </Button>
            </HStack>
          </Box>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader className="items-center">
            <Text size="lg" bold>
              Opret {activeType === "vendors" ? "leverandoer" : activeType === "locations" ? "lokation" : "enhed"}
            </Text>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <Box className="p-4 pt-0">
            <Input>
              <InputField value={createName} onChangeText={setCreateName} autoFocus placeholder="Navn" />
            </Input>

            {activeType === "units" && (
              <Input className="mt-3">
                <InputField value={createCode} onChangeText={setCreateCode} placeholder="Kode" />
              </Input>
            )}

            <HStack className="mt-4 justify-end gap-2">
              <Button
                variant="outline"
                action="secondary"
                className="mr-3"
                onPress={closeCreateModal}
                isDisabled={isCreating}
              >
                <ButtonText>Annuller</ButtonText>
              </Button>
              <Button
                onPress={handleCreateItem}
                isDisabled={
                  isCreating || createName.trim() === "" || (activeType === "units" && createCode.trim() === "")
                }
              >
                <ButtonText>{isCreating ? "Opretter..." : "Opret"}</ButtonText>
              </Button>
            </HStack>
          </Box>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}

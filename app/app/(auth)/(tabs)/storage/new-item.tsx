import { useMemo, useRef, useState } from "react";
import { Alert, ScrollView } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Grid, GridItem } from "@/components/ui/grid";

import { Item } from "@/types/Inventory/Item";
import { ItemStatus } from "@/types/Inventory/ItemStatus";
import { Location } from "@/types/Inventory/Location";
import { Unit } from "@/types/Inventory/Unit";
import { Vendor } from "@/types/Inventory/Vendor";

import { AddBarcode } from "@components/storage/add-barcode-drawer";
import { FormStateValue, StorageField, toFormState, toInputValue } from "@components/storage/form-fields";
import { Badge, BadgeText } from "@components/ui/badge";
import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";
import { useToast } from "@components/ui/toast";
import { useData } from "@hooks/useData";
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import { CreateItemSchema, CreateItemType } from "@schemas/item.schemas";
import { APIResponse } from "@utils/ApiResponse";
import apiClient from "@utils/apiClient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { z } from "zod";

import { useStorage } from "./ctx";

const cachedDataOptions = { cacheTimeMs: 60 * 60 * 1000 };

export default function NewItem() {
  const { barcode = undefined } = useLocalSearchParams();

  const initialState: CreateItemType = {
    name: "",
    description: "",
    quantity: 0,
    isPublic: false,
    price: 0,
    purchasePrice: 0,
    unitId: "",
    minSellQuantity: 0,
    vendorId: "",
    statusId: "",
    locationId: "",
    barcodes: barcode ? [barcode as string] : [],
  };

  return <NewRender initialState={initialState} />;
}

interface NewRenderProps {
  initialState: CreateItemType;
}

export function NewRender({ initialState }: NewRenderProps) {
  const toast = useToast();
  const { setData } = useStorage();

  const [formState, setFormState] = useState(toFormState(initialState));
  const [units, , unitsLoading] = useData<Unit>("/units", [], cachedDataOptions);
  const [vendors, , vendorsLoading, refreshVendors] = useData<Vendor>("/vendors", [], cachedDataOptions);
  const [statuses, , statusesLoading] = useData<ItemStatus>("/item-statuses", [], cachedDataOptions);
  const [locations, , locationsLoading, refreshLocations] = useData<Location>("/locations", [], cachedDataOptions);

  const [newVendorName, setNewVendorName] = useState<string | undefined>();
  const [newLocationName, setNewLocationName] = useState<string | undefined>();

  const statusOptions = useMemo(() => statuses.map((status) => ({ id: status.id, name: status.code })), [statuses]);

  const router = useRouter();
  const navigation = useNavigation();
  const allowNavigationRef = useRef(false);

  const [isBarcodeDrawerOpen, setIsBarcodeDrawerOpen] = useState(false);

  function isDifferent(a: unknown, b: unknown): boolean {
    if (Array.isArray(a) && Array.isArray(b)) return JSON.stringify(a) !== JSON.stringify(b);
    return a !== b;
  }

  const hasUnsavedChanges = Object.entries(toInputValue(formState)).some(([key, value]) =>
    isDifferent(value, initialState[key as keyof CreateItemType]),
  );

  function confirmDiscard(onConfirm: () => void) {
    Alert.alert("Bekræft", "Er du sikker på, at du vil annullere? Alle ændringer vil gå tabt.", [
      { text: "Annuller", style: "cancel" },
      { text: "Slet og gå tilbage", style: "destructive", onPress: onConfirm },
    ]);
  }

  usePreventRemove(hasUnsavedChanges && !allowNavigationRef.current, ({ data }) => {
    confirmDiscard(() => {
      allowNavigationRef.current = true;
      navigation.dispatch(data.action);
    });
  });

  function setFormStateValue<K extends keyof CreateItemType>(
    key: K,
    value: CreateItemType[K],
    keyToUpdate: keyof FormStateValue<CreateItemType[K]> = "value",
  ) {
    setFormState((prev) => ({ ...prev, [key]: { ...prev[key], [keyToUpdate]: value } }));
  }

  async function handleSubmit() {
    const validationResult = CreateItemSchema.safeParse(toInputValue(formState));
    const errorMap: Record<string, { errors?: string[] }> = validationResult.success
      ? {}
      : (z.treeifyError(validationResult.error).properties ?? {});

    setFormState(
      (prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([key, field]) => [key, { ...field, errors: errorMap[key]?.errors ?? [] }]),
        ) as typeof prev,
    );

    if (validationResult.success) {
      if (validationResult.data.vendorId?.startsWith("new-") && newVendorName) {
        try {
          const response = await apiClient.post<APIResponse<Vendor>>("/vendors", { name: newVendorName });
          if (!response.data.data || !response.data.data.id) {
            throw new Error("Invalid response from server");
          }

          validationResult.data.vendorId = response.data.data.id;
          refreshVendors();
        } catch (error) {
          console.error("Error creating new vendor:", error);
          toast.show({
            render: ({ id }) => (
              <Box className="rounded-md bg-red-500 px-4 py-2">
                <Text className="text-white">Fejl ved oprettelse af leverandør!</Text>
              </Box>
            ),
          });
          return;
        }
      }

      if (validationResult.data.locationId?.startsWith("new-") && newLocationName) {
        try {
          const response = await apiClient.post<APIResponse<Location>>("/locations", { name: newLocationName });
          if (!response.data.data || !response.data.data.id) {
            throw new Error("Invalid response from server");
          }

          validationResult.data.locationId = response.data.data.id;
          refreshLocations();
        } catch (error) {
          console.error("Error creating new location:", error);
          toast.show({
            render: ({ id }) => (
              <Box className="rounded-md bg-red-500 px-4 py-2">
                <Text className="text-white">Fejl ved oprettelse af lokation!</Text>
              </Box>
            ),
          });
          return;
        }
      }

      const response = await apiClient.post<APIResponse<Item>>("/items", validationResult.data);

      const newItem = response.data.data;

      if (!newItem) {
        toast.show({
          render: ({ id }) => (
            <Box className="rounded-md bg-red-500 px-4 py-2">
              <Text className="text-white">Fejl ved oprettelse af vare!</Text>
            </Box>
          ),
        });
        return;
      }

      toast.show({
        render: ({ id }) => (
          <Box className="rounded-md bg-green-500 px-4 py-2">
            <Text className="text-white">Vare oprettet!</Text>
            <Text className="text-green-100" size="sm">
              ID: {newItem.id}
            </Text>
          </Box>
        ),
      });

      setData((prev) => {
        const newList = [...prev, newItem];
        return newList.sort((a, b) => a.name.localeCompare(b.name));
      });

      allowNavigationRef.current = true;
      router.back();
    }
  }

  function handleReset() {
    router.back();
  }

  return (
    <Box className="bg-background-0 flex-1">
      <ScrollView contentContainerClassName="items-center" keyboardShouldPersistTaps="handled">
        <Grid className="gap-4 p-4" _extra={{ className: "grid-cols-2" }}>
          <GridItem _extra={{ className: "col-span-2" }}>
            <StorageField
              label="Navn"
              placeholder="Fx. Cykel"
              formStateValue={formState.name}
              onChange={(name) => setFormStateValue("name", name)}
            />
          </GridItem>

          <GridItem className="rounded-md text-center" _extra={{ className: "col-span-2" }}>
            <StorageField
              label="Beskrivelse"
              placeholder="Beskrivende tekst"
              formStateValue={formState.description}
              onChange={(description) => setFormStateValue("description", description)}
              isRequired={false}
              isTextArea
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Pris (DKK)"
              placeholder="Fx. 25"
              formStateValue={formState.price}
              onChange={(price) => setFormStateValue("price", price)}
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Indkøbs pris (DKK)"
              placeholder="Fx. 20"
              formStateValue={formState.purchasePrice}
              onChange={(purchasePrice) => setFormStateValue("purchasePrice", purchasePrice)}
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Antal"
              placeholder="Fx. 10"
              formStateValue={formState.quantity}
              onChange={(quantity) => setFormStateValue("quantity", quantity)}
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Enhed"
              placeholder="Vælg enhed"
              formStateValue={formState.unitId}
              onChange={(id) => setFormStateValue("unitId", id)}
              fieldType="select"
              selectOptions={units}
              isDisabled={unitsLoading}
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Minimum sælge antal"
              placeholder="Fx. 5"
              formStateValue={formState.minSellQuantity}
              onChange={(minSellQuantity) => setFormStateValue("minSellQuantity", minSellQuantity)}
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Leverandør"
              placeholder="Vælg leverandør"
              formStateValue={formState.vendorId}
              onChange={(id) => setFormStateValue("vendorId", id)}
              fieldType="combobox"
              selectOptions={vendors}
              isDisabled={vendorsLoading}
              onCreateNew={(name) => {
                const newVendorId = `new-${Date.now()}`;
                setNewVendorName(name);
                setFormStateValue("vendorId", newVendorId);
              }}
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Status"
              placeholder="Vælg status"
              formStateValue={formState.statusId}
              onChange={(id) => setFormStateValue("statusId", id)}
              fieldType="combobox"
              selectOptions={statusOptions}
              isDisabled={statusesLoading}
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Lokation"
              placeholder="Vælg lokation"
              formStateValue={formState.locationId}
              onChange={(id) => setFormStateValue("locationId", id)}
              fieldType="combobox"
              selectOptions={locations}
              isDisabled={locationsLoading}
              onCreateNew={(name) => {
                const newLocationId = `new-${Date.now()}`;
                setNewLocationName(name);
                setFormStateValue("locationId", newLocationId);
              }}
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Offentlig"
              formStateValue={formState.isPublic}
              onChange={(isPublic) => setFormStateValue("isPublic", isPublic)}
            />
          </GridItem>

          <GridItem>
            <Button variant="outline" onPress={() => setIsBarcodeDrawerOpen(true)}>
              <ButtonText>Stregkoder</ButtonText>
              {formState.barcodes.value && formState.barcodes.value.length > 0 && (
                <Badge
                  size="md"
                  variant="outline"
                  action="muted"
                  className="bg-background-0 absolute right-2 rounded-lg"
                >
                  <BadgeText>
                    {formState.barcodes.value.length > 99 ? "99+" : formState.barcodes.value.length}
                  </BadgeText>
                </Badge>
              )}
            </Button>

            <AddBarcode
              isOpen={isBarcodeDrawerOpen}
              setIsOpen={setIsBarcodeDrawerOpen}
              barcodes={formState.barcodes.value ?? []}
              onAddBarcode={(barcode) =>
                setFormStateValue("barcodes", [...(formState.barcodes.value ?? []), barcode], "value")
              }
              onRemoveBarcode={(barcode) =>
                setFormStateValue("barcodes", formState.barcodes.value?.filter((b) => b !== barcode) ?? [], "value")
              }
            />
          </GridItem>
        </Grid>
      </ScrollView>

      <Box className="mb-5 w-full flex-row items-center justify-center gap-4 px-4">
        <Button size="2xl" variant="outline" action="secondary" onPress={handleReset}>
          <ButtonText>Annuller</ButtonText>
        </Button>

        <Button size="2xl" action="primary" onPress={handleSubmit}>
          <ButtonText>Opret</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}

import { useRef, useState } from "react";
import { Alert, ScrollView } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Grid, GridItem } from "@/components/ui/grid";

import { Item } from "@/types/Inventory/Item";
import { ItemStatus } from "@/types/Inventory/ItemStatus";
import { Location } from "@/types/Inventory/Location";
import { Unit } from "@/types/Inventory/Unit";
import { Vendor } from "@/types/Inventory/Vendor";

import { FoxLoader } from "@components/fox";
import { AddBarcode } from "@components/storage/add-barcode-drawer";
import { FormStateValue, StorageField, toFormState, toInputValue } from "@components/storage/form-fields";
import { Badge, BadgeText } from "@components/ui/badge";
import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";
import { useToast } from "@components/ui/toast";
import { useData } from "@hooks/useData";
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import { EditItemSchema } from "@schemas/item.schemas";
import { APIResponse } from "@utils/ApiResponse";
import apiClient from "@utils/apiClient";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { z } from "zod";

import { useStorage } from "../ctx";

const cachedDataOptions = { cacheTimeMs: 60 * 60 * 1000 };

export default function EditItem() {
  const { id } = useGlobalSearchParams();
  const router = useRouter();

  const { data: items, isLoading } = useStorage();

  const item = items.find((i) => i.id === id);

  if (!id || isLoading) return <FoxLoader />;

  if (!item) {
    Alert.alert("Genstand ikke fundet", "Den genstand du prøver at redigere kunne ikke findes.", [
      { text: "OK", onPress: () => router.back() },
    ]);

    return null;
  }

  return <EditRender initialState={item} />;
}
interface EditItemProps {
  initialState: Item;
}

function EditRender({ initialState }: EditItemProps) {
  const toast = useToast();
  const { setData } = useStorage();

  const [formState, setFormState] = useState(toFormState(initialState));
  const [units, , unitsLoading] = useData<Unit>("/units", [], cachedDataOptions);
  const [vendors, , vendorsLoading] = useData<Vendor>("/vendors", [], cachedDataOptions);
  const [statuses, , statusesLoading] = useData<ItemStatus>("item-statuses", [], cachedDataOptions);
  const [locations, , locationsLoading] = useData<Location>("/locations", [], cachedDataOptions);

  const router = useRouter();
  const navigation = useNavigation();
  const allowNavigationRef = useRef(false);

  const [isBarcodeDrawerOpen, setIsBarcodeDrawerOpen] = useState(false);

  function isDifferent(a: unknown, b: unknown): boolean {
    if (Array.isArray(a) && Array.isArray(b)) return JSON.stringify(a) !== JSON.stringify(b);
    return a !== b;
  }

  const hasUnsavedChanges = Object.entries(toInputValue(formState)).some(([key, value]) =>
    isDifferent(value, initialState[key as keyof Item]),
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

  function setFormStateValue<K extends keyof Item>(
    key: K,
    value: Item[K],
    keyToUpdate: keyof FormStateValue<Item[K]> = "value",
  ) {
    setFormState((prev) => ({ ...prev, [key]: { ...prev[key], [keyToUpdate]: value } }));
  }

  async function handleSubmit() {
    const validationResult = EditItemSchema.safeParse(toInputValue(formState));
    const errorMap: Record<string, { errors?: string[] }> = validationResult.success
      ? {}
      : (z.treeifyError(validationResult.error).properties ?? {});

    setFormState(
      (prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([key, field]) => [key, { ...field, errors: errorMap[key]?.errors ?? [] }]),
        ) as typeof prev,
    );

    if (!validationResult.success) return;

    const response = await apiClient.put<APIResponse<Item>>(`/items/${initialState.id}`, validationResult.data);

    const updatedItem = response.data.data;

    if (!updatedItem) {
      toast.show({
        render: ({ id }) => (
          <Box className="rounded-md bg-red-500 px-4 py-2">
            <Text className="text-white">Fejl ved opdatering af vare!</Text>
          </Box>
        ),
      });
      return;
    }

    toast.show({
      render: ({ id }) => (
        <Box className="rounded-md bg-green-500 px-4 py-2">
          <Text className="text-white">Vare opdateret!</Text>
          <Text className="text-green-100" size="sm">
            ID: {updatedItem.id}
          </Text>
        </Box>
      ),
    });

    setData((prev) => {
      const newList = prev.map((item) => (item.id === updatedItem.id ? updatedItem : item));
      return newList;
    });

    allowNavigationRef.current = true;
    router.back();
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
            />
          </GridItem>

          <GridItem>
            <StorageField
              label="Status"
              placeholder="Vælg status"
              formStateValue={formState.statusId}
              onChange={(id) => setFormStateValue("statusId", id)}
              fieldType="combobox"
              selectOptions={statuses.map((status) => ({ id: status.id, name: status.code }))}
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

        <Button
          size="2xl"
          action="primary"
          onPress={handleSubmit}
          disabled={!hasUnsavedChanges}
          className={!hasUnsavedChanges ? "opacity-50" : ""}
        >
          <ButtonText>Opdater</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}

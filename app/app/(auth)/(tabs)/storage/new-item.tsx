import { useState } from "react";
import { Alert } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Grid, GridItem } from "@/components/ui/grid";

import { Item } from "@/types/Inventory/Item";
import { Unit } from "@/types/Inventory/Unit";

import { StorageField } from "@components/storage/form-fields";
import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";
import { useToast } from "@components/ui/toast";
import { useData } from "@hooks/useData";
import { CreateItemSchema, CreateItemType } from "@schemas/item.schemas";
import { APIResponse } from "@utils/ApiResponse";
import apiClient from "@utils/apiClient";
import { useRouter } from "expo-router";
import { z } from "zod";

import { useStorage } from "./ctx";

export interface FormStateValue<T> {
  value: T;
  fieldType: string;
  errors?: string[];
}

type FormState<T> = {
  [K in keyof T]-?: FormStateValue<T[K]>;
};

const initialState: CreateItemType = {
  name: "",
  description: "",
  quantity: 0,
  isPublic: false,
  price: 0,
  purchasePrice: 0,
  unitId: "",
  minSellQuantity: 0,
};

function toFormState<T>(input: T): FormState<T> {
  const formState = {} as FormState<T>;

  for (const key in input) {
    formState[key] = {
      value: input[key],
      fieldType: typeof input[key],
      errors: [],
    };
  }

  return formState;
}

function toInputValue<T>(formState: FormState<T>): T {
  const inputValue = {} as T;

  for (const key in formState) {
    inputValue[key] = formState[key].value;
  }

  return inputValue;
}

export default function NewItem() {
  const toast = useToast();
  const { setData } = useStorage();

  const [formState, setFormState] = useState(toFormState(initialState));
  const [units, , unitsLoading] = useData<Unit>("/units", [], { cacheTimeMs: 60 * 60 * 1000 });

  const router = useRouter();

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

      router.back();
    }
  }

  function handleReset() {
    const currentFormState = toInputValue(formState);
    const hasChanged = Object.entries(currentFormState).some(
      ([key, value]) => value !== initialState[key as keyof CreateItemType],
    );

    if (hasChanged) {
      Alert.alert("Bekræft", "Er du sikker på, at du vil annullere? Alle ændringer vil gå tabt.", [
        { text: "Nej", style: "cancel" },
        { text: "Ja", style: "destructive", onPress: () => router.back() },
      ]);
    } else router.back();
  }

  return (
    <Box className="bg-background-0 flex-1 items-center">
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

        <GridItem _extra={{ className: "col-span-2" }}>
          <StorageField
            label="Offentlig"
            formStateValue={formState.isPublic}
            onChange={(isPublic) => setFormStateValue("isPublic", isPublic)}
          />
        </GridItem>
      </Grid>

      <Box className="mb-5 mt-auto w-full flex-row items-center justify-center gap-4 px-4">
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

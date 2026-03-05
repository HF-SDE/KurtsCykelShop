import { useState } from "react";
import { Alert, FlatList } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SafeAreaView } from "react-native-safe-area-context";

import { Item } from "@/types/Inventory/Item";
import { ListTableColumn } from "@/types/ui/listTable";

import { FoxLoader } from "@components/fox";
import { NavigationButton } from "@components/navigation-button";
import { Searchbar } from "@components/search";
import { ActionSheetBarcodeScanner } from "@components/storage/action-sheet-barcode-scanner";
import { StorageFilterDrawer } from "@components/storage/storage-filter-drawer";
import { Badge, BadgeText } from "@components/ui/badge";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@components/ui/button";
import { ListTableHeader, ListTableRow } from "@components/ui/list-table";
import { Spinner } from "@components/ui/spinner";
import { Text } from "@components/ui/text";
import apiClient from "@utils/apiClient";
import { useRouter } from "expo-router";
import { Filter, Pencil, Plus, ScanText, Trash2 } from "lucide-react-native";

import { useStorage } from "./ctx";

const itemColumns: ListTableColumn<Item>[] = [
  {
    key: "name",
    header: "Navn",
    flexClassName: "flex-[2]",
  },
  {
    key: "quantity",
    header: "Antal",
  },
];

export default function Storage() {
  const router = useRouter();

  const {
    data: items,
    search,
    setSearch,
    filters,
    setFilters,
    setData,
    isLoading,
    isRefreshing,
    isLoadingMore,
    refresh,
    loadMore,
  } = useStorage();

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isBarcodeDrawerOpen, setIsBarcodeDrawerOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  async function handleBarcodeScanned(barcode: string) {
    setIsBarcodeDrawerOpen(false);

    try {
      const response = await apiClient.get<{ data: Item[] }>("/items", { params: { search: barcode } });
      const foundItem = response.data.data.find((item) => item.barcodes.includes(barcode));

      if (foundItem) {
        router.push(`/storage/${foundItem.id}/edit-item`);
        return;
      }

      Alert.alert("Stregkode ikke fundet", "Ingen vare med denne stregkode blev fundet. Vil du oprette en ny vare?", [
        {
          text: "Opret",
          style: "default",
          onPress: () => router.push({ pathname: "/storage/new-item", params: { barcode } }),
        },
        { text: "Scan igen", onPress: () => setIsBarcodeDrawerOpen(true) },
        { text: "Annuller", onPress: () => {}, style: "cancel" },
      ]);
    } catch (error) {
      console.error("Error fetching item by barcode:", error);
      Alert.alert("Fejl", "Kunne ikke slå stregkoden op. Prøv igen.");
      setIsBarcodeDrawerOpen(true);
    }
  }

  async function handleDeleteItem(item: Item) {
    if (deletingItemId) return;
    setDeletingItemId(item.id);

    try {
      await apiClient.delete(`/items/${item.id}`);
      setData((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Fejl", "Kunne ikke slette varen. Prøv igen.");
    } finally {
      setDeletingItemId(null);
    }
  }

  function confirmDeleteItem(item: Item) {
    Alert.alert("Slet genstand", `Er du sikker på, at du vil slette "${item.name}"?`, [
      { text: "Annuller", style: "cancel" },
      {
        text: "Slet",
        style: "destructive",
        onPress: () => handleDeleteItem(item),
      },
    ]);
  }

  return (
    <SafeAreaView className="bg-background-0 w-full flex-1 px-2" edges={{ top: "additive" }}>
      <ActionSheetBarcodeScanner
        isOpen={isBarcodeDrawerOpen}
        onClose={() => setIsBarcodeDrawerOpen(false)}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <Box className="mb-4 h-14 w-full flex-row justify-between gap-3 lg:mt-5">
        <Searchbar className="h-full flex-1" placeholder="Søg i lager..." value={search} onChangeText={setSearch} />

        <StorageFilterDrawer
          showDrawer={showFilterDrawer}
          setShowDrawer={setShowFilterDrawer}
          filters={filters}
          setFilters={setFilters}
        />

        <ButtonGroup className="h-full flex-row gap-2">
          <Button variant="outline" className="h-full" onPress={() => setShowFilterDrawer(true)}>
            <ButtonIcon as={Filter} />
            {Object.keys(filters).length > 0 && (
              <Badge size="sm" className="absolute -right-2 -top-2 rounded-full" variant="solid" action="info">
                <BadgeText>{Object.keys(filters).length}</BadgeText>
              </Badge>
            )}
          </Button>

          <Button variant="outline" className="h-full" onPress={() => setIsBarcodeDrawerOpen(true)}>
            <ButtonIcon as={ScanText} />
          </Button>

          <NavigationButton variant="outline" className="h-full" href="/storage/new-item">
            <ButtonIcon as={Plus} />
          </NavigationButton>
        </ButtonGroup>
      </Box>

      {isLoading ? (
        <FoxLoader />
      ) : items?.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={items}
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
                  onPress={() => confirmDeleteItem(item)}
                  isDisabled={deletingItemId === item.id}
                >
                  <ButtonIcon className="text-typography-700" as={Trash2} />
                  <ButtonText className="text-typography-700">{deletingItemId === item.id ? "..." : "Slet"}</ButtonText>
                </Button>
              )}
            >
              <ListTableRow
                item={item}
                columns={itemColumns}
                onPress={() => router.navigate(`/storage/${item.id}/edit-item`)}
                action={
                  <Button variant="outline" action="secondary" className="!border-0">
                    <ButtonIcon size="3xl" as={Pencil} />
                  </Button>
                }
              />
            </Swipeable>
          )}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
          canCancelContentTouches
          directionalLockEnabled
          ListHeaderComponent={<ListTableHeader columns={itemColumns} action={<Box />} />}
          stickyHeaderIndices={[0]}
          onRefresh={refresh}
          refreshing={isRefreshing}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <Box className="items-center py-4">
                <Spinner />
              </Box>
            ) : null
          }
        />
      ) : (
        <Box className="bg-background-0 flex-1 items-center justify-center">
          <Text size="lg" className="mb-4">
            Ingen genstande fundet
          </Text>

          <NavigationButton href="/storage/new-item" variant="outline" action="secondary" size="lg">
            <ButtonIcon as={Plus} />
            <ButtonText>Tilføj genstand</ButtonText>
          </NavigationButton>
        </Box>
      )}
    </SafeAreaView>
  );
}

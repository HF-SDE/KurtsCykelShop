import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Item } from "@/types/Inventory/Item";
import { ListTableColumn } from "@/types/ui/listTable";

import { FoxLoader } from "@components/fox";
import { NavigationButton } from "@components/navigation-button";
import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@components/ui/button";
import { ListTableHeader, ListTableRow } from "@components/ui/list-table";
import { Spinner } from "@components/ui/spinner";
import { Text } from "@components/ui/text";
import { useRouter } from "expo-router";
import { ListFilter, Pencil, Plus, ScanText } from "lucide-react-native";

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
  const { data: items, isLoading, isRefreshing, isLoadingMore, refresh, loadMore } = useStorage();

  if (isLoading)
    return (
      <SafeAreaView className="bg-background-0 flex-1">
        <FoxLoader />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="bg-background-0 w-full flex-1 px-2" edges={{ top: "additive" }}>
      <Box className="mb-4 h-14 w-full flex-row justify-between gap-3">
        <Searchbar className="h-full flex-1" />

        <ButtonGroup className="h-full flex-row gap-2">
          <Button variant="outline" className="h-full">
            <ButtonIcon as={ListFilter} />
          </Button>

          <NavigationButton variant="outline" className="h-full" href="/storage/barcode-scanner">
            <ButtonIcon as={ScanText} />
          </NavigationButton>

          <NavigationButton variant="outline" className="h-full" href="/storage/new-item">
            <ButtonIcon as={Plus} />
          </NavigationButton>
        </ButtonGroup>
      </Box>

      {items.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListTableRow
              item={item}
              columns={itemColumns}
              onPress={() => router.push(`/storage/${item.id}/edit-item`)}
              action={
                <Button variant="outline" action="secondary" className="!border-0">
                  <ButtonIcon size="3xl" as={Pencil} />
                </Button>
              }
            />
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
            No items found
          </Text>

          <NavigationButton href="/storage/new-item" variant="outline" action="secondary" size="lg">
            <ButtonIcon as={Plus} />
            <ButtonText>Add your first item</ButtonText>
          </NavigationButton>
        </Box>
      )}
    </SafeAreaView>
  );
}

import React, { useMemo, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ListTableColumn } from "@/types/ui/listTable";
import { Role } from "@/types/users/Role";

import { FoxLoader } from "@components/fox";
import { NavigationButton } from "@components/navigation-button";
import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon } from "@components/ui/button";
import { ListTableHeader, ListTableRow } from "@components/ui/list-table";
import { Text } from "@components/ui/text";
import { useRouter } from "expo-router";
import { ListFilter, Pencil, Plus } from "lucide-react-native";

import { useRole } from "./ctx";

const roleColumns: ListTableColumn<Role>[] = [
  {
    key: "name",
    header: "Rolle",
    flexClassName: "flex-[2]",
  },
  {
    key: "description",
    header: "Beskrivelse",
    flexClassName: "flex-[2]",
  },
];

export default function RolesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useRole();

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data || [];
    return data.filter((r) => r.name.toLowerCase().includes(q));
  }, [data, search]);

  if (isLoading)
    return (
      <SafeAreaView className="bg-background-0 flex-1">
        <FoxLoader />
      </SafeAreaView>
    );

  return (
    <Box className="bg-background-0 w-full flex-1 px-2">
      <Box className="mb-4 h-14 w-full flex-row justify-between gap-3">
        <Searchbar className="h-full flex-1" placeholder="Search roles..." value={search} onChangeText={setSearch} />

        <ButtonGroup className="h-full flex-row gap-2">
          <Button variant="outline" className="h-full">
            <ButtonIcon as={ListFilter} />
          </Button>

          <NavigationButton variant="outline" className="h-full" href="/admin/roles/new">
            <ButtonIcon as={Plus} />
          </NavigationButton>
        </ButtonGroup>
      </Box>

      {filteredRoles.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={filteredRoles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListTableRow
              item={item}
              columns={roleColumns}
              onPress={() => router.push(`/admin/roles/${item.id}/edit`)}
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
          ListHeaderComponent={<ListTableHeader columns={roleColumns} action={<Box />} />}
          stickyHeaderIndices={[0]}
          onEndReachedThreshold={0.3}
        />
      ) : (
        <Box className="bg-background-0 flex-1 items-center justify-center">
          <Text size="lg" className="mb-4">
            No roles found
          </Text>
        </Box>
      )}
    </Box>
  );
}

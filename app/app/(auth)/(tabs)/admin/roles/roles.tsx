import React, { useMemo, useState } from "react";
import { FlatList } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SafeAreaView } from "react-native-safe-area-context";

import { ListTableColumn } from "@/types/ui/listTable";
import { Role } from "@/types/users/Role";

import CheckPermission from "@components/check-permission";
import { FoxLoader } from "@components/fox";
import { NavigationButton } from "@components/navigation-button";
import { RolePermissionFiltersType, RolesFilterDrawer } from "@components/roles/roles-filter-drawer";
import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon } from "@components/ui/button";
import { Icon } from "@components/ui/icon";
import { ListTableHeader, ListTableRow } from "@components/ui/list-table";
import { Text } from "@components/ui/text";
import { useRouter } from "expo-router";
import { Filter, Pencil, Plus } from "lucide-react-native";

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
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState<RolePermissionFiltersType>({});
  const { data, isLoading } = useRole();

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const roles = data ?? [];

    return roles
      .filter((role) => {
        const matchesSearch = q ? role.name.toLowerCase().includes(q) : true;
        const matchesPermission = filters.permissionId
          ? (role.permissions || []).some(
              (permission) => permission.id === filters.permissionId && permission.isAssigned === true,
            )
          : true;

        return matchesSearch && matchesPermission;
      })
      .sort((a, b) => a.name.localeCompare(b.name, "da", { sensitivity: "base" }));
  }, [data, filters.permissionId, search]);

  if (isLoading)
    return (
      <SafeAreaView className="bg-background-0 flex-1">
        <FoxLoader />
      </SafeAreaView>
    );

  return (
    <Box className="bg-background-0 w-full flex-1 px-2">
      <Box className="mb-4 h-14 w-full flex-row justify-between gap-3 lg:mt-5">
        <Searchbar className="h-full flex-1" placeholder="Søg roller..." value={search} onChangeText={setSearch} />

        <ButtonGroup className="h-full flex-row gap-2">
          <Button variant="outline" className="h-full" onPress={() => setShowFilterDrawer(true)}>
            <ButtonIcon as={Filter} />
          </Button>

          <CheckPermission requiredPermission={["administrator:role:create"]}>
            <NavigationButton variant="outline" className="h-full" href="/admin/roles/new">
              <ButtonIcon as={Plus} />
            </NavigationButton>
          </CheckPermission>
        </ButtonGroup>
      </Box>

      <RolesFilterDrawer
        showDrawer={showFilterDrawer}
        setShowDrawer={setShowFilterDrawer}
        filters={filters}
        setFilters={setFilters}
      />

      {filteredRoles.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={filteredRoles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable
              overshootRight={false}
              overshootLeft={false}
              rightThreshold={40}
              renderRightActions={() => (
                <CheckPermission requiredPermission={["administrator:role:update"]}>
                  <RectButton
                    onPress={() => router.push(`/admin/roles/${item.id}/edit`)}
                    style={{ width: 110, justifyContent: "center", alignItems: "center" }}
                  >
                    <Box className="bg-primary-50 border-outline-200 h-full w-full items-center justify-center gap-1 border-l">
                      <Icon className="text-primary-700" as={Pencil} />
                      <Text className="text-primary-700">Rediger</Text>
                    </Box>
                  </RectButton>
                </CheckPermission>
              )}
            >
              <ListTableRow
                item={item}
                columns={roleColumns}
                onPress={() => router.push(`/admin/roles/${item.id}/edit`)}
              />
            </Swipeable>
          )}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
          canCancelContentTouches
          directionalLockEnabled
          ListHeaderComponent={<ListTableHeader columns={roleColumns} />}
          stickyHeaderIndices={[0]}
          onEndReachedThreshold={0.3}
        />
      ) : (
        <Box className="bg-background-0 flex-1 items-center justify-center">
          <Text size="lg" className="mb-4">
            Ingen roller fundet
          </Text>
        </Box>
      )}
    </Box>
  );
}

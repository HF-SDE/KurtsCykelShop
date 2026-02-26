import React, { useMemo, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ListTableColumn } from "@/types/ui/listTable";

import CheckPermission from "@components/check-permission";
import { FoxLoader } from "@components/fox";
import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonIcon } from "@components/ui/button";
import { ListTableHeader, ListTableRow } from "@components/ui/list-table";
import { Text } from "@components/ui/text";
import { useRouter } from "expo-router";
import { Pencil } from "lucide-react-native";

import { UserWithRoles, useUsers } from "./ctx";

type UserTableRow = UserWithRoles & {
  name: string;
};

const userColumns: ListTableColumn<UserTableRow>[] = [
  {
    key: "username",
    header: "Brugernavn",
    flexClassName: "flex-[2]",
  },
  {
    key: "name",
    header: "Navn",
    flexClassName: "flex-[2]",
  },
];

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useUsers();

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const users = data ?? [];

    return users
      .filter((user) => {
        if (!q) {
          return true;
        }

        const fullName = `${user.firstName} ${user.lastName}`.trim().toLowerCase();

        return (
          user.username.toLowerCase().includes(q) ||
          fullName.includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.initials.toLowerCase().includes(q)
        );
      })
      .map((user) => ({
        ...user,
        name: `${user.firstName} ${user.lastName}`.trim(),
      }))
      .sort((a, b) => a.username.localeCompare(b.username, "da", { sensitivity: "base" }));
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
        <Searchbar className="h-full flex-1" placeholder="Søg brugere..." value={search} onChangeText={setSearch} />
      </Box>

      {filteredUsers.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListTableRow
              item={item}
              columns={userColumns}
              onPress={() =>
                router.push({
                  pathname: "/(auth)/(tabs)/admin/users/[id]/edit",
                  params: { id: item.id },
                })
              }
              action={
                <CheckPermission requiredPermission={["administrator:users:update"]}>
                  <Button variant="outline" action="secondary" className="!border-0">
                    <ButtonIcon size="3xl" as={Pencil} />
                  </Button>
                </CheckPermission>
              }
            />
          )}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
          canCancelContentTouches
          directionalLockEnabled
          ListHeaderComponent={<ListTableHeader columns={userColumns} action={<Box />} />}
          stickyHeaderIndices={[0]}
          onEndReachedThreshold={0.3}
        />
      ) : (
        <Box className="bg-background-0 flex-1 items-center justify-center">
          <Text size="lg" className="mb-4">
            Ingen brugere fundet
          </Text>
        </Box>
      )}
    </Box>
  );
}

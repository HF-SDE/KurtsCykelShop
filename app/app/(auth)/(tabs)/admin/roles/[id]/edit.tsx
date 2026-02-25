import { useEffect, useMemo, useState } from "react";
import { FlatList } from "react-native";

import { FoxLoader } from "@components/fox";
import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@components/ui/button";
import { Checkbox, CheckboxIcon, CheckboxIndicator } from "@components/ui/checkbox";
import { Heading } from "@components/ui/heading";
import { CheckIcon } from "@components/ui/icon";
import { Text } from "@components/ui/text";
import { Textarea, TextareaInput } from "@components/ui/textarea";
import { useLocalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";

import { RolePermissionProvider, useRolePermissions } from "../ctx";

type RolePermission = {
  id: string;
  name: string;
  description: string;
  isAssigned: boolean;
};

export default function EditRolePage() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return null;
  }

  return (
    <RolePermissionProvider id={id}>
      <EditRolePageContent />
    </RolePermissionProvider>
  );
}

function EditRolePageContent() {
  const { data: role, isLoading } = useRolePermissions();
  const [search, setSearch] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});

  const permissions = useMemo<RolePermission[]>(
    () =>
      (role?.permissions || []).map((permission) => ({
        id: permission.id,
        name: permission.code,
        description: permission.description || "",
        isAssigned: permission.isAssigned || false,
      })),
    [role],
  );

  useEffect(() => {
    setSelectedPermissions(Object.fromEntries(permissions.map((item) => [item.id, item.isAssigned])));
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return permissions;

    return permissions.filter(
      (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    );
  }, [permissions, search]);

  function togglePermission(id: string, isChecked: boolean) {
    setSelectedPermissions((prev) => ({ ...prev, [id]: isChecked }));
  }

  if (isLoading) {
    return <FoxLoader />;
  }

  return (
    <Box className="bg-background-0 w-full flex-1 px-4 pt-2">
      <Heading bold size="4xl" className="mb-4 text-center">
        {role?.name || "NULL"}
      </Heading>

      <Textarea className="mb-4 w-full">
        <TextareaInput placeholder="Description" />
      </Textarea>

      <Box className="mb-3 flex-row items-center gap-3">
        <Searchbar className="h-12 flex-1" placeholder="Search" value={search} onChangeText={setSearch} />

        <Button variant="outline" action="secondary" className="h-12 px-4">
          <ButtonText>Filter</ButtonText>
          <ButtonIcon as={Plus} size="md" />
        </Button>
      </Box>

      <Box className="border-outline-200 flex-1 overflow-hidden rounded-2xl border">
        <Box className="border-outline-200 bg-background-50 flex-row border-b px-4 py-3">
          <Text className="text-typography-800 flex-[1.3] text-base font-bold">Name</Text>
          <Text className="text-typography-800 flex-[1.5] text-base font-bold">Description</Text>
        </Box>

        <FlatList
          data={filteredPermissions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Box className="border-outline-200 bg-background-0 flex-row items-center border-b px-4 py-3">
              <Text className="text-typography-800 flex-[1.3] text-xl" numberOfLines={2}>
                {item.name}
              </Text>
              <Text className="text-typography-700 flex-[1.5] text-xl" numberOfLines={1}>
                {item.description}
              </Text>

              <Box className="w-16 items-center">
                <Checkbox
                  size="md"
                  value={item.id}
                  className="justify-center"
                  isChecked={selectedPermissions[item.id] ?? false}
                  onChange={(isChecked) => togglePermission(item.id, isChecked)}
                >
                  <CheckboxIndicator className="border-outline-400 rounded-sm border-2">
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                </Checkbox>
              </Box>
            </Box>
          )}
        />
      </Box>
    </Box>
  );
}

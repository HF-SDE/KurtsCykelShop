import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView } from "react-native";

import apiClient from "@/utils/apiClient";

import { Permission } from "@/types/users/Permission";
import { Role } from "@/types/users/Role";

import { FoxLoader } from "@components/fox";
import {
  RolePermissionGroupFiltersType,
  RolesPermissionGroupFilterDrawer,
} from "@components/roles/roles-permission-group-filter-drawer";
import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon } from "@components/ui/button";
import { Checkbox, CheckboxIcon, CheckboxIndicator } from "@components/ui/checkbox";
import { Heading } from "@components/ui/heading";
import { CheckIcon, Icon } from "@components/ui/icon";
import { Input, InputField } from "@components/ui/input";
import { Text } from "@components/ui/text";
import { Textarea, TextareaInput } from "@components/ui/textarea";
import { Toast, ToastDescription, ToastTitle, useToast } from "@components/ui/toast";
import { Stack, useRouter } from "expo-router";
import { ListFilter, Save } from "lucide-react-native";

import { useRole } from "./ctx";

type RolePermission = {
  id: string;
  name: string;
  description: string;
  permissionGroupId?: string;
  isAssigned: boolean;
};

export default function NewRolePage() {
  const { data: roles, isLoading, setData } = useRole();
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState<RolePermissionGroupFiltersType>({});

  const allPermissions = useMemo<Permission[]>(() => {
    const permissionsById = new Map<string, Permission>();

    for (const role of roles) {
      for (const permission of role.permissions || []) {
        if (!permissionsById.has(permission.id)) {
          permissionsById.set(permission.id, permission);
        }
      }
    }

    return Array.from(permissionsById.values()).sort((a, b) =>
      a.code.localeCompare(b.code, "da", { sensitivity: "base" }),
    );
  }, [roles]);

  const permissions = useMemo<RolePermission[]>(
    () =>
      allPermissions.map((permission) => ({
        id: permission.id,
        name: permission.code,
        description: permission.description || "",
        permissionGroupId: permission.permissionGroupId,
        isAssigned: selectedPermissions[permission.id] ?? false,
      })),
    [allPermissions, selectedPermissions],
  );

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filteredByGroup = filters.permissionGroupId
      ? permissions.filter((item) => item.permissionGroupId === filters.permissionGroupId)
      : permissions;

    if (!query) return filteredByGroup;

    return filteredByGroup.filter(
      (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    );
  }, [filters.permissionGroupId, permissions, search]);

  function togglePermission(id: string) {
    setSelectedPermissions((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? false),
    }));
  }

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return;
    }

    const roleName = name.trim();

    if (roleName.length < 2) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Ugyldigt rollenavn</ToastTitle>
            <ToastDescription>Navnet skal være mindst 2 tegn</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    try {
      setIsSaving(true);

      const permissionIds = Object.entries(selectedPermissions)
        .filter(([, isChecked]) => isChecked)
        .map(([permissionId]) => permissionId);

      const response = await apiClient.post(`/manage/role`, {
        name: roleName,
        description: description.trim() || undefined,
        permissions: permissionIds,
      });

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Rollen er oprettet</ToastTitle>
            <ToastDescription>Din nye rolle er gemt</ToastDescription>
          </Toast>
        ),
      });

      const selectedPermissionIdSet = new Set(permissionIds);
      const createdRole = (response?.data?.data || null) as Role | null;

      if (createdRole) {
        const createdRoleWithPermissions: Role = {
          ...createdRole,
          description: description.trim() || undefined,
          permissions: allPermissions.map((permission) => ({
            ...permission,
            isAssigned: selectedPermissionIdSet.has(permission.id),
          })),
        };

        setData([...roles, createdRoleWithPermissions]);
      }

      router.back();
    } catch (error) {
      console.error("Error while creating role:", error);

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Kunne ikke oprette rolle</ToastTitle>
            <ToastDescription>Prøv igen om et øjeblik</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsSaving(false);
    }
  }, [allPermissions, description, isSaving, name, roles, router, selectedPermissions, setData, toast]);

  if (isLoading) {
    return <FoxLoader />;
  }

  return (
    <Box className="bg-background-0 w-full flex-1 px-4 pt-2">
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              hitSlop={8}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                opacity: isSaving ? 0.5 : 1,
              }}
            >
              <Icon as={Save} size="xl" className="text-typography-500" />
            </Pressable>
          ),
        }}
      />

      <Heading bold size="4xl" className="mb-4 text-center">
        Ny rolle
      </Heading>

      <Input className="mb-4 w-full">
        <InputField placeholder="Rollenavn" value={name} onChangeText={setName} />
      </Input>

      <Textarea className="mb-4 w-full">
        <TextareaInput placeholder="Description" value={description} onChangeText={setDescription} />
      </Textarea>

      <Box className="mb-3 flex-row items-center gap-3">
        <Searchbar className="flex-1" placeholder="Søg roller..." value={search} onChangeText={setSearch} />
        <ButtonGroup className="h-full flex-row gap-2">
          <Button variant="outline" className="h-full" onPress={() => setShowFilterDrawer(true)}>
            <ButtonIcon as={ListFilter} />
          </Button>
        </ButtonGroup>
      </Box>

      <RolesPermissionGroupFilterDrawer
        showDrawer={showFilterDrawer}
        setShowDrawer={setShowFilterDrawer}
        filters={filters}
        setFilters={setFilters}
      />

      <Box className="border-outline-200 flex-1 overflow-hidden rounded-2xl border">
        <Box className="border-outline-200 bg-background-50 flex-row border-b px-4 py-3">
          <Text className="text-typography-800 flex-[1.3] text-base font-bold">Name</Text>
          <Text className="text-typography-800 flex-[1.5] text-base font-bold">Description</Text>
        </Box>

        <ScrollView keyboardShouldPersistTaps="handled">
          {filteredPermissions.map((item) => (
            <Pressable key={item.id} onPress={() => togglePermission(item.id)}>
              <Box className="border-outline-200 bg-background-0 flex-row items-center gap-2 border-b px-4 py-3">
                <Text className="text-typography-800 flex-[1.3] text-xl" numberOfLines={2}>
                  {item.name}
                </Text>
                <Text className="text-typography-700 flex-[1.5] text-xl" numberOfLines={1}>
                  {item.description}
                </Text>

                <Box pointerEvents="none">
                  <Checkbox
                    size="md"
                    value={item.id}
                    className="items-center justify-center"
                    isChecked={selectedPermissions[item.id] ?? false}
                    onChange={undefined}
                  >
                    <CheckboxIndicator className="border-outline-400 rounded-sm border-2">
                      <CheckboxIcon as={CheckIcon} />
                    </CheckboxIndicator>
                  </Checkbox>
                </Box>
              </Box>
            </Pressable>
          ))}
        </ScrollView>
      </Box>
    </Box>
  );
}

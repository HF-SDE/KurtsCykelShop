import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView } from "react-native";

import apiClient from "@/utils/apiClient";

import { Role } from "@/types/users/Role";

import { FoxLoader } from "@components/fox";
import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon } from "@components/ui/button";
import { Checkbox, CheckboxIcon, CheckboxIndicator } from "@components/ui/checkbox";
import { Heading } from "@components/ui/heading";
import { CheckIcon, Icon } from "@components/ui/icon";
import { Text } from "@components/ui/text";
import { Textarea, TextareaInput } from "@components/ui/textarea";
import { Toast, ToastDescription, ToastTitle, useToast } from "@components/ui/toast";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ListFilter, Save } from "lucide-react-native";

import { useRole } from "../ctx";

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

  return <EditRolePageContent roleId={id} />;
}

function EditRolePageContent({ roleId }: { roleId: string }) {
  const { data: roles, isLoading, setData } = useRole();
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const role = useMemo(() => roles.find((item) => item.id === roleId), [roleId, roles]);
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const hydratedRoleIdRef = useRef<string | null>(null);

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
    if (!role) {
      return;
    }

    if (hydratedRoleIdRef.current !== role.id) {
      setSelectedPermissions(Object.fromEntries(permissions.map((item) => [item.id, item.isAssigned])));
      setDescription(role.description || "");
      hydratedRoleIdRef.current = role.id;
    }
  }, [permissions, role]);

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return permissions;

    return permissions.filter(
      (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    );
  }, [permissions, search]);

  function togglePermission(id: string) {
    setSelectedPermissions((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? false),
    }));
  }

  const handleSave = useCallback(async () => {
    if (!role || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const permissionIds = Object.entries(selectedPermissions)
        .filter(([, isChecked]) => isChecked)
        .map(([permissionId]) => permissionId);
      console.log("Selected permission IDs:", permissionIds);

      await apiClient.put(`/manage/role/${role.id}`, {
        name: role.name,
        description,
        permissions: permissionIds,
      });

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Rollen er opdateret</ToastTitle>
            <ToastDescription>Dine ændringer er gemt</ToastDescription>
          </Toast>
        ),
      });

      const selectedPermissionIdSet = new Set(permissionIds);

      setData(
        roles.map((r: Role) =>
          r.id === role.id
            ? {
                ...r,
                description,
                permissions: (r.permissions || []).map((permission) => ({
                  ...permission,
                  isAssigned: selectedPermissionIdSet.has(permission.id),
                })),
              }
            : r,
        ),
      );

      router.back();
    } catch (error) {
      console.error("Error while updating role:", error);

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Kunne ikke gemme rolle</ToastTitle>
            <ToastDescription>Prøv igen om et øjeblik</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsSaving(false);
    }
  }, [description, isSaving, role, roles, router, selectedPermissions, setData, toast]);

  if (isLoading || !role) {
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
        {role.name || "Null"}
      </Heading>

      <Textarea className="mb-4 w-full">
        <TextareaInput placeholder="Description" value={description} onChangeText={setDescription} />
      </Textarea>

      <Box className="mb-3 flex-row items-center gap-3">
        <Searchbar className="flex-1" placeholder="Søg roller..." value={search} onChangeText={setSearch} />
        <ButtonGroup className="h-full flex-row gap-2">
          <Button variant="outline" className="h-full">
            <ButtonIcon as={ListFilter} />
          </Button>
        </ButtonGroup>
      </Box>

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

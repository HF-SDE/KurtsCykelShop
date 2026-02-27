import React, { useCallback, useMemo, useState } from "react";
import { FlatList } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SafeAreaView } from "react-native-safe-area-context";

import apiClient from "@/utils/apiClient";

import { ListTableColumn } from "@/types/ui/listTable";

import CheckPermission from "@components/check-permission";
import { FoxLoader } from "@components/fox";
import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { Icon } from "@components/ui/icon";
import { ListTableHeader, ListTableRow } from "@components/ui/list-table";
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@components/ui/modal";
import { Text } from "@components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@components/ui/toast";
import { UserFiltersType, UsersFilterDrawer } from "@components/users/users-filter-drawer";
import { useRouter } from "expo-router";
import { Archive, ListFilter, Pencil } from "lucide-react-native";

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
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState<UserFiltersType>({ isActive: true });
  const [updatingStatusUserId, setUpdatingStatusUserId] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [pendingStatusUserId, setPendingStatusUserId] = useState<string | null>(null);
  const [pendingStatusUserName, setPendingStatusUserName] = useState("");
  const [pendingNextStatus, setPendingNextStatus] = useState<boolean | null>(null);
  const { data, setData, isLoading } = useUsers();

  const handleSetUserStatus = useCallback(
    async (userId: string, active: boolean) => {
      if (updatingStatusUserId) {
        return;
      }

      const selectedUser = (data ?? []).find((user) => user.id === userId);
      if (selectedUser && selectedUser.isActive === active) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={id} action="info" variant="solid">
              <ToastTitle>{active ? "Bruger er allerede aktiv" : "Bruger er allerede arkiveret"}</ToastTitle>
              <ToastDescription>Ingen ændringer blev lavet</ToastDescription>
            </Toast>
          ),
        });
        return;
      }

      try {
        setUpdatingStatusUserId(userId);

        await apiClient.put(`/manage/user/${userId}/account-status`, {
          active,
        });

        setData((prev) => prev.map((user) => (user.id === userId ? { ...user, isActive: active } : user)));

        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={id} action="success" variant="solid">
              <ToastTitle>{active ? "Bruger aktiveret" : "Bruger arkiveret"}</ToastTitle>
              <ToastDescription>
                {active ? "Brugerkontoen er nu aktiv" : "Brugerkontoen er nu deaktiveret"}
              </ToastDescription>
            </Toast>
          ),
        });
      } catch (error) {
        console.error("Error while updating user status:", error);

        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={id} action="error" variant="solid">
              <ToastTitle>{active ? "Kunne ikke aktivere bruger" : "Kunne ikke arkivere bruger"}</ToastTitle>
              <ToastDescription>Prøv igen om et øjeblik</ToastDescription>
            </Toast>
          ),
        });
      } finally {
        setUpdatingStatusUserId(null);
      }
    },
    [data, setData, toast, updatingStatusUserId],
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const users = (data ?? []).filter((user) => {
      if (filters.isActive === true) {
        return user.isActive;
      }

      if (filters.isActive === false) {
        return !user.isActive;
      }

      return true;
    });

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
  }, [data, filters.isActive, search]);

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

        <ButtonGroup className="h-full flex-row gap-2">
          <Button variant="outline" className="h-full" onPress={() => setShowFilterDrawer(true)}>
            <ButtonIcon as={ListFilter} />
          </Button>
        </ButtonGroup>
      </Box>

      <UsersFilterDrawer
        showDrawer={showFilterDrawer}
        setShowDrawer={setShowFilterDrawer}
        filters={filters}
        setFilters={setFilters}
      />

      {filteredUsers.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable
              overshootRight={false}
              overshootLeft={false}
              rightThreshold={40}
              renderLeftActions={() => (
                <CheckPermission requiredPermission={["administrator:users:update"]}>
                  <RectButton
                    enabled={updatingStatusUserId !== item.id}
                    onPress={() => {
                      setPendingStatusUserId(item.id);
                      setPendingStatusUserName(item.name || item.username || "denne bruger");
                      setPendingNextStatus(!item.isActive);
                      setIsArchiveModalOpen(true);
                    }}
                    style={{ width: 110, justifyContent: "center", alignItems: "center" }}
                  >
                    <Box className="bg-background-100 h-full w-full items-center justify-center gap-1">
                      <Icon className="text-typography-700" as={Archive} />
                      <Text className="text-typography-700">
                        {updatingStatusUserId === item.id ? "..." : item.isActive ? "Arkiver" : "Aktiver"}
                      </Text>
                    </Box>
                  </RectButton>
                </CheckPermission>
              )}
              renderRightActions={() => (
                <CheckPermission requiredPermission={["administrator:users:update"]}>
                  <Button
                    variant="outline"
                    action="secondary"
                    className="h-full w-[110px] rounded-none"
                    onPress={() =>
                      router.push({
                        pathname: "/(auth)/(tabs)/admin/users/[id]/edit",
                        params: { id: item.id },
                      })
                    }
                  >
                    <ButtonIcon as={Pencil} />
                  </Button>
                </CheckPermission>
              )}
            >
              <ListTableRow
                item={item}
                columns={userColumns}
                onPress={() =>
                  router.push({
                    pathname: "/(auth)/(tabs)/admin/users/[id]/edit",
                    params: { id: item.id },
                  })
                }
              />
            </Swipeable>
          )}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
          canCancelContentTouches
          directionalLockEnabled
          ListHeaderComponent={<ListTableHeader columns={userColumns} />}
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

      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setPendingStatusUserId(null);
          setPendingStatusUserName("");
          setPendingNextStatus(null);
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{pendingNextStatus ? "Bekræft aktivering" : "Bekræft arkivering"}</Heading>
          </ModalHeader>
          <ModalBody>
            <Text>
              Er du sikker på, at du vil {pendingNextStatus ? "aktivere" : "arkivere"} {pendingStatusUserName}?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              className="mr-3"
              onPress={() => {
                setIsArchiveModalOpen(false);
                setPendingStatusUserId(null);
                setPendingStatusUserName("");
                setPendingNextStatus(null);
              }}
            >
              <Text>Annuller</Text>
            </Button>
            <Button
              action={pendingNextStatus ? "positive" : "negative"}
              onPress={async () => {
                if (pendingStatusUserId && pendingNextStatus !== null) {
                  await handleSetUserStatus(pendingStatusUserId, pendingNextStatus);
                }

                setIsArchiveModalOpen(false);
                setPendingStatusUserId(null);
                setPendingStatusUserName("");
                setPendingNextStatus(null);
              }}
              isDisabled={!pendingStatusUserId || pendingNextStatus === null || !!updatingStatusUserId}
            >
              <Text>{pendingNextStatus ? "Aktiver" : "Arkiver"}</Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

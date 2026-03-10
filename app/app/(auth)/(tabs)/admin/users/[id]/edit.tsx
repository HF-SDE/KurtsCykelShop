import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView } from "react-native";

import apiClient from "@/utils/apiClient";

import { Role } from "@/types/users/Role";

import { Combobox } from "@components/combobox";
import { FoxLoader } from "@components/fox";
import { Avatar, AvatarFallbackText } from "@components/ui/avatar";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonText } from "@components/ui/button";
import { Center } from "@components/ui/center";
import { FormControl, FormControlLabel, FormControlLabelText } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { CloseIcon, Icon } from "@components/ui/icon";
import { Input, InputField } from "@components/ui/input";
import SecretInput from "@components/ui/input/password";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@components/ui/modal";
import { Text } from "@components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@components/ui/toast";
import { useData } from "@hooks/useData";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Save } from "lucide-react-native";

import { UserWithRoles, useUsers } from "../ctx";

export default function EditUserPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return null;
  }

  return <EditUserPageContent userId={id} />;
}

function EditUserPageContent({ userId }: { userId: string }) {
  const { data: users, setData, isLoading } = useUsers();
  const router = useRouter();
  const toast = useToast();
  const [roles, , isRolesLoading] = useData<Role>("/manage/role", []);
  const user = useMemo(() => users.find((item) => item.id === userId), [userId, users]);
  const hydratedUserIdRef = useRef<string | null>(null);
  const roleOptions = useMemo(() => roles.map((role) => ({ id: role.id, name: role.name })), [roles]);

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordModalError, setPasswordModalError] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isUpdatingAccountStatus, setIsUpdatingAccountStatus] = useState(false);
  const [isAccountStatusModalOpen, setIsAccountStatusModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (hydratedUserIdRef.current !== user.id) {
      setUsername(user.username || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setInitials(user.initials || "");
      setIsActive(Boolean(user.isActive));
      setSelectedRoleIds((user.roles || []).map((role) => role.id));
      hydratedUserIdRef.current = user.id;
    }
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user || isSaving) {
      return;
    }

    if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Mangler oplysninger</ToastTitle>
            <ToastDescription>Udfyld brugernavn, fornavn, efternavn og email</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    try {
      setIsSaving(true);

      await apiClient.put(`/manage/user/${user.id}`, {
        username: username.trim(),
        email: email.trim(),
        initials: initials.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isActive,
        UserRoles: selectedRoleIds,
      });

      const selectedRoleIdSet = new Set(selectedRoleIds);
      const selectedRoles = roles
        .filter((role) => selectedRoleIdSet.has(role.id))
        .map((role) => ({ id: role.id, name: role.name }));

      const updatedUser: UserWithRoles = {
        ...user,
        username: username.trim(),
        email: email.trim(),
        initials: initials.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isActive,
        roles: selectedRoles,
      };

      setData(users.map((item) => (item.id === user.id ? updatedUser : item)));

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Bruger er opdateret</ToastTitle>
            <ToastDescription>Dine ændringer er gemt</ToastDescription>
          </Toast>
        ),
      });

      router.back();
    } catch (error) {
      console.error("Error while updating user:", error);

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Kunne ikke gemme bruger</ToastTitle>
            <ToastDescription>Prøv igen om et øjeblik</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    email,
    firstName,
    initials,
    isActive,
    isSaving,
    lastName,
    roles,
    router,
    selectedRoleIds,
    setData,
    toast,
    user,
    username,
    users,
  ]);

  const handleResetPassword = useCallback(async () => {
    if (!user || isResettingPassword) {
      return;
    }

    const trimmedNewPassword = newPassword.trim();

    if (!trimmedNewPassword || !confirmNewPassword.trim()) {
      setPasswordModalError("Udfyld begge felter");
      return;
    }

    if (trimmedNewPassword.length < 8) {
      setPasswordModalError("Password skal være mindst 8 tegn");
      return;
    }

    if (trimmedNewPassword !== confirmNewPassword.trim()) {
      setPasswordModalError("Passwords matcher ikke");
      return;
    }

    try {
      setIsResettingPassword(true);

      await apiClient.put(`/manage/user/${user.id}/reset-password`, {
        password: trimmedNewPassword,
      });

      setIsResetPasswordModalOpen(false);
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordModalError("");

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Password nulstillet</ToastTitle>
            <ToastDescription>Brugerens password er opdateret</ToastDescription>
          </Toast>
        ),
      });
    } catch (error) {
      console.error("Error while resetting password:", error);

      setPasswordModalError("Kunne ikke nulstille password");
    } finally {
      setIsResettingPassword(false);
    }
  }, [confirmNewPassword, isResettingPassword, newPassword, toast, user]);

  const handleToggleAccountStatus = useCallback(async () => {
    if (!user || isUpdatingAccountStatus) {
      return;
    }

    const nextActive = !isActive;

    try {
      setIsUpdatingAccountStatus(true);

      await apiClient.put(`/manage/user/${user.id}/account-status`, {
        active: nextActive,
      });

      setIsActive(nextActive);
      setData(users.map((item) => (item.id === user.id ? { ...item, isActive: nextActive } : item)));

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Brugerstatus opdateret</ToastTitle>
            <ToastDescription>{nextActive ? "Brugeren er aktiveret" : "Brugeren er deaktiveret"}</ToastDescription>
          </Toast>
        ),
      });
    } catch (error) {
      console.error("Error while updating account status:", error);

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Kunne ikke opdatere brugerstatus</ToastTitle>
            <ToastDescription>Prøv igen om et øjeblik</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsUpdatingAccountStatus(false);
    }
  }, [isActive, isUpdatingAccountStatus, setData, toast, user, users]);

  if (isLoading || isRolesLoading || !user) {
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

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
        <Center>
          <Avatar size="4xl" className="bg-secondary-500 border-secondary-600 border-8">
            <AvatarFallbackText size="2xl" className="text-primary-950">
              {initials
                ?.split("")
                .map((name) => name.charAt(0))
                .join(" ") || "?"}
            </AvatarFallbackText>
          </Avatar>
        </Center>

        <FormControl className="mb-4 flex gap-1">
          <FormControlLabel>
            <FormControlLabelText>Brugernavn</FormControlLabelText>
          </FormControlLabel>
          <Input className="w-full">
            <InputField placeholder="Brugernavn" value={username} onChangeText={setUsername} />
          </Input>

          <FormControlLabel>
            <FormControlLabelText>Fornavn</FormControlLabelText>
          </FormControlLabel>
          <Input className="w-full">
            <InputField placeholder="Fornavn" value={firstName} onChangeText={setFirstName} />
          </Input>

          <FormControlLabel>
            <FormControlLabelText>Efternavn</FormControlLabelText>
          </FormControlLabel>
          <Input className="w-full">
            <InputField placeholder="Efternavn" value={lastName} onChangeText={setLastName} />
          </Input>

          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Input className="w-full">
            <InputField placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
          </Input>

          <FormControlLabel>
            <FormControlLabelText>Initialer</FormControlLabelText>
          </FormControlLabel>
          <Input className="w-full">
            <InputField placeholder="Initialer" value={initials} onChangeText={setInitials} maxLength={3} />
          </Input>

          <FormControlLabel>
            <FormControlLabelText>Roller</FormControlLabelText>
          </FormControlLabel>
          <Combobox
            placeholder="Vælg rolle"
            searchPlaceholder="Søg roller..."
            emptyStateText="Ingen roller fundet"
            options={roleOptions}
            multiSelect
            values={selectedRoleIds}
            onChangeValues={setSelectedRoleIds}
          />
        </FormControl>

        <ButtonGroup className="mb-4 w-full flex-col items-stretch gap-2">
          <Button
            className="w-full"
            variant="outline"
            action="secondary"
            onPress={() => setIsResetPasswordModalOpen(true)}
          >
            <ButtonText>Nulstil password</ButtonText>
          </Button>

          <Button
            className="w-full"
            variant="outline"
            action="secondary"
            onPress={() => setIsAccountStatusModalOpen(true)}
            isDisabled={isUpdatingAccountStatus}
          >
            <ButtonText>{isActive ? "Disable" : "Active"}</ButtonText>
          </Button>
        </ButtonGroup>
      </ScrollView>

      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setPasswordModalError("");
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Change Password</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <SecretInput
              inputValue={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nyt password"
              HelperText="Mindst 8 tegn"
              isInvalid={Boolean(passwordModalError)}
              errorMessage={passwordModalError}
            />

            <SecretInput
              inputValue={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Bekræft nyt password"
              isInvalid={Boolean(passwordModalError)}
              errorMessage={passwordModalError}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              className="mr-3"
              onPress={() => {
                setIsResetPasswordModalOpen(false);
                setPasswordModalError("");
              }}
            >
              <ButtonText>Annuller</ButtonText>
            </Button>
            <Button onPress={handleResetPassword} isDisabled={isResettingPassword}>
              <ButtonText>Gem</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isAccountStatusModalOpen}
        onClose={() => {
          setIsAccountStatusModalOpen(false);
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Bekræft ændring</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>
              {isActive
                ? "Er du sikker på, at du vil deaktivere denne bruger?"
                : "Er du sikker på, at du vil aktivere denne bruger?"}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              className="mr-3"
              onPress={() => setIsAccountStatusModalOpen(false)}
            >
              <ButtonText>Annuller</ButtonText>
            </Button>
            <Button
              onPress={async () => {
                await handleToggleAccountStatus();
                setIsAccountStatusModalOpen(false);
              }}
              isDisabled={isUpdatingAccountStatus}
            >
              <ButtonText>Bekræft</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

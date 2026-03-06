import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView } from "react-native";

import apiClient from "@/utils/apiClient";

import { Role } from "@/types/users/Role";

import { Combobox } from "@components/combobox";
import { FoxLoader } from "@components/fox";
import { Avatar, AvatarFallbackText } from "@components/ui/avatar";
import { Box } from "@components/ui/box";
import { Button, ButtonText } from "@components/ui/button";
import { Center } from "@components/ui/center";
import { FormControl, FormControlLabel, FormControlLabelText } from "@components/ui/form-control";
import { Icon } from "@components/ui/icon";
import { Input, InputField } from "@components/ui/input";
import SecretInput from "@components/ui/input/password";
import { Toast, ToastDescription, ToastTitle, useToast } from "@components/ui/toast";
import { useData } from "@hooks/useData";
import { Stack, useRouter } from "expo-router";
import { Save } from "lucide-react-native";

import { UserWithRoles, useUsers } from "./ctx";

export default function NewUserPage() {
  const { setData, isLoading } = useUsers();
  const [roles, , isRolesLoading] = useData<Role>("/manage/role", []);
  const router = useRouter();
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const roleOptions = useMemo(() => roles.map((role) => ({ id: role.id, name: role.name })), [roles]);

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedInitials = initials.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedUsername || !trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedInitials) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Mangler oplysninger</ToastTitle>
            <ToastDescription>Udfyld brugernavn, fornavn, efternavn, email og initialer</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    if (trimmedPassword.length < 8) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Ugyldigt password</ToastTitle>
            <ToastDescription>Password skal være mindst 8 tegn</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Passwords matcher ikke</ToastTitle>
            <ToastDescription>Kontroller begge password-felter</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    try {
      setIsSaving(true);

      const response = await apiClient.post("/manage/user", {
        username: trimmedUsername,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        initials: trimmedInitials,
        active: isActive,
        password: trimmedPassword,
        UserRoles: selectedRoleIds,
      });

      const selectedRoleIdSet = new Set(selectedRoleIds);
      const selectedRoles = roles
        .filter((role) => selectedRoleIdSet.has(role.id))
        .map((role) => ({ id: role.id, name: role.name }));

      const createdUser = (response?.data?.data || null) as Partial<UserWithRoles> | null;

      if (createdUser?.id) {
        const normalizedUser: UserWithRoles = {
          ...(createdUser as UserWithRoles),
          username: createdUser.username || trimmedUsername,
          firstName: createdUser.firstName || trimmedFirstName,
          lastName: createdUser.lastName || trimmedLastName,
          email: createdUser.email || trimmedEmail,
          initials: createdUser.initials || trimmedInitials,
          isActive: typeof createdUser.isActive === "boolean" ? createdUser.isActive : isActive,
          roles: selectedRoles,
        };

        setData((prev) => (prev.some((user) => user.id === normalizedUser.id) ? prev : [...prev, normalizedUser]));
      }

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Bruger oprettet</ToastTitle>
            <ToastDescription>Den nye bruger er gemt</ToastDescription>
          </Toast>
        ),
      });

      router.back();
    } catch (error) {
      console.error("Error while creating user:", error);

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Kunne ikke oprette bruger</ToastTitle>
            <ToastDescription>Prøv igen om et øjeblik</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    confirmPassword,
    email,
    firstName,
    initials,
    isActive,
    isSaving,
    lastName,
    password,
    roles,
    router,
    selectedRoleIds,
    setData,
    toast,
    username,
  ]);

  if (isLoading || isRolesLoading) {
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

          <SecretInput
            inputValue={password}
            onChangeText={setPassword}
            placeholder="Password"
            HelperText="Mindst 8 tegn"
          />

          <SecretInput inputValue={confirmPassword} onChangeText={setConfirmPassword} placeholder="Bekræft password" />

          <FormControlLabel>
            <FormControlLabelText>Roller</FormControlLabelText>
          </FormControlLabel>
          <Combobox
            placeholder="Vælge rolle"
            searchPlaceholder="Søg roller..."
            emptyStateText="Ingen roller fundet"
            options={roleOptions}
            multiSelect
            values={selectedRoleIds}
            onChangeValues={setSelectedRoleIds}
          />
        </FormControl>

        <Button className="w-full" variant="outline" action="secondary" onPress={() => setIsActive((prev) => !prev)}>
          <ButtonText>{isActive ? "Brugerstatus: Aktiv" : "Brugerstatus: Inaktiv"}</ButtonText>
        </Button>
      </ScrollView>
    </Box>
  );
}

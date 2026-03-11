import { useState } from "react";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { useUserProfile } from "@/hooks/useUserProfile";

import { useSession } from "@/app/ctx";
import { usePermissions } from "@/contexts/permissions.ctx";

import { NavigationButton } from "@components/navigation-button";
import { Avatar, AvatarFallbackText } from "@components/ui/avatar";
import { Box } from "@components/ui/box";
import { Center } from "@components/ui/center";
import { Heading } from "@components/ui/heading";
import { HStack } from "@components/ui/hstack";
import { CloseIcon, Icon } from "@components/ui/icon";
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
import { Toast, ToastDescription, ToastTitle, useToast } from "@components/ui/toast";
import { VStack } from "@components/ui/vstack";
import { InfoIcon } from "lucide-react-native";

export default function UserProfileScreen() {
  const { userProfile, isLoading, resetPassword } = useUserProfile();
  const { signOut, session } = useSession();
  const { hasPageAccess } = usePermissions();

  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [againPassword, setAgainPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState<boolean>(false);
  const [newConfirmPasswordError, setConfirmNewPasswordError] = useState<boolean>(false);

  const toast = useToast();
  const [toastId, setToastId] = useState("0");

  if (isLoading) return <Text>Indlæser...</Text>;

  async function handleReset() {
    if (!currentPassword || !password || !againPassword) {
      setErrorMessage("Udfyld alle felter!");
      setError(true);
      setConfirmNewPasswordError(false);
      return;
    }
    if (password !== againPassword) {
      setErrorMessage("Adgangskoderne matcher ikke!");
      setConfirmNewPasswordError(true);
      return;
    }

    try {
      const response = await resetPassword(currentPassword, password);
      if (response === "success") {
        setIsModalVisible(false);
        setError(false);
        setConfirmNewPasswordError(false);
        setCurrentPassword("");
        setPassword("");
        setAgainPassword("");
        handleToast();
      } else {
        setErrorMessage(JSON.parse(response)[0].message || "Der opstod en fejl.");
        // setErrorMessage(response || "Der opstod en fejl.");
        setConfirmNewPasswordError(false);
        setError(true);
      }
    } catch (error) {
      console.error(error);

      setErrorMessage("Der opstod en fejl ved ændring af adgangskode.");
      setError(true);
    }
  }

  function handleToast() {
    if (!toast.isActive(toastId)) {
      showNewToast();
    }
  }

  function showNewToast() {
    const newId = Math.random().toString();
    setToastId(newId);
    toast.show({
      id: newId,
      placement: "top",
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            action="success"
            variant="outline"
            nativeID={uniqueToastId}
            className="border-success-500 shadow-hard-5 w-full max-w-[443px] flex-row justify-between gap-6 p-4"
          >
            <HStack space="md">
              <Icon as={InfoIcon} className="stroke-success-500 mt-0.5" />
              <VStack space="xs">
                <ToastTitle className="text-success-500 font-semibold">Succes!</ToastTitle>
                <ToastDescription size="sm">Adgangskoden blev ændret.</ToastDescription>
              </VStack>
            </HStack>
            <HStack className="gap-1 min-[450px]:gap-3">
              <Pressable onPress={() => toast.close(id)}>
                <Icon as={CloseIcon} />
              </Pressable>
            </HStack>
          </Toast>
        );
      },
    });
  }

  return (
    <SafeAreaView className="bg-background-0 flex-1">
      <Center className={`bg-background-0 flex-1 p-6`}>
        <VStack className={`flex-1 justify-between px-5`}>
          <Box className="gap-5">
            <Avatar size="4xl" className="bg-secondary-100 border-secondary-700 shadow-hard-2 border-8">
              <AvatarFallbackText size="2xl" className="text-secondary-900">
                {userProfile?.initials
                  ?.split("")
                  .map((name) => name.charAt(0))
                  .join(" ") || "?"}
              </AvatarFallbackText>
            </Avatar>
            <Box>
              <Text size="2xl" bold>
                Hej, {userProfile?.firstName || "Ikke angivet"} {userProfile?.lastName || ""}
              </Text>
              <Text size="md" className="mb-1.5">
                Email: {userProfile?.email || "Ikke angivet"}
              </Text>
            </Box>
          </Box>

          <Center>
            <VStack className={"w-full gap-2.5"}>
              {hasPageAccess("StockPage") && (
                <NavigationButton href="/(auth)/(tabs)/management" size="xl">
                  <ButtonText>Administration</ButtonText>
                </NavigationButton>
              )}

              {/* <NavigationButton href="/(auth)/(tabs)/color-preview" size="xl">
                <ButtonText>Preview colors</ButtonText>
              </NavigationButton> */}

              <Button size="xl" onPress={() => setIsModalVisible(true)}>
                <ButtonText>Nulstil adgangskode</ButtonText>
              </Button>

              <Button size="xl" onPress={signOut}>
                <ButtonText>Log ud</ButtonText>
              </Button>
            </VStack>
          </Center>
        </VStack>

        <Modal
          isOpen={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
          }}
          size="md"
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading size="lg">Skift adgangskode</Heading>
              <ModalCloseButton>
                <Icon as={CloseIcon} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <SecretInput
                inputValue={currentPassword}
                onChangeText={setCurrentPassword}
                isInvalid={error}
                errorMessage={errorMessage}
                placeholder="Nuværende adgangskode"
              />
              <SecretInput
                inputValue={password}
                onChangeText={setPassword}
                className="mb-2"
                placeholder="Ny adgangskode"
                HelperText="Skal være mindst 6 tegn."
              />
              <SecretInput
                inputValue={againPassword}
                onChangeText={setAgainPassword}
                isInvalid={newConfirmPasswordError}
                errorMessage={errorMessage}
                placeholder="Bekræft ny adgangskode"
                HelperText='Skal være den samme som "Ny adgangskode".'
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                action="secondary"
                className="mr-3"
                onPress={() => {
                  setIsModalVisible(false);
                }}
              >
                <ButtonText>Annuller</ButtonText>
              </Button>
              <Button
                onPress={() => {
                  handleReset();
                }}
              >
                <ButtonText>Skift</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Center>
    </SafeAreaView>
  );
}

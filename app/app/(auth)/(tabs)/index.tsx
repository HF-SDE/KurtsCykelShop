import { useState } from "react";
import { Pressable } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { useUserProfile } from "@/hooks/useUserProfile";

import { useSession } from "@/app/ctx";

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
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileScreen() {
  const { userProfile, isLoading, resetPassword } = useUserProfile();
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const { signOut, session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [againPassword, setAgainPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState<boolean>(false);
  const [newConfirmPasswordError, setConfirmNewPasswordError] = useState<boolean>(false);

  const toast = useToast();
  const [toastId, setToastId] = useState("0");

  if (isLoading) return <Text> Loading...</Text>;

  async function handleReset() {
    if (!currentPassword || !password || !againPassword) {
      setErrorMessage("Please fill out all fields!");
      setError(true);
      setConfirmNewPasswordError(false);
      return;
    }
    if (password !== againPassword) {
      setErrorMessage("Passwords does not match!");
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
        setErrorMessage(JSON.parse(response)[0].message || "An error occurred.");
        // setErrorMessage(response || "An error occurred.");
        setConfirmNewPasswordError(false);
        setError(true);
      }
    } catch (error) {
      console.error(error);

      setErrorMessage("An error occurred while changing password.");
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
                <ToastTitle className="text-success-500 font-semibold">Success!</ToastTitle>
                <ToastDescription size="sm">Password changed successfully.</ToastDescription>
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
            <Avatar size="4xl" className="bg-secondary-500 border-secondary-600 border-8">
              <AvatarFallbackText size="2xl" className="text-primary-950">
                {userProfile?.initials
                  ?.split("")
                  .map((name) => name.charAt(0))
                  .join(" ") || "?"}
              </AvatarFallbackText>
            </Avatar>
            <Box>
              <Text size="2xl" bold>
                Hi, {userProfile?.firstName || "N/A"} {userProfile?.lastName || ""}
              </Text>
              <Text size="md" className="mb-1.5">
                Email: {userProfile?.email || "N/A"}
              </Text>
            </Box>
          </Box>

          <Center>
            <VStack className={"w-full gap-2.5"}>
              <Button size="xl" onPress={() => setIsModalVisible(true)}>
                <ButtonText>Reset Password</ButtonText>
              </Button>

              <Button size="xl" onPress={signOut}>
                <ButtonText>Sign Out</ButtonText>
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
              <Heading size="lg">Change Password</Heading>
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
                placeholder="Current Password"
              />
              <SecretInput
                inputValue={password}
                onChangeText={setPassword}
                className="mb-2"
                placeholder="New Password"
                HelperText="Must be at least 6 characters."
              />
              <SecretInput
                inputValue={againPassword}
                onChangeText={setAgainPassword}
                isInvalid={newConfirmPasswordError}
                errorMessage={errorMessage}
                placeholder="Confirm New Password"
                HelperText='Must be the same as "New Password".'
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
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                onPress={() => {
                  handleReset();
                }}
              >
                <ButtonText>Change</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Center>
    </SafeAreaView>
  );
}

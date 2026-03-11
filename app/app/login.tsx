import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import SecretInput from "@/components/ui/input/password";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { NotificationFeedbackType, triggerHapticFeedback } from "@/utils/hapticFeedback";

import Logo from "@assets/images/logo.svg";
import { router } from "expo-router";

import { useSession } from "./ctx";

export default function Index() {
  const { signIn } = useSession();
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isInvalid, setIsInvalid] = React.useState(false);

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    setUsername(trimmedUsername);
    setPassword(trimmedPassword);

    const isUsernameValid = trimmedUsername !== "";
    const isPasswordValid = trimmedPassword !== "";

    if (isUsernameValid && isPasswordValid) {
      setIsLoading(true);
      const signInResult = await signIn(trimmedUsername, trimmedPassword);

      if (signInResult === "authenticated") {
        await triggerHapticFeedback(NotificationFeedbackType.Success);
        setErrorMessage("");
        router.replace("/");
      } else {
        await triggerHapticFeedback(NotificationFeedbackType.Error);
        setErrorMessage(signInResult);
        setIsInvalid(true);
      }
      setIsLoading(false);
    } else {
      await triggerHapticFeedback(NotificationFeedbackType.Error);
      setErrorMessage("Udfyld brugernavn og adgangskode");
      setIsInvalid(true);
    }
  };

  useEffect(() => {
    if (username.trim() && password.trim()) {
      setErrorMessage("");
    }
  }, [username, password]);

  return (
    <SafeAreaView className="bg-background-0 flex-1">
      <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={320}>
        <Center>
          <View style={styles.logoContainer}>
            <Logo width={340} height={340} />
          </View>
          <Text bold={true} size="xl">
            Medarbejder kan erstattes.
          </Text>
          <Text bold={true} size="xl">
            Det kan vare ikke.
          </Text>
          <VStack style={styles.formContainer}>
            <FormControl isInvalid={isInvalid} size="md" isDisabled={false} isReadOnly={false} isRequired={false}>
              <FormControlLabel>
                <FormControlLabelText>Brugernavn</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1" size="md">
                <InputField
                  type="text"
                  placeholder="Brugernavn"
                  value={username}
                  onChangeText={(text) => setUsername(text)}
                />
              </Input>
            </FormControl>
            <SecretInput
              errorMessage={errorMessage}
              isInvalid={isInvalid}
              inputValue={password}
              onChangeText={setPassword}
            />
            {isLoading ? (
              <Button className="mt-4" size="lg" variant="solid">
                <ButtonSpinner />
                <ButtonText>Vent venligst...</ButtonText>
              </Button>
            ) : (
              <Button className="mt-4" size="lg" variant="solid" onPress={handleLogin}>
                <ButtonText>Log ind</ButtonText>
              </Button>
            )}
          </VStack>
        </Center>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  formContainer: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    gap: 10,
  },
});

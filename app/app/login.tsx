import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

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
      setErrorMessage("Please fill out username and password");
      setIsInvalid(true);
    }
  };

  useEffect(() => {
    if (username.trim() && password.trim()) {
      setErrorMessage("");
    }
  }, [username, password]);

  return (
    <KeyboardAvoidingView behavior={"padding"} keyboardVerticalOffset={100}>
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
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1" size="md">
              <InputField type="text" placeholder="Email" value={username} onChangeText={(text) => setUsername(text)} />
            </Input>
          </FormControl>
          <SecretInput errorMessage={errorMessage} isInvalid={isInvalid} inputValue={password} onChangeText={setPassword} />
          {isLoading ? (
            <Button className="mt-4 " size="lg" variant="solid">
              <ButtonSpinner/>
              <ButtonText>Please wait...</ButtonText>
            </Button>
          ) : (
            <Button className="mt-4 " size="lg" variant="solid" onPress={handleLogin}>
              <ButtonText>Login</ButtonText>
            </Button>
          )}
        </VStack>
      </Center>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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

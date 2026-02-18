import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useColorScheme } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import PasswordInput from "@/components/ui/input/password";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { NotificationFeedbackType, triggerHapticFeedback } from "@/utils/hapticFeedback";

import { router } from "expo-router";

import { useSession } from "./ctx";

// import {
//   triggerHapticFeedback,
//   NotificationFeedbackType,
// } from "@/utils/hapticFeedback";

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

      console.log("Sign-in result:", signInResult);
      if (signInResult === "authenticated") {
        await triggerHapticFeedback(NotificationFeedbackType.Success);
        setErrorMessage("");
        router.replace("/");
      } else {
        await triggerHapticFeedback(NotificationFeedbackType.Error);
        setErrorMessage(signInResult);
      }
      setIsLoading(false);
    } else {
      await triggerHapticFeedback(NotificationFeedbackType.Error);
      setErrorMessage("Please fill out username and password");
    }
  };

  useEffect(() => {
    if (username.trim() && password.trim()) {
      setErrorMessage("");
    }
  }, [username, password]);

  return (
    <Center>
      <View style={styles.logoContainer}>{/* <Logo width={340} height={340} /> */}</View>
      <Text bold={true} size="xl">
        Medarbejder kan erstattes det.
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
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
            <FormControlErrorText className="text-red-500">{errorMessage}</FormControlErrorText>
          </FormControlError>
        </FormControl>
        <PasswordInput isInvalid={isInvalid} inputValue={password} onChangeText={setPassword} />
        <Button className="mt-4 w-full self-end" size="md" variant="solid" onPress={handleLogin}>
          <ButtonText>Login</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  input: {
    height: 50,
    width: "100%",
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  button: {
    height: 50,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  input_block: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  icon_container: {
    padding: 5,
    position: "absolute",
    right: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";

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
  const [isUsernameEmpty, setIsUsernameEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isInvalid, setIsInvalid] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("12345");

  const handleSubmit = () => {
    if (inputValue.length < 6) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  const colorScheme = useColorScheme();

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    setUsername(trimmedUsername);
    setPassword(trimmedPassword);

    const isUsernameValid = trimmedUsername !== "";
    const isPasswordValid = trimmedPassword !== "";

    setIsUsernameEmpty(!isUsernameValid);
    setIsPasswordEmpty(!isPasswordValid);

    if (isUsernameValid && isPasswordValid) {
      setIsLoading(true);
      const signInResult = await signIn(trimmedUsername, trimmedPassword);

      if (signInResult === "authenticated") {
        // await triggerHapticFeedback(NotificationFeedbackType.Success);
        setErrorMessage("");
        // router.replace("/");
      } else {
        // await triggerHapticFeedback(NotificationFeedbackType.Error);
        setErrorMessage(signInResult);
      }
      setIsLoading(false);
    } else {
      // await triggerHapticFeedback(NotificationFeedbackType.Error);
      setErrorMessage("Please fill out username and password");
    }
  };

  useEffect(() => {
    if (username.trim() && password.trim()) {
      setErrorMessage("");
    }
  }, [username, password]);

  return (
    <>
      <View style={styles.logoContainer}>
        {/* <Logo width={340} height={340} /> */}
      </View>
      <VStack>
        <FormControl
          isInvalid={isInvalid}
          size="md"
          isDisabled={false}
          isReadOnly={false}
          isRequired={false}
        >
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Input className="my-1" size="md">
            <InputField
              type="text"
              placeholder="username"
              value={inputValue}
              onChangeText={(text) => setInputValue(text)}
            />
          </Input>
          <FormControlHelper>
            <FormControlHelperText>
              Must be at least 6 characters.
            </FormControlHelperText>
          </FormControlHelper>
          <FormControlError>
            <FormControlErrorIcon
              as={AlertCircleIcon}
              className="text-red-500"
            />
            <FormControlErrorText className="text-red-500">
              At least 6 characters are required.
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        <FormControl
          isInvalid={isInvalid}
          size="md"
          isDisabled={false}
          isReadOnly={false}
          isRequired={false}
        >
          <FormControlLabel>
            <FormControlLabelText>Password</FormControlLabelText>
          </FormControlLabel>
          <Input className="my-1" size="md">
            <InputField
              type="password"
              placeholder="password"
              value={inputValue}
              onChangeText={(text) => setInputValue(text)}
            />
          </Input>
          <FormControlHelper>
            <FormControlHelperText>
              Must be at least 6 characters.
            </FormControlHelperText>
          </FormControlHelper>
          <FormControlError>
            <FormControlErrorIcon
              as={AlertCircleIcon}
              className="text-red-500"
            />
            <FormControlErrorText className="text-red-500">
              At least 6 characters are required.
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        <Button
          className="mt-4 w-fit self-end"
          size="sm"
          variant="outline"
          onPress={handleSubmit}
        >
          <ButtonText>Submit</ButtonText>
        </Button>
      </VStack>
    </>
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

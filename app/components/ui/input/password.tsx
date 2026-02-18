import { useState } from "react";

import { Input, InputField, InputIcon, InputSlot } from ".";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "../form-control";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "../icon";

interface IPasswordInputProps {
  isInvalid?: boolean;
  inputValue: string;
  onChangeText?: (text: string) => void;
}
export default function PasswordInput({
  isInvalid,
  inputValue,
  onChangeText,
}: IPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
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
          type={showPassword ? "text" : "password"}
          placeholder="password"
          value={inputValue}
          onChangeText={(text) => onChangeText && onChangeText(text)}
        />
        <InputSlot className="mr-2" onPress={() => setShowPassword(!showPassword)}>
          <InputIcon as={showPassword ? EyeOffIcon : EyeIcon} />
        </InputSlot>
      </Input>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
        <FormControlErrorText className="text-red-500">
          At least 6 characters are required.
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}

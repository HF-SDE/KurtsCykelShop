import { useState } from "react";

import { Input, InputField, InputIcon, InputSlot } from ".";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "../form-control";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "../icon";

interface IPasswordInputProps {
  isInvalid?: boolean;
  inputValue: string;
  onChangeText?: (text: string) => void;
  errorMessage?: string;
  placeholder?: string;
  HelperText?: string;
  className?: string;
}
export default function SecretInput({ isInvalid, inputValue, onChangeText, errorMessage, placeholder, HelperText, className }: IPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormControl className={className} isInvalid={isInvalid} size="md" isDisabled={false} isReadOnly={false} isRequired={false}>
      <FormControlLabel>
        <FormControlLabelText>{placeholder || "Password"}</FormControlLabelText>
      </FormControlLabel>
      <Input className="my-1" size="md">
        <InputField
          type={showPassword ? "text" : "password"}
          placeholder={placeholder || "password"}
          value={inputValue}
          onChangeText={(text) => onChangeText && onChangeText(text)}
        />
        <InputSlot className="mr-2" onPress={() => setShowPassword(!showPassword)}>
          <InputIcon as={showPassword ? EyeOffIcon : EyeIcon} />
        </InputSlot>
      </Input>
      <FormControlHelper>
        <FormControlHelperText>{HelperText}</FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
        <FormControlErrorText isTruncated className="w-full text-wrap h-full text-red-500" >{errorMessage}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}

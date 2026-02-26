import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { AlertCircleIcon, CheckIcon, ChevronDownIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";

import { Combobox } from "@components/combobox";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@components/ui/select";
import { Textarea, TextareaInput } from "@components/ui/textarea";

export interface FormStateValue<T> {
  value: T;
  fieldType: string;
  errors?: string[];
}

export type FormState<T> = {
  [K in keyof T]-?: FormStateValue<T[K]>;
};

export function toFormState<T>(input: T): FormState<T> {
  const formState = {} as FormState<T>;

  for (const key in input) {
    formState[key] = {
      value: input[key],
      fieldType: typeof input[key],
      errors: [],
    };
  }

  return formState;
}

export function toInputValue<T>(formState: FormState<T>): T {
  const inputValue = {} as T;

  for (const key in formState) {
    inputValue[key] = formState[key].value;
  }

  return inputValue;
}

interface StorageFieldBaseProps<T> {
  label: string;
  placeholder?: string;
  formStateValue: FormStateValue<T>;
  fieldType?: string;
  onChange: (value: T) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  isTextArea?: boolean;
  selectOptions?: { id: string; name: string }[];
}

export function StorageField<T>({
  label,
  placeholder,
  formStateValue,
  fieldType = formStateValue.fieldType,
  onChange,
  isRequired = true,
  isDisabled = false,
  isTextArea = false,
  selectOptions,
}: StorageFieldBaseProps<T>) {
  const { value, errors } = formStateValue;

  const error = errors && errors.length > 0 ? errors[0] : null;

  return (
    <FormControl isInvalid={!!error} size="md" isRequired={isRequired}>
      {fieldType === "boolean" ? null : (
        <FormControlLabel>
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}

      {fieldType === "string" ? (
        isTextArea ? (
          <Textarea size="md" isInvalid={!!error} isDisabled={isDisabled}>
            <TextareaInput
              placeholder={placeholder}
              value={value as string}
              onChangeText={(value) => onChange(value as T)}
            />
          </Textarea>
        ) : (
          <Input size="md" isInvalid={!!error} isDisabled={isDisabled}>
            <InputField
              type="text"
              placeholder={placeholder}
              value={value as string}
              onChangeText={(value) => onChange(value as T)}
            />
          </Input>
        )
      ) : fieldType === "number" ? (
        <Input size="md" isInvalid={!!error} isDisabled={isDisabled}>
          <InputField
            type="text"
            keyboardType="decimal-pad"
            inputMode="decimal"
            placeholder={placeholder}
            value={value === 0 ? "" : String(value)}
            onChangeText={(text) => {
              const numericValue = text === "" ? 0 : text.replace(/[^0-9]/g, "");
              onChange(numericValue as T);
            }}
          />
        </Input>
      ) : fieldType === "boolean" ? (
        <Checkbox
          isInvalid={!!error}
          size="lg"
          value={String(value)}
          onChange={(isChecked) => onChange(isChecked as T)}
          isChecked={value as boolean}
          isDisabled={isDisabled}
        >
          <CheckboxIndicator>
            <CheckboxIcon as={CheckIcon} />
          </CheckboxIndicator>
          <CheckboxLabel>{label}</CheckboxLabel>
        </Checkbox>
      ) : fieldType === "select" ? (
        <Select
          onValueChange={(id) => onChange(id as T)}
          isDisabled={isDisabled}
          selectedLabel={selectOptions?.find((option) => option.id === value)?.name || ""}
        >
          <SelectTrigger variant="outline" size="md">
            <SelectInput placeholder={placeholder} />
            <SelectIcon className="ml-auto mr-2" as={ChevronDownIcon} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {selectOptions?.map((option) => <SelectItem key={option.id} value={option.id} label={option.name} />)}
            </SelectContent>
          </SelectPortal>
        </Select>
      ) : fieldType === "combobox" ? (
        <Combobox
          placeholder={placeholder}
          options={selectOptions || []}
          value={value as string}
          onChange={(id) => onChange(id as T)}
          isDisabled={isDisabled}
        />
      ) : null}

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
        <FormControlErrorText className="text-red-500">{error}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}

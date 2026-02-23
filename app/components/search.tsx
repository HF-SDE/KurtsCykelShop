import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";

import { SearchIcon } from "lucide-react-native";

export function Searchbar({
  placeholder,
  className,
  value,
  onChangeText,
}: {
  placeholder?: string;
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}) {
  return (
    <Input className={className}>
      <InputSlot className="pl-3">
        <InputIcon as={SearchIcon} />
      </InputSlot>
      <InputField placeholder={placeholder ?? "Søg..."} value={value} onChangeText={onChangeText} />
    </Input>
  );
}

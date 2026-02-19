import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";

import { SearchIcon } from "lucide-react-native";

export function Searchbar() {
  return (
    <Input className="h-14 rounded-lg">
      <InputSlot className="pl-3">
        <InputIcon as={SearchIcon} />
      </InputSlot>
      <InputField placeholder="Search..." />
    </Input>
  );
}

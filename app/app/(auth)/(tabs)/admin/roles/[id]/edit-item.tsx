import { Item } from "@/types/Inventory/Item";

import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";
import { useData } from "@hooks/useData";
import { useGlobalSearchParams } from "expo-router";

export default function EditItem() {
  const { id } = useGlobalSearchParams();

  const [[item], , isLoading] = useData<Item>(`/items/${id}`);

  console.log(item);

  if (isLoading)
    return (
      <Box className="bg-background-0 flex-1">
        <Text>Loading...</Text>
      </Box>
    );

  if (!item)
    return (
      <Box className="bg-background-0 flex-1">
        <Text>Item not found</Text>
      </Box>
    );

  return (
    <Box className="bg-background-0 flex-1">
      <Text>{item?.name}</Text>
    </Box>
  );
}

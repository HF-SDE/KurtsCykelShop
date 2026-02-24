import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";
import { useGlobalSearchParams } from "expo-router";

import { useStorage } from "../ctx";

export default function EditItem() {
  const { id } = useGlobalSearchParams();

  const { data: items, isLoading } = useStorage();

  const item = items.find((i) => i.id === id);

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

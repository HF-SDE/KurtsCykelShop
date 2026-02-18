import { Box } from "@/components/ui/box";

import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function Admin() {
  return (
    <Box className="bg-background-0 flex-1 items-center justify-center">
      <Entypo name="lock" size={64} color="#9ca3af" />
      <Box className="mt-4">
        <FontAwesome6 name="user-shield" size={24} color="#9ca3af" />
      </Box>
    </Box>
  );
}

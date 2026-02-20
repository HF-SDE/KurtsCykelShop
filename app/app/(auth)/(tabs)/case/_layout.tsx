import { BackButtonLayout } from "@components/back-button";
import { Box } from "@components/ui/box";
import { Button, ButtonIcon } from "@components/ui/button";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function StorageLayout() {
  const router = useRouter();

  return <BackButtonLayout />;
}

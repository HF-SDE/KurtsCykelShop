import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@/components/ui/button";

import CheckPageAccess from "@components/check-page-access";
import { Center } from "@components/ui/center";
import { LockIcon } from "@components/ui/icon";
import { useRouter } from "expo-router";
import { UsersRound } from "lucide-react-native";

export default function Admin() {
  const router = useRouter();

  function handleRolesPress() {
    // navigate to roles management screen
    router.navigate("/admin/roles");
  }

  function handleUsersPress() {
    // Handle users button press
    router.navigate("/admin/users");
  }

  return (
    <SafeAreaView className="bg-background-0 flex-1">
      <Center className="bg-background-0 flex-1">
        <ButtonGroup>
          <CheckPageAccess pageName="RolesPage">
            <Button action="primary" variant="solid" size="3xl" onPress={handleRolesPress}>
              <ButtonText size="2xl">Roles</ButtonText>
              <ButtonIcon as={LockIcon} size="4xl" />
            </Button>
          </CheckPageAccess>
          <CheckPageAccess pageName="UsersPage">
            <Button action="primary" variant="solid" size="3xl" onPress={handleUsersPress}>
              <ButtonText size="2xl">Users</ButtonText>
              <ButtonIcon as={UsersRound} size="4xl" />
            </Button>
          </CheckPageAccess>
        </ButtonGroup>
      </Center>
    </SafeAreaView>
  );
}

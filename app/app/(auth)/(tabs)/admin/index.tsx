import React from "react";

import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@/components/ui/button";

import { Center } from "@components/ui/center";
import { LockIcon, UserShieldIcon } from "@components/ui/icon";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Admin() {
  const router = useRouter();

  function handleRolesPress() {
    // navigate to roles management screen
    router.navigate("/admin/roles");
  }

  function handleUsersPress() {
    // Handle users button press
  }

  return (
    <SafeAreaView className="bg-background-0 flex-1">
      <Center className="bg-background-0 flex-1">
        <ButtonGroup>
          <Button action="primary" variant="solid" size="3xl" onPress={handleRolesPress}>
            <ButtonText size="2xl">Roles</ButtonText>
            <ButtonIcon as={LockIcon} size="4xl" />
          </Button>
          <Button action="primary" variant="solid" size="3xl" onPress={handleUsersPress}>
            <ButtonText size="2xl">Users</ButtonText>
            <ButtonIcon as={UserShieldIcon} size="4xl" />
          </Button>
        </ButtonGroup>
      </Center>
    </SafeAreaView>
  );
}

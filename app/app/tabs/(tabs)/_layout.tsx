import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { Box } from "@/components/ui/box";

import {
  ImpactFeedbackStyle,
  triggerHapticFeedback,
} from "@/utils/hapticFeedback";

import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { cn } from "@gluestack-ui/utils/nativewind-utils";
import { Tabs } from "expo-router";
import { colorTokens } from "@/components/ui/gluestack-ui-provider/config";
import { useThemeColor } from "@/components/ui/gluestack-ui-provider/useThemeColor";

export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(true);

  const [hasOrderPermission, setHasOrderPermission] = useState(true);
  const [hasReservationPermission, setHasReservationPermission] =
    useState(true);
  const [hasManagementPermission, setHasManagementPermission] = useState(true);

  // const checkPermissions = async () => {
  //   const permissionMan = new PermissionManager();
  //   await permissionMan.init();

  //   const orderPermission = await permissionMan.hasPageAccess("OrderPage");
  //   setHasOrderPermission(orderPermission);

  //   const reservationPermission =
  //     await permissionMan.hasPageAccess("ReservationPage");
  //   setHasReservationPermission(reservationPermission);

  //   const managementPermission =
  //     await permissionMan.hasPageAccess("ManagementPage");
  //   setHasManagementPermission(managementPermission);

  //   setIsLoading(false);
  // };

  const handleTabPress = async () => {
    // Trigger haptic feedback
    await triggerHapticFeedback(ImpactFeedbackStyle.Soft);
  };

  useEffect(() => {
    // checkPermissions();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 88,
          paddingTop: 10,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          overflow: "hidden",
        },
        tabBarBackground: () => <Box className="bg-background-0 flex-1" />,
        tabBarShowLabel: false,
        headerTitleAlign: "center",
        tabBarItemStyle: { display: "none" },
        tabBarIconStyle: {
          height: 50,
          width: 50,
        },
        headerShown: false,
      }}
      screenListeners={{
        tabPress: async () => {
          await handleTabPress(); // Ensure handleTabPress is a function and it returns a Promise.
        },
      }}
    >
      {hasOrderPermission && (
        <Tabs.Screen
          name="tab1"
          options={{
            title: "Tab 1",
            tabBarItemStyle: { display: "flex" },
            tabBarIcon: ({ focused }) => (
              <Entypo
                name="list"
                size={42}
                // color={focused ? colors.accent : colors.secondary}
                className={focused ? "!text-typography-800" : "!text-typography-300"  }
              />
            ),
          }}
        />
      )}
      {hasManagementPermission && (
        <Tabs.Screen
          name="tab2"
          options={{
            title: "Tab 2",
            tabBarItemStyle: { display: "flex" },
            tabBarIcon: ({ focused }) => (
              <FontAwesome6
                name="gear"
                size={38}
               className={focused ? "!text-typography-800" : "!text-typography-300"}
              />
            ),
          }}
        />
      )}
    </Tabs>
  );
}

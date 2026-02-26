import React, { useEffect, useState } from "react";

import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";

import { ImpactFeedbackStyle, triggerHapticFeedback } from "@/utils/hapticFeedback";

import { Tabs } from "expo-router";
import { BookText, CircleUserRound, Package, UserRoundCog } from "lucide-react-native";
import { PermissionManager } from "@utils/permissionManager";

export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(true);

  const [hasStockPermission, setHasStockPermission] = useState(true);
  const [hasCasePermission, setHasCasePermission] = useState(true);
  const [hasManagementPermission, setHasManagementPermission] = useState(true);

  const checkPermissions = async () => {
    const permissionMan = new PermissionManager();
    await permissionMan.init();

    const stockPermission = await permissionMan.hasPageAccess("StockPage");
    setHasStockPermission(stockPermission);

    const casePermission =
      await permissionMan.hasPageAccess("CasePage");
    setHasCasePermission(casePermission);

    const managementPermission =
      await permissionMan.hasPageAccess("ManagementPage");
    setHasManagementPermission(managementPermission);

    setIsLoading(false);
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 105,
          paddingTop: 10,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          overflow: "hidden",
        },
        tabBarBackground: () => <Box className="bg-background-0 flex-1" />,
        tabBarShowLabel: false,
        headerTitleAlign: "center",
        tabBarItemStyle: { display: "none" },
        tabBarIconStyle: { height: 50, width: 50 },
        headerShown: false,
      }}
      screenListeners={{
        tabPress: () => triggerHapticFeedback(ImpactFeedbackStyle.Soft),
      }}
    >
      {hasCasePermission && (
        <Tabs.Screen
          name="case"
          options={{
            title: "Sager",
            tabBarItemStyle: { display: "flex" },
            tabBarIcon: ({ focused }) => (
              <Icon as={BookText} size="4xl" className={focused ? "!text-typography-800" : "!text-typography-300"} />
            ),
          }}
        />
      )}
      {hasStockPermission && (
        <Tabs.Screen
          name="storage"
          options={{
            title: "Lager",
            tabBarItemStyle: { display: "flex" },
            tabBarIcon: ({ focused }) => (
              <Icon as={Package} size="4xl" className={focused ? "!text-typography-800" : "!text-typography-300"} />
            ),
          }}
        />
      )}
      {hasManagementPermission && (
        <Tabs.Screen
          name="admin"
          options={{
            title: "Admin",
            tabBarItemStyle: { display: "flex" },
            tabBarIcon: ({ focused }) => (
              <Icon
                as={UserRoundCog}
                size="4xl"
                className={focused ? "!text-typography-800" : "!text-typography-300"}
              />
            ),
          }}
        />
      )}
      {hasManagementPermission && (
        <Tabs.Screen
          name="index"
          options={{
            title: "Profile",
            tabBarItemStyle: { display: "flex" },
            tabBarIcon: ({ focused }) => (
              <Icon
                as={CircleUserRound}
                size="4xl"
                className={focused ? "!text-typography-800" : "!text-typography-300"}
              />
            ),
          }}
        />
      )}
    </Tabs>
  );
}

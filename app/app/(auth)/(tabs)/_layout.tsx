import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";

import { ImpactFeedbackStyle, triggerHapticFeedback } from "@/utils/hapticFeedback";

import { usePermissions } from "@/contexts/permissions.ctx";

import { FoxLoader } from "@components/fox";
import { Tabs } from "expo-router";
import { BookText, CircleUserRound, Package, UserRoundCog } from "lucide-react-native";

export default function TabLayout() {
  const { hasPageAccess, isLoading } = usePermissions();

  if (isLoading) return <FoxLoader />;

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
      {hasPageAccess("CasePage") && (
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
      {hasPageAccess("StockPage") && (
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
      {hasPageAccess("ManagementPage") && (
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
      {hasPageAccess("ManagementPage") && (
        <Tabs.Screen
          name="index"
          options={{
            title: "Profil",
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

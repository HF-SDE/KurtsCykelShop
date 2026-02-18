import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";

import SessionProvider from "@/app/ctx";
import "@/global.css";

import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

export const unstable_settings = {
  initialRouteName: "login",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorMode = "system";

  useEffect(() => {
    // Hide the splash screen once the app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <SessionProvider>
      <SafeAreaProvider>
        <GluestackUIProvider mode={colorMode}>
          <Box className="bg-background-0 flex-1">
            <SafeAreaView style={{ flex: 1 }}>
              <ThemeProvider>
                <Slot />
              </ThemeProvider>
            </SafeAreaView>
          </Box>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </SessionProvider>
  );
}

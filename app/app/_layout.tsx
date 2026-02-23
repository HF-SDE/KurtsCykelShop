import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
      <GluestackUIProvider mode={colorMode}>
        <KeyboardProvider>
          <ThemeProvider>
            <Slot />
          </ThemeProvider>
        </KeyboardProvider>
      </GluestackUIProvider>
    </SessionProvider>
  );
}

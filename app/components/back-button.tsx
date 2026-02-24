import { PropsWithChildren } from "react";

import { colorPalettes } from "@/components/ui/gluestack-ui-provider/config";

import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export function BackButtonLayout({ children }: PropsWithChildren) {
  const { colorScheme } = useColorScheme();
  const effectiveColorScheme = colorScheme === "dark" ? "dark" : "light";
  const palette = effectiveColorScheme === "dark" ? colorPalettes.dark : colorPalettes.light;
  const background0 = `rgb(${palette["--color-background-0"]})`;
  const headerTint = `rgb(${palette["--color-typography-900"]})`;

  return (
    <Stack
      key={effectiveColorScheme}
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerTitle: "",
        headerTransparent: false,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: headerTint,
        headerStyle: { backgroundColor: background0 },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {children}
    </Stack>
  );
}

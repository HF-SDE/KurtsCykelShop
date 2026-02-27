import { useCallback, useState } from "react";

import { Button } from "@components/ui/button";
import { useFocusEffect } from "@react-navigation/native";
import { tryAcquireNavigationLock } from "@utils/navigationLock";
import { Href, useRouter } from "expo-router";

export type NavigationButtonProps = Omit<React.ComponentProps<typeof Button>, "onPress"> & {
  href: Href;
  replace?: boolean;
};

export function NavigationButton({ href, replace = false, isDisabled, ...buttonProps }: NavigationButtonProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, []),
  );

  const handlePress = () => {
    if (isNavigating || isDisabled) return;
    if (!tryAcquireNavigationLock()) return;

    setIsNavigating(true);

    if (replace) {
      router.replace(href);
      return;
    }

    router.push(href);
  };

  return <Button {...buttonProps} isDisabled={Boolean(isDisabled) || isNavigating} onPress={handlePress} />;
}

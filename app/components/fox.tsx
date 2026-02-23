import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

import { Text } from "./ui/text";

interface FoxLoaderProps {
  size?: number;
  duration?: number; // Duration in milliseconds for one full rotation
}

export function FoxLoader({ size = 300, duration = 2000 }: FoxLoaderProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinValue, duration]);

  // Anti-clockwise rotation (negative degrees)
  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });

  return (
    <View className="items-center justify-center">
      <Animated.Image
        source={require("@/assets/fox2.png")}
        style={{
          width: size,
          height: size,
          transform: [{ rotate: spinAnimation }],
        }}
        resizeMode="contain"
      />
      <Text className="mt-4" size="3xl" bold>
        Indlæser...
      </Text>
    </View>
  );
}

export default FoxLoader;

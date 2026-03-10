import { Platform } from "react-native";

import * as Haptics from "expo-haptics";

/**
 * Triggers haptic feedback if not running on the web.
 * @param style - The haptic feedback style to use (default is Soft).
 */
export const triggerHapticFeedback = async (
  style: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType = Haptics.ImpactFeedbackStyle.Light,
) => {
  if (Platform.OS !== "web") {
    if (Object.values(Haptics.ImpactFeedbackStyle).includes(style as Haptics.ImpactFeedbackStyle)) {
      // Impact feedback
      await Haptics.impactAsync(style as Haptics.ImpactFeedbackStyle);
    } else if (Object.values(Haptics.NotificationFeedbackType).includes(style as Haptics.NotificationFeedbackType)) {
      // Notification feedback
      await Haptics.notificationAsync(style as Haptics.NotificationFeedbackType);
    } else {
      console.warn("Invalid haptic feedback type provided.");
    }
  }
};

export const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = Haptics.NotificationFeedbackType;

import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

type SupportedPlatform = "ios" | "android";

export const triggerImpact = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
  enabledPlatforms: SupportedPlatform[] = ["ios"],
) => {
  if (!enabledPlatforms.includes(Platform.OS as SupportedPlatform)) {
    return;
  }
  return Haptics.impactAsync(style);
};

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const DEVICE_TOKEN_KEY = "deviceToken";

export const grantNotificationPermission = async (
  isNecessary: boolean = false,
): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === "granted") {
    return true;
  }

  const { status: finalStatus } = await Notifications.requestPermissionsAsync();

  if (finalStatus === "granted") {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem(DEVICE_TOKEN_KEY, token);
    return true;
  } else if (isNecessary) {
    Alert.alert(
      "Notification Permission",
      "You need to enable notifications to use this feature. Please update your device settings.",
      [{ text: "OK" }],
    );
  }
  return false;
};

export const getDeviceToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting device token:", error);
    return null;
  }
};

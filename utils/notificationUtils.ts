import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import Assignment from "../models/Assignment";

const DEVICE_TOKEN_KEY = "deviceToken";

export const grantNotificationPermission = async (
  isNecessary: boolean = false,
): Promise<boolean> => {
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") {
      return true;
    }

    const { status: finalStatus } =
      await Notifications.requestPermissionsAsync();

    if (finalStatus === "granted") {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Failed to retrieve projectId");
      }
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
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
  }
  return true;
};

export const getDeviceToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting device token:", error);
    return null;
  }
};

export const scheduleNotification = async (
  assignment: Assignment,
  notificationTiming: string,
): Promise<void> => {
  const dueDate = new Date(assignment.dueTime);
  let notificationDate = new Date(dueDate);

  switch (notificationTiming) {
    case "7days":
      notificationDate.setDate(dueDate.getDate() - 7);
      break;
    case "3days":
      notificationDate.setDate(dueDate.getDate() - 3);
      break;
    case "1day":
      notificationDate.setDate(dueDate.getDate() - 1);
      break;
    case "3hours":
      notificationDate.setHours(dueDate.getHours() - 3);
      break;
    case "1hour":
      notificationDate.setHours(dueDate.getHours() - 1);
      break;
  }

  const now = new Date();
  if (notificationDate <= now) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Assignment Due Soon: ${assignment.title}`,
      body: `Your assignment "${assignment.title}" is due ${notificationTiming} from now.`,
    },
    trigger: notificationDate,
  });

  return;
};

export const setupNotifications = async (
  assignments: Assignment[],
  selectedNotifications: string[],
): Promise<void> => {
  const hasPermission = await grantNotificationPermission(true);
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const assignment of assignments) {
    for (const timing of selectedNotifications) {
      await scheduleNotification(assignment, timing);
    }
  }
};

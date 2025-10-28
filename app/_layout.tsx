import React from "react";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AssignmentProvider } from "../contexts/AssignmentContext";
import { LocalizationProvider } from "../contexts/LocalizationContext";
import { UserProvider } from "../contexts/UserContext";

export default function RootLayout() {
  const router = useRouter();

  const renderSettingsButton = React.useCallback(
    ({ tintColor }: { tintColor?: string }) => (
      <Pressable
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        onPress={() => router.push("/settings")}
        style={({ pressed }) => [
          styles.headerIconButton,
          pressed && styles.headerIconButtonPressed,
        ]}
      >
        <Ionicons
          name="settings-outline"
          size={22}
          color={tintColor ?? "#000"}
        />
      </Pressable>
    ),
    [router],
  );

  return (
    <LocalizationProvider>
      <UserProvider>
        <AssignmentProvider>
          <Stack
            screenOptions={{
              headerTintColor: "#000",
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="home"
              options={{
                title: "",
                headerBackVisible: false,
                headerRight: renderSettingsButton,
              }}
            />
            <Stack.Screen
              name="assignment/[id]"
              options={{
                title: "",
                headerBackTitle: "",
                headerRight: renderSettingsButton,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                title: "",
                headerBackTitle: "",
              }}
            />
          </Stack>
        </AssignmentProvider>
      </UserProvider>
    </LocalizationProvider>
  );
}

const styles = StyleSheet.create({
  headerIconButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconButtonPressed: {
    opacity: 0.6,
  },
});

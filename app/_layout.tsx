import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LogBox } from "react-native";

import { AssignmentProvider } from "../contexts/AssignmentContext";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // react-native-render-html によるエラー回避
    LogBox.ignoreLogs([
      'TNodeChildrenRenderer',
      'MemoizedTNodeRenderer',
      'TRenderEngineProvider',
      'bound renderChildren',
    ]);
  }, []);

  return (
    <AssignmentProvider>
      <Stack>
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
            title: "Home",
            headerBackVisible: false,
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push("/settings")}>
                <Ionicons name="settings-outline" size={24} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="assignment/[id]"
          options={{
            title: "Assignment Details",
            headerBackTitleVisible: false,
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push("/settings")}>
                <Ionicons name="settings-outline" size={24} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
            headerBackTitleVisible: false,
          }}
        />
      </Stack>
    </AssignmentProvider>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useUser } from "../contexts/UserContext";
import { useLocalization } from "../contexts/LocalizationContext";

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isChecking, setIsChecking] = useState(true);
  const { t } = useLocalization();
  const { loadUser } = useUser();

  const checkLoginStatus = useCallback(async () => {
    try {
      const loadUserStatus = await loadUser();
      if (loadUserStatus) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      router.replace("/login");
    } finally {
      setIsChecking(false);
    }
  }, [loadUser, router]);

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    checkLoginStatus();
  }, [navigationState?.key, checkLoginStatus]);

  if (isChecking || !navigationState?.key) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
});

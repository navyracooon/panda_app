import React, { useEffect, useState } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { View, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import User from "../models/User";
import Spinner from "../components/Spinner";
import { useLocalization } from "../contexts/LocalizationContext";

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isChecking, setIsChecking] = useState(true);
  const { t } = useLocalization();

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    checkLoginStatus();
  }, [navigationState?.key]);

  const checkLoginStatus = async () => {
    try {
      const userCredentialsString =
        await SecureStore.getItemAsync("userCredentials");
      if (!userCredentialsString) {
        router.replace("/login");
        return;
      }

      const userCredentials = JSON.parse(userCredentialsString);
      const user = new User(userCredentials.ecsId, userCredentials.password);

      const isLoggedIn = await user.checkLogin();
      if (isLoggedIn) {
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
  };

  if (isChecking || !navigationState?.key) {
    return (
      <View style={styles.container}>
        <Spinner size={40} color="#000" message={t("common.loading")} />
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
});

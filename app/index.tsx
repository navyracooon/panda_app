import React, { useEffect, useState, useRef } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { View, StyleSheet, Animated, Easing } from "react-native";
import * as SecureStore from "expo-secure-store";
import User from "../models/User";

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isChecking, setIsChecking] = useState(true);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    checkLoginStatus();
  }, [navigationState?.key]);

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinAnimation.start();

    return () => spinAnimation.stop();
  }, [spinValue]);

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

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (isChecking || !navigationState?.key) {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[styles.loader, { transform: [{ rotate: spin }] }]}
        />
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
  loader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#000",
    borderTopColor: "transparent",
  },
});

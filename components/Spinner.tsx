import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

interface SpinnerProps {
  size?: number;
  color?: string;
  message?: string;
}

export default function Spinner({
  size = 40,
  color = "#000",
  message,
}: SpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

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

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.loader,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            transform: [{ rotate: spin }],
          },
        ]}
      />
      {message && (
        <View style={styles.messageContainer}>
          <Text style={[styles.message, { color }]}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  loader: {
    borderWidth: 3,
    borderTopColor: "transparent",
  },
  messageContainer: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

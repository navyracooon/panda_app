import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as Haptics from 'expo-haptics';
import User from "../models/User";
import { grantNotificationPermission } from "../utils/notificationUtils";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const [ecsId, setEcsId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    grantNotificationPermission();
  }, []);

  const handleLogin = async () => {
    if (!ecsId || !password) {
      Alert.alert("Error", "Please enter both ECS-ID and password");
      return;
    }

    setIsLoading(true);
    const user = new User(ecsId, password);

    try {
      const isValid = await user.checkLogin();
      if (isValid) {
        await SecureStore.setItemAsync(
          "userCredentials",
          JSON.stringify({ ecsId, password }),
        );
        router.replace("/home");
      } else {
        Alert.alert("Error", "Invalid ECS-ID or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>PandA App</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={ecsId}
                onChangeText={setEcsId}
                placeholder="ECS-ID"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!isLoading}
              />
            </View>
          </View>
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#000",
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#000",
    fontSize: 16,
    paddingVertical: 10,
  },
  buttonContainer: {
    width: width * 0.8,
    maxWidth: 300,
  },
  button: {
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

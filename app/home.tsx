import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
} from "react-native";
import AssignmentCard from "../components/AssignmentCard";
import PandaParser from "../utils/PandaParser";
import User from "../models/User";
import * as SecureStore from "expo-secure-store";
import { useAssignments } from "../contexts/AssignmentContext";

export default function HomeScreen() {
  const { assignments, setAssignments } = useAssignments();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    fetchAssignments();
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const fetchAssignments = async () => {
    try {
      const userCredentialsString =
        await SecureStore.getItemAsync("userCredentials");
      if (!userCredentialsString) {
        throw new Error("User credentials not found");
      }

      const userCredentials = JSON.parse(userCredentialsString);
      const user = new User(userCredentials.ecsId, userCredentials.password);

      const assignmentList = await PandaParser.getAllAssignmentInfo(user);
      setAssignments(assignmentList);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => <AssignmentCard assignment={item} />;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Animated.View
          style={[styles.loader, { transform: [{ rotate: spin }] }]}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={assignments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  listContent: {
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
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

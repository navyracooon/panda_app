import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AssignmentCard from "../components/AssignmentCard";
import PandaParser from "../utils/PandaParser";
import User from "../models/User";
import * as SecureStore from "expo-secure-store";
import { useAssignments } from "../contexts/AssignmentContext";
import Spinner from "../components/Spinner";

export default function HomeScreen() {
  const { assignments, setAssignments } = useAssignments();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
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
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Spinner size={40} color="#000" message="fetching assignments..." />
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
        renderItem={({ item }) => <AssignmentCard assignment={item} />}
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
});

import React, { useState, useEffect, useCallback } from "react";
import { FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import AssignmentCard from "../components/AssignmentCard";
import PandaParser from "../utils/PandaParser";
import User from "../models/User";
import * as SecureStore from "expo-secure-store";
import { useAssignments } from "../contexts/AssignmentContext";
import Spinner from "../components/Spinner";
import { useLocalization } from "../contexts/LocalizationContext";

export default function HomeScreen() {
  const { assignments, setAssignments } = useAssignments();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalization();

  const fetchAssignments = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const userCredentialsString =
          await SecureStore.getItemAsync("userCredentials");
        if (!userCredentialsString) {
          throw new Error("User credentials not found");
        }

        const userCredentials = JSON.parse(userCredentialsString);
        const user = new User(userCredentials.ecsId, userCredentials.password);

        const assignmentList = await PandaParser.getAllAssignmentInfo(user);
        setAssignments(assignmentList);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [setAssignments, t],
  );

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleRefresh = useCallback(() => {
    fetchAssignments(true);
  }, [fetchAssignments]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Spinner
          size={40}
          color="#000"
          message={t("home.fetchingAssignments")}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {t("common.error")}: {error}
        </Text>
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
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t("home.noAssignments")}</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#000"]}
            tintColor="#000"
          />
        }
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

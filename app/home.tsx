import React, { useState, useEffect, useCallback } from "react";
import { FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import AssignmentCard from "../components/AssignmentCard";
import PandaUtils from "../utils/PandaUtils";
import { useAssignments } from "../contexts/AssignmentContext";
import Spinner from "../components/Spinner";
import { useLocalization } from "../contexts/LocalizationContext";
import { useUser } from "../contexts/UserContext";
import * as SecureStore from "expo-secure-store";
import { setupNotifications } from "../utils/notificationUtils";

export default function HomeScreen() {
  const { assignments, setAssignments } = useAssignments();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalization();
  const { user, loadUser } = useUser();

  const fetchAssignments = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        if (!user) {
          await loadUser();
        }

        if (user) {
          const assignmentList = await PandaUtils.getAllAssignments(user);
          const sortedAssignments = assignmentList.sort((a, b) => {
            const dateA = new Date(a.dueTime);
            const dateB = new Date(b.dueTime);
            return dateA.getTime() - dateB.getTime();
          });

          setAssignments(sortedAssignments);

          const selectedNotificationsString = await SecureStore.getItemAsync(
            "selectedNotifications",
          );
          if (selectedNotificationsString) {
            const selectedNotifications = JSON.parse(
              selectedNotificationsString,
            );
            await setupNotifications(sortedAssignments, selectedNotifications);
          }
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [setAssignments, t, user, loadUser],
  );

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleRefresh = useCallback(() => {
    fetchAssignments(true);
  }, [fetchAssignments]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <Spinner
            size={40}
            color="#000"
            message={t("home.fetchingAssignments")}
          />
        </View>
      ) : (
        <FlatList
          data={assignments}
          renderItem={({ item }) => <AssignmentCard assignment={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {error
                ? `${t("common.error")}: ${error}`
                : t("home.noAssignments")}
            </Text>
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
      )}
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
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

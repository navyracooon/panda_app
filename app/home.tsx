import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import AssignmentCard from "../components/AssignmentCard";
import { useAssignments } from "../contexts/AssignmentContext";
import { useLocalization } from "../contexts/LocalizationContext";
import { useUser } from "../contexts/UserContext";
import * as SecureStore from "expo-secure-store";
import { setupNotifications } from "../utils/notificationUtils";
import { format } from "date-fns";

export default function HomeScreen() {
  const { assignments, loadAssignments, lastRefresh } = useAssignments();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalization();
  const { user } = useUser();

  const fetchAssignments = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        if (user) {
          await loadAssignments(user, refresh);
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
    [loadAssignments, t, user],
  );

  const handleRefresh = useCallback(() => {
    fetchAssignments(true);
  }, [fetchAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    const setupNotificationsForAssignments = async () => {
      try {
        const selectedNotificationsString = await SecureStore.getItemAsync(
          "selectedNotifications",
        );
        if (selectedNotificationsString) {
          const selectedNotifications = JSON.parse(selectedNotificationsString);
          await setupNotifications(assignments, selectedNotifications);
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    if (assignments.length > 0) {
      setupNotificationsForAssignments();
    }
  }, [assignments]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>
            {t("home.fetchingAssignments")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={assignments}
          renderItem={({ item }) => <AssignmentCard assignment={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            lastRefresh && (
              <Text style={styles.lastRefreshText}>
                {t("home.lastRefresh", {
                  time: format(lastRefresh, "yyyy-MM-dd HH:mm:ss"),
                })}
              </Text>
            )
          }
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
  lastRefreshText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    paddingVertical: 2,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
});

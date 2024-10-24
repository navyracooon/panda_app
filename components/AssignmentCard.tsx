import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { format, differenceInDays } from "date-fns";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Assignment from "../models/Assignment";
import RenderHtml from "react-native-render-html";
import { useLocalization } from "../contexts/LocalizationContext";

type Props = {
  assignment: Assignment;
};

const MAX_DESCRIPTION_LENGTH = 100;

export default function AssignmentCard(props: Props) {
  const { assignment } = props;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t } = useLocalization();

  const getDueDateColor = (dueDate: Date) => {
    const daysUntilDue = differenceInDays(dueDate, new Date());
    if (daysUntilDue <= 1) return "#FF3B30";
    if (daysUntilDue <= 3) return "#FFCC00";
    return "#34C759";
  };

  const truncateHtml = (html: string, maxLength: number) => {
    if (html.length <= maxLength) return html;
    return html.substring(0, maxLength) + "...";
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/assignment/${assignment.id}`)}
      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      style={styles.card}
    >
      <Text style={styles.siteTitle} numberOfLines={1}>
        {assignment.site?.title}
      </Text>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.dueDateIndicator,
              {
                backgroundColor: getDueDateColor(new Date(assignment.dueTime)),
              },
            ]}
          />
          <Text style={styles.title} numberOfLines={1}>
            {assignment.title}
          </Text>
        </View>
        <View style={styles.dueDateContainer}>
          <Ionicons name="time-outline" size={16} color="#007AFF" />
          <Text style={styles.dueDate}>
            {format(new Date(assignment.dueTime), "MMM d 'at' H:mm")}
          </Text>
        </View>
      </View>
      <View style={styles.description}>
        <RenderHtml
          contentWidth={width - 64}
          source={{
            html: truncateHtml(assignment.instructions, MAX_DESCRIPTION_LENGTH),
          }}
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>
            {t("assignment.viewDetails")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#007AFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  siteTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  dueDateIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDate: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
  },
  description: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsButtonText: {
    fontSize: 14,
    color: "#007AFF",
    marginRight: 4,
  },
});

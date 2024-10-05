import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { format, differenceInDays } from "date-fns";
import * as Calendar from "expo-calendar";
import { useAssignments } from "../../contexts/AssignmentContext";
import RenderHtml from "react-native-render-html";

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { assignments } = useAssignments();
  const { width } = useWindowDimensions();

  const assignment = assignments.find((a) => a.id === id);

  if (!assignment) {
    return (
      <View style={styles.container}>
        <Text>Assignment not found</Text>
      </View>
    );
  }

  const getDueDateColor = (dueDate: Date) => {
    const daysUntilDue = differenceInDays(dueDate, new Date());
    if (daysUntilDue <= 1) return "#FF3B30"; // Red for 1 day or less
    if (daysUntilDue <= 3) return "#FFCC00"; // Yellow for 2-3 days
    return "#34C759"; // Green for more than 3 days
  };

  const dueDateColor = getDueDateColor(assignment.dueTime);

  const handleUrlPress = () => {
    Linking.openURL(
      `https://panda.ecs.kyoto-u.ac.jp/portal/site/${assignment.context}`,
    );
  };

  const handleDatePress = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT,
        );
        const defaultCalendar =
          calendars.find((cal) => cal.isPrimary) || calendars[0];

        if (defaultCalendar) {
          const eventDetails = {
            title: assignment.title,
            startDate: assignment.dueTime,
            endDate: new Date(assignment.dueTime.getTime() + 60 * 60 * 1000), // 1 hour duration
            notes: assignment.instructions,
            timeZone: "GMT",
          };

          await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
          Alert.alert("Assignment added to calendar");
        } else {
          Alert.alert("Error", "No calendar found on the device");
        }
      } else {
        Alert.alert(
          "Permission required",
          "Calendar permission is required to add the event",
        );
      }
    } catch (error) {
      console.error("Error adding event to calendar:", error);
      Alert.alert("Error", "Failed to add assignment to calendar");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{assignment.title}</Text>
        <TouchableOpacity
          style={styles.dueDateContainer}
          onPress={handleDatePress}
          onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Ionicons name="calendar-outline" size={24} color="#000" />
          <View
            style={[styles.dueDateIndicator, { backgroundColor: dueDateColor }]}
          />
          <Text style={styles.dueDate}>
            {format(new Date(assignment.dueTime), "MMMM d, yyyy 'at' h:mm a")}
          </Text>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="#007AFF"
            style={styles.addIcon}
          />
        </TouchableOpacity>
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: assignment.instructions }}
          />
        </View>
        <TouchableOpacity
          style={styles.urlContainer}
          onPress={handleUrlPress}
          onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Ionicons name="link-outline" size={24} color="#007AFF" />
          <Text style={styles.url} numberOfLines={1} ellipsizeMode="tail">
            {`https://panda.ecs.kyoto-u.ac.jp/portal/site/${assignment.context}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#F7F7F7",
    padding: 16,
    borderRadius: 12,
  },
  dueDateIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
    marginRight: 8,
  },
  dueDate: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  addIcon: {
    marginLeft: 8,
  },
  descriptionContainer: {
    backgroundColor: "#F7F7F7",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    padding: 16,
    borderRadius: 12,
  },
  url: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 12,
    flex: 1,
    textDecorationLine: "underline",
  },
});

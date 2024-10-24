import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import RenderHtml from "react-native-render-html";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Calendar from "expo-calendar";
import { format, differenceInDays } from "date-fns";
import AttachmentList from "../../components/AttachmentList";
import { useAssignments } from "../../contexts/AssignmentContext";
import { useLocalization } from "../../contexts/LocalizationContext";

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { assignments } = useAssignments();
  const { t } = useLocalization();
  const { width } = useWindowDimensions();

  const assignment = assignments.find((a) => a.id === id);

  if (!assignment) {
    return (
      <View style={styles.container}>
        <Text>{t("assignment.notFound")}</Text>
      </View>
    );
  }

  const getDueDateColor = (dueDate: Date) => {
    const daysUntilDue = differenceInDays(dueDate, new Date());
    if (daysUntilDue <= 1) return "#FF3B30";
    if (daysUntilDue <= 3) return "#FFCC00";
    return "#34C759";
  };

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
            startDate: new Date(assignment.dueTime),
            endDate: new Date(assignment.dueTime + 60 * 60 * 1000),
            notes: assignment.instructions,
            timeZone: "GMT",
          };

          await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
          Alert.alert(t("assignment.eventAddedToCalendar"));
        } else {
          Alert.alert(t("common.error"), t("assignment.noCalendarFound"));
        }
      } else {
        Alert.alert(
          t("common.error"),
          t("assignment.calendarPermissionRequired"),
        );
      }
    } catch (error) {
      console.error("Error adding event to calendar:", error);
      Alert.alert(t("common.error"), t("assignment.failedToAddEvent"));
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.siteTitle}>{assignment.site?.title}</Text>
        <Text style={styles.title}>{assignment.title}</Text>
        <TouchableOpacity
          style={styles.dueDateContainer}
          onPress={handleDatePress}
          onPressIn={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
        >
          <Ionicons name="calendar-outline" size={24} color="#000" />
          <View
            style={[
              styles.dueDateIndicator,
              {
                backgroundColor: getDueDateColor(new Date(assignment.dueTime)),
              },
            ]}
          />
          <Text style={styles.dueDate}>
            {format(new Date(assignment.dueTime), "MMM d 'at' H:mm")}
          </Text>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="#007AFF"
            style={styles.addIcon}
          />
        </TouchableOpacity>
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>{t("assignment.description")}</Text>
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: assignment.instructions }}
          />
        </View>
        <AttachmentList attachments={assignment.attachments} />
        <TouchableOpacity
          style={styles.urlContainer}
          onPress={handleUrlPress}
          onPressIn={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
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
    gap: 20,
  },
  siteTitle: {
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
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

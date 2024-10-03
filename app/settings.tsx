import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    // Implement language change logic here
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // Implement notification settings change logic here
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          // Implement logout logic here
          router.replace("/");
        },
      },
    ]);
  };

  const handleTermsOfUse = () => {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.settingsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name="language-outline"
                size={22}
                color="#000000"
                style={styles.icon}
              />
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={language}
                style={styles.picker}
                onValueChange={handleLanguageChange}
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="日本語" value="ja" />
                <Picker.Item label="Español" value="es" />
              </Picker>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#000000"
                style={styles.icon}
              />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: "#CCCCCC", true: "#34C759" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            style={styles.termsButton}
            onPress={handleTermsOfUse}
          >
            <Text style={styles.termsButtonText}>Terms of Use</Text>
            <Ionicons name="chevron-forward" size={22} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  settingsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#000000",
  },
  pickerContainer: {
    overflow: "hidden",
  },
  picker: {
    height: 40,
    width: 120,
    color: "#000000",
  },
  button: {
    backgroundColor: "#FF3333",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  termsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  termsButtonText: {
    color: "#000000",
    fontSize: 16,
  },
});

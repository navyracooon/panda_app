import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { grantNotificationPermission } from "../utils/notificationUtils";

const languages = [
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
];

const notificationOptions = [
  { id: '7days', label: '7 days before' },
  { id: '3days', label: '3 days before' },
  { id: '1day', label: '1 day before' },
  { id: '3hours', label: '3 hours before' },
  { id: '1hour', label: '1 hour before' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const storedLanguage = await SecureStore.getItemAsync('userLanguage');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
    const storedNotifications = await SecureStore.getItemAsync('selectedNotifications');
    if (storedNotifications) {
      setSelectedNotifications(JSON.parse(storedNotifications));
    }
  };

  const handleLanguageChange = async (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    setShowLanguageModal(false);
    await SecureStore.setItemAsync('userLanguage', selectedLanguage);
    // You might want to trigger a re-render of the app here to apply the new language
  };

  const handleNotificationToggle = async (notificationId: string) => {
    const hasPermission = await grantNotificationPermission(true);
    if (hasPermission) {
      setSelectedNotifications((prev) => {
        const newSelection = prev.includes(notificationId)
          ? prev.filter(id => id !== notificationId)
          : [...prev, notificationId];
        SecureStore.setItemAsync('selectedNotifications', JSON.stringify(newSelection));
        return newSelection;
      });
    }
  };

  const handleOpenNotificationSettings = async () => {
    const hasPermission = await grantNotificationPermission(true);
    if (hasPermission) {
      setShowNotificationModal(true);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          await SecureStore.deleteItemAsync('userCredentials');
          router.replace("/");
        },
      },
    ]);
  };

  const handleBuyMeACoffee = () => {
    Linking.openURL('https://www.buymeacoffee.com/navyracooon');
  };

  const handleGitHubContribute = () => {
    Linking.openURL('https://github.com/navyracooon/panda_app');
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleLanguageChange(item.code)}
    >
      <Text style={styles.modalItemText}>{item.label}</Text>
      {language === item.code && (
        <Ionicons name="checkmark" size={22} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleNotificationToggle(item.id)}
    >
      <Text style={styles.modalItemText}>{item.label}</Text>
      {selectedNotifications.includes(item.id) && (
        <Ionicons name="checkmark" size={22} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.settingsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name="language-outline"
                size={22}
                color="#000000"
                style={styles.icon}
              />
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {languages.find((lang) => lang.code === language)?.label}
              </Text>
              <Ionicons name="chevron-forward" size={22} color="#000000" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleOpenNotificationSettings}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#000000"
                style={styles.icon}
              />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {selectedNotifications.length === 0 ? "None" : `${selectedNotifications.length} selected`}
              </Text>
              <Ionicons name="chevron-forward" size={22} color="#000000" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity
            style={[styles.supportButton, styles.githubButton]}
            onPress={handleGitHubContribute}
            onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Ionicons name="logo-github" size={22} color="#24292e" style={styles.icon} />
            <Text style={[styles.supportButtonText, styles.githubButtonText]}>Contribute on GitHub</Text>
          </TouchableOpacity>
          <Text style={styles.supportDescription}>
            This is an open-source project and contributions are welcome. You can contribute to the development for free by visiting our GitHub repository.
          </Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleBuyMeACoffee}
            onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Ionicons name="cafe-outline" size={22} color="#6F4E37" style={styles.icon} />
            <Text style={styles.supportButtonText}>Buy me a coffee</Text>
          </TouchableOpacity>
          <Text style={styles.supportDescription}>
            We rely on donations to cover development costs, including Apple Store and Google Play Store developer fees. Your support helps us maintain and improve the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogout}
            onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLanguageModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Language</Text>
                <FlatList
                  data={languages}
                  renderItem={renderLanguageItem}
                  keyExtractor={(item) => item.code}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowLanguageModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowNotificationModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Notification Settings</Text>
                <FlatList
                  data={notificationOptions}
                  renderItem={renderNotificationItem}
                  keyExtractor={(item) => item.id}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowNotificationModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  settingValueContainer: {
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
  settingValue: {
    fontSize: 16,
    color: "#666666",
    marginRight: 8,
  },
  supportDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#6F4E37",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  supportButtonText: {
    color: "#6F4E37",
    fontSize: 16,
    fontWeight: "600",
  },
  githubButton: {
    borderColor: "#24292e",
  },
  githubButtonText: {
    color: "#24292e",
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
  buyMeACoffeeButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#6F4E37",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buyMeACoffeeButtonText: {
    color: "#6F4E37",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalItemText: {
    fontSize: 16,
    color: "#000000",
  },
  closeButton: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#EEEEEE",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});

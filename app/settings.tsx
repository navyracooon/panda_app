import React, { useState, useEffect, useCallback } from "react";
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
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import {
  grantNotificationPermission,
  setupNotifications,
} from "../utils/notificationUtils";
import { useAssignments } from "../contexts/AssignmentContext";
import { useLocalization } from "../contexts/LocalizationContext";
import { useUser } from "../contexts/UserContext";

type LanguageOption = {
  code: string;
  label: string;
};

type NotificationOption = {
  id: string;
  label: string;
};

const languages: LanguageOption[] = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
];

const notificationOptions: NotificationOption[] = [
  { id: "7days", label: "7days" },
  { id: "3days", label: "3days" },
  { id: "1day", label: "1day" },
  { id: "3hours", label: "3hours" },
  { id: "1hour", label: "1hour" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { assignments } = useAssignments();
  const { t, locale, setLocale } = useLocalization();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useUser();

  const loadSettings = useCallback(async () => {
    const storedNotifications = await SecureStore.getItemAsync(
      "selectedNotifications",
    );
    if (storedNotifications) {
      setSelectedNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  }, [loadSettings]);

  const handleLanguageChange = async (selectedLanguage: string) => {
    setLocale(selectedLanguage);
    setShowLanguageModal(false);
    await SecureStore.setItemAsync("userLanguage", selectedLanguage);
  };

  const handleNotificationToggle = async (notificationId: string) => {
    const hasPermission = await grantNotificationPermission(true);
    if (hasPermission) {
      setSelectedNotifications((prev) => {
        const newSelection = prev.includes(notificationId)
          ? prev.filter((id) => id !== notificationId)
          : [...prev, notificationId];
        SecureStore.setItemAsync(
          "selectedNotifications",
          JSON.stringify(newSelection),
        );

        setupNotifications(assignments, newSelection);

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
    Alert.alert(t("settings.logoutConfirmation"), "", [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.ok"),
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  const handleGitHubContribute = () => {
    Linking.openURL("https://github.com/navyracooon/panda_app");
  };

  const renderLanguageItem = ({ item }: { item: LanguageOption }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleLanguageChange(item.code)}
    >
      <Text style={styles.modalItemText}>{item.label}</Text>
      {locale === item.code && (
        <Ionicons name="checkmark" size={22} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }: { item: NotificationOption }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleNotificationToggle(item.id)}
    >
      <Text style={styles.modalItemText}>
        {t(`notificationOptions.${item.label}`)}
      </Text>
      {selectedNotifications.includes(item.id) && (
        <Ionicons name="checkmark" size={22} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#808080"]}
          tintColor="#808080"
        />
      }
    >
      <View style={styles.settingsContainer}>
        {/* Settings and UI elements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.preferences")}</Text>
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
              <Text style={styles.settingLabel}>{t("settings.language")}</Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {languages.find((lang) => lang.code === locale)?.label}
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
              <Text style={styles.settingLabel}>
                {t("settings.notifications")}
              </Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {selectedNotifications.length === 0
                  ? t("settings.none")
                  : `${selectedNotifications.length} ${t("settings.selected")}`}
              </Text>
              <Ionicons name="chevron-forward" size={22} color="#000000" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.support")}</Text>
          <TouchableOpacity
            style={[styles.supportButton, styles.githubButton]}
            onPress={handleGitHubContribute}
            onPressIn={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            }
          >
            <Ionicons
              name="logo-github"
              size={22}
              color="#24292e"
              style={styles.icon}
            />
            <Text style={[styles.supportButtonText, styles.githubButtonText]}>
              {t("settings.contributeGithub")}
            </Text>
          </TouchableOpacity>
          <Text style={styles.supportDescription}>
            {t("settings.contributionDescription")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.account")}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogout}
            onPressIn={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            }
          >
            <Text style={styles.buttonText}>{t("settings.logout")}</Text>
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
                <Text style={styles.modalTitle}>
                  {t("settings.selectLanguage")}
                </Text>
                <FlatList
                  data={languages}
                  renderItem={renderLanguageItem}
                  keyExtractor={(item) => item.code}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowLanguageModal(false)}
                >
                  <Text style={styles.closeButtonText}>
                    {t("common.close")}
                  </Text>
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
        <TouchableWithoutFeedback
          onPress={() => setShowNotificationModal(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {t("settings.notificationSettings")}
                </Text>
                <FlatList
                  data={notificationOptions}
                  renderItem={renderNotificationItem}
                  keyExtractor={(item) => item.id}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowNotificationModal(false)}
                >
                  <Text style={styles.closeButtonText}>
                    {t("common.close")}
                  </Text>
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
    marginTop: 10,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
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

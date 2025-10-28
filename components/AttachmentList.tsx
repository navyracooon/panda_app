import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import Attachment from "../models/Attachment";
import { Ionicons } from "@expo/vector-icons";
import { useLocalization } from "../contexts/LocalizationContext";
import { File, Directory, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

interface AttachmentListProps {
  attachments: Attachment[];
  isLastItem?: boolean;
}

export default function AttachmentList({
  attachments,
  isLastItem = false,
}: AttachmentListProps) {
  const { t } = useLocalization();
  const [downloadProgress, setDownloadProgress] = useState<{
    [key: string]: number;
  }>({});

  const getFileIcon = (type: string) => {
    switch (type) {
      case "application/pdf":
        return "document-text-outline";
      case "image/jpeg":
      case "image/png":
        return "image-outline";
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "document-outline";
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return "grid-outline";
      case "application/vnd.ms-powerpoint":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return "easel-outline";
      default:
        return "document-attach-outline";
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    let targetDirectory: Directory | null = null;
    try {
      targetDirectory = Paths.document;
    } catch (error) {
      console.warn(
        "Failed to access document directory, fallback to cache.",
        error,
      );
    }

    if (!targetDirectory) {
      try {
        targetDirectory = Paths.cache;
      } catch (error) {
        console.warn("Failed to access cache directory.", error);
      }
    }

    if (!targetDirectory) {
      Alert.alert(
        t("attachment.downloadError"),
        t("attachment.downloadErrorMessage"),
      );
      return;
    }

    const destinationFile = new File(targetDirectory, attachment.name);

    try {
      const downloadedFile = await File.downloadFileAsync(
        attachment.url,
        destinationFile,
        { idempotent: true },
      );
      await Sharing.shareAsync(downloadedFile.uri);
    } catch (e) {
      console.error("Download error:", e);
      Alert.alert(
        t("attachment.downloadError"),
        t("attachment.downloadErrorMessage"),
      );
    } finally {
      setDownloadProgress((prev) => ({ ...prev, [attachment.name]: 0 }));
    }
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, isLastItem && styles.lastItemContainer]}>
      <Text style={styles.sectionTitle}>{t("assignment.attachments")}</Text>
      {attachments.map((attachment, index) => (
        <Pressable
          key={index}
          onPress={() => handleDownload(attachment)}
          style={({ pressed }) => [
            styles.attachmentItem,
            index === 0 ? styles.firstAttachmentItem : null,
            pressed && styles.attachmentItemPressed,
          ]}
        >
          <Ionicons
            name={getFileIcon(attachment.type)}
            size={24}
            color="#007AFF"
            style={styles.icon}
          />
          <View style={styles.attachmentInfo}>
            <Text style={styles.attachmentName}>{attachment.name}</Text>
            <Text style={styles.attachmentSize}>
              {(attachment.size / 1024).toFixed(2)} KB
            </Text>
          </View>
          {downloadProgress[attachment.name] > 0 &&
          downloadProgress[attachment.name] < 1 ? (
            <Text
              style={styles.progressText}
            >{`${Math.round(downloadProgress[attachment.name] * 100)}%`}</Text>
          ) : (
            <Ionicons name="download-outline" size={24} color="#007AFF" />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 20,
  },
  lastItemContainer: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  firstAttachmentItem: {
    borderTopWidth: 0,
  },
  attachmentItemPressed: {
    opacity: 0.85,
  },
  icon: {
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 16,
    color: "#007AFF",
  },
  attachmentSize: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  progressText: {
    fontSize: 14,
    color: "#007AFF",
  },
});

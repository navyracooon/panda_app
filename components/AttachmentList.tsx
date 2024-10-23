import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Attachment from "../models/Attachment";
import { Ionicons } from "@expo/vector-icons";
import { useLocalization } from "../contexts/LocalizationContext";
import * as FileSystem from "expo-file-system";
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
    const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      setDownloadProgress((prev) => ({ ...prev, [attachment.name]: progress }));
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      attachment.url,
      FileSystem.documentDirectory + attachment.name,
      {},
      callback,
    );

    try {
      const downloadResult = await downloadResumable.downloadAsync();
      if (downloadResult !== undefined) {
        await Sharing.shareAsync(downloadResult.uri);
      }
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
        <TouchableOpacity
          key={index}
          style={[
            styles.attachmentItem,
            index === 0 ? styles.firstAttachmentItem : null,
          ]}
          onPress={() => handleDownload(attachment)}
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
        </TouchableOpacity>
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

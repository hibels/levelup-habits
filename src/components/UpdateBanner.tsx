import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getTranslations } from '../i18n';
import type { UpdateInfo } from '../utils/versionCheck';

interface Props {
  updateInfo: UpdateInfo;
  isDarkMode: boolean;
  onDismiss: () => void;
}

export function UpdateBanner({ updateInfo, isDarkMode, onDismiss }: Props) {
  const theme = isDarkMode ? colors.dark : colors.light;
  const t = getTranslations().update.soft;

  const message = t.message.replace('{{version}}', updateInfo.availableVersion);

  const handleUpdate = () => {
    Linking.openURL(updateInfo.storeUrl).catch(() => null);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${colors.semantic.info}15`,
          borderColor: `${colors.semantic.info}40`,
        },
      ]}
    >
      <Ionicons
        name="arrow-up-circle-outline"
        size={18}
        color={colors.semantic.info}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t.title}</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.updateButton, { backgroundColor: colors.semantic.info }]}
        onPress={handleUpdate}
        activeOpacity={0.8}
      >
        <Text style={styles.updateButtonText}>{t.updateButton}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} activeOpacity={0.7}>
        <Ionicons name="close" size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    gap: spacing.xs,
  },
  icon: {
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.caption,
    fontWeight: '700',
  },
  message: {
    ...typography.caption,
    marginTop: 1,
  },
  updateButton: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.s,
    flexShrink: 0,
  },
  updateButtonText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dismissButton: {
    padding: spacing.xxs,
    flexShrink: 0,
  },
});

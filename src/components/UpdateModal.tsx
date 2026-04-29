import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getTranslations } from '../i18n';
import type { UpdateInfo } from '../utils/versionCheck';

interface Props {
  visible: boolean;
  updateInfo: UpdateInfo;
  isDarkMode: boolean;
  onDismiss: () => void;
}

export function UpdateModal({ visible, updateInfo, isDarkMode, onDismiss }: Props) {
  const theme = isDarkMode ? colors.dark : colors.light;
  const t = getTranslations().update.critical;

  const message = t.message.replace('{{version}}', updateInfo.availableVersion);

  const handleUpdate = () => {
    Linking.openURL(updateInfo.storeUrl).catch(() => null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            shadows.medium,
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: `${colors.accent.main}15` }]}>
            <Ionicons name="warning-outline" size={32} color={colors.accent.main} />
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>{t.title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: colors.accent.main }]}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.updateButtonText}>{t.updateButton}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.laterButton, { borderColor: theme.border }]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={[styles.laterButtonText, { color: theme.textSecondary }]}>
              {t.laterButton}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: borderRadius.l,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.m,
    width: '100%',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  updateButtonText: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  laterButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  laterButtonText: {
    ...typography.body,
    fontWeight: '500',
  },
});

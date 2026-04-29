import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { RootNavigator } from './src/navigation';
import { useStore } from './src/store';
import { colors } from './src/theme';
import { seedDemoData } from './src/utils/demoData';
import { ensureRemindersScheduled } from './src/utils/notifications';

// Exibe a notificação mesmo com o app em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Mude para true para popular dados fictícios de screenshot. Reverta antes de publicar. */
const DEMO_MODE = false;

export default function App() {
  const { themeMode, isLoading, loadData, notificationPreferences } = useStore();

  useEffect(() => {
    const init = async () => {
      if (DEMO_MODE) {
        await seedDemoData();
      }
      await loadData();
    };
    init();
  }, []);

  // Reagenda lembretes ao abrir o app se necessário
  useEffect(() => {
    if (!isLoading && notificationPreferences.enabled) {
      ensureRemindersScheduled(notificationPreferences);
    }
  }, [isLoading, notificationPreferences]);

  // Show loading screen while data is loading
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

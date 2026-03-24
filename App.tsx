import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { useStore } from './src/store';

export default function App() {
  const themeMode = useStore(state => state.themeMode);

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { colors } from '../theme';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { EditHabitScreen } from '../screens/EditHabitScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { WeeklyReviewScreen } from '../screens/WeeklyReviewScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LevelUpScreen } from '../screens/LevelUpScreen';
import { HabitAnalyticsScreen } from '../screens/HabitAnalyticsScreen';
import { UpdateModal } from '../components/UpdateModal';
import { useUpdateContext } from '../context/UpdateContext';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  EditHabit: { habitId: string | undefined };
  Paywall: undefined;
  WeeklyReview: { reviewId?: string } | undefined;
  LevelUp: { level: number; totalXP: number };
  HabitAnalytics: { habitId: string };
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const themeMode = useStore(state => state.themeMode);
  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Hábitos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const themeMode = useStore(state => state.themeMode);
  const hasOnboarded = useStore(state => state.hasOnboarded);
  const isDarkMode = themeMode === 'dark';
  const { criticalUpdate, dismissModal } = useUpdateContext();
  const theme = isDarkMode ? colors.dark : colors.light;

  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: colors.primary.main,
      background: theme.background,
      card: theme.surface,
      text: theme.textPrimary,
      border: theme.border,
      notification: colors.primary.main,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
  };

  return (
    <>
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        {!hasOnboarded ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="EditHabit"
              component={EditHabitScreen}
              options={{ presentation: 'modal', title: 'Novo Hábito' }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen
              name="WeeklyReview"
              component={WeeklyReviewScreen}
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen
              name="LevelUp"
              component={LevelUpScreen}
              options={{ presentation: 'fullScreenModal', headerShown: false }}
            />
            <Stack.Screen
              name="HabitAnalytics"
              component={HabitAnalyticsScreen}
              options={{ presentation: 'modal', headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    {criticalUpdate && (
      <UpdateModal
        visible
        updateInfo={criticalUpdate}
        isDarkMode={isDarkMode}
        onDismiss={dismissModal}
      />
    )}
    </>
  );
}

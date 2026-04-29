import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider, useAuth} from './auth';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import TerritoriesScreen from './screens/TerritoriesScreen';
import AgilityScreen from './screens/AgilityScreen';
import SurvivalKitScreen from './screens/SurvivalKitScreen';
import ProfileScreen from './screens/ProfileScreen';
import {colors} from './theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  dark: true,
  colors: {
    primary: colors.gold500,
    background: colors.canopy,
    card: colors.canopy,
    text: colors.text,
    border: 'rgba(157,201,134,0.2)',
    notification: colors.gold500,
  },
};

function Routes() {
  const {user, loading} = useAuth();
  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.canopy},
          headerTitleStyle: {color: colors.gold500, fontWeight: '800'},
          headerTintColor: colors.gold500,
          contentStyle: {backgroundColor: colors.canopy},
        }}>
        {!user ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{headerShown: false}} />
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{title: '🐒 Monkey VPN'}} />
            <Stack.Screen name="Territories" component={TerritoriesScreen} options={{title: '🌍 Territories'}} />
            <Stack.Screen name="Agility" component={AgilityScreen} options={{title: '⚡ Agility'}} />
            <Stack.Screen name="SurvivalKit" component={SurvivalKitScreen} options={{title: '🧰 Survival Kit'}} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{title: '🐒 My Monkey'}} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.canopy} />
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

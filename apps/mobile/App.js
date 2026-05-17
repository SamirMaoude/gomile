import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Changement ici
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import { useMissionStore } from './src/store/useMissionStore';
import { navigationRef } from './src/navigation/navigationRef';

// les diverses pages utilisé dans le cadre du projet
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import RegisterStep1 from './src/screens/RegisterStep1';
import { EmailVerificationScreen } from './src/screens/EmailVerificationScreen';
import RegisterStep2Identity from './src/screens/RegisterStep2Identity';
import RegisterStep2 from './src/screens/RegisterStep2';
import MainTabs from './src/navigation/MainTabs';
import MissionDetailsScreen from './src/screens/MissionDetailsScreen';
import MissionFocusScreen from './src/screens/MissionFocusScreen';
import KYCScreen from './src/screens/KYCScreen';

const Stack = createNativeStackNavigator(); // Changement ici

export default function App() {
  useEffect(() => {
    // useMissionStore.getState().initStore();
    Asset.loadAsync([
      require('./assets/background_login.png'),
      require('./assets/livreur.jpg'),
    ]).catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="RegisterStep1" component={RegisterStep1} />
          <Stack.Screen name="RegisterStep2Identity" component={RegisterStep2Identity} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          <Stack.Screen name="RegisterStep2" component={RegisterStep2} />

          {/* L'écran principal après connexion */}
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen name="MissionDetails" component={MissionDetailsScreen} />
          <Stack.Screen name="MissionFocus" component={MissionFocusScreen} />
          <Stack.Screen name="KYC" component={KYCScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
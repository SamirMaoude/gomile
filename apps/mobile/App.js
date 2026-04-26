import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Changement ici
import { SafeAreaProvider } from 'react-native-safe-area-context';

// les diverses pages utilisé dans le cadre du projet
import LoginScreen from './src/screens/LoginScreen';
import RegisterStep1 from './src/screens/RegisterStep1';
import RegisterStep2 from './src/screens/RegisterStep2';
import RegisterStep3 from './src/screens/RegisterStep3';
import RegisterStep4 from './src/screens/RegisterStep4';
import MainTabs from './src/navigation/MainTabs';

const Stack = createNativeStackNavigator(); // Changement ici

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RegisterStep1" component={RegisterStep1} />
          <Stack.Screen name="RegisterStep2" component={RegisterStep2} />
          <Stack.Screen name="RegisterStep3" component={RegisterStep3} />
          <Stack.Screen name="RegisterStep4" component={RegisterStep4} />

          {/* L'écran principal après connexion */}
          <Stack.Screen name="MainApp" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
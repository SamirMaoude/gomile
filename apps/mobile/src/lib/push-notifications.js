import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { putDriverPushToken } from '../../lib/driver-client';

function resolveProjectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    null
  );
}

// Enregistre le token Expo du driver pour recevoir les notifications de mission.
export async function registerDriverPushToken() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const Notifications = await import('expo-notifications');

    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = existing.status;

    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const projectId = resolveProjectId();
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    if (tokenResponse?.data) {
      await putDriverPushToken(tokenResponse.data);
    }
  } catch {
    // L'enregistrement push est non bloquant pour l'authentification.
  }
}

export async function configureDriverPushNotifications() {
  if (Platform.OS === 'web') {
    return () => {};
  }

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('missions', {
      name: 'Missions',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
    });
  }

  return () => {};
}

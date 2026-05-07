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

export async function registerDriverPushToken() {
  if (Platform.OS === 'web') return;

  try {
    const Notifications = await import('expo-notifications');

    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = existing.status;

    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') return;

    const projectId = resolveProjectId();
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    if (tokenResponse?.data) {
      await putDriverPushToken(tokenResponse.data);
    }
  } catch {
    // Non bloquant
  }
}

export async function configureDriverPushNotifications() {
  if (Platform.OS === 'web') return () => {};

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('missions', {
      name: 'Missions GoMile',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'default',
    });
  }

  return () => {};
}

// Notification locale déclenchée par le polling quand de nouvelles missions arrivent.
// Fonctionne en Expo Go (notifications locales) et en dev build (push remote).
export async function notifyNewMissions(newMissions) {
  if (!newMissions || newMissions.length === 0) return;
  if (Platform.OS === 'web') return;

  try {
    const Notifications = await import('expo-notifications');

    const first = newMissions[0];
    const title =
      newMissions.length === 1
        ? 'Nouvelle mission !'
        : `${newMissions.length} nouvelles missions !`;
    const body =
      newMissions.length === 1
        ? `${first.store} — ${first.distance} (+${first.reward}€)`
        : `${newMissions.length} courses disponibles près de vous`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { missionId: first.id },
        ...(Platform.OS === 'android' ? { channelId: 'missions' } : {}),
      },
      trigger: null, // immédiat
    });
  } catch {
    console.warn('[push-notifications] scheduleNotificationAsync failed');
  }
}

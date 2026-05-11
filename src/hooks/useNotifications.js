import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { updatePushToken } from '../api/user.api';

// Config: How to handle incoming notifications when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = (userId, navigation) => {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!userId) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        updatePushToken(token).catch(err => console.warn('Failed to save push token:', err));
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification Tapped Data:', data);

      if (data?.orderId && navigation) {
        // Navigate to Order Details
        navigation.navigate('OrdersTab', {
          screen: 'OrderDetail',
          params: { orderId: data.orderId },
          initial: false
        });
      } else if (data?.screen && navigation) {
        navigation.navigate(data.screen, data.params || {});
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [userId]);
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    
    // Get FCM token (or Expo Push Token)
    token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log('FCM Token:', token);
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

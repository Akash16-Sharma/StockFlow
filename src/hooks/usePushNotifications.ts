import { useEffect, useCallback, useState } from 'react';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }

    return false;
  }, []);

  const sendPushNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        ...options,
      });

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, []);

  return {
    permission,
    requestPermission,
    sendPushNotification,
    isSupported: 'Notification' in window,
  };
};

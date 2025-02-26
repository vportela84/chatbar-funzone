
import { useEffect } from 'react';

export const useNotifications = () => {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }
    };
    requestNotificationPermission();
  }, []);

  const showNotification = (senderName: string, messageText: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Nova mensagem de ${senderName}`, {
        body: messageText,
        icon: '/favicon.ico'
      });
    }
  };

  return { showNotification };
};

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:8080"; // Replace with your server URL

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Establishing WebSocket connection
    const socket = io(SOCKET_SERVER_URL);

    // Setting up event listener for global notifications
    socket.on('globalNotification', (message) => {
      setNotifications(notifs => [...notifs, message]);
    });

    // Cleanup function to close socket connection
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.map((notif, index) => (
        <p key={index}>{notif}</p>
      ))}
    </div>
  );
};

export default NotificationsComponent;

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import notificationSound from '../../sounds/sound.mp3'; // Update with your sound file path

const SOCKET_SERVER_URL = "http://localhost:8080";

const NotificationsComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState('');

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('globalNotification', (message) => {
      setCurrentNotification(message);
      setShowModal(true);
      playNotificationSound();

      const hideModalTimeout = setTimeout(() => {
        setShowModal(false);
      }, 5000);

      return () => clearTimeout(hideModalTimeout);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio(notificationSound);
    audio.play();
  };

  return (
    <div>
      <h2>Notifications</h2>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>{currentNotification}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsComponent;

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './NotificationTest.css'
import notificationSound from '../../sounds/sound.mp3'; // Update with your sound file path

const SOCKET_SERVER_URL = "http://localhost:8080";

const NotificationsComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState('');

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('globalNotification', (data) => {
      console.log(data)
      setCurrentNotification(data.message);
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

  const sendNotification = async () => {
    const qs = require('qs');
    let data = qs.stringify({
      'message': 'asdjnfksajdnflkjn'
    });

    await axios.post(`${SOCKET_SERVER_URL}/send-notification`, data)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error al enviar la notificación:', error);
      });
  };



  return (
    <div>
      <h2>Notifications</h2>
      <button onClick={sendNotification}>Enviar Notificación</button>
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

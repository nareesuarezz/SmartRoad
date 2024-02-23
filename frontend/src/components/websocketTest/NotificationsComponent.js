import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './NotificationTest.css'

const SOCKET_SERVER_URL = process.env.REACT_APP_LOCALHOST_URL;
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
    const notificationSound = '/sounds/lego.mp3';
    const audio = new Audio(notificationSound);
    audio.volume = 0.4;
    audio.play();
  };
  

  const sendNotification = async () => {
    const qs = require('qs');
    let data = qs.stringify({
      'message': 'CAREFULL, ACCIDENT NEAR UWU'
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

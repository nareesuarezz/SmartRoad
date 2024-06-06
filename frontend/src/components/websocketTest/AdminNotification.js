import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './NotificationTest.css'
import Header from '../header/header';
import "./AdminNotification.css"
import LanguageSwitcher from '../languageSwitcher/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const SOCKET_SERVER_URL = process.env.REACT_APP_URL;
const AdminNotification = () => {
  const { t } = useTranslation();


  const [showModal, setShowModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState('');
  const [formData, setFormData] = useState({ message: 'CAREFULL, CRASH AHEAD!!!' });

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('globalNotification', (data) => {
      console.log(data)
      setCurrentNotification(data.message);
      setShowModal(true);

      const hideModalTimeout = setTimeout(() => {
        setShowModal(false);
      }, 5000);

      return () => clearTimeout(hideModalTimeout);
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendNotification = async () => {
    try {
      const response = await axios.post(`${SOCKET_SERVER_URL}/send-notification`, {
        message: formData.message
      });

      console.log(response.data);
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
    }
  };

  return (
    <div>
      <Header />
      <div>
        <LanguageSwitcher />
      </div>
      <h2>{t('Notifications')}</h2>
      <input
        type="text"
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder=""
      />
      <button onClick={sendNotification}>{t('Send Notification')}</button>
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

export default AdminNotification;

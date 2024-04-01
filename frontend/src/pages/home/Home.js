import React, { useState, useEffect } from 'react';
import logoBicycle from '../../img/bike.png';
import logoCar from '../../img/car.png';
import './Home.css';
import axios from 'axios';
import { regSw, subscribe } from '../../services/subscriptionService';
import { Puff } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
import UserNotification from '../../components/websocketTest/UserNotification';
import ProfilePictureUser from '../../components/profilePictureUser/profilePictureUser';
import { UserDeleteOutlined } from '@ant-design/icons';
const URL = process.env.REACT_APP_LOCALHOST_URL;


function Home() {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [availableSounds, setAvailableSounds] = useState([]);
  const [selectedSound, setSelectedSound] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('userInfo'))
  console.log(user)

  useEffect(() => {
    axios.get(`${URL}/api/sounds`)
      .then(response => {
        setAvailableSounds(response.data);
        setSelectedSound(response.data[0].id);
      })
      .catch(error => console.error('Error retrieving sounds:', error));
  }, []);

  const handleClick = async (vehicle) => {
    setIsLoading(true); // Inicia la carga
    try {
      await askForNotificationPermission();
      const position = await askForLocationPermission();
      localStorage.setItem('selectedSound', selectedSound);
      navigate(`/${vehicle}`, { state: { selectedSound } });
      if (position && Notification.permission === 'granted') {
        await createVehicleAndTrack(vehicle, position.coords);

        if (vehicle === 'car') {
          const serviceWorkerReg = await regSw();
          await subscribe(serviceWorkerReg, 'car');
        }

        window.location.href = `/${vehicle}`;
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const askForLocationPermission = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true }
      );
    });
  };

  const askForNotificationPermission = async () => {
    console.log('Estado actual de los permisos de notificaciones:', Notification.permission);

    if (Notification.permission === 'granted') {
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Permisos de notificaciones concedidos');
      return;
    } else {
      throw new Error('Permiso de notificaciones denegado');
    }
  };

  const createVehicleAndTrack = async (vehicle, coords) => {
    try {
      const createdVehicle = await createVehicle(vehicle);

      const createdTrack = await createTrack(createdVehicle.UID, coords);

      console.log('Vehicle and track created successfully:', createdVehicle, createdTrack);
    } catch (error) {
      console.error('Error creating vehicle and track:', error);
      throw error;
    }
  };

  const createVehicle = async (vehicle) => {
    try {
      const response = await axios.post(`${URL}/api/vehicles`, {
        Vehicle: vehicle,
        Admin_UID: user.UID,
      });

      console.log(`Vehicle created successfully`);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  };

  const createTrack = async (vehicleId, coords) => {
    const location = {
      type: 'Point',
      coordinates: [parseFloat(coords.latitude), parseFloat(coords.longitude)],
    };
    try {
      const response = await axios.post(`${URL}/api/tracks`, {
        Location: location,
        Status: 'Moving',
        Speed: 0,
        Extra: null,
        Vehicle_UID: vehicleId,
      });

      console.log(`Track created successfully: ${response.data}`);
      return response.data;
    } catch (error) {
      console.error('Error creating track:', error);
      throw error;
    }
  };

  const goLogin = () => {
    window.location.href = "/login";
  };

  const goBack = () => {
    window.location.href = "/login-user";
  };

  const handleSoundChange = (event) => {
    setSelectedSound(event.target.value);
  };



  return (
    <>
      <div className="title">
        <h1>SmartRoad</h1>
      </div>
      <div className='arrow' onClick={() => goBack()}>
        <UserDeleteOutlined />
      </div>
      <div><ProfilePictureUser /></div>
      <div>
        <LanguageSwitcher />
      </div>
      <div className="question">
        <h2>{t('What are you driving?')}</h2>
      </div>

      <div className="vehicle-container">
        <div className="vehicle-box bicycle-box" onClick={() => handleClick('bicycle')}>
          <img src={logoBicycle} alt="Logo de bicicleta" />
          <p className='bicycle'>{t('Bicycle')}</p>
        </div>

        <div className="vehicle-box car-box" onClick={() => handleClick('car')}>
          <img src={logoCar} alt="Logo de coche" />
          <p className='car'>{t('Car')}</p>
        </div>
      </div>
      {isLoading && (
        <div className="overlay">
          <Puff className="spinner" height={100} width={100} />
        </div>
      )}
      <div className="sound-selector">
        <label htmlFor="notification-sound">{t('Select a notification sound:')}</label>
        <select onChange={handleSoundChange}>
          {availableSounds.map((sound, index) => (
            <option key={index} value={sound.id}>
              {sound.filename}
            </option>
          ))}
        </select>
      </div>
      <div className='admin'>
        <p>{t('Are you an admin?')}</p>
        <p className='log' onClick={goLogin}>{t('Log in here')}</p>
      </div>
      <a className='help' href='/html/Introduction.html'>{t('Need help?')}</a>
      <UserNotification />
    </>
  );
}

export default Home;

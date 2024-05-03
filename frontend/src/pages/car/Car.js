import React, { useState, useEffect } from 'react';
import logoCar from '../../img/car.png';
import './Car.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { regSw, subscribe } from '../../services/subscriptionService';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
import UserNotification from '../../components/websocketTest/UserNotification';
import { useDispatch, useSelector } from 'react-redux';

function Car() {

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const API = process.env.REACT_APP_API_URL;
  const URL = process.env.REACT_APP_LOCALHOST_URL;
  const [showModal, setShowModal] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const selectedSound = localStorage.getItem("selectedSound");
  const [lastVehicleId, setLastVehicleId] = useState(null);
  const [speed, setSpeed] = useState(null);
  const time = 5000;

  let postsT = 0;

  // Agrega un estado para el elemento de audio
  const [audioElement, setAudioElement] = useState(null);
  const SOUND_API = `${URL}/api`;

  useEffect(() => {
    const audio = new Audio();
    setAudioElement(audio);

    if (selectedSound) {
      audio.volume = 1.0; // Establece el volumen al máximo
      const soundUrl = `${SOUND_API}/sounds/${selectedSound}`; // Asume que selectedSound es el nombre del archivo sin la extensión
      audio.src = soundUrl;
      audio.oncanplay = () => {
        audio.play();
      };
      audio.onerror = () => {
        console.log('Error loading sound');
      };
    }
  }, [selectedSound]);




  const addTrackGeo = async (lastVehicleId) => {
    try {
      const location = await trackGeo();

      const data = {
        Location: location,
        Status: 'Stopped',
        Speed: '0',
        Extra: 'coche',
        Vehicle_UID: lastVehicleId,
      };

      // Llamar a axios.post con los datos actualizados
      await axios.post(`${URL}/api/tracks`, data);

      console.log(data.Location.coordinates)
      const recentTracks = await axios.get(`${URL}/api/tracks/recent-within-radius`, {
        params: {
          lat: [data.Location.coordinates[0]],
          lng: [data.Location.coordinates[1]]
        }
      })

      // Obtener el penúltimo track para este vehículo
      const response = await axios.get(`${URL}/api/tracks?Vehicle_UID=${lastVehicleId}&_limit=2&_sort=createdAt:desc`);
      const penultimateTrack = response.data[1]; // El penúltimo track es el segundo elemento en los datos de respuesta

      setSpeed(penultimateTrack.Speed);

      if (recentTracks.data.recentTracks.length > 0) {
        setShowModal(true);
        sendNotification('car', `WARNING: THERE IS A BICYCLE NEAR YOU`, data.Location);
      }

    } catch (err) {
      console.error(err);
    }
  };


  //Función para recoger la localización y devolverla
  const trackGeo = () => {
    return new Promise((resolve, reject) => {
      try {
        navigator.geolocation.getCurrentPosition((position) => {
          const location = {
            type: 'Point',
            coordinates: [position.coords.latitude, position.coords.longitude],
          };
          resolve(location);  //Devuelve la localización recogida
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  };

  //Status UseEffect
  useEffect(() => {
    let consecutiveStoppedCount = 0;

    const checkStatus = async () => {
      try {
        const response = await axios.get(`https://localhost/api/tracks?Vehicle_UID=${lastVehicleId}&_limit=1&_sort=createdAt:desc`);
        const lastTrackStatus = response.data[postsT]?.Status;

        if (lastTrackStatus === 'Stopped') {
          consecutiveStoppedCount++;
        } else {
          consecutiveStoppedCount = 0;
        }

        if (consecutiveStoppedCount === 6) {
          goBack();
          return;
        }

        // Esperar 1 minuto (60 segundos) antes de la siguiente verificación
        setTimeout(checkStatus, 10 * 1000); // Convertir minutos a milisegundos
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    // Comenzar el monitoreo cuando haya un último vehículo ID
    if (lastVehicleId) {
      checkStatus();
    }

    // Limpiar intervalo cuando se desmonte el componente
    return () => {
      consecutiveStoppedCount = 0; // Reiniciar el contador al desmontar el componente
    };
  }, [lastVehicleId]);



  //Location UseEffect
  useEffect(() => {
    const fetchData = async () => {
      console.log("Recogiendo ID del vehiculo");
      const response = await axios.get('https://localhost/api/vehicles?_sort=createdAt:desc&_limit=1');
      const vehicles = response.data;
      const lastId = vehicles[vehicles.length - 1].UID;
      setLastVehicleId(lastId);
      console.log("ID del vehiculo: ", lastId);
    };

    fetchData(); // Llamada inicial para recoger el ID del vehículo

    const locationUpdateInterval = setInterval(() => {
      if (lastVehicleId) {
        postsT++;
        console.log(postsT);
        addTrackGeo(lastVehicleId);
      }
    }, time);

    return () => clearInterval(locationUpdateInterval);
  }, [lastVehicleId]); // Agregar lastVehicleId como dependencia

  //Notification
  useEffect(() => {
    let hideModalTimer = null;

    if (showModal) {
      // Establece un temporizador para ocultar el modal después de 30 segundos
      hideModalTimer = setTimeout(() => {
        setShowModal(false);
        // Aquí puedes detener el sonido si es necesario
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
      }, 3000); // 30000 milisegundos = 30 segundos
    }

    return () => {
      // Limpia el temporizador al desmontar o si showModal cambia antes de que el tiempo se agote
      if (hideModalTimer) {
        clearTimeout(hideModalTimer);
      }
    };
  }, [showModal, audioElement, setShowModal]);


  const sendNotification = async (subscriptionName, notificationMessage, location) => {
    try {
      await axios.post(`${API}/sendCustomNotification`, {
        subscriptionName,
        notificationMessage,
      });

      console.log(`Sending notification to ${subscriptionName}: ${notificationMessage}`);
      console.log('location: ', location);

      dispatch({ type: 'ADD_LOCATION', payload: location });
    } catch (error) {
      console.error('Error al enviar notificación al backend:', error.response);
    }
  };

  // Obtener el estado de Redux antes de despachar la acción
  const notificationLocationslog = useSelector(state => state.notificationLocations);

  useEffect(() => {
    // Obtener el estado de Redux después de despachar la acción

    console.log('notificationLocations log:', notificationLocationslog);
  }, [notificationLocationslog]); // Ejecutar el efecto cada vez que beforeNotificationLocations cambie






  const goBack = () => {
    window.location.href = '/home';
  };

  useEffect(() => {
    const handleMount = async () => {
      try {
        const serviceWorkerReg = await regSw();
        const existingSubscription = await serviceWorkerReg.pushManager.getSubscription();

        if (existingSubscription) {
          console.log('Suscripción ya existe:', existingSubscription);
          setSubscription(existingSubscription);
        } else {
          const newSubscription = await subscribe(serviceWorkerReg, 'car');
          setSubscription(newSubscription);
        }
      } catch (error) {
        console.error('Error al obtener suscripción:', error);
      }
    };

    handleMount();
  }, []);

  useEffect(() => {
    // Esta función se llamará cuando el componente se desmonte
    return async () => {
      try {
        const serviceWorkerReg = await regSw();
        const existingSubscription = await serviceWorkerReg.pushManager.getSubscription();
        if (existingSubscription) {
          console.log('Unsubscribing from:', existingSubscription.endpoint);
          await axios.post(`${API}/deleteByEndpoint`, { endpoint: existingSubscription.endpoint });
          await existingSubscription.unsubscribe();
          console.log('Unsubscription successful');
          // Aquí asumimos que `setSubscription` actualiza el estado del componente, si es aplicable
          setSubscription(null);
        }
      } catch (error) {
        console.error('Error during unsubscription:', error);
      }
    };
  }, []);

  return (
    <>
      <div className='arrow' onClick={() => goBack()}>
        <ArrowLeftOutlined />
      </div>
      <div>
        <LanguageSwitcher />
      </div>
      <div className='car-title'>
        <h1>{t('SmartRoad')}</h1>
      </div>
      <div className='logged'>
        <h2>{t('You are now logged as a...')}</h2>
      </div>

      <div className='car-container'>
        <div className='vehicle-box car-box'>
          <img src={logoCar} alt={t('Logo de Coche')} />
        </div>
        <p className='car'>{t('Car')}</p>
        <p className='speed'>{`Velocidad: ${speed} km/h`}</p>
        <h3 className='warn'>{t('Now you will be warned in case that a bike passes near you.')}</h3>
      </div>
      {showModal && (
        <div className='modal-overlay'>
          <div className='modal'>
            <p>{t('WARNING: THERE IS A BICYCLE NEAR YOU')}</p>
          </div>
        </div>
      )}
      <UserNotification />
    </>
  );
}
export default Car;

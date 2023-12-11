import React, { useState } from 'react';
import logoBicycle from '../../img/bike.png';
import logoCar from '../../img/car.png';
import './Home.css';
import axios from 'axios';

function Home() {
  const [subscription, setSubscription] = useState(null);

  const handleClick = async (vehicle) => {
    try {
      await askForNotificationPermission();
      const position = await askForLocationPermission();

      if (position && Notification.permission === 'granted') {
        await createVehicleAndTrack(vehicle, position.coords);
        window.location.href = `/${vehicle}`;
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
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
      const response = await axios.post(`http://localhost:8080/api/vehicles`, {
        Vehicle: vehicle,
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
      const response = await axios.post(`http://localhost:8080/api/tracks`, {
        Location: location,
        Status: 'stopped',
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

  return (
    <>
      <div className="title">
        <h1>SmartRoad</h1>
      </div>
      <div className="question">
        <h2>What are you driving?</h2>
      </div>

      <div className="vehicle-container">
        <div className="vehicle-box bicycle-box" onClick={() => handleClick('bicycle')}>
          <img src={logoBicycle} alt="Logo de bicicleta" />
        </div>
        <p className='bicycle'>Bicycle</p>
        <div className="vehicle-box car-box" onClick={() => handleClick('car')}>
          <img src={logoCar} alt="Logo de coche" />
        </div>
        <p className='car'>Car</p>
      </div>
      <div className='admin'>
        <p>Are you an admin?</p>
        <p className='log' onClick={goLogin}>Log in here</p>
      </div>
    </>
  );
}

export default Home;

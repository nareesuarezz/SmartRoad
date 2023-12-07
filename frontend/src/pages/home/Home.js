import React, { useState } from 'react';
import logoBicycle from '../../img/bike.png';
import logoCar from '../../img/car.png';
import './Home.css';
import { regSw, subscribe } from '../../services/subscriptionService';

function Home() {
    const [subscription, setSubscription] = useState(null);

    const handleClick = async (vehicle) => {
        try {
            await askForNotificationPermission();
            const position = await askForLocationPermission();

            if (position && Notification.permission === 'granted') {
                const newSubscription = await createSubscription(vehicle);
                setSubscription(newSubscription);

                redirectToVehiclePage(vehicle);
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

    const createSubscription = async (subscriptionName) => {
        try {
            const serviceWorkerReg = await regSw();
            const publicKey = process.env.REACT_APP_PUBLIC_KEY;
            
            await subscribe(serviceWorkerReg, subscriptionName, publicKey);
    

        } catch (error) {
            console.error('Error al crear la suscripción:', error);
            throw error;
        }
    };

    const redirectToVehiclePage = (vehicle) => {
        if (vehicle === 'bicycle') {
            window.location.href = "/bicycle";
        } else if (vehicle === 'car') {
            window.location.href = "/car";
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

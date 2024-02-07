import React, { useState, useEffect } from 'react';
import logoCar from '../../img/car.png';
import './Car.css';
import bikeWarningSound from '../../sounds/sound3.mp3';
import { ArrowLeftOutlined, ConsoleSqlOutlined } from '@ant-design/icons';
import { regSw, subscribe } from '../../services/subscriptionService';
import axios from 'axios';

function Car() {
    const API = process.env.REACT_APP_API_URL;
    const [showModal, setShowModal] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const time = 5000;


    // Location
    const addTrackGeo = async () => {
        try {
            // Obtener la ubicación utilizando trackGeo
            const location = await trackGeo();

            const response = await axios.get('http://localhost:8080/api/vehicles');
            const vehicle = response.data;
            const lastVehicleId = vehicle[vehicle.length - 1].UID;

            const data = {
                Latitude: '',
                Longitude: '',
                Status: 'Stopped',
                Speed: '0',
                Extra: '',
                Vehicle_UID: lastVehicleId,
                Location: location, // Usar la ubicación obtenida de trackGeo aquí
            };

            // Imprimir la ubicación para verificar
            // console.log('Ubicación obtenida:', location);

            // Llamar a axios.post con los datos actualizados
            await axios.post('http://localhost:8080/api/tracks', data);

        } catch (err) {
            console.error(err.response);
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
                    // console.log("Latitude: " + position.coords.latitude + "\nLongitude: " + position.coords.longitude);
                    resolve(location);  //Devuelve la localización recogida
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    };

    useEffect(() => {
        // Call the function here to start tracking
        addTrackGeo();
    }, 1); // Empty dependency array to run it only once

    useEffect(() => {
        const locationUpdateInterval = setInterval(() => {
            // Call the trackAddGeo function every 5 seconds
            addTrackGeo();
        }, 5000);

        return () => clearInterval(locationUpdateInterval);
    }, []);

    //Notification
    useEffect(() => {
        const notificationInterval = setInterval(() => {
            if (showModal) {
                setShowModal(false);
            } else {
                setShowModal(true);
                playWarningSound();

                const subscriptionName = 'car';
                const notificationMessage = 'WARNING: THERE IS A BICYCLE NEAR YOU';
                sendNotification(subscriptionName, notificationMessage);
            }
        }, 10000);

        return () => clearInterval(notificationInterval);
    }, [showModal]);

    const playWarningSound = () => {
        const audio = new Audio(bikeWarningSound);
        audio.play();
    };

    const sendNotification = async (subscriptionName, notificationMessage) => {
        try {
            await axios.post(`${API}/sendCustomNotification`, {
                subscriptionName,
                notificationMessage,
            });

            console.log(`Sending notification to ${subscriptionName}: ${notificationMessage}`);
        } catch (error) {
            console.error('Error al enviar notificación al backend:', error);
        }
    };

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
        return () => {
            const handleUnmount = async () => {
                try {
                    const serviceWorkerReg = await regSw();
                    if (subscription) {
                        console.log('Unsubscribing from:', subscription.endpoint);
                        await axios.post(`${API}/deleteByEndpoint`, { endpoint: subscription.endpoint });
                        const existingSubscription = await serviceWorkerReg.pushManager.getSubscription();
                        if (existingSubscription) {
                            await existingSubscription.unsubscribe();
                            console.log('Unsubscription successful');
                        }
                        setSubscription(null);
                    }
                } catch (error) {
                    console.error('Error during unsubscription:', error);
                }
            };

            handleUnmount();
        };
    }, [subscription]);

    return (
        <>
            <div className='arrow' onClick={() => goBack()}>
                <ArrowLeftOutlined />
            </div>
            <div className='car-title'>
                <h1>SmartRoad</h1>
            </div>
            <div className='logged'>
                <h2>You are now logged as a...</h2>
            </div>

            <div className='car-container'>
                <div className='vehicle-box car-box'>
                    <img src={logoCar} alt='Logo de Coche' />
                </div>
                <p className='car'>Car</p>

                <h3 className='warn'>Now you will be warned in case that a bike passes near you.</h3>
            </div>

            {showModal && (
                <div className='modal-overlay'>
                    <div className='modal'>
                        <p>WARNING: THERE IS A BICYCLE NEAR YOU</p>
                    </div>
                </div>
            )}
        </>
    );
}

export default Car; 
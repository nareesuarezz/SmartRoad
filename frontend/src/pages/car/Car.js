import React, { useState, useEffect } from 'react';
import logoCar from '../../img/car.png';
import './Car.css';
import bikeWarningSound from '../../sounds/sound3.mp3';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { regSw, subscribe } from '../../services/subscriptionService';
import axios from 'axios';

function Car() {
    const API = process.env.REACT_APP_API_URL;
    const [showModal, setShowModal] = useState(false);
    const [subscription, setSubscription] = useState(null);

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
        // Cleanup effect
        return () => {
            const handleUnmount = async () => {
                try {
                    if (subscription) {
                        console.log('Unsubscribing from:', subscription.endpoint);
                        await axios.post(`${API}/deleteByEndpoint`, { endpoint: subscription.endpoint });
                        await subscription.unsubscribe();
                        console.log('Unsubscription successful');
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
import React, { useState, useEffect } from 'react';
import logoCar from '../../img/car.png';
import './Car.css';
import bikeWarningSound from '../../sounds/sound3.mp3';
import { ArrowLeftOutlined } from '@ant-design/icons';


function Car() {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const notificationTimeout = setTimeout(() => {
            setShowModal(true);
            playWarningSound();

            const hideNotificationTimeout = setTimeout(() => {
                setShowModal(false);
            }, 5000);

            return () => clearTimeout(hideNotificationTimeout);
        }, 5000);

        return () => clearTimeout(notificationTimeout);
    }, []);

    const playWarningSound = () => {
        const audio = new Audio(bikeWarningSound);
        audio.play();
    };

    const goBack = () => {
        window.location.href = "/home";
    }
    return (
        <>
        <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
            <div className="car-title">
                <h1>SmartRoad</h1>
            </div>
            <div className="logged">
                <h2>You are now logged in as a...</h2>
            </div>

            <div className="car-container">
                <div className="vehicle-box car-box">
                    <img src={logoCar} alt="Car Logo" />
                </div>
                <p className='car'>Car</p>

                <h3 className='warn'>Now you will be warned in case that a bicycle is near you.</h3>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p>WARNING: THERE IS A BIKE NEAR YOU, BE CAREFUL</p>
                    </div>
                </div>
            )}
        </>
    );
}

export default Car;

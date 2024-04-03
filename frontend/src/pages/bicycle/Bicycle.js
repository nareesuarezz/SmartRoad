import React, { useState, useEffect } from 'react';
import logoBicycle from '../../img/bike.png';
import './Bicycle.css'
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
import UserNotification from '../../components/websocketTest/UserNotification';

function Bicycle() {
    const { t } = useTranslation();

    const API = process.env.REACT_APP_LOCALHOST_URL;

    const [lastVehicleId, setLastVehicleId] = useState(null);

    const time = 5000;

    let postsT = 0;

    //Location
    const addTrackGeo = async () => {
        try {
            console.log("antes de trackGeo")
            const location = await trackGeo();

            console.log(lastVehicleId)
            const data = {
                Location: location,
                Status: 'Stopped',
                Speed: '0',
                Extra: 'coche',
                Vehicle_UID: lastVehicleId,
            };

            await axios.post('https://smart-road-519r.vercel.app/api/tracks', data);

            console.log(data.Location.coordinates)

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
                const response = await axios.get(`https://smart-road-519r.vercel.app/api/tracks?Vehicle_UID=${lastVehicleId}&_limit=1&_sort=createdAt:desc`);
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
                setTimeout(checkStatus, 60 * 1000); // Convertir minutos a milisegundos
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
            const response = await axios.get('https://smart-road-519r.vercel.app/api/vehicles');
            const vehicles = response.data;
            const lastId = vehicles[vehicles.length - 1].UID;
            setLastVehicleId(lastId);
            console.log("ID del vehiculo: ", lastId);
        };

        fetchData(); // Llamada inicial para recoger el ID del vehículo

        const locationUpdateInterval = setInterval(() => {
            if (lastVehicleId) {
                postsT++;
                addTrackGeo(lastVehicleId);
            }
        }, time);

        return () => clearInterval(locationUpdateInterval);
    }, [lastVehicleId]); // Agregar lastVehicleId como dependencia


    const goBack = () => {
        window.location.href = "/home";
    }

    return (
        <>
            <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
            <div>
                <LanguageSwitcher />
            </div>
            <div className="bike-title">
                <h1>{t('SmartRoad')}</h1>
            </div>
            <div className="logged">
                <h2>{t('You are now logged as a...')}</h2>
            </div>

            <div className="bicycle-container">
                <div className="vehicle-box bicycle-box">
                    <img src={logoBicycle} alt={t('Logo de bicicleta')} />
                </div>
                <p className='bicycle'>{t('Bicycle')}</p>

                <h3 className='warn'>{t('Now every car user will be warned in case that they are near you.')}</h3>
            </div>
            <UserNotification/>
        </>
    );
}

export default Bicycle;
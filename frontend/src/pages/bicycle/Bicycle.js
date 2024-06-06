
import React, { useState, useEffect } from 'react';
import logoBicycle from '../../img/bike.png';
import logoCar from '../../img/car.png';
import './Bicycle.css'
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
import UserNotification from '../../components/websocketTest/UserNotification';

function Bicycle() {
    const { t } = useTranslation();

    const API = process.env.REACT_APP_LOCALHOST_URL;
    const URL = process.env.REACT_APP_LOCALHOST_URL;

    const [lastVehicleId, setLastVehicleId] = useState(null);
    const [speed, setSpeed] = useState(null);
    const [isTooFast, setIsTooFast] = useState(false);

    const time = 5000;

    let postsT = 0;

    //Location
    const addTrackGeo = async () => {
        try {
            // Obtener la ubicación actual
            const location = await trackGeo();

            let vehicleType = 'bicycle';
            if (speed >= 0) {
                vehicleType = 'car';
                setIsTooFast(true);
                // Actualizar el tipo de vehículo en la base de datos
                await axios.put(`${URL}/api/vehicles/${lastVehicleId}`, { Vehicle: vehicleType });
            }
            console.log(vehicleType)
            const data = {
                Location: location,
                Status: 'Stopped',
                Speed: speed,
                Type: 'Real',
                Extra: `vehiculo: ${vehicleType}`, // Mantén esto como 'bicycle' sin importar la velocidad
                Vehicle_UID: lastVehicleId,
            };
            // Llamar a axios.post con los datos actualizados
            await axios.post(`${URL}/api/tracks`, data);
            console.log(data.Type)

            // Obtener el último track para este vehículo
            const response = await axios.get(`${URL}/api/tracks?Vehicle_UID=${lastVehicleId}&_limit=1&_sort=createdAt:desc`);
            const lastTrack = response.data[0];

            // Actualizar el estado de la velocidad
            setSpeed(lastTrack.Speed);

            console.log(data.Location.coordinates)

        } catch (err) {
            console.error(err.response);
        }
    };


    //Función para recoger la localización y devolverla
    const trackGeo = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        type: 'Point',
                        coordinates: [position.coords.latitude, position.coords.longitude],
                    };
                    resolve(location);  //Devuelve la localización recogida
                },
                (error) => {
                    console.error(error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000,
                }
            );
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
            const response = await axios.get('https://localhost/api/vehicles');
            const vehicles = Array.isArray(response.data) ? response.data : [];
            if (vehicles.length > 0) {
                const lastId = vehicles[vehicles.length - 1].UID;
                setLastVehicleId(lastId);
                console.log("ID del vehiculo: ", lastId);
            } else {
                console.log("No se encontraron vehículos");
            }
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
                <div className={isTooFast ? "vehicle-box car-box" : "vehicle-box bicycle-box"}>
                    <img src={isTooFast ? logoCar : logoBicycle} alt={t(isTooFast ? 'Logo de coche' : 'Logo de bicicleta')} />                </div>
                <p className='bicycle'>{t(isTooFast ? 'Car' : 'Bicycle')}</p>
                <p className='speed'>{`Velocidad: ${speed} km/h`}</p>
                {isTooFast && <p className='warning'>{t('You are going too fast, we will track you as a car')}</p>}
                <h3 className='warn'>{t('Now every car user will be warned in case that they are near you.')}</h3>
            </div>
            <UserNotification />
        </>
    );
}

export default Bicycle;

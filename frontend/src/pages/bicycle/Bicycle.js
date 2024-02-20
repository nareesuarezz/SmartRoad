"use strict";

import React, { useState, useEffect } from 'react';
import logoBicycle from '../../img/bike.png';
import './Bicycle.css'
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';

function Bicycle() {

    const API = process.env.REACT_APP_LOCALHOST_URL;

    const [lastVehicleId, setLastVehicleId] = useState(null);

    const time = 5000;

    let postsT = 0;

    //Location
    const addTrackGeo = async () => {
        try {
            // Obtener la ubicación utilizando trackGeo
            const location = await trackGeo();

            const response = await axios.get(`${API}/api/vehicles`);
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

            // Llamar a axios.post con los datos actualizados
            await axios.post(`${API}/api/tracks`, data);

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
            <div className="bike-title">
                <h1>SmartRoad</h1>
            </div>
            <div className="logged">
                <h2>You are now logged as a...</h2>
            </div>

            <div className="bicycle-container">
                <div className="vehicle-box bicycle-box">
                    <img src={logoBicycle} alt="Logo de bicicleta" />
                </div>
                <p className='bicycle'>Bicycle</p>

                <h3 className='warn'>Now every car user will be warned in case that they are near you.</h3>
            </div>
        </>
    )
}

export default Bicycle;
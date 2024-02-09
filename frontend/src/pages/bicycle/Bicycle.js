"use strict";

import logoBicycle from '../../img/bike.png';
import './Bicycle.css'
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useEffect } from 'react';

const API = process.env.LOCAHOST_URL;

function Bicycle() {

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

            // Imprimir la ubicación para verificar
            // console.log('Ubicación obtenida:', location);

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
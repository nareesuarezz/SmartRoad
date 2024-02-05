import logoBicycle from '../../img/bike.png';
import './Bicycle.css'
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useEffect } from 'react';

function Bicycle() {

    //Location
    //Location
    const trackAddGeo = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/vehicles');
            const vehicles = response.data;
            const lastVehicleId = vehicles[vehicles.length - 1].UID; // Asume que 'id' es el nombre del campo de ID
            console.log(lastVehicleId);

            navigator.geolocation.watchPosition(async (position) => {
                const location = {
                    type: 'Point',
                    coordinates: [position.coords.latitude, position.coords.longitude],
                };

                const formData = {
                    Location: location,
                    Admin_UID: 'replace-with-admin-id', // Replace with the actual admin ID
                    Speed: 4,
                    Vehicle_UID: lastVehicleId,
                };

                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
                console.log("Latitude: " + position.coords.latitude + "\nLongitude: " + position.coords.longitude);
                await axios.post('http://localhost:8080/api/tracks', formData, config);
            });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        // Call the function here to start tracking
        trackAddGeo();
    }, []); // Empty dependency array to run it only once

    useEffect(() => {
        const locationUpdateInterval = setInterval(() => {
            // Call the trackAddGeo function every 5 seconds
            trackAddGeo();
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
import React from 'react';
import logoBicycle from '../../img/bike.png';
import logoCar from '../../img/car.png';
import './Home.css';

function Home() {
    const handleClick = (vehicle) => {
        debugger;
        const x = document.getElementById("demo");

        function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => showPosition(position, vehicle),
            showError,
            { enableHighAccuracy: true }
        );
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}


        function showPosition(position, vehicle) {
            x.innerHTML = "Latitude: " + position.coords.latitude +
                "<br>Longitude: " + position.coords.longitude;

            if (vehicle === 'bicycle') {
                window.location.href = "/bicycle";
            } else if (vehicle === 'car') {
                window.location.href = "/car";
            }
        }

        function showError(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    x.innerHTML = "User denied the request for Geolocation.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    x.innerHTML = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    x.innerHTML = "The request to get user location timed out.";
                    break;
                case error.UNKNOWN_ERROR:
                    x.innerHTML = "An unknown error occurred.";
                    break;
            }
        }

        getLocation();
    }

    return (
        <>
            <div className="title">
                <h1>SmartRoad</h1>
            </div>
            <div className="question">
                <h2>¿Qué estás conduciendo?</h2>
            </div>

            <div className="vehicle-container">
                <div className="vehicle-box bicycle-box" onClick={() => handleClick('bicycle')}>
                    <img src={logoBicycle} alt="Logo de bicicleta" />
                </div>
                <p className='bicycle'>Bicicleta</p>
                <div className="vehicle-box car-box" onClick={() => handleClick('car')}>
                    <img src={logoCar} alt="Logo de coche" />
                </div>
                <p className='car'>Coche</p>
            </div>
            <div className='admin'>
                <p>¿Eres un administrador?</p>
                <p className='log'>Inicia sesión aquí</p>
            </div>
        </>
    );
}

export default Home;

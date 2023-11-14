import React from 'react';
import logoBicycle from '../../img/bike.png';
import logoCar from '../../img/car.png';
import './Home.css';

function Home() {
    const handleClick = () => {
        debugger
        const x = document.getElementById("demo");

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                x.innerHTML = "Geolocation is not supported by this browser.";
            }

        }

        function showPosition(position) {
            x.innerHTML = "Latitude: " + position.coords.latitude +
                "<br>Longitude: " + position.coords.longitude;
                
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
                <div className="vehicle-box bicycle-box" onClick={handleClick}>
                    <img src={logoBicycle} alt="Logo de bicicleta" />
                </div>
                <p className='bicycle'>Bicicleta</p>
                <div className="vehicle-box car-box" onClick={handleClick}>
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

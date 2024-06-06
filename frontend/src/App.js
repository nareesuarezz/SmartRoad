import React, { useEffect, useState } from 'react';
import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { initReactI18next } from 'react-i18next'; // Import initReactI18next
import { PersistGate } from 'redux-persist/integration/react';
import createStore from './services/store';
import { Provider } from 'react-redux'; import i18n from 'i18next'; // Import i18n
import Loading from './pages/loading/Loading';
import Home from './pages/home/Home';
import Car from './pages/car/Car';
import Bicycle from './pages/bicycle/Bicycle';
import TrackList from './pages/tracks/trackList';
import TrackAdd from './pages/tracks/trackAdd';
import TrackEdit from './pages/tracks/trackEdit';
import VehicleList from './pages/vehicles/vehiclesList';
import VehicleAdd from './pages/vehicles/vehiclesAdd';
import VehicleEdit from './pages/vehicles/vehiclesEdit';
import AdminList from './pages/admins/adminList';
import AdminAdd from './pages/admins/adminAdd';
import AdminEdit from './pages/admins/adminEdit';
import LogList from './pages/logs/logList';
import UserNotification from './components/websocketTest/UserNotification';
import AdminNotification from './components/websocketTest/AdminNotification';
import SoundList from './pages/sounds/soundList';
import SoundAdd from './pages/sounds/soundsAdd';
import SoundEdit from './pages/sounds/soundsEdit';
import LoginUser from './pages/loginUser/LoginUser';
import UserProfile from './pages/userProfile/userProfile'
import SignUpUser from './pages/singupUser/SignUpUser';
const { store, persistor } = createStore();

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "What are you driving?": "What are you driving?",
          "Bicycle": "Bicycle",
          "Car": "Car",
          "Select a notification sound:": "Select a notification sound:",
          "Are you an admin?": "Are you an admin?",
          "Log in here": "Log in here",
          "Need help?": "Need help?",
          "You are now logged as a...": "You are now logged as a...",
          "Now you will be warned in case that a bike passes near you.": "Now you will be warned in case that a bike passes near you.",
          "WARNING: THERE IS A BICYCLE NEAR YOU": "WARNING: THERE IS A BICYCLE NEAR YOU",
          "Now every car user will be warned in case that they are near you.": "Now every car user will be warned in case that they are near you.",
          "Username": "Username",
          "Password:": "Password:",
          "Image:": "Image:",
          "Add Admin": "Add Admin",
          "Edit Admin": "Edit Admin",
          "Add New Admin": "Add New Admin",
          "Actions": "Actions",
          "Delete": "Delete",
          "Login": "Login",
          "Did you forget your password?": "Did you forget your password?",
          "Track ID": "Track ID",
          "Admin ID": "Admin ID",
          "Action": "Action",
          "Sound": "Sound",
          "Player": "Player",
          "Your browser does not support the audio tag.": "Your browser does not support the audio tag.",
          "Edit": "Edit",
          "Sound": "Sound",
          "Add Sound": "Add Sound",
          "Edit Sound": "Edit Sound",
          "Latitude": "Latitude",
          "Longitude": "Longitude",
          "Status": "Status",
          "Select": "Select",
          "Stopped": "Stopped",
          "Moving": "Moving",
          "Speed": "Speed",
          "Extra": "Extra",
          "Vehicle_UID": "Vehicle_UID",
          "Add Track": "Add Track",
          "Update Track": "Update Track",
          "Vehicle": "Vehicle",
          "Add Vehicle": "Add Vehicle",
          "Edit Vehicle": "Edit Vehicle",
          "Add New Vehicle": "Add New Vehicle"
        }
      },
      es: {
        translation: {
          "What are you driving?": "¿Qué estás conduciendo?",
          "Bicycle": "Bicicleta",
          "Car": "Coche",
          "Select a notification sound:": "Seleccione un sonido de notificación:",
          "Are you an admin?": "¿Es usted administrador?",
          "Log in here": "Incie sesión aquí",
          "Need help?": "¿Necesita ayuda?",
          "You are now logged as a...": "Usted se a registrado como un...",
          "Now you will be warned in case that a bike passes near you.": "Ahora serás avisado en caso de que una bicicleta pase cerca de usted.",
          "WARNING: THERE IS A BICYCLE NEAR YOU": "ADVERTENCIA: HAY UNA BICICLETA CERCA DE USTED",
          "Now every car user will be warned in case that they are near you.": "Ahora todos los usuarios registrados como coches serán avisados en caso de que estén cerca de usted.",
          "Username": "Nombre de Usuario",
          "Password": "Contraseña",
          "Image": "Imagen",
          "Add Admin": "Añadir Administrador",
          "Edit Admin": "Editar Administrador",
          "Add New Admin": "Añadir Nuevo Administrador",
          "Actions": "Acciones",
          "Delete": "Eliminar",
          "Login": "Iniciar Sesión",
          "Did you forget your password?": "¿Has olvidado tu contraseña?",
          "Track ID": "Ruta ID",
          "Admin ID": "Administrador ID",
          "Action": "Acción",
          "Sound": "Sonido",
          "Player": "Jugador",
          "Your browser does not support the audio tag.": "Su navegador no soporta la etiqueta audio.",
          "Edit": "Editar",
          "Sound": "Sonido",
          "Add Sound": "Añadir Sonido",
          "Edit Sound": "Editar Sonido",
          "Latitude": "Latitud",
          "Longitude": "Longitud",
          "Status": "Estado",
          "Select": "Seleccionar",
          "Stopped": "Parado",
          "Moving": "En movimiento",
          "Speed": "Velocidad",
          "Extra": "Extra",
          "Vehicle_UID": "Vehículo_UID",
          "Add Track": "Añadir Ruta",
          "Update Track": "Actualizar Ruta",
          "Vehicle": "Vehículo",
          "Add Vehicle": "Añadir Vehículo",
          "Edit Vehicle": "Editar Vehículo",
          "Add New Vehicle": "Añadir nuevo Vehículo"
        }
      }
    },
    lng: "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  });

function App() {

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')

        .then(function (registration) {
          console.log('Service Worker registrado con éxito:', registration);
        })
        .catch(function (error) {
          console.error('Error al registrar el Service Worker:', error);
        });
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div id='demo'></div>
        <BrowserRouter>
          <Routes>
            {/* Pass i18n instance to Home component */}
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Loading />} />
            <Route path="/home" element={<Home />} />
            <Route path="/car" element={<Car />} />
            <Route path="/bicycle" element={<Bicycle />} />
            <Route path="/track-list" element={<TrackList />} />
            <Route path="/track-add" element={<TrackAdd />} />
            <Route path="/track-edit/:id" element={<TrackEdit />} />
            <Route path="/vehicle-list" element={<VehicleList />} />
            <Route path="/vehicle-add" element={<VehicleAdd />} />
            <Route path="/vehicle-edit/:id" element={<VehicleEdit />} />
            <Route path="/admin-list" element={<AdminList />} />
            <Route path="/admin-add" element={<AdminAdd />} />
            <Route path="/admin-edit/:id" element={<AdminEdit />} />
            <Route path="/log-list" element={<LogList />} />
            <Route path="/admin-notification" element={<AdminNotification />} />
            <Route path="/user-notification" element={<UserNotification />} />
            <Route path="/sound-list" element={<SoundList />} />
            <Route path="/sound-add" element={<SoundAdd />} />
            <Route path="/sound-edit/:id" element={<SoundEdit />} />
            <Route path="/login-user" element={<LoginUser />} />
            <Route path="/user-profile/:id" element={<UserProfile />} />
            <Route path="/sign-up" element={<SignUpUser />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
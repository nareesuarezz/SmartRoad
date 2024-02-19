import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Loading from './pages/loading/Loading';
import Home from './pages/home/Home';
import Car from './pages/car/Car';
import Bicycle from './pages/bicycle/Bicycle';
import Login from './pages/login/Login';
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
import NotificationsComponent from './components/websocketTest/NotificationsComponent';
import SoundList from './pages/sounds/soundList';
import SoundAdd from './pages/sounds/soundsAdd';
import SoundEdit from './pages/sounds/soundsEdit';




function App() {

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw1.js')

        .then(function (registration) {
          console.log('Service Worker registrado con éxito:', registration);
        })
        .catch(function (error) {
          console.error('Error al registrar el Service Worker:', error);
        });
    }
  }, []);

  return (
    <>
      <div id='demo'></div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/home" element={<Home />} />
          <Route path="/car" element={<Car />} />
          <Route path="/bicycle" element={<Bicycle />} />
          <Route path="/login" element={<Login />} />
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
          <Route path="/websocketTest" element={<NotificationsComponent />} />
          <Route path="/sound-list" element={<SoundList />} />
          <Route path="/sound-add" element={<SoundAdd />} />
          <Route path="/sound-edit/:id" element={<SoundEdit />} />


        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

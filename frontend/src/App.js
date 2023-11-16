import React from 'react';
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

function App() {
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
          <Route path="/edit/:id" element={<TrackEdit />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

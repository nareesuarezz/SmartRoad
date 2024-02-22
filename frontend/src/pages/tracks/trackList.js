import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Importa los estilos de Leaflet
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import AuthService from '../../services/authService';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';

const customIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/images/mark.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const lastTrackIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/images/last.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const URL = process.env.REACT_APP_LOCALHOST_URL;

const TrackList = () => {
  const { t } = useTranslation();

  const [tracks, setTracks] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.1248, -15.4300]); // Coordenadas de Gran Canaria

  useEffect(() => {
    getTracks();
  }, []);

  const getTracks = async () => {
    try {
      const authToken = AuthService.getAuthToken();
      const response = await axios.get(`${URL}/api/tracks`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setTracks(response.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const groupTracksByVehicle = () => {
    const groupedTracks = {};
    tracks.forEach((track) => {
      const vehicleUID = track.Vehicle_UID;
      if (!groupedTracks[vehicleUID]) {
        groupedTracks[vehicleUID] = [];
      }
      groupedTracks[vehicleUID].push(track);
    });
    return groupedTracks;
  };

  const goBack = () => {
    window.location.href = '/login';
  };

  const renderTracksOnMap = () => {
    const groupedTracks = groupTracksByVehicle();

    return Object.values(groupedTracks).map((vehicleTracks, index) => {
      const trackCoordinates = vehicleTracks.map((track) => track.Location.coordinates.reverse());
      return (
        <React.Fragment key={index}>
          {vehicleTracks.map((track, trackIndex) => (
            <Marker
              key={track.ID}
              position={track.Location.coordinates.reverse()}
              icon={trackIndex === vehicleTracks.length - 1 ? lastTrackIcon : customIcon}
            >
              <Popup>
                <p>{`Track ID: ${track.ID}`}</p>
                <p>{`Location: ${track.Location.coordinates.join(', ')}`}</p>
                <p>{`Vehicle ID: ${track.Vehicle_UID}`}</p>
              </Popup>
            </Marker>
          ))}
          <Polyline positions={trackCoordinates} color="blue" />
        </React.Fragment>
      );
    });
  };

  return (
    <div>
      <Header />
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <div>
        <LanguageSwitcher />
      </div>
      <Link to="/track-add" className="add">
        {t('Add Track')}
      </Link>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <MapContainer center={mapCenter} zoom={12} style={{ height: '500px', width: '700px' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {renderTracksOnMap()}
        </MapContainer>
      </div>


    </div>
  );
};

export default TrackList;

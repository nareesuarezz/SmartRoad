import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import AuthService from '../../services/authService';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';

const carIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/images/car.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const bicycleIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/images/bicycle.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const URL = process.env.REACT_APP_LOCALHOST_URL;

const TrackList = () => {
  const { t } = useTranslation();

  const [tracks, setTracks] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.1248, -15.4300]);

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
  
      // Asegúrate de que cada track tenga la información del vehículo
      const tracksWithVehicleInfo = await Promise.all(response.data.map(async (track) => {
        const vehicleResponse = await axios.get(`${URL}/api/vehicles/${track.Vehicle_UID}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        return { ...track, vehicleType: vehicleResponse.data.Vehicle };
      }));
  
      setTracks(tracksWithVehicleInfo);
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

  const RoutingMachine = ({ trackCoordinates }) => {
    const map = useMap();
  
    useEffect(() => {
  if (trackCoordinates.length > 1) {
    let routingControl = L.Routing.control({
      waypoints: trackCoordinates.map(coord => L.latLng(coord[0], coord[1])),
      routeWhileDragging: true,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      router: new L.Routing.osrmv1({
        language: 'es',
        profile: 'driving',
      }),
      lineOptions: {
        styles: [{color: 'blue', opacity: 1, weight: 5}]
      },
      show: false, // Esta opción oculta las direcciones para llegar
      routeLine: function(route, options) { // Esta función oculta la línea de la ruta
        return L.polyline(route.coordinates, options);
      },
      createMarker: function() { return null; }, // Esta función oculta los marcadores de inicio y fin
    }).addTo(map);

    // Oculta el panel de instrucciones de ruta después de que se haya creado
    routingControl.on('routeselected', function(e) {
      let routesContainer = document.querySelector('.leaflet-routing-container-hide');
      if (routesContainer) {
        routesContainer.style.display = 'none';
      }
    });
  }
}, [map, trackCoordinates]);

  
    return null;
  };
  
  
  
  const renderTracksOnMap = () => {
    const groupedTracks = groupTracksByVehicle();
  
    return Object.values(groupedTracks).map((vehicleTracks, index) => {
      const trackCoordinates = vehicleTracks.map((track) => track.Location.coordinates.reverse());
  
      return (
        <React.Fragment key={index}>
          {vehicleTracks.map((track, trackIndex) => {
            const icon = track.vehicleType === 'car' ? carIcon : bicycleIcon;
            return (
              <Marker
                key={track.ID}
                position={track.Location.coordinates.reverse()}
                icon={icon}
              >
                <Popup>
                  <p>{`Track ID: ${track.ID}`}</p>
                  <p>{`Location: ${track.Location.coordinates.join(', ')}`}</p>
                  <p>{`Vehicle ID: ${track.Vehicle_UID}`}</p>
                </Popup>
              </Marker>
            );
          })}
          <RoutingMachine trackCoordinates={trackCoordinates} />
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
      <div>
        <Link to="/track-add" className="add">
          {t('Add Track')}
        </Link>
      </div>

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

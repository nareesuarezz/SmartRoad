import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'lrm-graphhopper';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import AuthService from '../../services/authService';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
import { useSelector } from 'react-redux';

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

const notificationIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/images/notification.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
const URL = process.env.REACT_APP_LOCALHOST_URL;

const TrackList = () => {
  const notificationLocations = useSelector(state => {
    console.log('Estado de Redux:', state); // Este console.log muestra todo el estado de Redux
    return state.notificationLocations; // Devuelve solo la parte de notificationLocations del estado
  });

  const { t } = useTranslation();

  const [tracks, setTracks] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.1248, -15.4300]);
  const [showCompleteRoute, setShowCompleteRoute] = useState(true); // Por defecto, mostrar la ruta completa



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
    window.location.href = '/login-user';
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
          router: L.Routing.graphHopper('3b3cf297-dba9-4a69-a17a-7ecc3873a1da', {
            urlParameters: {
              vehicle: 'foot',
            },
          }),
          lineOptions: {
            styles: [{ color: 'sasa', opacity: 1, weight: 5 }]
          },
          show: false, // Esta opción oculta las direcciones para llegar
          routeLine: function (route, options) { // Esta función oculta la línea de la ruta
            return L.polyline(route.coordinates, options);
          },
          createMarker: function () { return null; }, // Esta función oculta los marcadores de inicio y fin
        }).addTo(map);

        // Oculta el panel de instrucciones de ruta después de que se haya creado
        routingControl.on('routeselected', function (e) {
          let routesContainer = document.querySelector('.leaflet-routing-container-hide');
          if (routesContainer) {
            routesContainer.style.display = 'none';
          }
        });
      }
    }, [map, trackCoordinates]);

    return null;
  };

  const renderTracksOnMap = (vehicleType) => {
    const groupedTracks = groupTracksByVehicle();
  
    return Object.values(groupedTracks).map((vehicleTracks, index) => {
      if (vehicleTracks[0].vehicleType !== vehicleType) {
        return null;
      }
  
      const trackCoordinates = showCompleteRoute ? 
        vehicleTracks.map((track) => track.Location.coordinates.reverse()) :
        [vehicleTracks[vehicleTracks.length - 1].Location.coordinates.reverse()];
  
      return (
        <React.Fragment key={index}>
          {vehicleTracks.map((track, trackIndex) => {
            const icon = track.vehicleType === 'car' ? carIcon : bicycleIcon;
            return (
              <Marker
                key={track.ID}
                position={track.Location.coordinates.reverse()}
                icon={icon}
                zIndexOffset={500} // Ajusta este valor según tus necesidades
              >
                <Popup>
                  <p>{`Track ID: ${track.ID}`}</p>
                  <p>{`Location: ${track.Location.coordinates.join(', ')}`}</p>
                  <p>{`Vehicle ID: ${track.Vehicle_UID}`}</p>
                  <p>{`Status: ${track.Status}`}</p>
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
        <Link to="/track-add" className='add'>
          {t('Add Track')}
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <MapContainer center={mapCenter} zoom={12} style={{ height: '500px', width: '700px' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <LayersControl position="topright">
            <LayersControl.Overlay checked name="Bicicletas">
              <LayerGroup>
                {renderTracksOnMap('bicycle')}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked name="Coches">
              <LayerGroup>
                {renderTracksOnMap('car')}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked name="Notificaciones">
              <LayerGroup>
                {notificationLocations.map((location, index) => {
                  const coordinates = location.coordinates;
                  console.log(coordinates)
                  return (
                    <Marker
                      key={index}
                      position={[coordinates[0], coordinates[1]]}
                      icon={notificationIcon}
                      zIndexOffset={1000} 
                    >
                      <Popup>
                        <p>Notificación enviada desde aquí</p>
                      </Popup>
                    </Marker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>
    </div>
  );
};

export default TrackList;

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
import io from 'socket.io-client';

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
    return state.notificationLocations; // Devuelve solo la parte de notificationLocations del estado
  });

  const { t } = useTranslation();

  const [allTracks, setAllTracks] = useState([]);
  const [displayTracks, setDisplayTracks] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.1248, -15.4300]);
  const [trackView, setTrackView] = useState('complete');
  const [selectedLayer, setSelectedLayer] = useState('Todas las rutas');
  const SOCKET_SERVER_URL = process.env.REACT_APP_LOCALHOST_URL;



  useEffect(() => {
    getTracks();
  }, []);

  useEffect(() => {
    if (trackView === 'complete') {
      setDisplayTracks(allTracks);
    } else {
      const lastTracks = getLastTracks(allTracks);
      setDisplayTracks(lastTracks);
    }
  }, [allTracks, trackView]);
  

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL); 

    socket.on('trackCreated', (newTrack) => {
      setAllTracks([...allTracks, newTrack]);
    });

    return () => {
      socket.disconnect();
    };
  }, [allTracks]);

  const layerToTrackView = {
    "Todas las rutas": "complete",
    "Último track": "last"
  };
  
  const handleLayerChange = (layer) => {
    setTrackView(layerToTrackView[layer]);
  };


  const CustomControl = (props) => {
    const map = useMap();
    useEffect(() => {
      map.on('baselayerchange', (event) => {
        handleLayerChange(event.name);
      });
    }, [map]);
    return null;
  };


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

      setAllTracks(tracksWithVehicleInfo);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const getLastTracks = (tracks) => {
    const groupedTracks = tracks.reduce((grouped, track) => {
      (grouped[track.Vehicle_UID] = grouped[track.Vehicle_UID] || []).push(track);
      return grouped;
    }, {});

    const lastTracks = Object.values(groupedTracks).map(tracks => tracks.sort((a, b) => new Date(b.Date) - new Date(a.Date))[0]);
    return lastTracks;
  };

  const groupTracksByVehicle = (tracks) => {
    const groupedTracks = tracks.reduce((grouped, track) => {
      (grouped[track.Vehicle_UID] = grouped[track.Vehicle_UID] || []).push(track);
      return grouped;
    }, {});
    return groupedTracks;
  };

  const goBack = () => {
    window.location.href = '/login-user';
  };

  useEffect(() => {
    console.log(trackView);
  }, [trackView]);

  const RoutingMachine = ({ trackCoordinates }) => {
    const map = useMap();
  
    useEffect(() => {
      if (trackCoordinates.length > 1) {
        map.whenReady(() => {
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
        });
      }
    }, [map, trackCoordinates]);
  
    return null;
  };
  
  
  const renderTracksOnMap = (vehicleType) => {
    const groupedTracks = groupTracksByVehicle(displayTracks);

    return Object.values(groupedTracks).map((vehicleTracks, index) => {
      if (vehicleTracks[0].vehicleType !== vehicleType) {
        return null;
      }

      let trackCoordinates;
      if (trackView === 'complete') {
        trackCoordinates = vehicleTracks.map((track) => track.Location.coordinates.reverse());
      } else {
        trackCoordinates = [vehicleTracks.sort((a, b) => new Date(b.Date) - new Date(a.Date))[0].Location.coordinates.reverse()];
      }
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
        <Link to="/track-add" className="add">
          {t('Add Track')}
        </Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <MapContainer key={`${trackView}-${Date.now()}`} center={mapCenter} zoom={12} style={{ height: '500px', width: '700px' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <CustomControl />
          <LayersControl position="topright">
            <LayersControl.BaseLayer name="Todas las rutas">
              <LayerGroup>
              </LayerGroup>
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Último track">
              <LayerGroup>
              </LayerGroup>
            </LayersControl.BaseLayer>
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
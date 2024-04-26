import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'lrm-graphhopper';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { Select } from 'antd';

const { Option } = Select;

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
  const [tracksWithinBounds, setTracksWithinBounds] = useState([]);
  const [bounds, setBounds] = useState({ swLat: 0, swLng: 0, neLat: 0, neLng: 0 });
  const [zoomLevel, setZoomLevel] = useState(12);
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [endTime, setEndTime] = useState(new Date().toISOString());
  const [timeInterval, setTimeInterval] = useState({ startTime: new Date().toISOString(), endTime: new Date().toISOString() });

  const timeOptions = [
    { label: 'Últimos 2 minutos', value: { startTime: new Date(Date.now() - 120000).toISOString(), endTime: new Date().toISOString() } },
    { label: 'Últimos 10 minutos', value: { startTime: new Date(Date.now() - 600000).toISOString(), endTime: new Date().toISOString() } },
    { label: 'Últimos 20 minutos', value: { startTime: new Date(Date.now() - 1200000).toISOString(), endTime: new Date().toISOString() } },
    { label: 'Última media hora', value: { startTime: new Date(Date.now() - 1800000).toISOString(), endTime: new Date().toISOString() } },
    { label: 'Última hora', value: { startTime: new Date(Date.now() - 3600000).toISOString(), endTime: new Date().toISOString() } },
    { label: 'Últimas 24 horas', value: { startTime: new Date(Date.now() - 86400000).toISOString(), endTime: new Date().toISOString() } },
    { label: 'Últimos 7 días', value: { startTime: new Date(Date.now() - 604800000).toISOString(), endTime: new Date().toISOString() } },
    { label: 'Todos los tracks', value: { startTime: null, endTime: new Date().toISOString() } },
  ];


  console.log(timeInterval)


  useEffect(() => {
    fetchTracksWithinBounds(bounds.swLat, bounds.swLng, bounds.neLat, bounds.neLng)
      .catch(error => {
        console.error('Error: ', error);
      });
  }, []);




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



  const fetchTracksWithinBounds = async (swLat, swLng, neLat, neLng) => {

    try {
      const response = await axios.get(`${URL}/api/tracks/within-bounds`, {
        params: {
          swLat,
          swLng,
          neLat,
          neLng,
          view: trackView // Añade el nuevo parámetro
        },
      });
      console.log('sasa ', trackView)
      // Ahora cada track debería tener la información del vehículo incluida
      const tracksWithVehicleInfo = response.data.tracksWithinBounds;

      setTracksWithinBounds(tracksWithVehicleInfo);
    } catch (error) {
      console.error('Error al buscar tracks dentro de los límites:', error);
    }
  };

  useEffect(() => {
  }, [tracksWithinBounds]);

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

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('trackCreated', (newTrack) => {
      // Llama a fetchTracksWithinBounds con las coordenadas actuales del cuadro
      fetchTracksWithinBounds(bounds.swLat, bounds.swLng, bounds.neLat, bounds.neLng);
    });

    return () => {
      socket.disconnect();
    };
  }, [bounds]); // Añade 'bounds' a las dependencias del useEffect

  const fetchTracksInTimeInterval = () => {
    const params = {};
    if (timeInterval.startTime) {
      params.startTime = timeInterval.startTime;
    }
    params.endTime = timeInterval.endTime;

    axios.get(`${URL}/api/tracks/in-time-interval`, { params })
      .then(response => {
        const tracks = response.data.tracksInTimeInterval;
        setTracksWithinBounds(tracks);
      })
      .catch(error => {
        console.error('Error fetching tracks in time interval:', error);
      });
  };


  const RoutingMachine = ({ trackCoordinates }) => {
    const map = useMap();
    const isMounted = useRef(false);

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    useEffect(() => {
      if (map && trackCoordinates.length > 1 && isMounted.current) {
        const whenMapIsReady = new Promise(resolve => map.whenReady(resolve));
        whenMapIsReady.then(() => {
          if (map) { // Asegúrate de que el mapa existe
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
              if (!isMounted.current) return;
              let routesContainer = document.querySelector('.leaflet-routing-container-hide');
              if (routesContainer) {
                routesContainer.style.display = 'none';
              }
            });
          }
        });
      }
    }, [map, trackCoordinates]);

    return null;
  };

  const MapBounds = () => {
    const map = useMap();

    useEffect(() => {
      map.on('moveend', () => {
        const center = map.getCenter();
        const zoom = map.getZoom();

        // Actualiza el estado con las nuevas coordenadas del centro
        setMapCenter([center.lat, center.lng]);
        setZoomLevel(zoom);

        const mapBounds = map.getBounds();
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();

        // Actualiza el estado con las nuevas coordenadas
        setBounds({ swLat: sw.lat, swLng: sw.lng, neLat: ne.lat, neLng: ne.lng });

        // Hace la solicitud a la API con las coordenadas de las esquinas del mapa
        fetchTracksWithinBounds(sw.lat, sw.lng, ne.lat, ne.lng);
      });
    }, [map]);

    return null;
  };

  const tracksToGeoJSON = (tracks) => {
    return {
      type: 'FeatureCollection',
      features: tracks.map(track => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: track.Location.coordinates
        },
        properties: {
          trackId: track.ID,
          vehicleId: track.Vehicle_UID,
          status: track.Status,
          vehicleType: track.Vehicles.Vehicle
        }
      }))
    };
  };

  const notificationsToGeoJSON = (notifications) => {
    return {
      type: 'FeatureCollection',
      features: notifications.map(notification => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: notification.coordinates
        }
      }))
    };
  };


  const renderTracksOnMap = (vehicleType, view) => {
    const groupedTracks = groupTracksByVehicle(tracksWithinBounds);
    return Object.values(groupedTracks).map((vehicleTracks, index) => {
      if (vehicleTracks[0].Vehicles.Vehicle !== vehicleType) {
        return null;
      }

      // Ordena los tracks por fecha y toma el último
      let tracksToRender;
      if (view === 'last') {
        tracksToRender = [vehicleTracks.sort((a, b) => new Date(b.Date) - new Date(a.Date))[0]];
      } else {
        tracksToRender = vehicleTracks;
      }
      const geoJsonData = tracksToGeoJSON(tracksToRender);

      return (
        <React.Fragment key={index}>
          {tracksToRender.map((track, trackIndex) => (
            <Marker
              key={trackIndex}
              position={track.Location.coordinates}
              icon={track.Vehicles.Vehicle === 'car' ? carIcon : bicycleIcon}
              zIndexOffset={500}
            >
              <Popup>
                <p>{`Track ID: ${track.ID}`}</p>
                <p>{`Location: ${track.Location.coordinates.join(', ')}`}</p>
                <p>{`Vehicle ID: ${track.Vehicle_UID}`}</p>
                <p>{`Status: ${track.Status}`}</p>
              </Popup>
            </Marker>
          ))}
          <GeoJSON data={geoJsonData} />
        </React.Fragment>
      );
    });
  };


  useEffect(() => {
    const carTracksComplete = renderTracksOnMap('car', 'complete');
    const carTracksLast = renderTracksOnMap('car', 'last');
    const bicycleTracksComplete = renderTracksOnMap('bicycle', 'complete');
    const bicycleTracksLast = renderTracksOnMap('bicycle', 'last');
    const notifications = notificationsToGeoJSON(notificationLocations);

    console.log('Capa de Coches (Todas las rutas):', carTracksComplete);
    console.log('Capa de Coches (Último track):', carTracksLast);
    console.log('Capa de Bicicletas (Todas las rutas):', bicycleTracksComplete);
    console.log('Capa de Bicicletas (Último track):', bicycleTracksLast);
    console.log('Capa de Notificaciones:', notifications);
}, [tracksWithinBounds, notificationLocations]);




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
      <div>
        <Select
          style={{ width: 200 }}
          placeholder="Selecciona un intervalo de tiempo"
          optionFilterProp="children"
          onChange={value => {
            setTimeInterval(JSON.parse(value));
            fetchTracksInTimeInterval();
          }}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {timeOptions.map((option, index) => (
            <Option key={index} value={JSON.stringify(option.value)}>{option.label}</Option>
          ))}
        </Select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <MapContainer key={`${trackView}-${Date.now()}`} center={mapCenter} zoom={zoomLevel} style={{ height: '500px', width: '700px' }}>
          <MapBounds />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <CustomControl />
          <LayersControl position="topleft">
            <LayersControl.BaseLayer name="Todas las rutas">
              <LayerGroup>
                {renderTracksOnMap('car', 'complete')}
                {renderTracksOnMap('bicycle', 'complete')}
              </LayerGroup>
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Último track">
              <LayerGroup>
                {renderTracksOnMap('car', 'last')}
                {renderTracksOnMap('bicycle', 'last')}
              </LayerGroup>
            </LayersControl.BaseLayer>
            <LayersControl.Overlay checked name="Bicicletas">
              <LayerGroup>
                {renderTracksOnMap('bicycle', trackView)}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked name="Coches">
              <LayerGroup>
                {renderTracksOnMap('car', trackView)}
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
                <GeoJSON data={notificationsToGeoJSON(notificationLocations)} />
              </LayerGroup>
            </LayersControl.Overlay>


          </LayersControl>
        </MapContainer>
      </div>
    </div>
  );

};

export default TrackList;
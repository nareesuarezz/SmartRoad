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
  const tracksRef = useRef([]);
  const mapPositionRef = useRef(mapCenter);
  const mapZoomRef = useRef(zoomLevel);
  const [carTracksGeoJSON, setCarTracksGeoJSON] = useState(null);
  const [bicycleTracksGeoJSON, setBicycleTracksGeoJSON] = useState(null);


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
          view: trackView
        },
      });
      const newTracks = response.data.tracksWithinBounds;

      console.log('newTracks: ', newTracks)
      if (JSON.stringify(newTracks) !== JSON.stringify(tracksRef.current)) {
        tracksRef.current = newTracks;
        setTracksWithinBounds(newTracks);

        // Envía los tracks al backend para su procesamiento
        processTracks(newTracks);
      }
    } catch (error) {
      console.error('Error al buscar tracks dentro de los límites:', error);
    }
  };


  useEffect(() => {
  }, [tracksWithinBounds]);


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
    const routingControlRef = useRef(null); // Añade esta línea

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
        if (routingControlRef.current) { // Añade este bloque
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      if (map && trackCoordinates.length > 1 && isMounted.current) {
        const whenMapIsReady = new Promise(resolve => map.whenReady(resolve));
        whenMapIsReady.then(() => {
          if (map) {
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

        mapZoomRef.current = zoom;
        mapPositionRef.current = [center.lat, center.lng];
        const mapBounds = map.getBounds();
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();

        // Hace la solicitud a la API con las coordenadas de las esquinas del mapa
        fetchTracksWithinBounds(sw.lat, sw.lng, ne.lat, ne.lng);
      });
    }, [map]);

    return null;
  };

  const processTracks = async (allTracks) => {
    try {
      const response = await axios.post(`${URL}/api/tracks/processTracks`, { allTracks });
      setCarTracksGeoJSON(response.data.carTracksGeoJSON);
      setBicycleTracksGeoJSON(response.data.bicycleTracksGeoJSON);

    } catch (error) {
      console.error('Error al procesar los tracks:', error);
    }
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
    let tracksGeoJSON;
    if (vehicleType === 'car') {
      tracksGeoJSON = carTracksGeoJSON;
    } else if (vehicleType === 'bicycle') {
      tracksGeoJSON = bicycleTracksGeoJSON;
    }

    if (!tracksGeoJSON) {
      return null;
    }

    return (
      <React.Fragment>
        {tracksGeoJSON.features.map((feature, index) => {
          const track = feature.properties;
          const coordinates = feature.geometry.coordinates;

          // Solo renderiza el último track si la vista es 'last'
          if (view === 'last' && index < tracksGeoJSON.features.length - 1) {
            return null;
          }

          return (
            <Marker
              key={index}
              position={coordinates}
              icon={track.vehicleType === 'car' ? carIcon : bicycleIcon}
              zIndexOffset={500}
            >
              <Popup>
                <p>{`Track ID: ${track.trackId}`}</p>
                <p>{`Location: ${coordinates.join(', ')}`}</p>
                <p>{`Vehicle ID: ${track.vehicleId}`}</p>
                <p>{`Status: ${track.status}`}</p>
              </Popup>
            </Marker>
          );
        })}
        <GeoJSON data={tracksGeoJSON} />
      </React.Fragment>
    );
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
        <Link to="/track-add" className='add'>
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
        <MapContainer key={`${trackView}-${Date.now()}`} center={mapPositionRef.current} zoom={mapZoomRef.current} style={{ height: '500px', width: '700px' }}>
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
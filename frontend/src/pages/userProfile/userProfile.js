import "./userProfile.css"
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import MenuUserInfo from "../../components/menuUserInfo/MenuUserInfo.js";
import ProfilePictureUser from "../../components/profilePictureUser/profilePictureUser.js";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'lrm-graphhopper';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
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


const URL = process.env.REACT_APP_LOCALHOST_URL;

const getPlaceName = async (lat, lon) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
  const data = await response.json();
  const shortAddress = data.display_name.split(',').slice(0, 4).join(',');
  return shortAddress;
};

function UserProfile() {
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [showEditImage, setShowEditImage] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [formData, setFormData] = useState({
    Image: null,
    Username: '',
  });
  const [previewImage, setPreviewImage] = useState('');
  const [carDistance, setCarDistance] = useState(0);
  const [bicycleDistance, setBicycleDistance] = useState(0);
  const [lastJourney, setLastJourney] = useState(null);
  const [startPlaceName, setStartPlaceName] = useState('');
  const [endPlaceName, setEndPlaceName] = useState('');


  const [totalTime, setTotalTime] = useState('');
  const [carTime, setCarTime] = useState(null);
  const [bicycleTime, setBicycleTime] = useState(null);

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


  const userInfo = JSON.parse(localStorage.getItem('userInfo'))

  useEffect(() => {
    //Total Time
    axios.get(`${URL}/api/tracks/totalTime/${userInfo.UID}`)
      .then(response => {
        setTotalTime(response.data);
      })
      .catch(error => {
        console.error('Error getting total time:', error);
      });
    //Car Time
    axios.get(`${URL}/api/tracks/carTime/${userInfo.UID}`)
      .then(response => {
        setCarTime(response.data);
      })
      .catch(error => {
        console.error('Error getting car time:', error);
      });
    //Bicycle Time
    axios.get(`${URL}/api/tracks/bicycleTime/${userInfo.UID}`)
      .then(response => {
        setBicycleTime(response.data);
      })
      .catch(error => {
        console.error('Error getting bicycle time:', error);
      });
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'Image') {
      const file = e.target.files[0];

      if (file) {
        setFormData({
          ...formData,
          Image: file,
        });

        const imageUrl = window.URL.createObjectURL(file);
        setPreviewImage(imageUrl);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('Username', formData.Username);

      if (formData.Image) {
        formDataForUpload.append('filename', formData.Image);
      }

      await axios.put(`${URL}/api/admins/${userInfo.UID}`, formDataForUpload);

      const updatedAdminData = await axios.get(`${URL}/api/admins/${userInfo.UID}`);
      localStorage.setItem('adminInfo', JSON.stringify(updatedAdminData.data));
      localStorage.setItem('userInfo', JSON.stringify(updatedAdminData.data)); // Actualiza la información del usuario en el almacenamiento local

      window.location.reload(); // Recarga la página
    } catch (error) {
      console.error(`Error updating admin with id=${userInfo.UID}:`, error);
    }
  };

  const goBack = () => {
    window.location.href = '/home';
  };

  useEffect(() => {
    // Define una función asincrónica que realiza la solicitud a la API
    const fetchTotalDistance = async () => {
      try {
        // Realiza una solicitud GET a la API para obtener la distancia total
        const response = await axios.get(`${URL}/api/tracks/distance/admin/${userInfo.UID}`);

        // Actualiza el estado con la distancia total obtenida
        setTotalDistance(response.data.totalDistance);
        setCarDistance(response.data.carDistance);
        setBicycleDistance(response.data.bicycleDistance);
      } catch (error) {
        console.error(`Error fetching total distance: ${error}`);
      }
    };

    const fetchLastJourney = async () => {
      try {
        // Realiza una solicitud GET a la API para obtener el último viaje
        const response = await axios.get(`${URL}/api/tracks/lastJourney/admin/${userInfo.UID}`);

        // Actualiza el estado con el último viaje obtenido
        const lastJourney = response.data;
        setLastJourney(lastJourney);

        if (lastJourney) {
          const startPlaceName = await getPlaceName(
            lastJourney.firstTrack.Location.coordinates[0],
            lastJourney.firstTrack.Location.coordinates[1]
          );
          const endPlaceName = await getPlaceName(
            lastJourney.lastTrack.Location.coordinates[0],
            lastJourney.lastTrack.Location.coordinates[1]
          );

          setStartPlaceName(startPlaceName);
          setEndPlaceName(endPlaceName);
        }
      } catch (error) {
        console.error(`Error fetching last journey: ${error}`);
      }
    };

    fetchLastJourney();
    fetchTotalDistance();
  }, []);


  const fetchTracksWithinBounds = async (swLat, swLng, neLat, neLng) => {
    try {
      const response = await axios.get(`${URL}/api/tracks/within-bounds`, {
        params: {
          swLat,
          swLng,
          neLat,
          neLng,
          view: trackView,
          userId: userInfo.UID 
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
                <p>{`Type: ${track.Type}`}</p>
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

    console.log('Capa de Coches (Todas las rutas):', carTracksComplete);
    console.log('Capa de Coches (Último track):', carTracksLast);
    console.log('Capa de Bicicletas (Todas las rutas):', bicycleTracksComplete);
    console.log('Capa de Bicicletas (Último track):', bicycleTracksLast);
  }, [tracksWithinBounds]);




  return (
    <>
      <header>
        <div className='arrow' onClick={() => goBack()}>
          <ArrowLeftOutlined />
        </div>
        <div className="menuUserInfo">
          <MenuUserInfo />
        </div>
        {/* <div className='profile'>
          <ProfilePictureUser onClick={() => setShowEditImage(!showEditImage)} />
        </div> */}
        <div className='username'>
          <h1 onClick={() => setShowEditUsername(!showEditUsername)}>
            {userInfo.Username}
          </h1>

        </div>
      </header>
      <div className="userProfileData">
        <h2>Here you will see you stats:</h2>
        <p>Car Time = {carTime}</p>
        <p>Bicycle Time = {bicycleTime}</p>
        <p>Car Km = {(carDistance / 1000).toFixed(2)} Km</p>

        <p>Bicycle Km = {(bicycleDistance / 1000).toFixed(2)} Km{bicycleTime}</p>
        <p>Total Time = {totalTime}</p>
        <p>Total Km = {(totalDistance / 1000).toFixed(2)} Km</p>
        {lastJourney ? (
          <>
            <h3>Last Journey:</h3>
            <p>Start: {new Date(lastJourney.firstTrack.Date).toLocaleString()} at {startPlaceName}</p>
            <p>End: {new Date(lastJourney.lastTrack.Date).toLocaleString()} at {endPlaceName}</p>
          </>
        ) : (
          <p>Loading last journey...</p>
        )}


        {showEditUsername && (
          <form onSubmit={handleSubmit}>
            <label>
              Cambiar nombre de usuario:
              <input type="text" name="Username" value={formData.Username} onChange={handleChange} />
            </label>
            <button type="submit">Actualizar nombre de usuario</button>
          </form>
        )}
        {showEditImage && (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <label>
              Cambiar imagen de perfil:
              <input type="file" name="Image" onChange={handleChange} accept="image/*" />
            </label>
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
              </div>
            )}
            <button type="submit">Actualizar imagen de perfil</button>
          </form>
        )}
      </div>
      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer center={mapPositionRef.current} zoom={mapZoomRef.current} style={{ height: '100%', width: '100%' }}>
          <MapBounds />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

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
          </LayersControl>
        </MapContainer>
      </div>
    </>
  );
}

export default UserProfile;

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
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';



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

const routeIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/images/route.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -3, 2],
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
  const [carTracksGPSGeoJSON, setCarTracksGPSGeoJSON] = useState(null);
  const [carTracksGeoapifyGeoJSON, setCarTracksGeoapifyGeoJSON] = useState(null);
  const [bicycleTracksGPSGeoJSON, setBicycleTracksGPSGeoJSON] = useState(null);
  const [bicycleTracksGeoapifyGeoJSON, setBicycleTracksGeoapifyGeoJSON] = useState(null);
  const [method, setMethod] = useState('GPS');
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [placeA, setPlaceA] = useState('');
  const [placeB, setPlaceB] = useState('');
  const pointARef = useRef(null);
  const pointBRef = useRef(null);
  const markerARef = useRef(null);
  const markerBRef = useRef(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef([]);
  const [routes, setRoutes] = useState([]);
  const routingControlsRef = useRef([]);
  const [mapKey, setMapKey] = useState(Math.random());





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
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))

  const layerToTrackView = {
    "Todas las rutas": "complete",
    "Último track": "last"
  };

  const handleLayerChange = (layer) => {
    setTrackView(layerToTrackView[layer]);
  };


  const handlePlaceSubmit = async (place, setPoint, pointRef) => {
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: place });
    if (results && results.length > 0) {
      const latlng = [results[0].y, results[0].x];
      setPoint(latlng);
      pointRef.current = latlng;
    }
  };


  const CustomControl = (props) => {
    const map = useMap();

    useEffect(() => {
      map.whenReady(() => {
        map.on('baselayerchange', (event) => {
          handleLayerChange(event.name);
        });
      });
    }, [map]);

    return null;
  };

  useEffect(() => {
    console.log(trackView);
  }, [trackView]);


  useEffect(() => {
  }, [tracksWithinBounds]);

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
    console.log(method);
  }, [method]);


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

  const fetchRoutes = async () => {

    try {
      const response = await axios.get(`${URL}/api/routes/findByAdminUID/${userInfo.UID}`);
      setRoutes(response.data);
      console.log(routes)
    } catch (error) {
      console.error(`Error fetching routes: ${error}`);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

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
      let newTracks = response.data.tracksWithinBounds;

      // Si el usuario seleccionó 'Último track', solo conserva el último track de cada vehículo
      if (trackView === 'last') {
        const lastTracks = {};
        newTracks.forEach(track => {
          const vehicleId = track.vehicleId;
          if (!lastTracks[vehicleId] || lastTracks[vehicleId].timestamp < track.timestamp) {
            lastTracks[vehicleId] = track;
          }
        });
        newTracks = Object.values(lastTracks);
      }

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

  const MapBounds = () => {
    const map = useMap();

    useEffect(() => {
      // Asegúrate de que el mapa esté completamente cargado antes de interactuar con él
      map.whenReady(() => {
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
      });
    }, [map]);

    return null;
  };

  const processTracks = async (allTracks) => {
    try {
      const response = await axios.post(`${URL}/api/tracks/processTracks`, { allTracks });
      setCarTracksGPSGeoJSON(response.data.carTracksGPSGeoJSON);
      setCarTracksGeoapifyGeoJSON(response.data.carTracksGeoapifyGeoJSON);
      setBicycleTracksGPSGeoJSON(response.data.bicycleTracksGPSGeoJSON);
      setBicycleTracksGeoapifyGeoJSON(response.data.bicycleTracksGeoapifyGeoJSON);
    } catch (error) {
      console.error('Error al procesar los tracks:', error);
    }
  };


  const MapClickHandler = ({ setPointA, setPointB, markerARef, markerBRef }) => {
    const map = useMap();
    const [routingControl, setRoutingControl] = useState(null);
    mapRef.current = map; // Actualiza la referencia al mapa

    const handleMapClick = async (e) => {
      if (!pointA) {
        setPointA(e.latlng);
        markerARef.current = L.marker(e.latlng, { icon: routeIcon }).addTo(map);
      } else if (!pointB) {
        setPointB(e.latlng);
        markerBRef.current = L.marker(e.latlng, { icon: routeIcon }).addTo(map);

        // Crea la ruta después de seleccionar el segundo punto
        const routeData = {
          from: {
            type: 'Point',
            coordinates: [pointA.lng, pointA.lat],
          },
          to: {
            type: 'Point',
            coordinates: [e.latlng.lng, e.latlng.lat],
          },
          AdminId: userInfo.UID, // Asegúrate de tener el ID del administrador disponible
        };

        try {
          const response = await axios.post(`${URL}/api/routes`, routeData);
          console.log(response.data);

          // Actualiza el estado de las rutas para incluir la nueva ruta
          setRoutes(prevRoutes => [...prevRoutes, response.data]);
        } catch (error) {
          console.error(`Error creating route: ${error}`);
        }
      } else {
        // Si ambos puntos ya están establecidos, restablece todo
        setPointA(e.latlng);
        setPointB(null);
        map.removeLayer(markerARef.current);
        map.removeLayer(markerBRef.current);
        markerARef.current = L.marker(e.latlng, { icon: routeIcon }).addTo(map);
        markerBRef.current = null;
      }
    };


    useEffect(() => {
      map.on('click', handleMapClick);
      return () => {
        map.off('click', handleMapClick);
      };
    }, [map, pointA, pointB]);

    useEffect(() => {
      routes.forEach(route => {
        const from = [route.from.coordinates[1], route.from.coordinates[0]]; // Recuerda que las coordenadas de Leaflet son [lat, lng]
        const to = [route.to.coordinates[1], route.to.coordinates[0]];

        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(from[0], from[1]),
            L.latLng(to[0], to[1])
          ],
          lineOptions: {
            styles: [{ color: 'black', opacity: 1, weight: 5 }]
          },
          createMarker: function () { return null; },
          router: new L.Routing.osrmv1({
            serviceUrl: 'http://localhost:5000/route/v1',
            language: 'es',
            profile: 'foot',
          }),
          routeWhileDragging: true,
        }).addTo(map);

        routingControlsRef.current.push(routingControl);
      });
    },);


    useEffect(() => {
      if (pointARef.current) {
        // Si ya existe un marcador para el punto A, lo elimina del mapa
        if (markerARef.current) {
          map.removeLayer(markerARef.current);
        }
        // Crea un nuevo marcador para el punto A y lo añade al mapa
        markerARef.current = L.marker([pointARef.current[0], pointARef.current[1]], { icon: routeIcon }).addTo(map);
      }
      if (pointBRef.current) {
        // Si ya existe un marcador para el punto B, lo elimina del mapa
        if (markerBRef.current) {
          map.removeLayer(markerBRef.current);
        }
        // Crea un nuevo marcador para el punto B y lo añade al mapa
        markerBRef.current = L.marker([pointBRef.current[0], pointBRef.current[1]], { icon: routeIcon }).addTo(map);
      }
    }, [pointARef.current, pointBRef.current]);


    useEffect(() => {
      if (pointARef.current && pointBRef.current) {
        if (routingControl) {
          // Si ya existe un control de enrutamiento, lo elimina del mapa
          map.removeControl(routingControl);
        }
        // Crea un nuevo control de enrutamiento con los puntos A y B actuales
        const newRoutingControl = L.Routing.control({
          waypoints: [
            L.latLng(pointARef.current[0], pointARef.current[1]),
            L.latLng(pointBRef.current[0], pointBRef.current[1])
          ],
          fitSelectedRoutes: false,
          lineOptions: {
            styles: [{ color: 'black', opacity: 1, weight: 5 }]
          },
          createMarker: function () { return null; },
          router: new L.Routing.osrmv1({
            serviceUrl: 'http://localhost:5000/route/v1',
            language: 'es',
            profile: 'foot',
          }),
          routeWhileDragging: true,
        }).addTo(map);
        routingControlRef.current.push(newRoutingControl);
      }
    }, [pointARef.current, pointBRef.current]);


    return null;
  };

  const handleRemoveRoutes = async () => {
    if (routes.length > 0) {
      try {
        const response = await axios.delete(`${URL}/api/routes`);
        console.log('Rutas borradas');
        routingControlRef.current.forEach(routingControl => {
          mapRef.current.removeControl(routingControl);
        });
        routingControlRef.current = [];
        setRoutes([]); // Aquí actualizas el estado para que no haya rutas
        setMapKey(Math.random()); // Actualiza la clave del mapa para forzar su re-renderizado
      } catch (error) {
        console.error(`Error al borrar la ruta: ${error}`);
      }
    } else {
      console.log("Nada que borrar");
    }
  };

  const RoutingMachine = ({ trackCoordinates }) => {
    const map = useMap();

    useEffect(() => {
      if (trackCoordinates.length > 1) {
        console.log("trackView:", trackView); // Añade esta línea

        let routingControl = L.Routing.control({
          waypoints: trackCoordinates.map(coord => L.latLng(coord[0], coord[1])),
          routeWhileDragging: false,
          draggableWaypoints: false,
          fitSelectedRoutes: false,
          showAlternatives: false,
          router: new L.Routing.osrmv1({
            serviceUrl: 'http://localhost:5000/route/v1',
            language: 'es',
            profile: 'foot',
          }),
          addWaypoints: trackView === 'last' ? false : true,
          show: false, // Cambia esta línea
          routeLine: function (route, options) {
            return L.polyline(route.coordinates, { color: trackView === 'last' ? 'orange' : 'blue', opacity: 1, weight: 5 });
          },
          createMarker: function () { return null; },
        }).addTo(map);



      }
    }, [map, trackCoordinates]);

    return null;
  };

  const renderTracksOnMap = (vehicleType, view) => {
    let tracksGeoJSON;
    if (vehicleType === 'car') {
      if (method === 'GPS') {
        tracksGeoJSON = carTracksGPSGeoJSON;
      } else if (method === 'Geoapify') {
        tracksGeoJSON = carTracksGeoapifyGeoJSON;
      }
    } else if (vehicleType === 'bicycle') {
      if (method === 'GPS') {
        tracksGeoJSON = bicycleTracksGPSGeoJSON;
      } else if (method === 'Geoapify') {
        tracksGeoJSON = bicycleTracksGeoapifyGeoJSON;
      }
    }

    if (!tracksGeoJSON) {
      return null;
    }

    // Filtrar los tracks basándose en la vista
    let tracksToRender;
    if (view === 'last') {
      if (tracksGeoJSON && tracksGeoJSON.features) {
        // Agrupar los tracks por el ID del vehículo
        let tracksByVehicleId = {};
        tracksGeoJSON.features.forEach(feature => {
          const track = feature.properties;
          if (!tracksByVehicleId[track.vehicleId]) {
            tracksByVehicleId[track.vehicleId] = [];
          }
          tracksByVehicleId[track.vehicleId].push(feature);
        });

        // Para cada vehículo, seleccionar solo el último track
        tracksToRender = Object.values(tracksByVehicleId).map(tracks => tracks[tracks.length - 1]);
      } else {
        tracksToRender = [];
      }
    } else {
      tracksToRender = tracksGeoJSON && tracksGeoJSON.features ? tracksGeoJSON.features : [];
    }

    // Agrupar los tracks por el ID del vehículo
    let tracksByVehicleId = {};
    tracksToRender.forEach(feature => {
      const track = feature.properties;
      if (!tracksByVehicleId[track.vehicleId]) {
        tracksByVehicleId[track.vehicleId] = [];
      }
      tracksByVehicleId[track.vehicleId].push(feature.geometry.coordinates);
    });

    return (
      <React.Fragment>
        {Object.keys(tracksByVehicleId).map(vehicleId => {
          const trackCoordinates = tracksByVehicleId[vehicleId];
          return (
            <RoutingMachine key={vehicleId} trackCoordinates={trackCoordinates} />
          );
        })}
        {tracksToRender.map((feature, index) => {
          const track = feature.properties;
          const coordinates = feature.geometry.coordinates;

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
                <p>{`Type: ${track.type}`}</p>
                <p>{`Speed: ${track.speed}`}</p>
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
      <div>
        <Select
          style={{ width: 200 }}
          placeholder="Selecciona un método"
          optionFilterProp="children"
          onChange={value => {
            setMethod(value);
          }}>
          <Option value='GPS' />
          <Option value='Geoapify' />
        </Select>
      </div>
      <input
        type="text"
        value={placeA}
        onChange={e => setPlaceA(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            handlePlaceSubmit(placeA, setPointA, pointARef);
            console.log(pointARef.current);
          }
        }}
      />
      <input
        type="text"
        value={placeB}
        onChange={e => setPlaceB(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            handlePlaceSubmit(placeB, setPointB, pointBRef);
            console.log(pointBRef);
          }
        }}
      />
      <button onClick={handleRemoveRoutes}>Eliminar rutas</button>
      <div style={{ height: '500px', width: '100%' }}>
      <MapContainer key={mapKey} center={mapPositionRef.current} zoom={mapZoomRef.current} style={{ height: '100%', width: '100%' }}>          <MapClickHandler setPointA={setPointA} setPointB={setPointB} markerARef={markerARef} markerBRef={markerBRef} />
          <MapBounds />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <CustomControl />
          <LayersControl key={`${trackView}-${Date.now()}`} position="topleft">
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

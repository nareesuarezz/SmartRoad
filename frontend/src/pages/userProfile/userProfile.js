import "./userProfile.css"
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import MenuUserInfo from "../../components/menuUserInfo/MenuUserInfo.js";
import ProfilePictureUser from "../../components/profilePictureUser/profilePictureUser.js";
import axios from 'axios';
import { useState, useEffect } from 'react';

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
  }, []); // El array vacío significa que este efecto se ejecutará solo una vez, cuando se monte el componente


  return (
    <>
      <header>
        <div className="top-components">
          <div className='arrow' onClick={() => goBack()}>
            <ArrowLeftOutlined />
          </div>
          <div className="menuUserInfo">
            <MenuUserInfo />
          </div>
        </div>
        <div className='profile'>
          <ProfilePictureUser />
          <EditOutlined onClick={() => setShowEditImage(!showEditImage)} />
        </div>
        <div className='username'>
          <h1>{userInfo.Username}</h1>
          <EditOutlined onClick={() => setShowEditUsername(!showEditUsername)} />
        </div>
      </header>
      <div>
        <h2>Here you will see you stats:</h2>
        <p>Car Time = {carTime}</p>
        <p>Bicycle Time = {bicycleTime}</p>
        <p>Total Time = {totalTime}</p>
        <p>Car Km = {(carDistance / 1000).toFixed(2)} Km</p>
        <p>Bicycle Km = {(bicycleDistance / 1000).toFixed(2)} Km</p>
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
    </>
  );
}

export default UserProfile;

import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import MenuUserInfo from "../../components/menuUserInfo/MenuUserInfo.js";
import ProfilePictureUser from "../../components/profilePictureUser/profilePictureUser.js";
import axios from 'axios';
import { useState, useEffect } from 'react';

const URL = process.env.REACT_APP_LOCALHOST_URL;

function UserProfile() {
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [showEditImage, setShowEditImage] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [formData, setFormData] = useState({
    Image: null,
    Username: '',
  });
  const [previewImage, setPreviewImage] = useState('');
  const [carTime, setCarTime] = useState(null);
  const [carDistance, setCarDistance] = useState(0);
  const [bicycleDistance, setBicycleDistance] = useState(0);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));



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

    // Llama a la función que acabas de definir
    fetchTotalDistance();
  }, []); // El array vacío significa que este efecto se ejecutará solo una vez, cuando se monte el componente


  return (
    <>
      <header>
        <div className='arrow' onClick={() => goBack()}>
          <ArrowLeftOutlined />
        </div>
        <div className='profile'>
          <ProfilePictureUser />
          <EditOutlined onClick={() => setShowEditImage(!showEditImage)} />
        </div>
        <div className='username'>
          <h1>{userInfo.Username}</h1>
          <EditOutlined onClick={() => setShowEditUsername(!showEditUsername)} />
        </div>
        <MenuUserInfo />
      </header>
      <div>
        <h2>Here you will see you stats:</h2>
        <p>Car Time = {carTime ? `${carTime.hours} horas, ${carTime.minutes} minutos` : 'Cargando...'}</p>
        <p>Car Km = {(carDistance / 1000).toFixed(2)}</p> 
        <p>Bicycle Km = {(bicycleDistance / 1000).toFixed(2)}</p> 
        <p>Total Km = {(totalDistance / 1000).toFixed(2)}</p>
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

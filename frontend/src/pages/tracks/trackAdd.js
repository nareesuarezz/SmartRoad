import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './trackAdd.css';
import AuthService from '../../services/authService';

const TrackAdd = ({ getTracks }) => {
  const [formData, setFormData] = useState({
    Latitude: '',
    Longitude: '',
    Status: '',
    Speed: '',
    Extra: '',
    Vehicle_UID: '',
  });

  // Agrega el estado para almacenar el ID del admin
  const [adminId, setAdminId] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLocationChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const goBack = () => {
    window.location.href = "/track-list";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Recupera el token del almacenamiento local
    const authToken = AuthService.getAuthToken();

    const config = {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    };

    if (!formData.Latitude || !formData.Longitude || !formData.Status || !formData.Speed || !formData.Vehicle_UID) {
      const missingFields = Object.entries(formData)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      alert(`Por favor, complete los siguientes campos: ${missingFields.join(', ')}`);
      return;
    }

    const location = {
      type: 'Point',
      coordinates: [parseFloat(formData.Longitude), parseFloat(formData.Latitude)],
    };

    try {
      await axios.post('http://localhost:8080/api/tracks', {
        ...formData,
        Location: location,
        Admin_UID: adminId,
      }, config);
      goBack();
    } catch (error) {
      console.error('Error adding track:', error);
    }
  };

  useEffect(() => {
    // Obtén el ID del admin cuando el componente se monta
    const fetchAdminId = async () => {
      try {
        const authToken = AuthService.getAuthToken();
        const decodedToken = AuthService.decodeAuthToken(authToken);
        setAdminId(decodedToken.UID);
      } catch (error) {
        console.error('Error fetching admin ID:', error);
      }
    };

    fetchAdminId();
  }, []);

  return (
    <>
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <form onSubmit={handleSubmit}>
        <label>
          Latitude:
          <input type="text" name="Latitude" value={formData.Latitude} onChange={(e) => handleLocationChange('Latitude', e.target.value)} />
        </label>
        <label>
          Longitude:
          <input type="text" name="Longitude" value={formData.Longitude} onChange={(e) => handleLocationChange('Longitude', e.target.value)} />
        </label>
        <label>
          Status:
          <select name="Status" value={formData.Status} onChange={handleChange}>
            <option value="">Select</option>
            <option value="stopped">Stopped</option>
            <option value="moving">Moving</option>
          </select>
        </label>
        <label>
          Speed:
          <input type="text" name="Speed" value={formData.Status === 'stopped' ? '0' : formData.Speed} onChange={handleChange} />
        </label>
        <label>
          Extra:
          <input type="text" name="Extra" value={formData.Extra} onChange={handleChange} />
        </label>
        <label>
          Vehicle UID:
          <input type="text" name="Vehicle_UID" value={formData.Vehicle_UID} onChange={handleChange} />
        </label>
        <button type="submit">Add Track</button>
      </form>
    </>
  );
};

export default TrackAdd;

import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';

const TrackAdd = ({ getTracks }) => {
  const [formData, setFormData] = useState({
    Latitude: '',
    Longitude: '',
    Status: '',
    Speed: '',
    Extra: '',
    Vehicle_UID: '',
  });

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
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Combina la latitud y la longitud en el formato esperado por el backend
    const location = {
      type: 'Point',
      coordinates: [parseFloat(formData.Longitude), parseFloat(formData.Latitude)],
    };

    try {
      await axios.post('http://localhost:8080/api/tracks', {
        ...formData,
        Location: location,
      });
      goBack();
    } catch (error) {
      console.error('Error adding track:', error);
    }
  };

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
        <input type="text" name="Status" value={formData.Status} onChange={handleChange} />
      </label>
      <label>
        Speed:
        <input type="text" name="Speed" value={formData.Speed} onChange={handleChange} />
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

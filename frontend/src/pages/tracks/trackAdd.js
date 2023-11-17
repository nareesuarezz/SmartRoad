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
          <select name="Status" value={formData.Status} onChange={handleChange}>
            <option value="">Select</option>
            <option value="stopped">Stopped</option>
            <option value="moving">Moving</option>
          </select>
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

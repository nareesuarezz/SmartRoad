import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';

const VehicleAdd = ({ getVehicles }) => {
  const [formData, setFormData] = useState({
    Vehicle: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const goBack = () => {
    window.location.href = "/vehicle-list";
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.Vehicle) {
      alert('Por favor, inserta un vehiculo.');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/vehicles', {
        ...formData,
      });
      goBack();
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <>
    <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
    <form onSubmit={handleSubmit}>
      <label>
        Vehicle:
        <input type="text" name="Vehicle" value={formData.Vehicle} onChange={handleChange} />
      </label>
      <button type="submit">Add Vehicle</button>
    </form>
    </>
  );
};

export default VehicleAdd;

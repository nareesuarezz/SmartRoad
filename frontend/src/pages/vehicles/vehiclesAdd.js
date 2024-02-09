import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';

const URL = process.env.LOCAHOST_URL;

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


    try {
      await axios.post(`${URL}/api/vehicles`, {
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
          <select name="Vehicle" value={formData.Vehicle} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
          </select>
        </label>
      <button type="submit" className="submit">Add Vehicle</button>
    </form>
    </>
  );
};

export default VehicleAdd;

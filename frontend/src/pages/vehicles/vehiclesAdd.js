import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';

const URL = process.env.REACT_APP_LOCALHOST_URL;

const VehicleAdd = ({ getVehicles }) => {
  const { t } = useTranslation();

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
      <div>
        <LanguageSwitcher />
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          {t('Vehicle')}:
          <select name="Vehicle" value={formData.Vehicle} onChange={handleChange}>
            <option value="">{t('Select')}</option>
            <option value="Car"></option>
            <option value="Bike">{t('Bike')}</option>
          </select>
        </label>
        <button type="submit" className="submit">{t('Add Vehicle')}</button>
      </form>
    </>
  );
};

export default VehicleAdd;

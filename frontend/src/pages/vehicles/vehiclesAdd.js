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
    Admin_UID: '',
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
            <option value="car">{t('Car')}</option>
            <option value="bicycle">{t('Bike')}</option>
          </select>
        </label>
        <label>
          {t('Admin_UID')}:
          <input type="text" name="Admin_UID" value={formData.Admin_UID} onChange={handleChange} />
        </label>
        <button type="submit" className="submit">{t('Add Vehicle')}</button>
      </form>
    </>
  );
};

export default VehicleAdd;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './trackAdd.css';
import AuthService from '../../services/authService';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';

const URL = process.env.REACT_APP_LOCALHOST_URL;

const TrackAdd = ({ getTracks }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    Latitude: '',
    Longitude: '',
    Status: '',
    Speed: '',
    Extra: '',
    Vehicle_UID: '',
  });

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

    const authToken = AuthService.getAuthToken();

    const config = {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    };

    if (!formData.Latitude || !formData.Longitude || !formData.Status || (!formData.Speed && formData.Status !== 'stopped') || !formData.Vehicle_UID) {
      const missingFields = Object.entries(formData)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      alert(`Please complete the following fields: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.Status === 'moving' && formData.Speed === '0') {
      alert("Error: You can't put 0 speed on a moving vehicle.");
      return;
    }

    if (formData.Status === 'Select') {
      alert('Error: Select a type of status for the vehicle.');
      return;
    }

    const location = {
      type: 'Point',
      coordinates: [parseFloat(formData.Longitude), parseFloat(formData.Latitude)],
    };

    try {
      await axios.post(`${URL}/api/tracks`, {
        ...formData,
        Location: location,
        Admin_UID: adminId,
        Speed: formData.Status === 'stopped' ? 0 : formData.Speed,
      }, config);
      goBack();
    } catch (error) {
      console.error('Error adding track:', error);
    }
  }

  useEffect(() => {

  }, []);

  return (
    <>
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <div>
        <LanguageSwitcher />
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          {t('Latitude')}:
          <input type="text" name="Latitude" value={formData.Latitude} onChange={(e) => handleLocationChange('Latitude', e.target.value)} />
        </label>
        <label>
          {t('Longitude')}:
          <input type="text" name="Longitude" value={formData.Longitude} onChange={(e) => handleLocationChange('Longitude', e.target.value)} />
        </label>
        <label>
          {t('Status')}
          <select name="Status" value={formData.Status} onChange={handleChange}>
            <option value="select">{t('Select')}</option>
            <option value="stopped">{t('Stopped')}</option>
            <option value="moving">{t('Moving')}</option>
          </select>
        </label>
        <label>
          {t('Speed')}:
          <input type="text" name="Speed" value={formData.Status === 'stopped' ? '0' : formData.Speed} onChange={handleChange} disabled={formData.Status === 'stopped'} />
        </label>
        <label>
          {t('Extra')}:
          <input type="text" name="Extra" value={formData.Extra} onChange={handleChange} />
        </label>
        <label>
          {t('Vehicle_UID')}:
          <input type="text" name="Vehicle_UID" value={formData.Vehicle_UID} onChange={handleChange} />
        </label>
        <button type="submit">{t('Add Track')}</button>
      </form>
    </>
  );
};

export default TrackAdd;

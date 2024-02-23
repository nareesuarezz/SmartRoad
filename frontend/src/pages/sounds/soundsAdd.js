import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
const URL = process.env.REACT_APP_LOCALHOST_URL;


const SoundAdd = ({ getAdmins }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    Sound: null,
  });

  const goBack = () => {
    window.location.href = "/sound-list";
  };

  const handleChange = (e) => {
    if (e.target.name === 'Sound') {
      setFormData({
        ...formData,
        Sound: e.target.files[0],
      });

    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.Sound) {
      alert('Por favor, seleccione un archivo de sonido.');
      return;
    }

    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('filename', formData.Sound);

      await axios.post(`${URL}/api/sounds`, formDataForUpload);
      goBack();
    } catch (error) {
      console.error('Error adding sound:', error);
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
          {t('Sound')}:
          <input type="file" name="Sound" onChange={handleChange} accept="audio/*" />
        </label>
        <button type="submit">{t('Add Sound')}</button>
      </form>
    </>
  );
};

export default SoundAdd;

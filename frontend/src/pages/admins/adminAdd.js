import React, { useState, useTransition } from 'react';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
import "./adminAdd.css"

const URL = process.env.REACT_APP_LOCALHOST_URL;

const AdminAdd = ({ getAdmins }) => {

  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    Username: '',
    Password: '',
    Role: '',
    Image: null,
  });

  const [previewImage, setPreviewImage] = useState('');

  const goBack = () => {
    window.location.href = "/admin-list";
  };

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

    if (!formData.Username || !formData.Password) {
      const missingFields = [];
      if (!formData.Username) {
        missingFields.push('Username');
      }
      if (!formData.Password) {
        missingFields.push('Password');
      }
      if (!formData.Role) {
        missingFields.push('Role');
      }
      if (!formData.Image) {
        missingFields.push('Image');
      }

      alert(`Por favor, complete los siguientes campos: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('Username', formData.Username);
      formDataForUpload.append('Password', formData.Password);
      formDataForUpload.append('Role', formData.Role);
      formDataForUpload.append('filename', formData.Image);

      await axios.post(`${URL}/api/admins`, formDataForUpload);
      goBack();
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  return (
    <>
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <div className='language-switcher-adAdd'>
        <LanguageSwitcher />
      </div>
      <form onSubmit={handleSubmit} className='admins-add-form'>
        <label>
          {t('Username')}:
        </label>
        <input type="text" name="Username" value={formData.Username} onChange={handleChange} />
        <label>
          {t('Password')}:
        </label>
        <input type="password" name="Password" value={formData.Password} onChange={handleChange} />
        <label>
          {t('Role')}:
        </label>
        <select name="Role" value={formData.Role} onChange={handleChange}>
          <option value="">{t('Select')}</option>
          <option value="Admin">{t('Admin')}</option>
          <option value="User">{t('User')}</option>
        </select>
        <label>
          {t('Image')}:
        </label>
        <input type="file" name="Image" onChange={handleChange} accept="image/*" />
        {previewImage && (
          <div className="image-preview">
            <img src={previewImage} alt="Preview" />
          </div>
        )}
        <button type="submit">{t('Add Admin')}</button>
      </form>
    </>
  );
};

export default AdminAdd;
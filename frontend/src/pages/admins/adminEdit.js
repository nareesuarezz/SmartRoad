import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';

const URL = process.env.REACT_APP_LOCALHOST_URL;

const AdminEdit = ({ getAdmins }) => {

  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    Username: '',
    Password: '',
    Image: null,
  });

  const [previewImage, setPreviewImage] = useState('');
  const [adminInfo, setAdminInfo] = useState(null);

  const goBack = () => {
    navigate('/admin-list');
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(`${URL}/api/admins/${id}`);
        const adminData = response.data;

        setFormData({
          Username: adminData.Username,
          Password: '',
          Image: null,
        });

        setPreviewImage(`${URL}/uploads/${adminData.filename}`);
        setAdminInfo(adminData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, [id]);

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

    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('Username', formData.Username);
      formDataForUpload.append('Password', formData.Password);

      if (formData.Image) {
        formDataForUpload.append('filename', formData.Image);
      }

      await axios.put(`${URL}/api/admins/${id}`, formDataForUpload);

      const updatedAdminData = await axios.get(`${URL}/api/admins/${id}`);
      setAdminInfo(updatedAdminData.data);
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
      if ((adminInfo.UID + "") == id) {
        localStorage.setItem('adminInfo', JSON.stringify(updatedAdminData.data));
      }

      goBack();
    } catch (error) {
      console.error(`Error updating admin with id=${id}:`, error);
    }
  };

  return (
    <>
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <div>
        <LanguageSwitcher />
      </div>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          {t('Username')}:
          <input type="text" name="Username" value={formData.Username} onChange={handleChange} />
        </label>
        <label>
          {t('Password')}:
          <input type="password" name="Password" value={formData.Password} onChange={handleChange} />
        </label>
        <label>
          {t('Image')}:
          <input type="file" name="Image" onChange={handleChange} accept="image/*" />
          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Preview" />
            </div>
          )}
        </label>
        <button type="submit">{t('Edit Admin')}</button>
      </form>
    </>
  );
};

export default AdminEdit;

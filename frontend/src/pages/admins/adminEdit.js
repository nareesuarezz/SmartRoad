// AdminEdit.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const AdminEdit = ({ getAdmins }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        Username: '',
        Password: '',
        Image: null,
    });

    const [previewImage, setPreviewImage] = useState('');

    const goBack = () => {
        navigate('/admin-list');
    };

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/admins/${id}`);
                const adminData = response.data;

                setFormData({
                    Username: adminData.Username,
                    Password: adminData.Password,
                });

                setPreviewImage(`http://localhost:8080/uploads/${adminData.filename}`);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            }
        };

        fetchAdminData();
    }, [id]);

    const handleChange = (e) => {
        if (e.target.name === 'Image') {
            setFormData({
                ...formData,
                Image: e.target.files[0],  
            });
    
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
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
      
          await axios.put(`http://localhost:8080/api/admins/${id}`, formDataForUpload);
          goBack();
        } catch (error) {
          console.error(`Error updating admin with id=${id}:`, error);
        }
      };
      

    return (
        <>
            <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" name="Username" value={formData.Username} onChange={handleChange} />
                </label>
                <label>
                    Password:
                    <input type="text" name="Password" value={formData.Password} onChange={handleChange} />
                </label>
                <label>
                    Image:
                    <input type="file" name="Image" onChange={handleChange} accept="image/*" />
                    {previewImage && (
                        <div className="image-preview">
                            <img src={previewImage} alt="Preview" />
                        </div>
                    )}
                </label>
                <button type="submit">Edit Admin</button>
            </form>
        </>
    );
};

export default AdminEdit;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AuthService from '../../services/authService';

const URL = process.env.REACT_APP_LOCALHOST_URL;

const TrackEdit = ({ getTracks }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        Latitude: '',
        Longitude: '',
        Status: '',
        Speed: '',
        Extra: '',
        Vehicle_UID: '',
    });

    const [adminId, setAdminId] = useState(null);

    const goBack = () => {
        navigate('/track-list');
    };

    useEffect(() => {
        const fetchTrackData = async () => {
            try {
                const response = await axios.get(`${URL}/api/tracks/${id}`);
                const trackData = response.data;

                if (trackData.Location && trackData.Location.coordinates) {
                    setFormData({
                        ...trackData,
                        Latitude: trackData.Location.coordinates[1].toString(),
                        Longitude: trackData.Location.coordinates[0].toString(),
                    });
                } else {
                    console.error('Invalid location data:', trackData.Location);
                }
            } catch (error) {
                console.error('Error fetching track data:', error);
            }
        };

        fetchTrackData();
    }, [id]);

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

        if (formData.Status === 'moving' && Number(formData.Speed) === 0) {
          alert("Error: You can't put 0 speed on a moving vehicle.");
          return;
        }

        const location = {
          type: 'Point',
          coordinates: [parseFloat(formData.Longitude), parseFloat(formData.Latitude)],
        };

        try {
            await axios.put(`${URL}/api/tracks/${id}`, {
            ...formData,
            Location: location,
            Admin_UID: adminId,
            Speed: formData.Status === 'stopped' ? 0 : formData.Speed,
          }, config);
          goBack();
        } catch (error) {
          console.error('Error updating track:', error);
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
                    <input type="text" name="Speed" value={formData.Status === 'stopped' ? '0' : formData.Speed} onChange={handleChange} disabled={formData.Status === 'stopped'} />
                </label>
                <label>
                    Extra:
                    <input type="text" name="Extra" value={formData.Extra} onChange={handleChange} />
                </label>
                <label>
                    Vehicle UID:
                    <input type="text" name="Vehicle_UID" value={formData.Vehicle_UID} onChange={handleChange} />
                </label>
                <button type="submit">Update Track</button>
            </form>
        </>
    );
};

export default TrackEdit;

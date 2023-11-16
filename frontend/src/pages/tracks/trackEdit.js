import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

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

    const goBack = () => {
        navigate('/track-list');
    };

    useEffect(() => {
        const fetchTrackData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/tracks/${id}`);
                const trackData = response.data;

                // Asegúrate de que Location esté en el formato correcto antes de asignarlo
                if (trackData.Location && trackData.Location.coordinates) {
                    // Asigna los datos de la ubicación al estado del formulario
                    setFormData({
                        ...trackData,
                        Latitude: trackData.Location.coordinates[1].toString(),
                        Longitude: trackData.Location.coordinates[0].toString(),
                    });
                } else {
                    console.error('Datos de ubicación no válidos:', trackData.Location);
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

        const location = {
            type: 'Point',
            coordinates: [parseFloat(formData.Longitude), parseFloat(formData.Latitude)],
        };

        try {
            await axios.put(`http://localhost:8080/api/tracks/${id}`, {
                ...formData,
                Location: location,
            });
            goBack();
        } catch (error) {
            console.error(`Error editing track with id=${id}:`, error);
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
                    <input type="text" name="Status" value={formData.Status} onChange={handleChange} />
                </label>
                <label>
                    Speed:
                    <input type="text" name="Speed" value={formData.Speed} onChange={handleChange} />
                </label>
                <label>
                    Extra:
                    <input type="text" name="Extra" value={formData.Extra} onChange={handleChange} />
                </label>
                <label>
                    Vehicle UID:
                    <input type="text" name="Vehicle_UID" value={formData.Vehicle_UID} onChange={handleChange} />
                </label>
                <button type="submit">Edit Track</button>
            </form>
        </>
    );
};

export default TrackEdit;

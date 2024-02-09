import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const SoundEdit = ({ getSounds }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({

        Sound: null,
    });

    const [soundInfo, setSoundInfo] = useState(null);

    const goBack = () => {
        navigate('/sound-list');
    };

    useEffect(() => {
        const fetchSoundData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/sounds/${id}`);
                const soundData = response.data;

                setFormData({
                    Sound: soundData.Sound,
                });

                setSoundInfo(soundData);
            } catch (error) {
                console.error('Error fetching sound data:', error);
            }
        };

        fetchSoundData();
    }, [id]);

    const handleChange = (e) => {
        if (e.target.name === 'Sound') {
            const file = e.target.files[0];
            setFormData({
                ...formData,
                Sound: file,
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

        try {
            const formDataForUpload = new FormData();
            if (formData.Sound) {
                formDataForUpload.append('filename', formData.Sound);
            }

            await axios.put(`http://localhost:8080/api/sounds/${id}`, formDataForUpload);

            const updatedSoundData = await axios.get(`http://localhost:8080/api/sounds/${id}`);
            setSoundInfo(updatedSoundData.data);
            const soundInfo = JSON.parse(localStorage.getItem('soundInfo'));
            if (soundInfo && (soundInfo.id + "") === id) {
                localStorage.setItem('soundInfo', JSON.stringify(updatedSoundData.data));
            }


            goBack();
        } catch (error) {
            console.error(`Error updating sound with id=${id}:`, error);
        }
    };

    return (
        <>
            <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <label>
                    Sound:
                    <input type="file" name="Sound" onChange={handleChange} accept="audio/*" />
                </label>
                <button type="submit">Edit Sound</button>
            </form>
        </>
    );
};

export default SoundEdit;

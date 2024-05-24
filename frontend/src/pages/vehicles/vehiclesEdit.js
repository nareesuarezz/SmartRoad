import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
import "./vehiclesEdit.css"

const URL = process.env.REACT_APP_LOCALHOST_URL;

const VehicleEdit = ({ getVehicles }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        Vehicle: ''
    });

    const goBack = () => {
        navigate('/vehicle-list');
    };

    useEffect(() => {
        const fetchVehicleData = async () => {
            try {
                const response = await axios.get(`${URL}/api/vehicles/${id}`);
                const vehicleData = response.data;

                setFormData({
                    Vehicle: vehicleData.Vehicle
                });
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
            }
        };

        fetchVehicleData();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        try {
            await axios.put(`${URL}/api/vehicles/${id}`, {
                ...formData,
            });
            goBack();
        } catch (error) {
            console.error(`Error editing vehicle with id=${id}:`, error);
        }
    };

    return (
        <>
            <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
            <div className='language-switcher-vhEdit'>
                <LanguageSwitcher />
            </div>
            <form onSubmit={handleSubmit} className='vehicles-edit-form'>
                <label>
                    {t('Vehicle')}:
                </label>
                <select name="Vehicle" value={formData.Vehicle} onChange={handleChange}>
                    <option value="">{t('Select')}</option>
                    <option value="bicycle">{t('Bicycle')}</option>
                    <option value="car">{t('Car')}</option>
                </select>
                <button type="submit">{t('Edit Vehicle')}</button>
            </form>
        </>
    );
};

export default VehicleEdit;

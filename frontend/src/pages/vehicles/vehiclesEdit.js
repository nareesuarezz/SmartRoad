import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const VehicleEdit = ({ getVehicles }) => {
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
                const response = await axios.get(`http://localhost:8080/api/vehicles/${id}`);
                const vehicleData = response.data;
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
            await axios.put(`http://localhost:8080/api/vehicles/${id}`, {
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
            <form onSubmit={handleSubmit}>
                <label>
                    Vehicle:
                    <select name="Status" value={formData.Status} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="stopped">Bike</option>
                        <option value="moving">Car</option>
                    </select>
                </label>
                <button type="submit">Edit Vehicle</button>
            </form>
        </>
    );
};

export default VehicleEdit;

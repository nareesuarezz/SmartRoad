import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';

const URL = process.env.REACT_APP_LOCALHOST_URL;

const VehicleList = () => {
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState([]);

  const [vehicleT, setVehicleT] = useState('');

  const [adminUID, setAdminUID] = useState('');

  useEffect(() => {
    getVehicles(vehicleT, adminUID);
  }, [vehicleT, adminUID]);

  const getVehicles = async (vehicleType = '', adminUID = '') => {
    try {
      let response

      if (vehicleType) {
        response = await axios.get(`${URL}/api/vehicles/findByVehicleType/${vehicleType}`);
      }
      else if (adminUID) {
        response = await axios.get(`${URL}/api/vehicles/findByAdminUID/${adminUID}`);
      }
      else {
        response = await axios.get(`${URL}/api/vehicles`)
      }
      setVehicles(response.data)

    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  }

  const deleteVehicle = async (id) => {
    try {
      await axios.delete(`${URL}/api/vehicles/${id}`);
      getVehicles(vehicleT, adminUID);
    } catch (error) {
      console.error(`Error deleting vehicle with id=${id}:`, error);
    }
  };

  const handleVehicleGetter = (e) => {
    setVehicleT(e.target.value)
  }

  const handleAdminUIDGetter = (e) => {
    setAdminUID(e.target.value)
  }

  const goBack = () => {
    window.location.href = '/login-user';
  };

  return (
    <div>
      <Header />
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <div>
        <LanguageSwitcher />
      </div>
      <Link to="/vehicle-add" className="add">
        {t('Add New Vehicle')}
      </Link>
      <div className='vehiclesFilters'>
        <label>Vehicle:</label>
        <span> </span>
        <select name="Vehicle" value={vehicleT} onChange={handleVehicleGetter}>
          <option value="">Select</option>
          <option value="Car">Car</option>
          <option value="Bicycle">Bicycle</option>
        </select>
        <input type='text' placeholder='Admin_UID' onChange={handleAdminUIDGetter}></input>
      </div>

      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>ID</th>
            <th>{t('Vehicle')}</th>
            <th>{t('Admin_UID')}</th>
            <th>{t('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle, index) => (
            <tr key={vehicle.UID}>
              <td>{vehicle.UID}</td>
              <td>{vehicle.Vehicle}</td>
              <td>{vehicle.Admin_UID}</td>
              <td>
                <Link to={`/vehicle-edit/${vehicle.UID}`} className="edit">
                  {t('Edit')}
                </Link>
                <Link to="#" onClick={() => deleteVehicle(vehicle.UID)} className="delete">
                  {t('Delete')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;

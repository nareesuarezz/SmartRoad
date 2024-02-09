import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';

const URL = process.env.LOCALHOST_URL;

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    getVehicles();
  }, []);

  const getVehicles = async () => {
    try {
      const response = await axios.get(`${URL}/api/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await axios.delete(`${URL}/api/vehicles/${id}`);
      getVehicles();
    } catch (error) {
      console.error(`Error deleting vehicle with id=${id}:`, error);
    }
  };

  const goBack = () => {
    window.location.href = "/login";
  }

  return (
    <div>
      <Header/>
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <Link to="/vehicle-add" className="add">
        Add New Vehicle
      </Link>

      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehicle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle, index) => (
            <tr key={vehicle.UID}>
              <td>{vehicle.UID}</td>
              <td>{vehicle.Vehicle}</td>
              <td>
                <Link to={`/vehicle-edit/${vehicle.UID}`} className="edit">
                  Edit
                </Link>
                <Link to="#" onClick={() => deleteVehicle(vehicle.UID)} className="delete">
                  Delete
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

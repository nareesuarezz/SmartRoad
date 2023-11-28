// Importa las dependencias necesarias
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './trackList.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import AuthService from '../../services/authService'; // Asegúrate de importar AuthService

const TrackList = () => {
  const [tracks, setTracks] = useState([]);
  const [adminId, setAdminId] = useState(null); 

  useEffect(() => {
    getTracks();
    fetchAdminId(); 
  }, []);

  const getTracks = async () => {
    try {
      const authToken = AuthService.getAuthToken();
      const response = await axios.get('http://localhost:8080/api/tracks', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setTracks(response.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

 const deleteTrack = async (id) => {
  try {
    const trackToDelete = await axios.get(`http://localhost:8080/api/tracks/${id}`);

    await axios.post('http://localhost:8080/api/log', {
      action: 'DELETE',
      trackId: id,
      adminId,
      trackData: trackToDelete.data,  
    });

    await axios.delete(`http://localhost:8080/api/tracks/${id}`);

    getTracks();
  } catch (error) {
    console.error(`Error deleting track with id=${id}:`, error);
  }
};

  

  const goBack = () => {
    window.location.href = "/login";
  };

  const fetchAdminId = async () => {
    try {
      const authToken = AuthService.getAuthToken();
      const decodedToken = AuthService.decodeAuthToken(authToken);
      setAdminId(decodedToken.UID);
    } catch (error) {
      console.error('Error fetching admin ID:', error);
    }
  };

  return (
    <div>
      <Header />
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <Link to="/track-add" className="add">
        Add New Track
      </Link>

      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>Track nº</th>
            <th>Location</th>
            <th>Status</th>
            <th>Speed</th>
            <th>Extra</th>
            <th>Vehicle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => (
            <tr key={track.ID}>
              <td>{track.ID}</td>
              <td>{track.Location.coordinates.join(', ')}</td>
              <td>{track.Status}</td>
              <td>{track.Speed}</td>
              <td>{JSON.stringify(track.Extra)}</td>
              <td>{track.Vehicle_UID}</td>
              <td>
                <Link to={`/track-edit/${track.ID}`} className="edit">
                  Edit
                </Link>
                <Link to="#" onClick={() => deleteTrack(track.ID)} className="delete">
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

export default TrackList;

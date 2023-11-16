// Importa las dependencias necesarias
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './trackList.css';
import { ArrowLeftOutlined } from '@ant-design/icons';

const TrackList = () => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    getTracks();
  }, []);

  const getTracks = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tracks');
      setTracks(response.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const deleteTrack = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/tracks/${id}`);
      getTracks();
    } catch (error) {
      console.error(`Error deleting track with id=${id}:`, error);
    }
  };

  const goBack = () => {
    window.location.href = "/login";
  }

  return (
    <div>
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <Link to="/track-add" className="button is-primary mt-2">
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
              <td>{index + 1}</td>
              <td>{track.Location.coordinates.join(', ')}</td>
              <td>{track.Status}</td>
              <td>{track.Speed}</td>
              <td>{JSON.stringify(track.Extra)}</td>
              <td>{track.Vehicle_UID}</td>
              <td>
                <Link to={`/edit/${track.ID}`} className="button is-small is-info">
                  Edit
                </Link>
                <button onClick={() => deleteTrack(track.ID)} className="button is-small is-danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackList;

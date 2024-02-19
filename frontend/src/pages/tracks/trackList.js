import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import './trackList.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import AuthService from '../../services/authService';

const URL = process.env.REACT_APP_LOCALHOST_URL;

const TrackList = () => {
  const [tracks, setTracks] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]); // Set the initial map center

  useEffect(() => {
    getTracks();
  }, []);

  const getTracks = async () => {
    try {
      const authToken = AuthService.getAuthToken();
      const response = await axios.get(`${URL}/api/tracks`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setTracks(response.data);

      // Find the center of the map based on the first track's location
      if (response.data.length > 0) {
        const firstTrack = response.data[0];
        setMapCenter(firstTrack.Location.coordinates.reverse());
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  // Helper function to group tracks by vehicle UID
  const groupTracksByVehicle = () => {
    const groupedTracks = {};
    tracks.forEach((track) => {
      const vehicleUID = track.Vehicle_UID;
      if (!groupedTracks[vehicleUID]) {
        groupedTracks[vehicleUID] = [];
      }
      groupedTracks[vehicleUID].push(track);
    });
    return groupedTracks;
  };

  const goBack = () => {
    window.location.href = '/login';
  };

  const renderTracksOnMap = () => {
    const groupedTracks = groupTracksByVehicle();

    return Object.values(groupedTracks).map((vehicleTracks, index) => (
      <React.Fragment key={index}>
        {vehicleTracks.map((track) => (
          <Marker
            key={track.ID}
            position={track.Location.coordinates.reverse()}
            icon={L.icon({ iconUrl: 'path/to/marker-icon.png', iconSize: [25, 41] })}
          >
            <Popup>
              <p>{`Track ID: ${track.ID}`}</p>
              <p>{`Location: ${track.Location.coordinates.join(', ')}`}</p>
              {/* Add other track details as needed */}
            </Popup>
          </Marker>
        ))}
        {/* Connect tracks with a Polyline */}
        <Polyline
          positions={vehicleTracks.map((track) => track.Location.coordinates.reverse())}
          color="blue"
        />
      </React.Fragment>
    ));
  };

  return (
    <div>
      <Header />
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <Link to="/track-add" className="add">
        Add New Track
      </Link>

      <MapContainer center={mapCenter} zoom={12}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {renderTracksOnMap()}
      </MapContainer>
    </div>
  );
};

export default TrackList;

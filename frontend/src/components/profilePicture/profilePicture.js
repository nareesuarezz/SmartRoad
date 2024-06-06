import React from 'react';
import './profilePicture.css'
import { Link } from 'react-router-dom';

const URL = process.env.REACT_APP_URL;

const ProfilePicture = () => {
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));

  if (!adminInfo || !adminInfo.filename) {
    return null;
  }

  return (
    <Link to={`/admin-edit/${adminInfo.UID}`}>                                
    <div>
      <img
        src={`${URL}/images/${adminInfo.filename}`}
        alt="Admin Avatar"
        width="50"
        height="50"
      />
    </div>
    </Link>
  );
};

export default ProfilePicture;

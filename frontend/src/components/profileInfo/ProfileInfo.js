import React from 'react';
import './profilePicture.css'
import { Link } from 'react-router-dom';

const URL = process.env.REACT_APP_LOCALHOST_URL;

const ProfileInfo = ({getUserId}) => {

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));

  if (!adminInfo || !adminInfo.filename) {
    return null;
  }

  return (
    <Link to={`/user-info/${adminInfo.UID}`}>                                
    <div className="profile-picture">
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

export default ProfileInfo;

import React from 'react';
import './profilePictureUser.css'
import { Link } from 'react-router-dom';

const URL = process.env.REACT_APP_LOCALHOST_URL;

const ProfilePictureUser = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (!userInfo || !userInfo.filename) {
    return null;
  }

  return (
    <Link to={`/user-profile/${userInfo.UID}`}>                                
    <div className="profile-picture">
      <img
        src={`${URL}/images/${userInfo.filename}`}
        alt="User Avatar"
        width="50"
        height="50"
      />
    </div>
    </Link>
  );
};

export default ProfilePictureUser;

import React from 'react';
import './profilePicture.css'
import { Link } from 'react-router-dom';

const ProfilePicture = () => {
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));

  if (!adminInfo || !adminInfo.filename) {
    return null;
  }

  return (
    <Link to={`/admin-edit/${adminInfo.UID}`}>                                
    <div className="profile-picture">
      <img
      
        src={`http://localhost:8080/images/${adminInfo.filename}`}
        alt="Admin Avatar"
        width="50"
        height="50"
      />
    </div>
    </Link>
  );
};

export default ProfilePicture;

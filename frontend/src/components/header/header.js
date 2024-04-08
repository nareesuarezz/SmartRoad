import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';
import AuthService from '../../services/authService'; 
import ProfilePicture from '../profilePicture/profilePicture';


function Header() {
  const isAuthenticated = AuthService.isAuthenticated();

  return (
    <div className="header-container">
      <nav>
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/track-list" className="nav-link">Tracks</Link>
          </li>
          <li className="nav-item">
            <Link to="/admin-list" className="nav-link">Admins</Link>
          </li>
          <li className="nav-item">
            <Link to="/vehicle-list" className="nav-link">Vehicles</Link>
          </li>
          <li className="nav-item">
            <Link to="/log-list" className="nav-link">Logs</Link>
          </li>
          <li className="nav-item">
            <Link to="/sound-list" className="nav-link">Sounds</Link>
          </li>
          <li className="nav-item">
            <Link to="/admin-notification" className="nav-link" target='blank'>Global Notification</Link>
          </li>
          {isAuthenticated && (
            <li className="nav-item">
              <ProfilePicture/>
            </li>
          )}
        </ul>
      </nav>
   
    </div>
  );
}

export default Header;

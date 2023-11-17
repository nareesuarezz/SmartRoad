import { Link } from 'react-router-dom';
import './header.css'; 

function Header() {
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
        </ul>
      </nav>
    </div>
  );
}

export default Header;

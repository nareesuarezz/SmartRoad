import React, { useState } from 'react';
import './Login.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AuthService from '../../services/authService'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const goTracks = async () => {
    try {
      const response = await AuthService.signIn(username, password);

      console.log('Respuesta del backend:', response);

      window.location.href = "/track-list";
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError('Usuario o contraseña incorrectos');
    }
  }

  const goBack = () => {
    window.location.href = "/home";
  }

  return (
    <>
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <div className="container-wrapper">
        <div className="container">
          <div className="left">
            <h2 className="heading">Login</h2>
          </div>
          <form className="form">
            <div className="formGroup">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="formGroup forgot-password">
              <div className="label-input">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="#">Did you forget your password?</a>
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="button" onClick={goTracks}>
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;

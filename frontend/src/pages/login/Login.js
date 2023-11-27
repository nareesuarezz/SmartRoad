import React, { useState } from 'react';
import './Login.css';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AuthService from '../../services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const goTracks = async () => {
    try {
      const response = await AuthService.signIn(username, password);

      console.log('Respuesta del backend:', response);

      localStorage.setItem('adminInfo', JSON.stringify(response.admin));

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
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </div>
              </div>
            </div>
            <div className="formGroup forgot-password">
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

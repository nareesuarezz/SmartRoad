import React, { useState } from 'react';
import './LoginUser.css';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import AuthService from '../../services/authService';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';

function LoginUser() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const { t } = useTranslation();

    const goHome = async () => {
        try {
            const response = await AuthService.signIn(username, password);

            console.log('Respuesta del backend:', response);

            localStorage.setItem('userInfo', JSON.stringify(response.admin));

            if (response.admin.Role !== 'User') {
                setError('Acceso denegado. Solo los usuarios pueden iniciar sesión.');
                return;
              }

            window.location.href = "/home";
        } catch (error) {
            console.error('Error de inicio de sesión:', error);
            setError('Usuario o contraseña incorrectos');
        }
    }

    return (
        <>
            <div>
                <LanguageSwitcher />
            </div>
            <div className="container-wrapper">
                <div className="container">
                    <div className="left">
                        <h2 className="heading">{t('Login')}</h2>
                    </div>
                    <form className="form">
                        <div className="formGroup">
                            <label htmlFor="username">{t('Username')}:</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="password">{t('Password')}:</label>
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
                            <a href="/sign-up">{t(`Don't you have an account? Create one!`)}</a>
                        </div>
                        <div className="formGroup forgot-password">
                            <a href="/home">{t(`Continue as a guest`)}</a>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="button" onClick={goHome}>
                            {t('Login')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default LoginUser;

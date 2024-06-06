    import React, { useState } from 'react';
    import './SignUpUser.css';
    import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
    import AuthService from '../../services/authService';
    import { useTranslation } from 'react-i18next';
    import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';

    function SignUpUser() {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
        const [error, setError] = useState('');
        const URL = process.env.REACT_APP_URL;
        const { t } = useTranslation();

    const createUser = async () => {
        try {
            const pfp = `${URL}/images/user.png`
            const response = await AuthService.signUp(username, password, 'User', pfp);

                console.log('Respuesta del backend:', response);

                if (response.error) {
                    setError(response.error);
                    return;
                }

            window.location.href = "/login-user";
        } catch (error) {
            console.error('Error de registro:', error);
            setError('No puedes crear el usuario con este nombre, ya existe');
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevenir la acción por defecto del formulario
            createUser();
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
                        <h2 className="heading">{t('Sign Up')}</h2>
                    </div>
                    <form className="form" onKeyPress={handleKeyPress}>
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
                            <div className="formGroup forgot-password">
                                <a href="/login-user">{t(`Do you have an account? Log In!`)}</a>
                            </div>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="button" onClick={createUser}>
                            {t('Create Account')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

    export default SignUpUser;

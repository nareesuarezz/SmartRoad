import React from 'react';
import { useTranslation } from 'react-i18next';
import "./LanguageSwitcher.css";

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
    };

    return (
        <div className="LanguageSwitcher">
            <button onClick={() => changeLanguage('en')}>EN</button>
            <button onClick={() => changeLanguage('es')}>ES</button>
        </div>
    );
}

export default LanguageSwitcher;

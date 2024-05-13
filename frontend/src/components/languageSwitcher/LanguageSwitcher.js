import React from 'react';
import { useTranslation } from 'react-i18next';
import "./LanguageSwitcher.css";

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (event) => {
        i18n.changeLanguage(event.target.value);
    };

    return (
        <div>
            <select className='language-switcher' onChange={changeLanguage}>
                <option value='en'>EN</option>
                <option value='es'>ES</option>
            </select>
        </div>
    );
}

export default LanguageSwitcher;

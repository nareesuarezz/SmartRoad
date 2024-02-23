import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './trackList.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
const URL = process.env.REACT_APP_LOCALHOST_URL;


const SoundList = () => {
  const { t } = useTranslation();

  const [sounds, setSounds] = useState([]);

  useEffect(() => {
    getSounds();
  }, []);

  const getSounds = async () => {
    try {
      const response = await axios.get(`${URL}/api/sounds/`, {});
      console.log(response.data);
      setSounds(response.data);
    } catch (error) {
      console.error('Error fetching sounds:', error);
    }
  };

  const deleteSound = async (id) => {
    try {
      await axios.delete(`${URL}/api/sounds/${id}`);
      getSounds();
    } catch (error) {
      console.error(`Error deleting sound with id=${id}:`, error);
    }
  };

  const goBack = () => {
    window.location.href = "/login";
  };

  return (
    <div>
      <Header />
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <div>
        <LanguageSwitcher />
      </div>
      <Link to="/sound-add" className="add">
        {t('Add New Sound')}
      </Link>

      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>ID</th>
            <th>{t('Sound')}</th>
            <th>{t('Player')}</th>
            <th>{t('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {sounds.map((sound, index) => (
            <tr key={sound.id || index}>
              <td>{sound.id}</td>
              <td>{sound.filename}</td>
              <td>
                {sound.id && (
                  <audio controls>
                    <source src={`${URL}/api/sounds/${sound.id}`} type="audio/mp3" />
                    {t('Your browser does not support the audio tag.')}
                  </audio>
                )}
              </td>
              <td>
                <Link to={`/sound-edit/${sound.id}`} className="edit">
                  {t('Edit')}
                </Link>
                <Link to="#" onClick={() => deleteSound(sound.id)} className="delete">
                  {t('Delete')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SoundList;

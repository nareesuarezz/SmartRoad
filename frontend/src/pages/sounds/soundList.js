import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './soundList.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
const URL = process.env.REACT_APP_LOCALHOST_URL;


const SoundList = () => {
  const { t } = useTranslation();

  const [sounds, setSounds] = useState([]);

  const [soundName, setSoundName] = useState('');

  const [durationFilter, setDurationFilter] = useState('');

  useEffect(() => {
    getSounds(soundName);
  }, [soundName, durationFilter]);

  const getSounds = async () => {
    try {
      let response;
      if (soundName) {
        response = await axios.get(`${URL}/api/sounds/findBySound/${soundName}`);
      } else {
        response = await axios.get(`${URL}/api/sounds/`);
      }
      let soundsWithDuration = await Promise.all(response.data.map(async sound => {
        return new Promise((resolve, reject) => {
          let audio = new Audio(`${URL}/api/sounds/${sound.id}`);
          audio.onloadedmetadata = function () {
            resolve({ ...sound, duration: audio.duration });
          };
          audio.onerror = function () {
            reject('Error loading audio');
          };
        });
      }));
      if (durationFilter) {
        soundsWithDuration = soundsWithDuration.filter(sound => Math.floor(sound.duration) === durationFilter);
      }
      setSounds(soundsWithDuration);
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

  const handleSoundNameGetter = (e) => {
    setSoundName(e.target.value)
  }

  const handleDurationFilterChange = (e) => {
    setDurationFilter(Number(e.target.value));
  }

  const goBack = () => {
    window.location.href = '/login-user';
  };

  return (
    <div>
      <Header />
      <div className='language-add-bottons-container-sound'>
        <div className='sound-add-container'>
          <Link to="/sound-add" className="add">
            {t('Add New Sound')}
          </Link>
        </div>
        <div>
          <LanguageSwitcher />
        </div>
      </div>
      <div className='soundsFilters'>
        <input type='text' placeholder='Sound Name' onChange={handleSoundNameGetter}></input>
        <select onChange={handleDurationFilterChange}>
          <option value="">-- Select Duration --</option>
          <option value="1">1 Second</option>
          <option value="2">2 Seconds</option>
          <option value="3">3 Seconds</option>
        </select>
      </div>

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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';

const URL = process.env.REACT_APP_URL;

const LogList = () => {
  const { t } = useTranslation();

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getLogs();
  }, []);

  const getLogs = async () => {
    try {
      const response = await axios.get(`${URL}/api/logs`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const goBack = () => {
    window.location.href = "/login";
  }

  return (
    <div>
      <Header />
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <div>
        <LanguageSwitcher />
      </div>
      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>ID</th>
            <th>{t('Track ID')}</th>
            <th>{t('Admin ID')}</th>
            <th>{t('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={log.Log_ID}>
              <td>{log.Log_ID}</td>
              <td>{log.Track_ID}</td>
              <td>{log.Admin_UID}</td>
              <td>{log.Action}</td>
              <td>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogList;

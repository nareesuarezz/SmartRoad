import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';

const URL = process.env.LOCAHOST_URL;

const LogList = () => {
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
      <Header/>
      <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>ID</th>
            <th>Track ID</th>
            <th>Admin ID</th>
            <th>Action</th>
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

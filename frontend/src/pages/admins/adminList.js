import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/header/header';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher';
import "./adminList.css"

const URL = process.env.REACT_APP_LOCALHOST_URL;

const AdminList = () => {
    const { t } = useTranslation();

    const [admins, setAdmins] = useState([]);
    const [role, setRole] = useState('');
    const [letters, setLetters] = useState('')

    useEffect(() => {
        getAdmins(role, letters);
    }, [role, letters]);

    const getAdmins = async (role, letters) => {
        try {
            let response;
            if (role && letters) {
                response = await axios.get(`${URL}/api/admins/findByRoleAndLetters/${role}/${letters}`);
            } else if (role) {
                response = await axios.get(`${URL}/api/admins/findAllByRole/${role}`);
            } else if (letters) {
                response = await axios.get(`${URL}/api/admins/findByLetters/${letters}`);
            } else {
                response = await axios.get(`${URL}/api/admins`);
            }
            setAdmins(response.data);
        } catch (error) {
            console.error('Error fetching admins:', error);
        }
    };

    const deleteAdmin = async (id) => {
        try {
            await axios.delete(`${URL}/api/admins/${id}`);
            getAdmins();
        } catch (error) {
            console.error(`Error deleting admin with id=${id}:`, error);
        }
    };

    const goBack = () => {
        window.location.href = "/login-user";
    }

    const handleRoleGetter = (e) => {
        setRole(e.target.value)
    }

    // Manejador para el campo de texto
    const handleInputChange = (e) => {
        setLetters(e.target.value);
    }

    return (
        <div>
            <Header />
            <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
            <div className='language-add-bottons-container-admin'>
                <div className='admin-add-container'>
                    <Link to="/admin-add" className="add">
                        {t('Add New Admin')}
                    </Link>
                </div>
                <div>
                    <LanguageSwitcher />
                </div>
            </div>
            <div className='admin-filter'>
                <div className='admin-filter-role'>
                    <label> {t('Role')}
                        <span> </span>
                        <select name="Role" value={role} onChange={handleRoleGetter}>
                            <option value="">{t('Select')}</option>
                            <option value="Admin">{t('Admin')}</option>
                            <option value="User">{t('User')}</option>
                        </select>
                    </label>
                </div>
                <div className='admin-filter-username'>
                    <input type='text' placeholder={t('Username')} onChange={handleInputChange} />
                </div>
            </div>
            <table className="table is-striped is-fullwidth">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>{t('Username')}</th>
                        <th>{t('Image')}</th>
                        <th>{t('Role')}</th>
                        <th>{t('Actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map((admin) => (
                        <tr key={admin.UID}>
                            <td>{admin.UID}</td>
                            <td>{admin.Username}</td>
                            <td><img src={`${URL}/images/${admin.filename}`} alt="Admin Avatar" width="60" /></td>
                            <td>{admin.Role}</td>
                            <td>
                                <Link to="#" onClick={() => deleteAdmin(admin.UID)} className="delete">
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

export default AdminList;

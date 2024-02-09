    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import { Link } from 'react-router-dom';
    import { ArrowLeftOutlined } from '@ant-design/icons';
    import Header from '../../components/header/header';

    const URL = process.env.LOCALHOST_URL;

    const AdminList = () => {
        const [admins, setAdmins] = useState([]);

        useEffect(() => {
            getAdmins();
        }, []);

        const getAdmins = async () => {
            try {
                const response = await axios.get(`${URL}/api/admins`);
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
            window.location.href = "/login";
        }

        return (
            <div>
                <Header />
                <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
                <Link to="/admin-add" className="add">
                    Add New Admin
                </Link>

                <table className="table is-striped is-fullwidth">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.UID}>
                                <td>{admin.UID}</td>
                                <td>{admin.Username}</td>
                                <td><img src={`${URL}/images/${admin.filename}`} alt="Admin Avatar" width="60" /></td>
                                <td>
                                    <Link to="#" onClick={() => deleteAdmin(admin.UID)} className="delete">
                                        Delete
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

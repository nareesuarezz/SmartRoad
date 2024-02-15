import axios from 'axios';

const URL = process.env.REACT_APP_LOCALHOST_URL;
const API_URL = `${URL}/api`;
const SIGNIN_URL = `${API_URL}/admins/signin`;

const AuthService = {
  signIn: async (username, password) => {
    try {
      const response = await axios.post(SIGNIN_URL, { Username: username, Password: password });
      const token = response.data.access_token;

      localStorage.setItem('authToken', token);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },
  isAuthenticated: () => {
    const authToken = localStorage.getItem('authToken');
    return authToken !== null;
  },
  
};

export default AuthService;

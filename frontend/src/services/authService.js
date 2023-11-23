import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; // Actualiza con la URL de tu servidor backend
const SIGNIN_URL = `${API_URL}/admins/signin`;

const AuthService = {
  signIn: async (username, password) => {
    try {
      const response = await axios.post(SIGNIN_URL, { Username: username, Password: password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default AuthService;

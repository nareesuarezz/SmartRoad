import axios from 'axios';

const URL = "https://smart-road-ke3l.vercel.app";
const API_URL = `${URL}/api`;
const SIGNIN_URL = `${API_URL}/admins/signin`;
const SIGNUP_URL = `${API_URL}/admins/signup`;

console.log(SIGNIN_URL)

const AuthService = {
  signIn: async (username, password, role) => {
    try {
      const response = await axios.post(SIGNIN_URL, { Username: username, Password: password, Role: role });
      console.log("login: ", response.data.admin)
      const token = response.data.access_token;

      localStorage.setItem('authToken', token);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  signUp: async (username, password, role, profilePicture) => {
    try {
      const profilePicture = 'images/user.png'; 
      const response = await axios.post(SIGNUP_URL, { Username: username, Password: password, Role: role, filename: profilePicture });
      console.log("signup: ", response.data.admin)
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

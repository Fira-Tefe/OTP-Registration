import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Replace with your backend URL

// Register a new user
const register = async (formData) => {
   try {
      const res = await axios.post(`${API_URL}/register`, formData);
      return res; // Return the full response
   } catch (err) {
      throw err.response?.data || err.message;
   }
};

// Login a user
const login = async (formData) => {
   try {
      const res = await axios.post(`${API_URL}/login`, formData);
      return res; // Return the full response
   } catch (err) {
      throw err.response?.data || err.message;
   }
};

export { register, login };
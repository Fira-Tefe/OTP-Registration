import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
  };
  message?: string;
  errors?: Array<{ msg: string }>;
}

// Register user
const register = async (formData: RegisterData): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, formData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw error.response.data;
    }
    throw { success: false, message: error.message || 'Registration failed' };
  }
};

// Login user
const login = async (formData: LoginData): Promise<ApiResponse> => {
   try {
     const response = await axios.post(`${API_URL}/login`, formData);
     console.log('Login response:', response.data); // Debug logging
     return response.data;
   } catch (error: any) {
     console.error('Login API error:', error.response?.data || error.message);
     if (error.response) {
       // Return the entire error response from backend
       return error.response.data;
     }
     return { 
       success: false, 
       message: error.message || 'Network error during login' 
     };
   }
 };

// Google authentications
 export const getGoogleAuthUrl = () => {
  return 'http://localhost:5000/api/auth/google';
};

export const handleGoogleAuthSuccess = async (token: string, user: any): Promise<ApiResponse> => {
  try {
    return {
      success: true,
      token,
      user: JSON.parse(decodeURIComponent(user))
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error processing Google authentication'
    };
  }
};

export { register, login };
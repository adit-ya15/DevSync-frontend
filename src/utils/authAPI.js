// Authentication API Constants and Helper Functions
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';

const API_BASE_URL = BASE_URL || 'http://localhost:9999/api';

export const authAPI = {
    // Sign up endpoint
    signup: async (userData) => {
        return axios.post(`${API_BASE_URL}/signup`, userData, { withCredentials: true });
    },

    // Login endpoint
    login: async (email, password) => {
        return axios.post(`${API_BASE_URL}/login`, { email, password }, { withCredentials: true });
    },

    // Request password reset
    forgotPassword: async (email) => {
        return axios.post(`${API_BASE_URL}/forgot-password`, { email }, { withCredentials: true });
    },

    // Reset password with token
    resetPassword: async (token, password) => {
        return axios.post(`${API_BASE_URL}/reset-password/${token}`, { password }, { withCredentials: true });
    },

    // Resend verification email
    resendVerification: async (email) => {
        return axios.post(`${API_BASE_URL}/resend-verification`, { email }, { withCredentials: true });
    },

    // Logout
    logout: async () => {
        return axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
    },

    // Google OAuth callback
    googleLogin: async (credential) => {
        return axios.post(`${API_BASE_URL}/auth/google/callback`, { credential }, { withCredentials: true });
    },

    // Get current user profile
    getProfile: async () => {
        return axios.get(`${API_BASE_URL}/profile/view`, { withCredentials: true });
    }
};

export default authAPI;

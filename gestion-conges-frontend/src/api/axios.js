import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            return Promise.reject(new Error('Unauthorized - Please login again'));
        }
        if (error.response?.status === 403) {
            return Promise.reject(new Error('Access Forbidden'));
        }
        if (error.response?.status === 500) {
            console.error('Server error:', error.response.data);
            return Promise.reject(new Error('Internal Server Error'));
        }
        if (!error.response) {
            console.error('Network error or CORS issue:', error.message);
            return Promise.reject(new Error('Network error - Check CORS configuration'));
        }

        return Promise.reject(error);
    }
);

export default api;
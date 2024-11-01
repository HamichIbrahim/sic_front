import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: 'http://localhost:8080', // Base URL for your API
});

// Intercept requests to include the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Retrieve the token from local storage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Set the Authorization header
        }
        return config; // Return the modified config
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

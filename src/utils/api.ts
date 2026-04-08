import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // For cookies
});

let isRefreshing = false;
let pendingRequests = [];

const persistAuthPayload = (data) => {
    if (data?.token) {
        localStorage.setItem('token', data.token);
    }
    if (data?.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
    }
};

// Request interceptor to add token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    response => {
        persistAuthPayload(response.data);
        return response;
    },
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes('/auth/login') && !originalRequest?.url?.includes('/auth/refresh')) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingRequests.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            isRefreshing = true;

            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`, {
                    withCredentials: true,
                    headers: {
                        'x-refresh-token': localStorage.getItem('refreshToken') || '',
                    },
                });

                if (data?.token) {
                    persistAuthPayload(data);
                    pendingRequests.forEach(({ resolve }) => resolve(data.token));
                    pendingRequests = [];
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('userProfile');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userRole');
                pendingRequests.forEach(({ reject }) => reject(refreshError));
                pendingRequests = [];
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;


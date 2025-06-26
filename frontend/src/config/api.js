// API Configuration for different environments
const API_CONFIG = {
  development: 'http://localhost:5000',
  production: import.meta.env.VITE_API_URL || 'https://your-backend-app.onrender.com'
};

const isDevelopment = import.meta.env.MODE === 'development';
export const API_BASE_URL = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// Log the current API URL for debugging
console.log(`🌍 Environment: ${import.meta.env.MODE}`);
console.log(`🔗 API URL: ${API_BASE_URL}`);

export default API_BASE_URL;

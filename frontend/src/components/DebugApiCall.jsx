import { useEffect } from 'react';
import api from '../config/axios';

const DebugApiCall = () => {
  useEffect(() => {
    const testApiCall = async () => {
      console.log('🔍 Debug: Testing API call...');
      
      // Check localStorage
      const user = localStorage.getItem('user');
      console.log('🔍 User in localStorage:', user);
      
      try {
        const response = await api.get('/api/grievances/department');
        console.log('✅ API call successful:', response.data);
      } catch (error) {
        console.error('❌ API call failed:', error);
        console.error('❌ Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          headers: error.config?.headers
        });
      }
    };
    
    testApiCall();
  }, []);
  
  return null; // This component doesn't render anything
};

export default DebugApiCall;

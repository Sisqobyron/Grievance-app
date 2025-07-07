import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/axios';

// Custom hook to check if current user is a coordinator
export const useCoordinatorStatus = () => {
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkCoordinatorStatus = async () => {
      if (!user || user.role !== 'staff') {
        setIsCoordinator(false);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/coordinators/user/${user.id}`);
        setIsCoordinator(response.data ? true : false);
      } catch {
        // If 404, user is not a coordinator
        setIsCoordinator(false);
      } finally {
        setLoading(false);
      }
    };

    checkCoordinatorStatus();
  }, [user]);

  return { isCoordinator, loading };
};

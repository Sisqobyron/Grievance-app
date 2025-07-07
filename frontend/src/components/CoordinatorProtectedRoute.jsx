import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PropTypes from 'prop-types';

const CoordinatorProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is staff (coordinators are staff members with coordinator profile)
  if (user.role !== 'staff') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // TODO: Add API call to check if staff member is actually a coordinator
  // For now, allow all staff members to access coordinator workspace
  
  return children;
};

CoordinatorProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CoordinatorProtectedRoute;

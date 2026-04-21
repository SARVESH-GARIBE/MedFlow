import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PatientRoute = () => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'patient') {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return <Outlet />;
};

export const DoctorRoute = () => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'doctor') {
    return <Navigate to={`/${user?.role === 'patient' ? '' : user?.role}`} replace />;
  }

  return <Outlet />;
};

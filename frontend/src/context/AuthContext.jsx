import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // Use lazy initial state to read from localStorage once
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('medflow.user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('medflow.token'));
  const [loading, setLoading] = useState(false);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('medflow.user', JSON.stringify(userData));
    localStorage.setItem('medflow.token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medflow.user');
    localStorage.removeItem('medflow.token');
    // Also clear old mock keys to cleanly migrate
    localStorage.removeItem('medflow.currentUser');
    localStorage.removeItem('medflow.currentDoctor');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

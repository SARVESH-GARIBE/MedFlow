import React, { createContext, useState, useEffect, useContext } from 'react';

export const CityContext = createContext();

export const useCity = () => {
  return useContext(CityContext);
};

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState('Bangalore');

  useEffect(() => {
    // Load city from localStorage on mount
    const storedCity = localStorage.getItem('medflow.selectedCity');
    if (storedCity) {
      setSelectedCity(storedCity);
    }
  }, []);

  const updateCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('medflow.selectedCity', city);
  };

  const value = {
    selectedCity,
    updateCity
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
};
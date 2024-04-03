// AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogout = () => {
    setLoggedIn(false);

    setSessionUser('');
    // Your logout logic here
  };

  return (
    <AuthContext.Provider value={{ loggedIn, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

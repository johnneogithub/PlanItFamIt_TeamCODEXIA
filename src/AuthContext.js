// AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

  const loginAsUser = (user) => {
    setCurrentUser(user);
    setIsAdmin(false);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAdmin', 'false');
    console.log("User logged in:", user);
  };

  const loginAsAdmin = () => {
    const adminUser = { role: 'admin', name: 'Admin User' };
    setCurrentUser(adminUser);
    setIsAdmin(true);
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    localStorage.setItem('isAdmin', 'true');
    console.log("Admin logged in:", true);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, loginAsUser, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
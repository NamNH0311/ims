/* import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

 const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  const login = (role) => {
    setRole(role);
  };

  const logout = () => {
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export { AuthContext, AuthProvider }; */

import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("userId")
  );
  const [role, setRole] = useState(() => {
    // Lấy giá trị từ LocalStorage khi khởi tạo
    const savedRole = localStorage.getItem("role");
    return savedRole ? JSON.parse(savedRole) : null;
  });
  const [userId, setUserId] = useState(() => {
    // Lấy giá trị từ LocalStorage khi khởi tạo
    const savedUserId = localStorage.getItem("userId");
    return savedUserId ? savedUserId : null;
  });

  useEffect(() => {
    // Lưu giá trị vào LocalStorage khi role thay đổi
    if (role || userId) {
      localStorage.setItem("role", JSON.stringify(role));
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
    }
  }, [role, userId]);

  const login = (role, userId) => {
    setRole(role);
    setUserId(userId);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setRole(null);
    setUserId(null);
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

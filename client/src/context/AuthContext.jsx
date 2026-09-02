import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check expiry
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } else {
          setUser(payload);
        }
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  const loginUser = async (phone, password) => {
    try {
      const { data } = await auth.login({ phone, password });
      const responseData = data.data || data;
      const newToken = responseData.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      toast.success('Logged in successfully!');
      return responseData;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      toast.error(msg);
      throw error;
    }
  };

  const registerUser = async (userData) => {
    try {
      const { data } = await auth.register(userData);
      const responseData = data.data || data;
      const newToken = responseData.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      toast.success('Registered successfully!');
      return responseData;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw error;
    }
  };

  const googleLoginUser = async (googleToken, role = 'buyer') => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken, role })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Google login failed');
      
      const responseData = data.data || data;
      const newToken = responseData.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      toast.success('Google login successful!');
      return responseData;
    } catch (error) {
      toast.error(error.message || 'Google login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  const value = {
    user,
    token,
    loading,
    login: loginUser,
    register: registerUser,
    logout,
    googleLogin: googleLoginUser,
    isAuthenticated: !!token && !!user,
    isFarmer: user?.role === 'farmer',
    isBuyer: user?.role === 'buyer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

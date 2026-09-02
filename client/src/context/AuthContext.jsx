import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

const getFriendlyErrorMessage = (error, defaultMsg) => {
  let msg = error?.response?.data?.error || error?.response?.data?.message || error?.message;
  if (!msg || typeof msg !== 'string') return defaultMsg;
  if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
    return 'Invalid credentials or verification code. Please check your input and try again.';
  }
  if (msg.includes('Request failed with status code')) {
    return defaultMsg;
  }
  return msg;
};

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
      const msg = getFriendlyErrorMessage(error, 'Login failed. Please check your phone and password.');
      toast.error(msg);
      throw new Error(msg);
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
      const msg = getFriendlyErrorMessage(error, 'Registration failed. Please check your details and try again.');
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const sendOtp = async (identifier, purpose = 'verification') => {
    try {
      const { data } = await auth.sendOtp({ identifier, purpose });
      const msg = data.message || 'OTP code sent successfully!';
      toast.success(msg);
      return data;
    } catch (error) {
      const msg = getFriendlyErrorMessage(error, 'Failed to send OTP code. Please try again.');
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const verifyOtp = async (identifier, otp) => {
    try {
      const { data } = await auth.verifyOtp({ identifier, otp });
      const msg = data.message || 'OTP verified successfully!';
      toast.success(msg);
      return data;
    } catch (error) {
      const msg = getFriendlyErrorMessage(error, 'Invalid or expired OTP code. Please check and try again.');
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const forgotPassword = async (identifier) => {
    try {
      const { data } = await auth.forgotPassword({ identifier });
      const msg = data.message || 'Password reset OTP sent successfully!';
      toast.success(msg);
      return data;
    } catch (error) {
      const msg = getFriendlyErrorMessage(error, 'Failed to send password reset code. Please verify your phone or email.');
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (identifier, otp, newPassword) => {
    try {
      const { data } = await auth.resetPassword({ identifier, otp, newPassword });
      const msg = data.message || 'Password reset successfully!';
      toast.success(msg);
      return data;
    } catch (error) {
      const msg = getFriendlyErrorMessage(error, 'Failed to reset password. Please check your details.');
      toast.error(msg);
      throw new Error(msg);
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
      const msg = getFriendlyErrorMessage(error, 'Google login failed. Please try again.');
      toast.error(msg);
      throw new Error(msg);
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
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!token && !!user,
    isFarmer: user?.role === 'farmer',
    isBuyer: user?.role === 'buyer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

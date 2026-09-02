import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get('role') || '';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: preselectedRole || 'farmer',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (form.phone.length < 10) errs.phone = 'Enter valid phone number';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await register({
        name: form.name,
        phone: form.phone,
        password: form.password,
        role: form.role,
        location: form.location,
      });
      const user = data.user;
      if (user?.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none blur-[120px] bg-gradient-to-br from-primary-400 to-accent-300 rounded-full z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-primary-200"
            >
              🌱
            </motion.div>
            <h2 className="text-3xl font-extrabold text-dark tracking-tight">{t('auth.register', 'Create an account')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('auth.role', 'I am a')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('role', 'farmer')}
                  className={`p-4 rounded-xl border-2 text-center font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    form.role === 'farmer'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">👨‍🌾</span>
                  <span>{t('auth.farmer', 'Farmer')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('role', 'buyer')}
                  className={`p-4 rounded-xl border-2 text-center font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    form.role === 'buyer'
                      ? 'border-accent-500 bg-accent-50 text-accent-700 ring-2 ring-accent-500/20'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">🏢</span>
                  <span>{t('auth.buyer', 'Buyer')}</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{t('auth.name', 'Full Name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-colors ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{t('auth.phone', 'Phone Number')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. 9876543210"
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-colors ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{t('auth.location', 'Location (City, State)')}</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. Pune, Maharashtra"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{t('auth.password', 'Password')}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Min 6 characters"
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-colors ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{t('auth.confirmPassword', 'Confirm Password')}</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-colors ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2"
              size="lg"
            >
              {loading ? t('common.loading', 'Loading...') : t('nav.register', 'Register')}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600 font-medium">
            {t('auth.hasAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold hover:underline">
              {t('auth.loginLink', 'Login here')}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;

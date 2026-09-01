import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 bg-cream">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌾</div>
          <h2 className="text-2xl font-bold text-dark">{t('auth.register', 'Create an account')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.role', 'I am a')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('role', 'farmer')}
                className={`p-4 rounded-xl border-2 text-center font-medium min-h-[56px] transition-all ${
                  form.role === 'farmer'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                🌾 {t('auth.farmer', 'Farmer')}
              </button>
              <button
                type="button"
                onClick={() => handleChange('role', 'buyer')}
                className={`p-4 rounded-xl border-2 text-center font-medium min-h-[56px] transition-all ${
                  form.role === 'buyer'
                    ? 'border-accent-500 bg-orange-50 text-accent-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                🛒 {t('auth.buyer', 'Buyer')}
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.name', 'Full Name')}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className={`w-full p-3 border-2 rounded-xl min-h-[48px] text-lg focus:outline-none ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone', 'Phone Number')}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. 9876543210"
              className={`w-full p-3 border-2 rounded-xl min-h-[48px] text-lg focus:outline-none ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.location', 'Location (City, State)')}</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. Pune, Maharashtra"
              className="w-full p-3 border-2 border-gray-200 rounded-xl min-h-[48px] text-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password', 'Password')}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Min 6 characters"
              className={`w-full p-3 border-2 rounded-xl min-h-[48px] text-lg focus:outline-none ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword', 'Confirm Password')}</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Re-enter password"
              className={`w-full p-3 border-2 rounded-xl min-h-[48px] text-lg focus:outline-none ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl min-h-[56px] text-lg transition-colors mt-2"
          >
            {loading ? t('common.loading', 'Loading...') : t('nav.register', 'Register')}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {t('auth.hasAccount', 'Already have an account?')}{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            {t('auth.loginLink', 'Login here')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

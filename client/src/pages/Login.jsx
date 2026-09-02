import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

const Login = () => {
  const { t } = useTranslation();
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await googleLogin(credentialResponse.credential);
      navigate(data.user?.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const executeLogin = async (phoneStr, passStr, loaderSetter) => {
    loaderSetter(true);
    try {
      const data = await login(phoneStr, passStr);
      navigate(data.user?.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
    } catch {
      // Error handled by AuthContext
    } finally {
      loaderSetter(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin(phone, password, setLoading);
  };

  const handleDemo = (role) => {
    const p = role === 'farmer' ? '9876543210' : '9123456780';
    setDemoLoading(role);
    executeLogin(p, 'password123', () => setDemoLoading(null));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-100 blur-3xl opacity-50" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-accent-100 blur-3xl opacity-40" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-card p-8 z-10 border border-gray-100"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner"
          >
            🌱
          </motion.div>
          <h2 className="text-2xl font-bold text-dark">{t('auth.login', 'Welcome back')}</h2>
          <p className="text-gray-500 mt-2 text-sm">Enter your details to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.phone', 'Phone Number')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password', 'Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <Button type="submit" isLoading={loading} className="w-full" size="lg">
            {t('nav.login', 'Login')}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium text-xs tracking-wider uppercase">Demo Access</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button 
              variant="secondary" 
              onClick={() => handleDemo('farmer')}
              isLoading={demoLoading === 'farmer'}
              disabled={demoLoading !== null}
            >
              As Farmer
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleDemo('buyer')}
              isLoading={demoLoading === 'buyer'}
              disabled={demoLoading !== null}
            >
              As Buyer
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Google Login Failed')}
            useOneTap
            theme="outline"
            shape="pill"
          />
        </div>

        <p className="text-center mt-6 text-gray-600 text-sm">
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            {t('auth.registerLink', 'Create one')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

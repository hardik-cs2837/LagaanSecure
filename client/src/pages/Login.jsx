import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

// SVG Icons
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const LeafPattern = () => (
  <svg className="absolute opacity-10" width="400" height="400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" fill="white"/>
  </svg>
);

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const floatingAnimation = {
  y: [-10, 10, -10],
  rotate: [-5, 5, -5],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
};

const floatingAnimation2 = {
  y: [10, -10, 10],
  rotate: [5, -5, 5],
  transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
};

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
    <div className="min-h-[calc(100vh-64px)] flex bg-gray-50 relative overflow-hidden">
      
      {/* Left Column: Brand Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-emerald-900 relative overflow-hidden items-center justify-center p-12">
        {/* Dynamic Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 z-0" />
        
        {/* Floating Abstract Shapes / Patterns */}
        <motion.div animate={floatingAnimation} className="absolute -top-20 -left-20 text-white z-0">
          <LeafPattern />
        </motion.div>
        <motion.div animate={floatingAnimation2} className="absolute bottom-10 -right-20 text-white z-0" style={{ transform: 'scale(1.5)' }}>
          <LeafPattern />
        </motion.div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] z-0 opacity-40"></div>

        {/* Brand Content */}
        <div className="relative z-10 max-w-lg text-white">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6 }}
            className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-2xl mb-8 border border-white/20"
          >
            🌱
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-extrabold tracking-tight mb-6 leading-tight"
          >
            Grow Your <span className="text-emerald-400">Agri-Business</span> With Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-emerald-100/80 mb-8"
          >
            Connect directly with verified buyers and farmers. Secure transactions, fair prices, and intelligent insights.
          </motion.p>
          
          {/* Social Proof / Stats */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex gap-6 items-center"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-900 bg-emerald-200 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-emerald-200">
              Join <strong className="text-white">10,000+</strong> users
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 relative z-10 w-full">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner mb-4">
            🌱
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md relative">
          {/* Subtle Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-20 hidden lg:block"></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('auth.login', 'Welcome Back')}</h2>
              <p className="text-gray-500 mt-2 text-sm">Enter your credentials to access your account</p>
            </div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-5"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  {t('auth.phone', 'Phone Number')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <PhoneIcon />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <LockIcon />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">Forgot password?</a>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <Button 
                  type="submit" 
                  isLoading={loading} 
                  className="w-full py-3.5 text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200" 
                  size="lg"
                >
                  {t('nav.login', 'Sign In')}
                </Button>
              </motion.div>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium text-xs tracking-wider uppercase">Quick Demo Access</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleDemo('farmer')}
                  disabled={demoLoading !== null}
                  className="group relative flex flex-col items-center sm:items-start p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-emerald-500 hover:shadow-md transition-all text-center sm:text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-emerald-100 transition-transform">
                    {demoLoading === 'farmer' ? (
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-lg">🚜</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Farmer</h3>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">View seller dashboard</p>
                </button>

                <button 
                  onClick={() => handleDemo('buyer')}
                  disabled={demoLoading !== null}
                  className="group relative flex flex-col items-center sm:items-start p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:blue-500 hover:border-blue-500 hover:shadow-md transition-all text-center sm:text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-blue-100 transition-transform">
                    {demoLoading === 'buyer' ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-lg">🛒</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Buyer</h3>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">View marketplace</p>
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center"
            >
              <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">Or continue with</p>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Google Login Failed')}
                useOneTap
                theme="outline"
                shape="pill"
                size="large"
                width="100%"
              />
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="text-center mt-8 text-gray-600 text-sm"
            >
              {t('auth.noAccount', "Don't have an account?")}{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline underline-offset-4">
                {t('auth.registerLink', 'Create one')}
              </Link>
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

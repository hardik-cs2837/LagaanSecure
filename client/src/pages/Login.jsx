import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
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

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 014.122-.971c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
  const { login, googleLogin, forgotPassword, verifyOtp, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Login Form States
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Identifier, 2: OTP, 3: New Password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse?.credential || (typeof credentialResponse === 'string' ? credentialResponse : 'demo_google_token');
      const data = await googleLogin(token);
      const userRole = data?.user?.role || 'buyer';
      navigate(userRole === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
    } catch (e) {
      console.error('Google Login Error:', e);
    }
  };

  const executeLogin = async (phoneStr, passStr, loaderSetter) => {
    loaderSetter(true);
    try {
      const data = await login(phoneStr, passStr);
      if (data.user?.role === 'admin') { navigate('/admin'); } else { navigate(data.user?.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'); }
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
    const p = role === 'farmer' ? '9822011223' : '9820012345';
    setDemoLoading(role);
    executeLogin(p, 'password123', (isLoading) => setDemoLoading(isLoading ? role : null));
  };

  // Forgot Password Step 1: Send OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError(t('auth.identifierRequired', 'Please enter your phone number or email.'));
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      await forgotPassword(forgotIdentifier);
      setForgotStep(2);
      setResendTimer(60);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setForgotError('');
    setForgotLoading(true);
    try {
      await forgotPassword(forgotIdentifier);
      setResendTimer(60);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password Step 2: Verify OTP
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      setForgotError(t('auth.otpRequired', 'Please enter the 6-digit OTP code.'));
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      await verifyOtp(forgotIdentifier, forgotOtp);
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password Step 3: Reset Password
  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) {
      setForgotError(t('auth.passwordLengthError', 'New password must be at least 6 characters.'));
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError(t('auth.passwordMismatchError', 'Passwords do not match.'));
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      await resetPassword(forgotIdentifier, forgotOtp, forgotNewPassword);
      // Auto-fill phone field if identifier is phone number
      if (/^\d{10}$/.test(forgotIdentifier)) {
        setPhone(forgotIdentifier);
      }
      closeForgotModal();
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotIdentifier('');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(phone);
                      setShowForgotModal(true);
                    }}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
                  >
                    {t('auth.forgotPassword', 'Forgot password?')}
                  </button>
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
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log('Google Login Failed')}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  size="large"
                  width="100%"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => handleGoogleSuccess({ credential: 'demo_google_token' })}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all shadow-sm active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
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

      {/* Interactive Forgot Password 3-Step Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-gray-100"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeForgotModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <CloseIcon />
              </button>

              {/* Modal Header & Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex-1 h-1.5 rounded-full transition-colors ${forgotStep >= 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                  <div className={`flex-1 h-1.5 rounded-full transition-colors ${forgotStep >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                  <div className={`flex-1 h-1.5 rounded-full transition-colors ${forgotStep >= 3 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                    {forgotStep === 1 ? '1' : forgotStep === 2 ? '2' : '3'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {forgotStep === 1 && t('auth.forgotTitle', 'Forgot Password')}
                      {forgotStep === 2 && t('auth.verifyTitle', 'Enter Verification Code')}
                      {forgotStep === 3 && t('auth.resetTitle', 'Set New Password')}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {forgotStep === 1 && t('auth.step1Sub', 'Step 1 of 3: Enter registered Email or Phone')}
                      {forgotStep === 2 && t('auth.step2Sub', 'Step 2 of 3: Verify 6-digit OTP code')}
                      {forgotStep === 3 && t('auth.step3Sub', 'Step 3 of 3: Create your new password')}
                    </p>
                  </div>
                </div>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                  {forgotError}
                </div>
              )}

              {/* Step 1: Identifier Entry */}
              {forgotStep === 1 && (
                <form onSubmit={handleForgotSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('auth.phoneOrEmail', 'Phone Number or Email')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="e.g. 9876543210 or user@example.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={closeForgotModal}
                      className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <Button
                      type="submit"
                      isLoading={forgotLoading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl"
                    >
                      {t('auth.sendCode', 'Send OTP Code')}
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {forgotStep === 2 && (
                <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('auth.otpLabel', '6-Digit Verification Code')}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full text-center tracking-[0.5em] text-xl font-mono py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      required
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Code sent to <strong className="text-gray-700">{forgotIdentifier}</strong>
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Didn't get the code?</span>
                    {resendTimer > 0 ? (
                      <span className="text-gray-400 font-medium">Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={forgotLoading}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      {t('common.back', 'Back')}
                    </button>
                    <Button
                      type="submit"
                      isLoading={forgotLoading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl"
                    >
                      {t('auth.verifyCode', 'Verify OTP')}
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleForgotResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('auth.newPassword', 'New Password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {showForgotNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('auth.confirmPassword', 'Confirm New Password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {showForgotConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button
                      type="submit"
                      isLoading={forgotLoading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl"
                    >
                      {t('auth.resetBtn', 'Reset Password')}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;

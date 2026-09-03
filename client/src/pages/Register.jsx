import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// SVG Icons
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

const Register = () => {
  const { t } = useTranslation();
  const { register, sendOtp, verifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get('role') || '';

  // Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: preselectedRole || 'farmer',
    state: '',
    district: '',
  });

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Step State
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = t('auth.nameRequired', 'Full Name is required');
    if (!form.phone.trim()) errs.phone = t('auth.phoneRequired', 'Phone number is required');
    else if (form.phone.replace(/\D/g, '').length < 10) errs.phone = t('auth.phoneInvalid', 'Enter valid 10-digit phone number');
    if (form.password.length < 6) errs.password = t('auth.passwordLengthError', 'Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) errs.confirmPassword = t('auth.passwordMismatchError', 'Passwords do not match');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 1 Submission: Send OTP and go to Step 2
  const handleProceedToOtp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      await sendOtp(form.phone, 'registration');
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setErrors({});
    try {
      await sendOtp(form.phone, 'registration');
      setResendTimer(60);
    } catch (err) {
      setErrors({ otp: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Submission: Verify OTP and Register User
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrors({ otp: t('auth.otpRequired', 'Please enter valid 6-digit OTP code') });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await verifyOtp(form.phone, otp);
      const data = await register({
        name: form.name,
        phone: form.phone,
        password: form.password,
        role: form.role,
        location: `${form.district}, ${form.state}`,
      });
      const user = data?.user;
      if (user?.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setErrors({ otp: err.message });
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
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-primary-200"
            >
              🌱
            </motion.div>
            <h2 className="text-3xl font-extrabold text-dark tracking-tight">
              {step === 1 ? t('auth.register', 'Create an Account') : t('auth.verifyTitle', 'Verify Phone Number')}
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {step === 1 
                ? t('auth.registerSub', 'Join Lagaan Secure for direct agricultural trade')
                : t('auth.otpSentSub', 'We sent a 6-digit verification code to your phone number')}
            </p>
          </div>

          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {errors.form}
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleProceedToOtp} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  {t('auth.role', 'I am a')}
                </label>
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  {t('auth.name', 'Full Name')}
                </label>
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  {t('auth.phone', 'Phone Number')}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-colors ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
              </div>

                {/* State & District */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      {t('auth.state', 'State')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 transition-colors bg-white"
                    >
                      <option value="">{t('auth.select_state', 'Select State')}</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      {t('auth.district', 'District')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.district || ''}
                      onChange={(e) => handleChange('district', e.target.value)}
                      placeholder="e.g. Pune"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Min 6 characters"
                    className={`w-full pl-4 pr-11 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-colors ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  {t('auth.confirmPassword', 'Confirm Password')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full pl-4 pr-11 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-colors ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                size="lg"
              >
                {t('auth.sendOtpBtn', 'Send OTP Verification Code')}
              </Button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleCompleteRegistration} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  {t('auth.otpLabel', '6-Digit Verification Code')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3.5 border-2 border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-emerald-50/30"
                  required
                />
                {errors.otp && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.otp}</p>}
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Verification code sent to <strong className="text-gray-800">{form.phone}</strong>
                </p>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Didn't receive code?</span>
                {resendTimer > 0 ? (
                  <span className="text-gray-400 font-medium">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  {t('common.back', 'Back')}
                </button>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                  size="lg"
                >
                  {t('auth.verifyAndRegister', 'Verify OTP & Register')}
                </Button>
              </div>
            </form>
          )}

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

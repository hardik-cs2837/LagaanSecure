import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AIVoiceAssistant = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isFarmer } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      window.speechRecognition?.stop();
    };
  }, []);

  const getGreeting = () => {
    if (!user) return t('common.welcome_guest', 'Welcome to Kisan Connect. Say "Login" or "Register" to continue.');
    return t('common.welcome_user', `Welcome back, {{name}}. Say "Dashboard", "Add Produce", or "My Deals" to navigate.`, { name: user.name });
  };

  const speak = (text, onEndCallback = null) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const currentLang = localStorage.getItem('language') || 'en';
    if (currentLang === 'hi') utterance.lang = 'hi-IN';
    else if (currentLang === 'mr') utterance.lang = 'mr-IN';
    else if (currentLang === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error(t('common.voice_not_supported', 'Voice input not supported in this browser.'));
      return;
    }

    if (isListening) {
      window.speechRecognition?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    const currentLang = localStorage.getItem('language') || 'en';
    if (currentLang === 'hi') recognition.lang = 'hi-IN';
    else if (currentLang === 'mr') recognition.lang = 'mr-IN';
    else if (currentLang === 'te') recognition.lang = 'te-IN';
    else recognition.lang = 'en-IN';

    window.speechRecognition = recognition;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      
      // Voice Navigation Logic
      let matched = false;
      if (transcript.includes('dashboard') || transcript.includes('home') || transcript.includes('मुख्य पृष्ठ') || transcript.includes('डैशबोर्ड') || transcript.includes('होम') || transcript.includes('मुखपृष्ठ')) {
        navigate(isAuthenticated ? (isFarmer ? '/farmer/dashboard' : '/buyer/dashboard') : '/');
        matched = true;
      } else if (transcript.includes('add') || transcript.includes('produce') || transcript.includes('listing') || transcript.includes('sell') || transcript.includes('फसल जोड़ें') || transcript.includes('बेचना') || transcript.includes('जोड़ें') || transcript.includes('उत्पादन')) {
        navigate('/listings/create');
        matched = true;
      } else if (transcript.includes('deal') || transcript.includes('my deals') || transcript.includes('सौदे') || transcript.includes('डील') || transcript.includes('व्यवहार')) {
        navigate('/deals');
        matched = true;
      } else if (transcript.includes('dispute') || transcript.includes('complaint')) {
        navigate('/disputes');
        matched = true;
      } else if (transcript.includes('impact') || transcript.includes('analytics')) {
        navigate('/impact');
        matched = true;
      } else if (transcript.includes('login') || transcript.includes('sign in') || transcript.includes('लॉगिन') || transcript.includes('लॉग इन') || transcript.includes('प्रवेश')) {
        navigate('/login');
        matched = true;
      } else if (transcript.includes('register') || transcript.includes('sign up') || transcript.includes('रजिस्टर') || transcript.includes('खाता') || transcript.includes('नोंदणी')) {
        navigate('/register');
        matched = true;
      }

      if (matched) {
        speak(t('common.navigating', 'Navigating now...'));
        setIsOpen(false);
      } else {
        speak(t('common.not_understood', 'I didn\'t catch that. Please say Dashboard, Deals, or Add Produce.'));
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    // Stop speaking before listening
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    recognition.start();
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      window.speechSynthesis?.cancel();
      window.speechRecognition?.stop();
      setIsPlaying(false);
      setIsListening(false);
    } else {
      setIsOpen(true);
      if (!hasGreeted) {
        speak(getGreeting(), () => {
          // Optionally start listening after greeting
          // startListening();
        });
        setHasGreeted(true);
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 w-72 overflow-hidden relative"
          >
            {/* Background gradient decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">{t('common.voice_nav', 'Voice Navigation')}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 relative z-10 min-h-[40px]">
              {isListening ? (
                <span className="text-emerald-600 font-bold flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  {t('common.listening_command', 'Listening for command...')}
                </span>
              ) : isPlaying ? (
                <span className="flex gap-1 items-end mt-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              ) : (
                getGreeting()
              )}
            </p>
            
            <div className="flex gap-2 relative z-10">
              <button 
                onClick={startListening}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  isListening ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                {isListening ? t('common.stop', 'Stop') : t('common.speak_now', 'Speak Command')}
              </button>
              <button 
                onClick={() => { speak(getGreeting()); }}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition"
              >
                <Play className="w-3 h-3" /> {t('common.replay', 'Replay')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-colors border-4 border-white ${
          isOpen ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-500'
        }`}
      >
        <Mic className={`w-6 h-6 ${isPlaying || isListening ? 'animate-pulse' : ''}`} />
      </motion.button>
    </div>
  );
};

export default AIVoiceAssistant;

import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Volume2, VolumeX, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const AIVoiceAssistant = () => {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  useEffect(() => {
    // Stop speaking when component unmounts
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const getGreeting = () => {
    if (!user) return t('common.welcome_guest', 'Welcome to Kisan Connect. How can I help you today?');
    return t('common.welcome_user', `Welcome back, {{name}}.`, { name: user.name });
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on current i18n language
    const currentLang = localStorage.getItem('language') || 'en';
    if (currentLang === 'hi') utterance.lang = 'hi-IN';
    else if (currentLang === 'mr') utterance.lang = 'mr-IN';
    else if (currentLang === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.9; // Slightly slower for better comprehension
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    } else {
      setIsOpen(true);
      if (!hasGreeted) {
        speak(getGreeting());
        setHasGreeted(true);
      }
    }
  };

  const handleReplay = () => {
    speak(getGreeting());
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
                <h3 className="font-bold text-slate-800 text-sm">{t('common.voice_assistant', 'Voice Assistant')}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 relative z-10 min-h-[40px]">
              {isPlaying ? (
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
                onClick={handleReplay}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition"
              >
                <Play className="w-3 h-3" /> {t('common.replay', 'Replay')}
              </button>
              <button 
                onClick={() => { window.speechSynthesis?.cancel(); setIsPlaying(false); }}
                className="flex-1 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-semibold text-red-700 flex items-center justify-center gap-1 transition"
              >
                <VolumeX className="w-3 h-3" /> {t('common.stop', 'Stop')}
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
        <Mic className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
      </motion.button>
    </div>
  );
};

export default AIVoiceAssistant;

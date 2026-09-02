import React, { useState, useEffect } from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export default function TextToSpeechButton({ textToRead, className = "" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    return () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(textToRead);
        
        // Map i18n language to BCP 47 language tag
        const langMap = {
          'en': 'en-IN',
          'hi': 'hi-IN',
          'mr': 'mr-IN',
          'gu': 'gu-IN',
          'pa': 'pa-IN',
          'ta': 'ta-IN',
          'te': 'te-IN',
          'kn': 'kn-IN',
          'bn': 'bn-IN'
        };
        utterance.lang = langMap[i18n.language] || 'en-IN';
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      } else {
        alert(t("tts.notSupported", "Text to speech is not supported in this browser."));
      }
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={`p-2 text-gray-500 hover:text-green-600 focus:outline-none transition-colors ${className}`}
      title={isPlaying ? t("tts.stop", "Stop") : t("tts.listen", "Listen")}
      aria-label={isPlaying ? t("tts.stop", "Stop") : t("tts.listen", "Listen")}
    >
      {isPlaying ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
    </button>
  );
}

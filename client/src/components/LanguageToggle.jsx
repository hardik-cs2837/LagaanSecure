import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 min-h-[48px]"
    >
      {i18n.language === 'en' ? 'हिंदी' : 'English'}
    </button>
  );
};
export default LanguageToggle;

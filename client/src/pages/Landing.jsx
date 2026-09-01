import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-cream flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary-700 tracking-tight">
          {t('landing.title', 'KisaanConnect')}
        </h1>
        <p className="text-xl md:text-2xl text-dark font-medium max-w-2xl mx-auto">
          {t('landing.subtitle', 'Direct Farm to Table')}
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('landing.description', 'Connecting farmers directly with buyers. Fair prices, fresh produce, no middlemen.')}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12">
          <Link 
            to="/register?role=farmer" 
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 min-h-[48px] flex items-center justify-center"
          >
            {t('landing.farmerBtn', 'I am a Farmer 🌾')}
          </Link>
          <Link 
            to="/register?role=buyer" 
            className="w-full sm:w-auto bg-accent-500 hover:bg-accent-600 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 min-h-[48px] flex items-center justify-center"
          >
            {t('landing.buyerBtn', 'I am a Buyer 🛒')}
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-primary-500">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-dark mb-2">Fair Price Check</h3>
            <p className="text-gray-600">Compare agent offers directly with live Mandi rates to ensure you get a fair deal.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-accent-500">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-dark mb-2">Direct Trade</h3>
            <p className="text-gray-600">Sell directly to businesses and consumers, maximizing your profit margin.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-primary-500">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-dark mb-2">AI Advisor</h3>
            <p className="text-gray-600">Get personalized advice on market trends, crop pricing, and the best time to sell.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

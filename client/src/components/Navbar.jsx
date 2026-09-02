import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import LanguageToggle from './LanguageToggle';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isFarmer, isBuyer, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">🌾 KisaanConnect</span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <>
                {isFarmer && (
                  <>
                    <Link to="/farmer/dashboard" className="text-dark hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.dashboard')}</Link>
                    <Link to="/listings/create" className="text-dark hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.createListing')}</Link>
                    <Link to="/deals" className="text-dark hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.deals')}</Link>
                  </>
                )}
                {isBuyer && (
                  <>
                    <Link to="/buyer/dashboard" className="text-dark hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.dashboard')}</Link>
                    <Link to="/deals" className="text-dark hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.deals')}</Link>
                  </>
                )}
                <Link to="/impact" className="text-dark hover:text-primary-600 px-3 py-2 rounded-md text-sm font-bold flex items-center gap-1">
                  📊 {t('nav.impact', 'Impact Analytics')}
                </Link>
                <LanguageToggle />
                <div className="relative">
                  <button
                    onClick={() => setShowNotif(!showNotif)}
                    className="p-2 text-dark hover:text-primary-600 relative min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  </button>
                  <NotificationPanel isOpen={showNotif} onClose={() => setShowNotif(false)} />
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-dark hidden lg:block">{user?.name}</span>
                  <button onClick={handleLogout} className="ml-2 bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-colors">
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <LanguageToggle />
                <Link to="/login" className="text-dark hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium min-h-[44px] flex items-center">{t('nav.login')}</Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] flex items-center transition-colors">{t('nav.register')}</Link>
              </>
            )}
          </div>
          {/* Mobile hamburger */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-dark hover:text-primary-600 focus:outline-none min-h-[48px] min-w-[48px]">
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <div className="py-2"><LanguageToggle /></div>
            {isAuthenticated ? (
              <>
                {isFarmer && (
                  <>
                    <Link to="/farmer/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-dark hover:bg-gray-50 min-h-[48px]">{t('nav.dashboard')}</Link>
                    <Link to="/listings/create" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-dark hover:bg-gray-50 min-h-[48px]">{t('nav.createListing')}</Link>
                  </>
                )}
                {isBuyer && (
                  <Link to="/buyer/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-dark hover:bg-gray-50 min-h-[48px]">{t('nav.dashboard')}</Link>
                )}
                <Link to="/deals" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-dark hover:bg-gray-50 min-h-[48px]">{t('nav.deals')}</Link>
                <Link to="/impact" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-lg text-base font-bold text-emerald-800 hover:bg-gray-50 min-h-[48px]">📊 {t('nav.impact', 'Impact Analytics')}</Link>
                <Link to="/notifications" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-dark hover:bg-gray-50 min-h-[48px]">{t('nav.notifications')}</Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-3 rounded-lg text-base font-medium text-accent-600 hover:bg-gray-50 min-h-[48px]">{t('nav.logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-dark hover:bg-gray-50 min-h-[48px]">{t('nav.login')}</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-primary-600 hover:bg-gray-50 min-h-[48px]">{t('nav.register')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

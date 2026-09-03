import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import LanguageToggle from './LanguageToggle';
import NotificationPanel from './NotificationPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { Wheat } from 'lucide-react';

const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={cn(
      "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive ? "text-primary-600" : "text-slate-600 hover:text-primary-600 hover:bg-primary-50"
    )}
  >
    {children}
    {isActive && (
      <motion.div
        layoutId="navbar-active"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isFarmer, isBuyer, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-gray-200/50" 
          : "bg-white/50 backdrop-blur-md border-transparent"
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center gap-2"
              >
                <span><svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2.66663L3.99996 7.99996V14.6666C3.99996 22.0666 9.15996 28.9733 16 30.6666C22.84 28.9733 28 22.0666 28 14.6666V7.99996L16 2.66663Z" fill="#10B981"/>
  <path d="M16 2.66663V30.6666C22.84 28.9733 28 22.0666 28 14.6666V7.99996L16 2.66663Z" fill="#059669"/>
  <path d="M16 22.6666C16 22.6666 10.6666 18.6666 10.6666 14.6666C10.6666 11.6666 13 9.33329 16 9.33329C19 9.33329 21.3333 11.6666 21.3333 14.6666C21.3333 18.6666 16 22.6666 16 22.6666Z" fill="#D1FAE5"/>
  <path d="M16 9.33329C14.5272 9.33329 13.3333 10.5272 13.3333 12C13.3333 13.4728 14.5272 14.6666 16 14.6666C17.4728 14.6666 18.6666 13.4728 18.6666 12C18.6666 10.5272 17.4728 9.33329 16 9.33329Z" fill="#059669"/>
</svg></span> Lagaan Secure
              </motion.div>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-2">
            {isAuthenticated ? (
              <>
                {isFarmer && (
                  <>
                    <NavLink to="/farmer/dashboard" isActive={location.pathname === '/farmer/dashboard'}>{t('nav.dashboard')}</NavLink>
                    <NavLink to="/listings/create" isActive={location.pathname === '/listings/create'}>{t('nav.createListing')}</NavLink>
                    <NavLink to="/deals" isActive={location.pathname === '/deals'}>{t('nav.deals')}</NavLink>
                  </>
                )}
                {isBuyer && (
                  <>
                    <NavLink to="/buyer/dashboard" isActive={location.pathname === '/buyer/dashboard'}>{t('nav.dashboard')}</NavLink>
                    <NavLink to="/deals" isActive={location.pathname === '/deals'}>{t('nav.deals')}</NavLink>
                  </>
                )}
                <NavLink to="/disputes" isActive={location.pathname === '/disputes'}>{t('nav.disputes', 'Disputes')}</NavLink>
                {user?.role === "admin" && <NavLink to="/admin" isActive={location.pathname === '/admin'}>⚙️ {t('nav.admin', 'Admin')}</NavLink>}
                <NavLink to="/impact" isActive={location.pathname === '/impact'}>
                  <span className="flex items-center gap-1">📊 {t('nav.impact', 'Impact Analytics')}</span>
                </NavLink>
                
                <div className="w-px h-6 bg-slate-200 mx-2" />
                
                <LanguageToggle />
                
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotif(!showNotif)}
                    className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-full relative transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  </motion.button>
                  <NotificationPanel isOpen={showNotif} onClose={() => setShowNotif(false)} />
                </div>
                
                <div className="relative ml-2" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 hover:border-primary-300 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm border border-primary-200">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 hidden lg:block">{user?.name}</span>
                    <svg className={cn("w-4 h-4 text-slate-400 transition-transform", showUserMenu && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 lg:hidden">
                          <p className="text-sm text-slate-500">Signed in as</p>
                          <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                        </div>
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t('nav.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <LanguageToggle />
                <Link to="/login">
                  <Button variant="ghost" className="text-slate-600 hover:text-primary-600">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="shadow-sm hover:shadow-md transition-shadow">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile hamburger */}
          <div className="-mr-2 flex items-center sm:hidden gap-2">
            {!isAuthenticated && <LanguageToggle />}
            {isAuthenticated && (
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="p-2 text-slate-500 hover:text-primary-600 relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
            )}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {isAuthenticated && (
                <div className="flex items-center gap-3 px-3 py-4 mb-2 border-b border-slate-100">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg border border-primary-200">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{user?.name}</div>
                    <div className="text-xs text-slate-500">{isFarmer ? 'Farmer' : isBuyer ? 'Buyer' : 'User'}</div>
                  </div>
                </div>
              )}
              
              {isAuthenticated && (
                <div className="py-2 flex items-center justify-between px-3">
                  <span className="text-sm font-medium text-slate-600">Language</span>
                  <LanguageToggle />
                </div>
              )}
              
              {isAuthenticated ? (
                <div className="space-y-1 mt-2">
                  {isFarmer && (
                    <>
                      <MobileNavLink to="/farmer/dashboard" onClick={() => setIsOpen(false)} isActive={location.pathname === '/farmer/dashboard'}>{t('nav.dashboard')}</MobileNavLink>
                      <MobileNavLink to="/listings/create" onClick={() => setIsOpen(false)} isActive={location.pathname === '/listings/create'}>{t('nav.createListing')}</MobileNavLink>
                    </>
                  )}
                  {isBuyer && (
                    <MobileNavLink to="/buyer/dashboard" onClick={() => setIsOpen(false)} isActive={location.pathname === '/buyer/dashboard'}>{t('nav.dashboard')}</MobileNavLink>
                  )}
                  <MobileNavLink to="/deals" onClick={() => setIsOpen(false)} isActive={location.pathname === '/deals'}>{t('nav.deals')}</MobileNavLink>
                  <MobileNavLink to="/disputes" onClick={() => setIsOpen(false)} isActive={location.pathname === '/disputes'}>⚖️ {t('nav.disputes', 'Disputes')}</MobileNavLink>
                  {user?.role === "admin" && <MobileNavLink to="/admin" onClick={() => setIsOpen(false)} isActive={location.pathname === '/admin'}>⚙️ {t('nav.admin', 'Admin')}</MobileNavLink>}
                  <MobileNavLink to="/impact" onClick={() => setIsOpen(false)} isActive={location.pathname === '/impact'} className="text-primary-700 font-semibold bg-primary-50/50">📊 {t('nav.impact', 'Impact Analytics')}</MobileNavLink>
                  <MobileNavLink to="/notifications" onClick={() => setIsOpen(false)} isActive={location.pathname === '/notifications'}>{t('nav.notifications')}</MobileNavLink>
                  
                  <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }} 
                    className="flex w-full items-center gap-2 px-4 py-3 mt-4 rounded-xl text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-center mb-2">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-center">{t('nav.register')}</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const MobileNavLink = ({ to, onClick, children, isActive, className }) => (
  <Link 
    to={to} 
    onClick={onClick} 
    className={cn(
      "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
      isActive 
        ? "text-primary-700 bg-primary-50" 
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      className
    )}
  >
    {children}
  </Link>
);

export default Navbar;

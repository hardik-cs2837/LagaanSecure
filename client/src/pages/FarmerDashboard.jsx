import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import MarkupCalculator from '../components/MarkupCalculator';
import PriceTrendRecommendation from '../components/PriceTrendRecommendation';
import AIDemandForecastWidget from '../components/AIDemandForecastWidget';
import SmartBuyerMatchingWidget from '../components/SmartBuyerMatchingWidget';
import BulkRequirementsSection from '../components/BulkRequirementsSection';
import StorageDirectoryModal from '../components/StorageDirectoryModal';
import FpoBulkLotModal from '../components/FpoBulkLotModal';
import MultiStopRouteModal from '../components/MultiStopRouteModal';
import ListingCard from '../components/ListingCard';
import DealCard from '../components/DealCard';
import NearestMarketSuggestion from '../components/NearestMarketSuggestion';
import AIChatbot from '../components/AIChatbot';
import AISmartSellCopilot from '../components/AISmartSellCopilot';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { 
  CurrencyRupeeIcon, 
  PresentationChartLineIcon, 
  DocumentTextIcon, 
  TruckIcon,
  UserGroupIcon,
  SparklesIcon,
  PlusIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { FiBox, FiTrendingUp, FiActivity, FiMapPin, FiTruck, FiAlertCircle } from 'react-icons/fi';

const FarmerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [myListings, setMyListings] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingDeals, setLoadingDeals] = useState(true);
  
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showFpoModal, setShowFpoModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showCopilotModal, setShowCopilotModal] = useState(false);

  useEffect(() => {
    fetchMyListings();
    fetchMyDeals();
  }, []);

  const fetchMyListings = async () => {
    try {
      const res = await api.get('/listings/my');
      setMyListings(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchMyDeals = async () => {
    try {
      const res = await api.get('/deals/my');
      setMyDeals(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDeals(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const estimatedValue = myDeals.reduce((sum, deal) => {
     return sum + (deal.price * deal.quantity || 0);
  }, 0) || 45000; 

  const stats = [
    { 
      label: 'Active Lots', 
      value: loadingListings ? '-' : myListings.length, 
      icon: <FiBox className="w-6 h-6 text-emerald-600" />, 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-100',
      trend: myListings.length > 0 ? '+1 this week' : 'No active lots' 
    },
    { 
      label: 'Pending Deals', 
      value: loadingDeals ? '-' : myDeals.length, 
      icon: <FiActivity className="w-6 h-6 text-blue-600" />, 
      bg: 'bg-blue-50', 
      border: 'border-blue-100',
      trend: myDeals.length > 0 ? 'Requires action' : 'All caught up' 
    },
    { 
      label: 'Est. Revenue', 
      value: `₹${estimatedValue.toLocaleString()}`, 
      icon: <CurrencyRupeeIcon className="w-6 h-6 text-indigo-600" />, 
      bg: 'bg-indigo-50', 
      border: 'border-indigo-100',
      trend: '+12% vs last month' 
    },
  ];

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header & Quick Actions */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {t('farmer.welcome', 'Welcome back')},{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                {user?.name || 'Kisaan'}
              </span> 👋
            </h1>
            {user?.fpo_name && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 uppercase tracking-wider shadow-sm">
                <UserGroupIcon className="w-3.5 h-3.5" />
                FPO: {user.fpo_name}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-base font-medium max-w-2xl">
            {t('farmer.subtitle', "Here's what's happening with your crops today. Track deals, forecast demand, and manage your lots.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCopilotModal(true)}
            className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-xl hover:from-emerald-500 hover:to-indigo-500 transition-all shadow-md hover:shadow-emerald-500/25 overflow-hidden"
          >
            <SparklesIcon className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Sell Copilot</span>
          </button>

          <button
            onClick={() => setShowFpoModal(true)}
            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-700 bg-white border border-amber-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <UserGroupIcon className="w-4 h-4 text-amber-500" />
            <span>Pool FPO Lot</span>
          </button>
          
          <button
            onClick={() => setShowRouteModal(true)}
            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <FiTruck className="w-4 h-4 text-indigo-500" />
            <span>Multi-Stop Route</span>
          </button>

          <button
            onClick={() => setShowStorageModal(true)}
            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <BuildingOfficeIcon className="w-4 h-4 text-blue-500" />
            <span>Cold Storage</span>
          </button>

          <Link to="/listings/create" className="shrink-0">
            <Button className="shadow-md hover:shadow-lg transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-transparent px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold">
              <PlusIcon className="w-4 h-4 stroke-2" />
              {t('farmer.addListing', 'Add Lot')}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={cn("relative overflow-hidden bg-white p-6 rounded-2xl border shadow-sm group hover:shadow-md transition-all duration-300", stat.border)}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
               {stat.icon}
            </div>
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-slate-500">
              <FiTrendingUp className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              {stat.trend}
            </div>
          </div>
        ))}
      </motion.div>

      {/* AI Smart Sell Copilot Featured Section */}
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-400/30">
                <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                Government Verified Mandi Intelligence
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                AI Smart Sell Copilot
              </h2>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                6-step interactive workflow: Get verified government mandi price benchmarks, expected net realization, and data-backed sell/store recommendations.
              </p>
            </div>

            <button
              onClick={() => setShowCopilotModal(true)}
              className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold px-7 py-3.5 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 text-sm sm:text-base group"
            >
              <span>Launch Copilot Workflow 🚀</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Embedded Interactive Copilot Widget */}
        <AISmartSellCopilot />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <MarkupCalculator />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AIDemandForecastWidget defaultCrop={myListings[0]?.crop_name || 'Onion'} />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <PriceTrendRecommendation initialCrop={myListings[0]?.crop_name || 'Onion'} initialState="Maharashtra" />
      </motion.div>

      <motion.div variants={itemVariants}>
        <SmartBuyerMatchingWidget 
          crop={myListings[0]?.crop_name || 'Onion'} 
          quantity={myListings[0]?.quantity || 100}
          location={user?.location || 'Nashik, Maharashtra'} 
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <BulkRequirementsSection isBuyer={false} />
      </motion.div>

      {/* Two Column: My Listings + Nearest Mandis */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Listings */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 h-full flex flex-col relative overflow-hidden">
            {/* Subtle background mesh/pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />
            
            <div className="relative z-10 flex-1">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-emerald-600" />
                    {t('farmer.myListings', 'My Active Lots')}
                  </h2>
                  <div className="h-1 w-10 bg-gradient-to-r from-emerald-500 to-transparent mt-2 rounded-full" />
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                  {myListings.length} {t('listings.active', 'active')}
                </span>
              </div>

              {loadingListings ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4 p-4 border border-slate-100 rounded-2xl bg-slate-50">
                       <div className="rounded-xl bg-slate-200 h-20 w-20"></div>
                       <div className="flex-1 space-y-4 py-1">
                         <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                         <div className="space-y-2">
                           <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                           <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : myListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 px-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <FiBox className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{t('farmer.noListings', 'No active produce listings')}</h3>
                  <p className="text-slate-500 text-sm mt-2 max-w-sm">{t('farmer.noListingsDesc', 'Create a listing to start receiving direct offers from verified buyers with zero middleman commissions.')}</p>
                  <Link
                    to="/listings/create"
                    className="mt-6 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
                  >
                    <PlusIcon className="w-4 h-4" />
                    {t('farmer.create_first_lot', 'Create Your First Lot')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} showOfferButton={false} />
                  ))}
                </div>
              )}
            </div>
            
            {myListings.length > 0 && (
              <div className="pt-6 mt-6 border-t border-slate-100 text-center relative z-10">
                <Link
                  to="/listings/create"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add another lot
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nearest Mandis & Market Channels */}
        <div className="lg:col-span-5 space-y-8">
          <NearestMarketSuggestion userLocation={user?.location || 'Nashik, Maharashtra'} />
        </div>
      </motion.div>

      {/* Incoming Offers & Deals */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-blue-600" />
                {t('farmer.incomingOffers', 'Incoming Direct Buyer Offers')}
              </h2>
              <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-transparent mt-2 rounded-full mb-2" />
              <p className="text-sm text-slate-500 font-medium">Manage price negotiations, confirm payments & schedule farm haulage</p>
            </div>
            <Link to="/deals" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg">
              {t('common.view_all', 'View All Deals')} 
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {loadingDeals ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-slate-50 border border-slate-100 rounded-2xl h-32" />
              ))}
            </div>
          ) : myDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
              <FiAlertCircle className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-700 font-semibold">{t('farmer.noOffers', 'No incoming offers right now.')}</p>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">Offers will appear here as soon as buyers discover your produce lots.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myDeals.slice(0, 4).map((deal) => (
                <div key={deal.id} className="transition-transform hover:-translate-y-1 duration-300">
                  <DealCard
                    deal={deal}
                    userRole="farmer"
                    userId={user?.id}
                    onUpdate={fetchMyDeals}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Storage Facilities Directory Modal */}
      <StorageDirectoryModal 
        isOpen={showStorageModal} 
        onClose={() => setShowStorageModal(false)} 
        defaultState="Maharashtra"
      />

      {/* FPO Bulk Lot Modal */}
      <FpoBulkLotModal
        isOpen={showFpoModal}
        onClose={() => setShowFpoModal(false)}
        onSuccess={fetchMyListings}
        user={user}
      />

      {/* Multi-Stop Delivery Route Optimizer Modal */}
      <MultiStopRouteModal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        userLocation={user?.location || 'Nashik Farm Hub'}
      />

      {/* AI Smart Sell Copilot Modal */}
      <AnimatePresence>
        {showCopilotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl my-auto rounded-3xl"
            >
              <AISmartSellCopilot onClose={() => setShowCopilotModal(false)} isModal={true} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Chatbot Floating Widget */}
      <AIChatbot />
    </motion.div>
  );
};

export default FarmerDashboard;

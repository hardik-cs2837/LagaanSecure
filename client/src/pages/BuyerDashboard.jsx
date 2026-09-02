import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { listings, deals } from '../services/api';
import toast from 'react-hot-toast';
import DemandSupplyIndicators from '../components/DemandSupplyIndicators';
import NearestMarketSuggestion from '../components/NearestMarketSuggestion';
import BuyerBadge from '../components/BuyerBadge';
import StorageDirectoryModal from '../components/StorageDirectoryModal';
import MultiStopRouteModal from '../components/MultiStopRouteModal';
import BulkRequirementsModal from '../components/BulkRequirementsModal';
import BulkRequirementsSection from '../components/BulkRequirementsSection';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import ListingCard from '../components/ListingCard';

const getCropEmoji = (cropName) => {
  const name = cropName?.toLowerCase() || '';
  if (name.includes('wheat')) return '🌾';
  if (name.includes('tomato')) return '🍅';
  if (name.includes('onion')) return '🧅';
  if (name.includes('rice')) return '🍚';
  if (name.includes('potato')) return '🥔';
  if (name.includes('soybean')) return '🫘';
  if (name.includes('cotton')) return '🏵️';
  return '🌱';
};

// Inline SVG Icons for premium feel
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ isOpen }) => (
  <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [qualityGrade, setQualityGrade] = useState('');
  const [fpoOnly, setFpoOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = { 
        crop: search || undefined, 
        location: location || undefined, 
        minPrice: minPrice || undefined, 
        maxPrice: maxPrice || undefined, 
        quality_grade: qualityGrade || undefined,
        isFpo: fpoOnly ? 'true' : undefined,
        page 
      };
      const res = await listings.getListings(filters);
      setItems(res.data?.data?.listings || res.data?.listings || []);
      setTotalPages(res.data?.data?.totalPages || res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(t('common.error_fetch', 'Failed to fetch listings.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      setDealsLoading(true);
      const res = await deals.getMyDeals();
      setMyDeals(res.data?.data || res.data?.deals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDealsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, fpoOnly, qualityGrade]);

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setQualityGrade('');
    setFpoOnly(false);
    setPage(1);
    fetchListings();
  };

  const hasActiveFilters = search || location || minPrice || maxPrice || qualityGrade || fpoOnly;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Mock stats for premium UI
  const stats = [
    { label: 'Active Listings', value: items.length > 0 ? items.length + '+' : '-', icon: '📦', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Deals Completed', value: user?.deals_completed_count || 18, icon: '🤝', color: 'bg-blue-50 text-blue-700' },
    { label: 'Est. Savings', value: '₹1.2L+', icon: '💰', color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <motion.div 
      className="min-h-screen bg-slate-50 pb-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Premium Header */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {t('buyer.welcome', 'Welcome back')}, <span className="text-emerald-700">{user?.name}</span>!
                </h1>
                <BuyerBadge 
                  isVerified={user?.is_verified ?? true} 
                  businessName={user?.business_name} 
                  ratingAvg={user?.rating_avg || 4.9}
                  dealsCompleted={user?.deals_completed_count || 18}
                  size="sm" 
                />
              </div>
              <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
                {t('buyer.dashboard_subtitle', 'Manage your procurement pipeline, discover premium agricultural produce, and negotiate directly with verified farmers.')}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setShowBulkModal(true)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2">
                <span>📢</span> {t('bulk.post_req_btn', 'Post Bulk Tender')}
              </button>
              <button onClick={() => setShowRouteModal(true)} className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2">
                <span>🚚</span> {t('routes.route_planner_btn', 'Route Optimizer')}
              </button>
              <button onClick={() => setShowStorageModal(true)} className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2">
                <span>❄️</span> {t('storage.btn', 'Storage')}
              </button>
              <Link to="/deals">
                <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2">
                  <span>📋</span> My Deals
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Demand & Supply Arrival Volume Indicators */}
        <motion.div variants={itemVariants}>
          <DemandSupplyIndicators />
        </motion.div>

        {/* Institutional Bulk Requirements Section */}
        <motion.div variants={itemVariants}>
          <BulkRequirementsSection 
            onOpenPostModal={() => setShowBulkModal(true)} 
            isBuyer={true} 
          />
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-slate-200 w-full my-8"></div>

        {/* Advanced Search & Filter Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">{t('buyer.browseListings', 'Procurement Directory')}</h2>
            <button 
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
            >
              <FilterIcon />
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              <ChevronDownIcon isOpen={showAdvancedFilters} />
            </button>
          </div>

          <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="pl-4 text-slate-400">
                <SearchIcon />
              </div>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('buyer.searchPlaceholder', 'Search by crop name (e.g., Wheat, Tomato...)')}
                className="w-full px-4 py-4 bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-400"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => setSearch('')}
                    className="p-2 mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <CloseIcon />
                  </motion.button>
                )}
              </AnimatePresence>
              <button 
                type="submit" 
                className="m-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                {t('common.submit', 'Search')}
              </button>
            </div>

            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('listings.location', 'Location')}</label>
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Nashik"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('listings.quality_grade', 'Quality Grade')}</label>
                      <select
                        value={qualityGrade}
                        onChange={(e) => setQualityGrade(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm bg-white text-slate-700"
                      >
                        <option value="">{t('common.all_grades', 'All Quality Grades')}</option>
                        <option value="A">Grade A (Premium / Export)</option>
                        <option value="B">Grade B (Standard Wholesale)</option>
                        <option value="C">Grade C (Processing / Fair)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Min Price (₹)</label>
                      <input 
                        type="number" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min ₹"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Max Price (₹)</label>
                      <input 
                        type="number" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max ₹"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm bg-white"
                      />
                    </div>
                    
                    <div className="md:col-span-4 flex items-center justify-between pt-2">
                      <label className="inline-flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={fpoOnly}
                            onChange={(e) => setFpoOnly(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                          👥 {t('buyer.fpo_filter', 'Show FPO Collective Lots Only')}
                        </span>
                      </label>

                      {hasActiveFilters && (
                        <button 
                          type="button" 
                          onClick={clearFilters}
                          className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
                        >
                          <CloseIcon /> {t('common.cancel', 'Clear All Filters')}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Listings Grid */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-500 font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Showing {items.length} lots
            </span>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 animate-pulse space-y-4">
                  <div className="h-48 bg-slate-100 rounded-xl w-full mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-10 bg-slate-200 rounded-xl w-full mt-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-50 text-rose-700 p-8 rounded-2xl text-center border border-rose-100 max-w-2xl mx-auto mt-12">
              <span className="text-4xl block mb-4">⚠️</span>
              <p className="font-semibold text-lg">{error}</p>
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-16 rounded-3xl shadow-sm text-center border border-slate-200 max-w-2xl mx-auto mt-12">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('buyer.noListings', 'No matching lots found')}</h3>
              <p className="text-slate-500 text-base mb-8 max-w-md mx-auto">{t('buyer.noListingsDesc', 'Try adjusting your search filters, widening your price range, or clearing the quality grade toggle.')}</p>
              <button 
                onClick={clearFilters}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {items.map(listing => (
                  <motion.div
                    key={listing.id || listing._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListingCard listing={listing} showOfferButton={true} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Modern Pill Pagination */}
          {!loading && totalPages > 1 && (
            <motion.div layout className="flex justify-center mt-12">
              <div className="inline-flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
                >
                  ← {t('common.back', 'Prev')}
                </button>
                
                <div className="flex items-center gap-1 px-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show current, first, last, and pages around current
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center ${page === pageNum ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="text-slate-400 px-1">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
                >
                  {t('common.next', 'Next')} →
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Nearest Market Suggestions */}
        <motion.div variants={itemVariants}>
          <NearestMarketSuggestion userLocation={user?.location || 'Nashik, Maharashtra'} />
        </motion.div>
      </div>

      {/* Modals */}
      <StorageDirectoryModal
        isOpen={showStorageModal}
        onClose={() => setShowStorageModal(false)}
        defaultState="Maharashtra"
      />

      <MultiStopRouteModal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        userLocation={user?.location || 'Nashik Hub'}
      />

      <BulkRequirementsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={fetchListings}
      />
    </motion.div>
  );
}

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

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Storage modal state
  const [showStorageModal, setShowStorageModal] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [fpoOnly, setFpoOnly] = useState(false);
  
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
  }, [page, fpoOnly]);

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      {/* Header */}
      <div className="bg-primary-700 text-white p-6 rounded-b-3xl shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">{t('buyer.welcome', 'Welcome')}, {user?.name}!</h1>
              <BuyerBadge isVerified={user?.is_verified ?? true} businessName={user?.business_name} size="sm" />
            </div>
            <p className="text-primary-100 mt-1 text-sm md:text-base">
              {t('buyer.dashboard_subtitle', 'Source direct fresh agricultural produce with verified credentials & zero middleman markups.')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStorageModal(true)}
              className="bg-primary-800/80 hover:bg-primary-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-primary-500/30 transition shadow-sm flex items-center gap-1.5"
            >
              🏬 {t('storage.btn', 'Storage Facilities')}
            </button>
            <Link
              to="/deals"
              className="bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              🤝 {t('buyer.myDeals', 'My Deals')} ({myDeals.length})
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Demand & Supply Arrival Volume Indicators */}
        <DemandSupplyIndicators />

        {/* Search & Filter Section */}
        <form onSubmit={handleSearch} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('listings.crop', 'Crop Name')}</label>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('buyer.searchPlaceholder', 'e.g. Onion, Wheat, Tomato...')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('listings.location', 'Location / District')}</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nashik, Maharashtra"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Min ₹</label>
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Max ₹</label>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button 
                type="submit" 
                className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition shadow-sm flex items-center justify-center text-sm"
              >
                🔍 {t('common.submit', 'Search')}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={fpoOnly}
                onChange={(e) => setFpoOnly(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="font-semibold text-gray-700">👥 {t('buyer.fpo_filter', 'Show FPO / Farmer Group Collective Lots Only')}</span>
            </label>
            <button 
              type="button" 
              onClick={() => { setSearch(''); setLocation(''); setMinPrice(''); setMaxPrice(''); setFpoOnly(false); fetchListings(); }}
              className="text-gray-400 hover:text-gray-600"
            >
              {t('common.cancel', 'Clear Filters')}
            </button>
          </div>
        </form>

        {/* Listings Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark">{t('buyer.browseListings', 'Available Fresh Produce')}</h2>
            <span className="text-xs text-gray-500 font-medium">
              {items.length} {t('common.quintals', 'lots listed')}
            </span>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-lg font-bold text-gray-900">{t('buyer.noListings', 'No listings found')}</h3>
              <p className="text-gray-500 text-sm mt-1">{t('buyer.noListingsDesc', 'Try adjusting your search filters or clear the FPO toggle.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(listing => (
                <div key={listing.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
                  <div className="p-5">
                    {/* Top Row */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{getCropEmoji(listing.crop_name)}</span>
                        <div>
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            listing.quality_grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                            listing.quality_grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {t('listings.quality', 'Grade')} {listing.quality_grade}
                          </span>
                          {listing.is_fpo_pool && (
                            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                              👥 FPO
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                        {listing.status === 'active' ? t('listings.active', 'Active') : t('listings.sold', 'Sold')}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-dark mt-2 mb-1">{listing.crop_name}</h3>
                    
                    <div className="space-y-2 mt-4 text-xs text-gray-600">
                      <p className="flex justify-between border-b border-gray-50 pb-1.5">
                        <span className="text-gray-400">{t('listings.quantity', 'Quantity')}</span>
                        <span className="font-bold text-dark text-sm">{listing.quantity} {listing.unit}</span>
                      </p>
                      <p className="flex justify-between border-b border-gray-50 pb-1.5">
                        <span className="text-gray-400">{t('listings.price', 'Farmer Price')}</span>
                        <span className="font-extrabold text-primary-700 text-sm">
                          {listing.price_per_unit || listing.price ? `₹${listing.price_per_unit || listing.price}/${listing.unit}` : t('deals.pending', 'Open to offers')}
                        </span>
                      </p>
                      <p className="flex justify-between border-b border-gray-50 pb-1.5">
                        <span className="text-gray-400">{t('listings.location', 'Location')}</span>
                        <span className="font-medium text-dark truncate max-w-[60%] text-right">{listing.location}</span>
                      </p>
                      <p className="flex justify-between items-center pb-1">
                        <span className="text-gray-400">{t('listings.farmerInfo', 'Farmer / Source')}</span>
                        <span className="font-bold text-dark flex items-center gap-1">
                          👨‍🌾 {listing.farmer?.name || 'Farmer'}
                          {listing.farmer?.fpo_name && (
                            <span className="text-[10px] bg-primary-50 text-primary-700 px-1.5 py-0.2 rounded">
                              {listing.farmer.fpo_name}
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <Link 
                      to={`/listings/${listing.id}`} 
                      className="flex items-center justify-center w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition shadow-sm text-sm"
                    >
                      {t('deals.makeOffer', 'View Details & Make Offer')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center space-x-3 mt-8">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold disabled:opacity-40 bg-white"
              >
                ← {t('common.back', 'Previous')}
              </button>
              <span className="text-xs font-semibold text-gray-600">
                {page} / {totalPages}
              </span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold disabled:opacity-40 bg-white"
              >
                {t('common.next', 'Next')} →
              </button>
            </div>
          )}
        </div>

        {/* Nearest Market Suggestions */}
        <NearestMarketSuggestion userLocation={user?.location || 'Nashik, Maharashtra'} />
      </div>

      {/* Storage Facilities Directory Modal */}
      <StorageDirectoryModal
        isOpen={showStorageModal}
        onClose={() => setShowStorageModal(false)}
        defaultState="Maharashtra"
      />
    </div>
  );
}

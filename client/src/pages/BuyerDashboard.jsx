import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { listings, deals } from '../services/api';
import toast from 'react-hot-toast';

const getCropEmoji = (cropName) => {
  const name = cropName?.toLowerCase() || '';
  if (name.includes('wheat')) return '🌾';
  if (name.includes('tomato')) return '🍅';
  if (name.includes('onion')) return '🧅';
  if (name.includes('rice')) return '🍚';
  if (name.includes('potato')) return '🥔';
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

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = { search, location, minPrice, maxPrice, page };
      const res = await listings.getListings(filters);
      setItems(res.data?.listings || res.listings || []);
      setTotalPages(res.data?.totalPages || res.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(t('common.error_fetch', 'Failed to fetch listings.'));
      toast.error(t('common.error_fetch', 'Failed to fetch listings.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      setDealsLoading(true);
      const res = await deals.getMyDeals();
      setMyDeals(res.data?.deals || res.deals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDealsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page]);

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
      <div className="bg-primary-700 text-white p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold">{t('buyer.welcome', 'Welcome')}, {user?.name}!</h1>
        <p className="text-primary-100 mt-1">{t('buyer.dashboard_subtitle', 'Find the best produce directly from farmers.')}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Search Section */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('listings.crop_name', 'Crop')}</label>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('buyer.search_crop', 'Search crop...')}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('listings.location', 'Location')}</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('buyer.search_location', 'Location...')}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.min', 'Min ₹')}</label>
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.max', 'Max ₹')}</label>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition shadow-sm flex items-center justify-center">
                {t('common.search', 'Search')}
              </button>
            </div>
          </div>
        </form>

        {/* Listings Grid */}
        <h2 className="text-xl font-bold text-dark mb-4">{t('buyer.available_produce', 'Available Produce')}</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-medium text-gray-900">{t('common.no_results', 'No results found')}</h3>
            <p className="text-gray-500 mt-1">{t('buyer.try_different_filters', 'Try adjusting your search filters.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(listing => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCropEmoji(listing.crop_name)}</span>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        listing.quality_grade === 'A' ? 'bg-green-100 text-green-700' :
                        listing.quality_grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {t('listings.grade', 'Grade')} {listing.quality_grade}
                      </span>
                    </div>
                    {listing.status && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        {listing.status}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-dark mt-2 mb-1">{listing.crop_name}</h3>
                  
                  <div className="space-y-2 mt-4 text-sm text-gray-600">
                    <p className="flex justify-between border-b border-gray-50 pb-1">
                      <span>{t('listings.quantity', 'Quantity')}</span>
                      <span className="font-medium text-dark">{listing.quantity} {listing.unit}</span>
                    </p>
                    <p className="flex justify-between border-b border-gray-50 pb-1">
                      <span>{t('listings.price', 'Price')}</span>
                      <span className="font-medium text-primary-600">
                        {listing.price ? `₹${listing.price}/${listing.unit}` : t('listings.open_to_offers', 'Open to offers')}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-gray-50 pb-1">
                      <span>{t('listings.location', 'Location')}</span>
                      <span className="text-right max-w-[60%] truncate" title={listing.location}>{listing.location}</span>
                    </p>
                    <p className="flex justify-between pb-1">
                      <span>{t('listings.farmer', 'Farmer')}</span>
                      <span className="font-medium">{listing.farmer_name || 'Farmer'}</span>
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <Link 
                    to={`/listing/${listing.id}`} 
                    className="flex items-center justify-center w-full h-12 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition"
                  >
                    {t('buyer.view_offer', 'View & Offer')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              {t('common.prev', 'Previous')}
            </button>
            <span className="text-gray-600">
              {t('common.page', 'Page')} {page} {t('common.of', 'of')} {totalPages}
            </span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              {t('common.next', 'Next')}
            </button>
          </div>
        )}

        {/* Active Deals Section */}
        <div className="mt-12 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark">{t('buyer.my_active_deals', 'My Active Deals')}</h2>
            <Link to="/deals" className="text-primary-600 font-medium hover:underline">
              {t('common.view_all', 'View All')}
            </Link>
          </div>
          
          {dealsLoading ? (
            <div className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse"></div>
          ) : myDeals.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
              {t('buyer.no_active_deals', 'You have no active deals yet.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myDeals.slice(0, 4).map(deal => (
                <Link to="/deals" key={deal.id} className="block bg-white p-4 rounded-xl border border-gray-100 hover:border-primary-300 transition shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-dark">{deal.crop_name}</h4>
                    <p className="text-sm text-gray-500">{t('deals.offered', 'Offered')}: ₹{deal.offered_price}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    deal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    deal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    deal.status === 'countered' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

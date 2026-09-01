import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { deals } from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function DealFlow() {
  const { t } = useTranslation();
  const { user, isBuyer, isFarmer } = useContext(AuthContext);

  const [allDeals, setAllDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // State for countering
  const [counterId, setCounterId] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await deals.getMyDeals();
      setAllDeals(res.data?.data || res.data?.deals || []);
    } catch (err) {
      console.error(err);
      toast.error(t('common.error_fetch', 'Failed to fetch deals.'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, price = null) => {
    try {
      const payload = { status };
      if (price !== null) payload.counter_price = Number(price);
      
      await deals.updateDeal(id, payload);
      toast.success(`Deal ${status}!`);
      
      // Update locally
      setAllDeals(prev => prev.map(d => {
        if (d.id === id) {
          return { ...d, status, counter_price: price || d.counter_price };
        }
        return d;
      }));
      setCounterId(null);
    } catch (err) {
      console.error(err);
      toast.error(t('common.error_occurred', 'Action failed.'));
    }
  };

  const submitCounter = (id) => {
    if (!counterPrice || Number(counterPrice) <= 0) {
      toast.error(t('deals.invalid_price', 'Enter a valid price'));
      return;
    }
    handleUpdateStatus(id, 'countered', counterPrice);
  };

  const filteredDeals = filter === 'all' ? allDeals : allDeals.filter(d => d.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'countered': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-dark text-center">{t('deals.title', 'Deal Flow')}</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 py-2 mb-6">
          {['all', 'pending', 'countered', 'accepted', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${
                filter === f 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(n => (
              <div key={n} className="h-40 bg-white rounded-xl border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100 mt-8">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-lg font-medium text-gray-900">{t('deals.no_deals', 'No deals found')}</h3>
            <p className="text-gray-500 mt-1">{t('deals.no_deals_desc', 'You have no deals matching this status.')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeals.map(deal => (
              <div key={deal.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                deal.status === 'accepted' ? 'border-green-300' : 'border-gray-200'
              }`}>
                {/* Deal Header */}
                <div className={`p-4 flex justify-between items-center border-b ${
                  deal.status === 'accepted' ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <div>
                    <h3 className="font-bold text-lg">{deal.crop_name}</h3>
                    <p className="text-xs text-gray-500">{deal.quantity} {deal.unit}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(deal.status)}`}>
                    {deal.status.toUpperCase()}
                  </span>
                </div>

                {/* Deal Body */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('deals.other_party', 'Other Party')}</p>
                      <p className="font-medium text-dark">{isFarmer ? deal.buyer_name : deal.farmer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{deal.status === 'countered' ? t('deals.current_price', 'Current Price') : t('deals.offered_price', 'Offered Price')}</p>
                      <p className="font-bold text-xl text-primary-700">
                        ₹{deal.status === 'countered' && deal.counter_price ? deal.counter_price : deal.offered_price}
                      </p>
                      {deal.status === 'countered' && deal.counter_price && (
                        <p className="text-xs text-gray-400 line-through">₹{deal.offered_price}</p>
                      )}
                    </div>
                  </div>

                  {deal.status === 'accepted' && (
                    <div className="mt-4 bg-green-100 text-green-800 p-3 rounded-lg flex items-center justify-center font-bold">
                      🎉 {t('deals.confirmed', 'Deal Confirmed!')}
                    </div>
                  )}

                  {/* Actions depending on role and status */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {/* Farmer Actions on Pending */}
                    {isFarmer && deal.status === 'pending' && counterId !== deal.id && (
                      <>
                        <button onClick={() => handleUpdateStatus(deal.id, 'accepted')} className="flex-1 min-h-[48px] bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition">
                          {t('common.accept', 'Accept')}
                        </button>
                        <button onClick={() => setCounterId(deal.id)} className="flex-1 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                          {t('deals.counter', 'Counter')}
                        </button>
                        <button onClick={() => handleUpdateStatus(deal.id, 'rejected')} className="flex-1 min-h-[48px] bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition">
                          {t('common.reject', 'Reject')}
                        </button>
                      </>
                    )}

                    {/* Buyer Actions on Countered */}
                    {isBuyer && deal.status === 'countered' && counterId !== deal.id && (
                      <>
                        <button onClick={() => handleUpdateStatus(deal.id, 'accepted')} className="flex-1 min-h-[48px] bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition">
                          {t('common.accept', 'Accept')}
                        </button>
                        <button onClick={() => setCounterId(deal.id)} className="flex-1 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                          {t('deals.counter', 'Counter')}
                        </button>
                        <button onClick={() => handleUpdateStatus(deal.id, 'rejected')} className="flex-1 min-h-[48px] bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition">
                          {t('common.reject', 'Reject')}
                        </button>
                      </>
                    )}

                    {/* Counter Input UI */}
                    {counterId === deal.id && (
                      <div className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 flex gap-2 items-center">
                        <span className="font-medium text-gray-600">₹</span>
                        <input 
                          type="number"
                          value={counterPrice}
                          onChange={(e) => setCounterPrice(e.target.value)}
                          placeholder="New Price"
                          className="flex-1 h-12 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <button onClick={() => submitCounter(deal.id)} className="h-12 px-4 bg-primary-600 text-white rounded-md font-medium">
                          {t('common.send', 'Send')}
                        </button>
                        <button onClick={() => setCounterId(null)} className="h-12 px-3 bg-gray-200 text-gray-700 rounded-md">
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-center">
                    <Link to={`/listing/${deal.listing_id}`} className="text-sm text-primary-600 hover:underline">
                      {t('deals.view_listing', 'View Original Listing')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

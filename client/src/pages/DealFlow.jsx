import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { deals } from '../services/api';
import toast from 'react-hot-toast';
import DealCard from '../components/DealCard';

export default function DealFlow() {
  const { t } = useTranslation();
  const { user, isFarmer } = useContext(AuthContext);

  const [allDeals, setAllDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredDeals = filter === 'all' 
    ? allDeals 
    : filter === 'dispute'
      ? allDeals.filter(d => d.dispute_status === 'open')
      : allDeals.filter(d => d.status === filter);

  const pendingCount = allDeals.filter(d => d.status === 'pending').length;
  const acceptedCount = allDeals.filter(d => d.status === 'accepted').length;
  const disputeCount = allDeals.filter(d => d.dispute_status === 'open').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      <div className="bg-primary-700 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🤝 {t('deals.title', 'Deal Flow & Negotiation')}
            </h1>
            <p className="text-primary-100 text-sm mt-0.5">
              {t('deals.flow_subtitle', 'Transparent direct agreements, payment milestones & logistics tracking')}
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="bg-white/20 px-3 py-1.5 rounded-xl font-bold">
              {pendingCount} {t('deals.pending', 'Pending')}
            </span>
            <span className="bg-emerald-500/80 px-3 py-1.5 rounded-xl font-bold">
              {acceptedCount} {t('deals.accepted', 'Accepted')}
            </span>
            {disputeCount > 0 && (
              <span className="bg-red-500 px-3 py-1.5 rounded-xl font-bold animate-pulse">
                {disputeCount} {t('dispute.filter_tab', 'Grievance')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-2">
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 py-2 mb-6">
          {[
            { id: 'all', label: t('common.all', 'All Deals') },
            { id: 'pending', label: t('deals.pending', 'Pending Offers') },
            { id: 'countered', label: t('deals.countered', 'Counter Offers') },
            { id: 'accepted', label: t('deals.accepted', 'Confirmed Deals') },
            { id: 'dispute', label: `⚠️ ${t('dispute.filter_tab', 'Grievances')} (${disputeCount})` },
            { id: 'rejected', label: t('deals.rejected', 'Declined') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition ${
                filter === tab.id 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-44 bg-white rounded-2xl border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100 mt-4">
            <div className="text-5xl mb-3">🤝</div>
            <h3 className="text-lg font-bold text-gray-900">{t('deals.no_deals', 'No deals found')}</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
              {t('deals.no_deals_desc', 'You have no deals matching this status. Make or accept offers to initiate agreements.')}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredDeals.map(deal => (
              <DealCard 
                key={deal.id}
                deal={deal}
                userRole={isFarmer ? 'farmer' : 'buyer'}
                userId={user?.id}
                onUpdate={fetchDeals}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

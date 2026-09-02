import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listings } from '../services/api';

export default function DemandSupplyIndicators() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await listings.getDemandSupplyAnalytics();
      setData(res.data?.data || null);
    } catch (e) {
      console.error('Failed to fetch demand supply', e);
    } finally {
      setLoading(false);
    }
  };

  const getCropEmoji = (crop) => {
    const c = crop?.toLowerCase() || '';
    if (c.includes('wheat')) return '🌾';
    if (c.includes('tomato')) return '🍅';
    if (c.includes('onion')) return '🧅';
    if (c.includes('rice')) return '🍚';
    if (c.includes('potato')) return '🥔';
    if (c.includes('soybean')) return '🫘';
    if (c.includes('cotton')) return '🏵️';
    return '🌱';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-dark text-lg flex items-center gap-2">
            📊 {t('demand.title', 'Live Platform Arrival Volumes & Supply')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('demand.subtitle', 'Real-time aggregated produce available directly from verified farmers & FPOs')}
          </p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="text-xs text-primary-600 font-bold hover:underline p-1"
          title="Refresh"
        >
          🔄 {t('common.refresh', 'Refresh')}
        </button>
      </div>

      {loading ? (
        <div className="h-28 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
          {t('common.loading', 'Loading volumes...')}
        </div>
      ) : data && data.cropBreakdown?.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {data.cropBreakdown.map((item) => (
            <div key={item.crop} className="bg-gradient-to-b from-gray-50 to-white p-3.5 rounded-xl border border-gray-100 hover:border-primary-300 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">{getCropEmoji(item.crop)}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
                  {item.count} {t('demand.lots', 'lots')}
                </span>
              </div>
              <p className="font-bold text-dark text-sm truncate">{item.crop}</p>
              <p className="text-base font-extrabold text-primary-800 mt-0.5">
                {item.totalQuantity.toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
              </p>
              {item.fpoLots > 0 && (
                <p className="text-[10px] text-amber-700 font-semibold mt-1">
                  👥 {item.fpoLots} {t('demand.fpo_pooled', 'FPO pooled')}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 text-sm">
          {t('demand.no_data', 'No active lots listed currently.')}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t pt-2">
        <span>📍 {t('demand.coverage', 'Covers direct farm listings across Maharashtra, Punjab, Karnataka & MP')}</span>
        <span className="text-emerald-600 font-medium">● {t('demand.live_status', 'Live Market Aggregation')}</span>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { prices } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PriceTrendRecommendation({ initialCrop = 'Onion', initialState = 'Maharashtra' }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState(initialCrop);
  const [state, setState] = useState(initialState);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);

  const availableCrops = ['Onion', 'Tomato', 'Wheat', 'Rice', 'Potato', 'Soybean', 'Cotton', 'Maize', 'Garlic', 'Mustard'];
  const availableStates = ['Maharashtra', 'Karnataka', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Uttar Pradesh', 'Gujarat', 'West Bengal'];

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const res = await prices.getTrends(crop, state);
      setTrendData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load price trends', err);
      setTrendData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [crop, state]);

  const getSignalBadge = (signal, direction) => {
    if (direction === 'UPWARD') {
      return {
        bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
        icon: '📈',
        title: t('trends.hold_recommendation', 'Favorable Window: Consider Holding / Staggered Selling'),
        tag: t('trends.trending_up', 'Trending Upward')
      };
    } else if (direction === 'DOWNWARD') {
      return {
        bg: 'bg-amber-50 border-amber-300 text-amber-800',
        icon: '📉',
        title: t('trends.sell_recommendation', 'Market Softening: Consider Liquidating Harvest Soon'),
        tag: t('trends.trending_down', 'Trending Downward')
      };
    }
    return {
      bg: 'bg-blue-50 border-blue-300 text-blue-800',
      icon: '📊',
      title: t('trends.stable_recommendation', 'Stable Window: Standard Regular Scheduled Selling'),
      tag: t('trends.stable', 'Price Stable')
    };
  };

  const signal = trendData ? getSignalBadge(trendData.windowSignal, trendData.trendDirection) : null;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              📈 {t('trends.title', 'Sale-Window & Price Trend Signal')}
            </h3>
            <p className="text-xs text-primary-100 mt-0.5">
              {t('trends.method_tag', 'Statistical 7-day moving average & mandi modal spread (Heuristic analysis, not AI/ML)')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="bg-primary-900/60 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-primary-400/40 focus:outline-none"
            >
              {availableCrops.map((c) => (
                <option key={c} value={c} className="text-dark bg-white">{c}</option>
              ))}
            </select>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="bg-primary-900/60 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-primary-400/40 focus:outline-none"
            >
              {availableStates.map((s) => (
                <option key={s} value={s} className="text-dark bg-white">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {loading ? (
          <div className="h-48 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400">
            {t('common.loading', 'Loading trends...')}
          </div>
        ) : trendData ? (
          <>
            {/* Recommendation Banner */}
            <div className={`p-4 rounded-xl border-2 ${signal.bg} flex items-start gap-3.5`}>
              <span className="text-3xl select-none">{signal.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-base">{signal.title}</h4>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-white shadow-sm border">
                    {trendData.percentageChange >= 0 ? `+${trendData.percentageChange}%` : `${trendData.percentageChange}%`} (7-day)
                  </span>
                </div>
                <p className="text-sm mt-1 leading-relaxed opacity-95">
                  {trendData.recommendation}
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase">{t('trends.avg_mandi', 'Avg Mandi Modal')}</p>
                <p className="text-lg font-bold text-primary-700 mt-0.5">₹{trendData.avgModalPrice}</p>
                <p className="text-[11px] text-gray-400">/quintal</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase">{t('trends.peak_mandi', 'Regional High')}</p>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">₹{trendData.maxPrice}</p>
                <p className="text-[11px] text-gray-400">/quintal</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase">{t('trends.floor_price', 'Regional Low')}</p>
                <p className="text-lg font-bold text-gray-700 mt-0.5">₹{trendData.minPrice}</p>
                <p className="text-[11px] text-gray-400">/quintal</p>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.historicalSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis domain={['dataMin - 100', 'dataMax + 100']} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val) => [`₹${val}/q`, 'Modal Price']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2D6A4F" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2D6A4F' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 border-t pt-2">
              <span>📌 {t('trends.transparent_label', 'Transparent Statistical Indicator')}</span>
              <span>{t('trends.updated_live', 'Updated with Mandi price cache')}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">{t('trends.no_data', 'No trend data found.')}</p>
        )}
      </div>
    </div>
  );
}

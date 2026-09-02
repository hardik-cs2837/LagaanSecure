import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { prices } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, ComposedChart } from 'recharts';

export default function PriceTrendRecommendation({ initialCrop = 'Onion', initialState = 'Maharashtra' }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState(initialCrop);
  const [state, setState] = useState(initialState);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHorizon, setActiveHorizon] = useState(1); // 0: 3d, 1: 7d, 2: 10d, 3: 14d

  const availableCrops = ['Onion', 'Tomato', 'Wheat', 'Rice', 'Potato', 'Soybean', 'Cotton', 'Maize', 'Garlic', 'Mustard'];
  const availableStates = ['Maharashtra', 'Karnataka', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Uttar Pradesh', 'Gujarat', 'West Bengal'];

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const res = await prices.getTrends(crop, state);
      setTrendData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load price forecast', err);
      setTrendData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [crop, state]);

  const getSignalBadge = (direction) => {
    if (direction === 'UPWARD') {
      return {
        bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
        icon: '📈',
        title: t('trends.hold_recommendation', 'Favorable Window: Consider Holding / Staggered Selling'),
        tag: t('trends.trending_up', 'Projected Upward')
      };
    } else if (direction === 'DOWNWARD') {
      return {
        bg: 'bg-amber-50 border-amber-300 text-amber-900',
        icon: '📉',
        title: t('trends.sell_recommendation', 'Market Softening: Liquidate Ready Lots Soon'),
        tag: t('trends.trending_down', 'Projected Downward')
      };
    }
    return {
      bg: 'bg-blue-50 border-blue-300 text-blue-900',
      icon: '📊',
      title: t('trends.stable_recommendation', 'Stable Window: Standard Regular Scheduled Selling'),
      tag: t('trends.stable', 'Price Stable')
    };
  };

  const signal = trendData ? getSignalBadge(trendData.trendDirection) : null;
  const currentForecast = trendData?.forecastSeries?.[activeHorizon] || trendData?.forecastSeries?.[1];

  // Combine historical and forecast for seamless visualization
  const combinedChartData = trendData ? [
    ...trendData.historicalSeries.map(p => ({
      name: p.day,
      historicalPrice: p.price,
      projectedPrice: null,
      confidenceMin: null,
      confidenceMax: null
    })),
    ...(trendData.forecastSeries || []).map(f => ({
      name: f.horizon,
      historicalPrice: null,
      projectedPrice: f.projectedPrice,
      confidenceMin: f.confidenceMin,
      confidenceMax: f.confidenceMax
    }))
  ] : [];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              📈 {t('trends.title', 'Price Forecast & Sale-Window Recommendation')}
            </h3>
            <p className="text-xs text-primary-100 mt-0.5">
              {trendData?.methodLabel || t('trends.method_tag', 'Statistical Linear Regression & EWMA Projection (90% Confidence Interval, Not AI)')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="bg-primary-900/70 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-primary-400/40 focus:outline-none"
            >
              {availableCrops.map((c) => (
                <option key={c} value={c} className="text-dark bg-white">{c}</option>
              ))}
            </select>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="bg-primary-900/70 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-primary-400/40 focus:outline-none"
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
            {t('common.loading', 'Calculating price forecast...')}
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
                    {trendData.percentageChange >= 0 ? `+${trendData.percentageChange}%` : `${trendData.percentageChange}%`} (7-day projection)
                  </span>
                </div>
                <p className="text-sm mt-1 leading-relaxed opacity-95">
                  {trendData.recommendation}
                </p>
              </div>
            </div>

            {/* Projection Horizon Tabs & Target Metric */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('trends.forecast_horizon', 'Select Forecast Horizon (Statistical Projection)')}:
                </span>
                <div className="flex gap-1.5 bg-white p-1 rounded-lg border border-gray-200">
                  {trendData.forecastSeries?.map((f, idx) => (
                    <button
                      key={f.horizon}
                      onClick={() => setActiveHorizon(idx)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                        activeHorizon === idx 
                          ? 'bg-primary-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {f.horizon}
                    </button>
                  ))}
                </div>
              </div>

              {currentForecast && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center pt-2 border-t border-gray-200">
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-400 block">{t('trends.current_modal', 'Current Mandi Rate')}</span>
                    <span className="text-lg font-bold text-dark">₹{trendData.currentPrice || trendData.avgModalPrice}</span>
                    <span className="text-[10px] text-gray-400 block">/quintal today</span>
                  </div>
                  <div className="bg-primary-50 p-3 rounded-lg border border-primary-200 shadow-sm">
                    <span className="text-xs text-primary-800 font-bold block">
                      🎯 {t('trends.projected_target', 'Projected {{horizon}} Price', { horizon: currentForecast.horizon })}
                    </span>
                    <span className="text-2xl font-black text-primary-800">₹{currentForecast.projectedPrice}</span>
                    <span className="text-[10px] text-primary-600 font-semibold block">/quintal expected</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-400 block">{t('trends.ci_band', '90% Confidence Interval')}</span>
                    <span className="text-base font-extrabold text-gray-700">₹{currentForecast.confidenceMin} – ₹{currentForecast.confidenceMax}</span>
                    <span className="text-[10px] text-gray-400 block">(±₹{currentForecast.marginOfError} margin of error)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Regression Model Diagnostic */}
            {trendData.modelStats && (
              <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border text-[11px] text-gray-600">
                <span>📐 <strong>Slope:</strong> ₹{trendData.modelStats.slope}/day</span>
                <span>📊 <strong>Goodness of Fit (R²):</strong> {trendData.modelStats.rSquared}</span>
                <span>🎯 <strong>Confidence:</strong> 90% Statistical Band</span>
              </div>
            )}

            {/* Historical + Forecast Chart */}
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={['dataMin - 120', 'dataMax + 120']} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val, name) => [
                      `₹${val}/q`, 
                      name === 'historicalPrice' ? 'Historical Mandi Modal' : 'Projected Forecast'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  {/* Historical Solid Line */}
                  <Line 
                    type="monotone" 
                    dataKey="historicalPrice" 
                    stroke="#2D6A4F" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2D6A4F' }}
                    name="historicalPrice"
                  />
                  {/* Forecast Dashed Line */}
                  <Line 
                    type="monotone" 
                    dataKey="projectedPrice" 
                    stroke="#E76F51" 
                    strokeWidth={3} 
                    strokeDasharray="5 5"
                    dot={{ r: 5, fill: '#E76F51' }}
                    name="projectedPrice"
                  />
                </ComposedChart>
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

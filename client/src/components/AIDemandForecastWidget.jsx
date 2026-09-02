import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { demand } from '../services/api';

const CROPS = ['Onion', 'Tomato', 'Wheat', 'Rice', 'Potato', 'Soybean', 'Cotton'];

export default function AIDemandForecastWidget({ defaultCrop = 'Onion' }) {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState(defaultCrop);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast(selectedCrop);
  }, [selectedCrop]);

  const fetchForecast = async (crop) => {
    try {
      setLoading(true);
      const res = await demand.getForecast(crop);
      setForecast(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch demand forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDemandColor = (status) => {
    if (status?.includes('VERY HIGH')) return 'bg-red-100 text-red-900 border-red-300';
    if (status?.includes('HIGH')) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (status?.includes('STEADY')) return 'bg-blue-100 text-blue-900 border-blue-300';
    return 'bg-amber-100 text-amber-900 border-amber-300';
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-primary-800 to-primary-700 text-white p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <h3 className="text-lg md:text-xl font-black">
                {t('demand.title', 'AI Demand Forecasting & Sell Timing')}
              </h3>
            </div>
            <p className="text-emerald-100 text-xs mt-0.5">
              {t('demand.subtitle', 'Forward-looking demand projections, arrival trends & storage window advice (PS 26033)')}
            </p>
          </div>
          <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/30 self-start sm:self-auto">
            STATISTICAL MODEL
          </span>
        </div>

        {/* Crop Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
          {CROPS.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCrop === crop
                  ? 'bg-white text-primary-900 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {crop === 'Onion' ? '🧅 Onion' :
               crop === 'Tomato' ? '🍅 Tomato' :
               crop === 'Wheat' ? '🌾 Wheat' :
               crop === 'Rice' ? '🍚 Rice' :
               crop === 'Potato' ? '🥔 Potato' :
               crop === 'Soybean' ? '🫘 Soybean' : '🏵️ Cotton'}
            </button>
          ))}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 md:p-6 space-y-5">
        {loading ? (
          <div className="h-44 flex items-center justify-center text-gray-400 animate-pulse text-sm">
            {t('common.loading', 'Analyzing demand indices and arrival volume dynamics...')}
          </div>
        ) : forecast ? (
          <>
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Current Demand */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    {t('demand.current_demand', 'Current Demand Index')}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-dark">{forecast.currentDemandIndex}/100</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getDemandColor(forecast.currentDemand)}`}>
                      {forecast.currentDemand}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Aggregated wholesale inquiry index</p>
              </div>

              {/* 7-Day & 30-Day Curve */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                    {t('demand.forecast_curve', 'Forward Demand Shift')}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <div>
                      <span className="text-xl font-black text-emerald-800">
                        {forecast.trend7DayPct > 0 ? `+${forecast.trend7DayPct}%` : `${forecast.trend7DayPct}%`}
                      </span>
                      <span className="text-[10px] text-emerald-700 block font-bold">Next 7 Days</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-primary-800">
                        {forecast.trend30DayPct > 0 ? `+${forecast.trend30DayPct}%` : `${forecast.trend30DayPct}%`}
                      </span>
                      <span className="text-[10px] text-primary-700 block font-bold">Next 30 Days</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-emerald-800 font-semibold flex items-center justify-between">
                  <span>Confidence: <strong>{forecast.confidencePct}%</strong></span>
                  <span>📈 Trend: {forecast.trend7DayPct > 0 ? 'Surging' : 'Stable'}</span>
                </div>
              </div>

              {/* Storage Recommendation */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                    {t('demand.storage_window', 'Post-Harvest Shelf Life')}
                  </span>
                  <p className="text-xs font-bold text-blue-950 mt-1">
                    {forecast.storageWindowRecommendation}
                  </p>
                </div>
                <span className="text-[10px] text-blue-700 mt-2 block font-medium">
                  Prevents distress selling during temporary glut
                </span>
              </div>
            </div>

            {/* Smart Sell Recommendation Box */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50 p-4 rounded-2xl border border-amber-300 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h4 className="font-extrabold text-xs sm:text-sm text-amber-950 uppercase tracking-wider">
                  {t('demand.smart_action_title', 'Smart Sell Timing Recommendation ("Should I Sell Now?")')}:
                </h4>
              </div>
              <p className="text-xs text-gray-800 font-medium leading-relaxed pl-7">
                {forecast.recommendedAction}
              </p>
            </div>

            {/* Key Drivers / Market Factors */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                🔍 {t('demand.key_drivers', 'Underlying Market Drivers & Arrival Dynamics')}:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                {forecast.factors?.map((factor, idx) => (
                  <div key={idx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-start gap-2">
                    <span className="text-primary-700 font-bold">•</span>
                    <span className="leading-snug">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Notice Tag */}
            <div className="text-[10px] text-gray-400 text-right italic">
              * {forecast.dataNotice}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

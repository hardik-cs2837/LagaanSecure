import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listings } from '../services/api';

export default function NearestMarketSuggestion({ userLocation = 'Nashik, Maharashtra' }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, [userLocation]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await listings.getRouteSuggestions({ location: userLocation });
      setData(res.data?.data || null);
    } catch (e) {
      console.error('Failed to get market suggestions', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-dark text-lg flex items-center gap-2">
            📍 {t('routes.title', 'Nearest Mandis & Market Channels')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('routes.subtitle', 'Distance-based suggestions for alternative local selling hubs (Haversine distance calculation)')}
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
          {t('routes.distance_based', 'Distance-based')}
        </span>
      </div>

      {loading ? (
        <div className="h-28 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
          {t('common.loading', 'Calculating nearest markets...')}
        </div>
      ) : data?.nearestMarkets?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.nearestMarkets.map(market => (
            <div key={market.name} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between hover:border-primary-400 transition">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-dark text-sm">{market.name}</h4>
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                    {market.distanceKm} km
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{market.district}, {market.state}</p>
                <p className="text-[11px] text-gray-600 mt-1 italic">✨ {market.specialty}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2.5 mt-2.5 border-t border-gray-200">
                <span>⏱️ ~{market.estimatedTravelTimeHours} hrs transit</span>
                <span className="font-bold text-primary-800">~₹{market.estimatedFreightPerQuintal}/qtl freight</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 py-4">{t('routes.no_data', 'No nearby markets calculated.')}</p>
      )}
    </div>
  );
}

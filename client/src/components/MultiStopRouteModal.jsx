import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listings } from '../services/api';

export default function MultiStopRouteModal({ isOpen, onClose, userLocation = 'Nashik Farm Yard' }) {
  const { t } = useTranslation();
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      const res = await listings.getMultiStopRoute({
        origin: { name: userLocation, lat: 20.00, lng: 73.78 }
      });
      setRouteData(res.data?.data || null);
    } catch (e) {
      console.error('Failed to calculate route', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoute();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-600 to-primary-700 p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              🚚 {t('routes.tsp_title', 'Multi-Stop Delivery Route Suggestion')}
            </h3>
            <p className="text-xs text-orange-100 mt-0.5">
              {t('routes.tsp_subtitle', 'Nearest-neighbor TSP approximation for consolidated multi-buyer delivery')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Methodology notice banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-900 flex items-center justify-between font-medium">
          <span>⚠️ {t('routes.tsp_method_notice', 'Mathematical nearest-neighbor sequencing model (Heuristic, not AI)')}</span>
          <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">HEURISTIC</span>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="h-44 flex items-center justify-center text-gray-400">
              {t('common.loading', 'Optimizing multi-stop delivery sequence...')}
            </div>
          ) : routeData ? (
            <>
              {/* Route Summary Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 block">{t('routes.total_stops', 'Total Stops')}</span>
                  <span className="text-xl font-black text-dark">{routeData.totalStops} hubs</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 block">{t('routes.total_distance', 'Total Circuit Distance')}</span>
                  <span className="text-xl font-black text-primary-700">{routeData.totalDistanceKm} km</span>
                </div>
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
                  <span className="text-xs text-orange-800 font-semibold block">{t('routes.est_freight', 'Est. Total Freight')}</span>
                  <span className="text-xl font-black text-accent-700">₹{routeData.estimatedTotalFreight?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Stop-by-stop sequencing */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  📍 {t('routes.suggested_sequence', 'Sequential Drop Schedule')}:
                </h4>
                
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                      0
                    </span>
                    <div>
                      <span className="font-bold text-emerald-950">Origin: {routeData.originName}</span>
                      <p className="text-[10px] text-emerald-700">Loading produce lot</p>
                    </div>
                  </div>
                  <span className="text-emerald-800 font-bold">Start Point</span>
                </div>

                {routeData.orderedRoute?.map(stop => (
                  <div key={stop.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs hover:border-primary-300 transition">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-primary-700 text-white font-bold flex items-center justify-center text-[10px]">
                        {stop.stopNumber}
                      </span>
                      <div>
                        <span className="font-bold text-dark">{stop.name}</span>
                        <p className="text-[10px] text-gray-500">
                          Demand: {stop.demandQty} qtl • +{stop.legDistanceKm} km from previous stop
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary-800">~{stop.legEstHours} hrs</span>
                      <span className="text-[10px] text-gray-400 block">{stop.cumulativeDistanceKm} km total</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Model Assumptions Banner */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 space-y-1">
                <p className="font-bold text-gray-700">📐 Model Assumptions & Pricing Constants:</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <span>• Base Rate: {routeData.rateModel?.baseRateKm}</span>
                  <span>• Fixed Cost: {routeData.rateModel?.fixedCost}</span>
                  <span>• Average Speed: {routeData.rateModel?.avgSpeed}</span>
                  <span>• Estimated Travel Duration: ~{routeData.estimatedTotalHours} hours</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-gray-400 py-6">{t('routes.no_data', 'No route data available.')}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

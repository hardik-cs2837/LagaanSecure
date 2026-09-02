import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listings } from '../services/api';

export default function StorageDirectoryModal({ isOpen, onClose, defaultState = 'Maharashtra' }) {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState([]);
  const [state, setState] = useState(defaultState);
  const [loading, setLoading] = useState(false);

  const states = ['Maharashtra', 'Karnataka', 'Punjab', 'Haryana', 'Uttar Pradesh'];

  useEffect(() => {
    if (isOpen) {
      fetchStorage();
    }
  }, [isOpen, state]);

  const fetchStorage = async () => {
    try {
      setLoading(true);
      const res = await listings.getStorageOptions(state);
      setFacilities(res.data?.data || []);
    } catch (e) {
      console.error(e);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              🏬 {t('storage.title', 'Nearby Cold Storage & Warehouse Options')}
            </h3>
            <p className="text-xs text-primary-100 mt-0.5">
              {t('storage.subtitle', 'Preserve produce post-harvest to avoid distress selling')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Demo Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-900 flex items-center justify-between font-medium">
          <span>⚠️ {t('storage.demo_notice', 'Illustrative verified directory for demonstration (Demo Data)')}</span>
          <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">SIMULATION</span>
        </div>

        {/* Filter State */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{t('storage.select_state', 'Select State')}:</label>
          <select 
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm font-medium focus:ring-primary-500 focus:border-primary-500"
          >
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* List of facilities */}
        <div className="p-5 max-h-96 overflow-y-auto space-y-4">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-gray-400">
              {t('common.loading', 'Loading storage facilities...')}
            </div>
          ) : facilities.length === 0 ? (
            <p className="text-center text-gray-500 py-6">{t('storage.none_found', 'No storage facilities found for this region.')}</p>
          ) : (
            facilities.map(fac => (
              <div key={fac.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-primary-400 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-dark text-base">{fac.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {fac.location}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {fac.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <span className="text-gray-400 block">{t('storage.capacity', 'Total Capacity')}</span>
                    <span className="font-bold text-dark">{fac.capacity}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <span className="text-gray-400 block">{t('storage.available', 'Available Space')}</span>
                    <span className="font-bold text-emerald-600">{fac.availableSpace}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-100 col-span-2 sm:col-span-1">
                    <span className="text-gray-400 block">{t('storage.est_rate', 'Rate/Qtl/Month')}</span>
                    <span className="font-bold text-primary-700">₹{fac.ratePerQuintalMonth}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                  <span className="text-gray-500">🌡️ {fac.temperatureRange}</span>
                  <a 
                    href={`tel:${fac.contactPhone}`} 
                    className="font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    📞 {fac.contactPhone}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

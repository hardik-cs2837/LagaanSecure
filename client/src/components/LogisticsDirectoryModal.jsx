import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listings, deals } from '../services/api';
import toast from 'react-hot-toast';

export default function LogisticsDirectoryModal({ 
  isOpen, 
  onClose, 
  deal, 
  onTransportBooked 
}) {
  const { t } = useTranslation();
  const [logisticsData, setLogisticsData] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [distanceKm, setDistanceKm] = useState(120);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const crop = deal?.listing?.crop_name || 'Produce';
  const weight = deal?.listing?.quantity || 20;
  const origin = deal?.listing?.location || 'Farmer Farm Yard';
  const destination = deal?.buyer?.location || 'Buyer Distribution Center';

  useEffect(() => {
    if (isOpen) {
      fetchLogistics();
    }
  }, [isOpen, distanceKm]);

  const fetchLogistics = async () => {
    try {
      setLoading(true);
      const res = await listings.getLogisticsOptions({
        origin,
        destination,
        weight,
        distanceKm
      });
      setLogisticsData(res.data?.data || null);
      if (res.data?.data?.options?.length > 0) {
        setSelectedProvider(res.data.data.options[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransport = async () => {
    if (!deal?.id || !selectedProvider) return;
    try {
      setBooking(true);
      await deals.updateDeal(deal.id, {
        transport_requested: true,
        transport_details: {
          provider_id: selectedProvider.id,
          provider_name: selectedProvider.provider_name,
          vehicle_type: selectedProvider.vehicle_type,
          estimated_cost: selectedProvider.estimated_cost,
          distance_km: distanceKm,
          contact: selectedProvider.contact
        }
      });
      toast.success(t('logistics.booked_success', 'Transport request submitted successfully!'));
      if (onTransportBooked) onTransportBooked();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(t('common.error_occurred', 'Failed to request transport'));
    } finally {
      setBooking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-600 to-accent-500 p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              🚚 {t('logistics.title', 'Farm-to-Buyer Transport & Logistics')}
            </h3>
            <p className="text-xs text-orange-100 mt-0.5">
              {t('logistics.subtitle', 'Cost estimation & rural haulage coordination for {{crop}} ({{weight}} {{unit}})', { crop, weight, unit: deal?.listing?.unit || 'qtl' })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Demo Tag Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-900 flex items-center justify-between font-medium">
          <span>⚠️ {t('logistics.simulation_notice', 'Distance & capacity based freight simulation (Illustrative Demo Data)')}</span>
          <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">SIMULATION</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Route & Distance inputs */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block">{t('logistics.origin', 'Origin (Farmer)')}:</span>
              <span className="font-bold text-dark truncate block">📍 {origin}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('logistics.destination', 'Destination (Buyer)')}:</span>
              <span className="font-bold text-dark truncate block">🏁 {destination}</span>
            </div>
            <div>
              <label className="text-gray-500 block font-medium mb-1">{t('logistics.distance', 'Est. Distance (km)')}:</label>
              <input 
                type="number" 
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value) || 10)}
                className="w-full p-1.5 border border-gray-300 rounded font-bold text-dark"
                min="5"
                max="2000"
              />
            </div>
          </div>

          {/* Transport Provider Options */}
          <div>
            <h4 className="font-bold text-sm text-gray-700 mb-2">{t('logistics.available_options', 'Available Haulage Options')}:</h4>
            {loading ? (
              <div className="h-32 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400">
                {t('common.loading', 'Calculating freight rates...')}
              </div>
            ) : (
              <div className="space-y-3">
                {logisticsData?.options?.map(opt => (
                  <div 
                    key={opt.id}
                    onClick={() => setSelectedProvider(opt)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      selectedProvider?.id === opt.id 
                        ? 'border-accent-500 bg-orange-50/50 ring-1 ring-accent-400' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-dark text-sm">{opt.provider_name}</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">★ {opt.rating}</span>
                      </div>
                      <p className="text-xs text-gray-600">🚛 {opt.vehicle_type}</p>
                      <p className="text-[11px] text-gray-500">⏱️ Est. Transit: ~{opt.estimated_hours} hrs | Base: ₹{opt.base_rate_km}/km</p>
                    </div>

                    <div className="text-right w-full sm:w-auto">
                      <span className="text-xs text-gray-400 block">{t('logistics.total_estimated_freight', 'Estimated Total Freight')}</span>
                      <span className="text-xl font-extrabold text-accent-700">₹{opt.estimated_cost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition text-sm"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button 
            onClick={handleConfirmTransport}
            disabled={booking || !selectedProvider}
            className="px-6 py-2.5 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white font-bold rounded-xl transition text-sm flex items-center gap-2 shadow-md"
          >
            {booking ? t('common.processing', 'Submitting...') : `🚚 ${t('logistics.confirm_booking', 'Request Transport')}`}
          </button>
        </div>
      </div>
    </div>
  );
}

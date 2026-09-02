import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listings } from '../services/api';
import toast from 'react-hot-toast';

export default function FpoBulkLotModal({ isOpen, onClose, onSuccess, user }) {
  const { t } = useTranslation();
  const [cropName, setCropName] = useState('Onion');
  const [fpoName, setFpoName] = useState(user?.fpo_name || 'Sahyadri Farmers Producer Co.');
  const [pricePerUnit, setPricePerUnit] = useState(1450);
  const [location, setLocation] = useState(user?.location || 'Nashik, Maharashtra');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Member lots table
  const [members, setMembers] = useState([
    { id: 1, farmer_name: user?.name || 'Ramesh Patel (FPO Leader)', quantity: 60, quality_grade: 'A' },
    { id: 2, farmer_name: 'Suresh Deshmukh', quantity: 50, quality_grade: 'A' },
    { id: 3, farmer_name: 'Venkatesh Gowda', quantity: 40, quality_grade: 'A' }
  ]);

  const addMember = () => {
    setMembers(prev => [
      ...prev,
      { id: Date.now(), farmer_name: '', quantity: 20, quality_grade: 'A' }
    ]);
  };

  const updateMember = (idx, field, value) => {
    setMembers(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeMember = (idx) => {
    if (members.length <= 1) return;
    setMembers(prev => prev.filter((_, i) => i !== idx));
  };

  const totalQuantity = members.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cropName || totalQuantity <= 0) {
      toast.error('Please enter valid crop and quantities');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        crop_name: cropName,
        fpo_name: fpoName,
        price_per_unit: Number(pricePerUnit),
        location,
        description,
        member_lots: members.map(m => ({
          farmer_name: m.farmer_name || 'Member Farmer',
          quantity: Number(m.quantity),
          quality_grade: m.quality_grade
        }))
      };

      const res = await listings.aggregateFpo(payload);
      toast.success(res.data?.message || 'FPO Bulk Lot Aggregated Successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to aggregate FPO bulk lot');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-primary-800 p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              👥 {t('fpo.modal_title', 'FPO Bulk Produce Lot Aggregation')}
            </h3>
            <p className="text-xs text-amber-100 mt-0.5">
              {t('fpo.modal_subtitle', 'Pool individual member harvests into a single master bulk listing for institutional buyers')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('listings.crop', 'Commodity')}:</label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-semibold"
              >
                {['Onion', 'Tomato', 'Wheat', 'Rice', 'Soybean', 'Cotton', 'Potato'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('farmer.fpo_name_label', 'FPO Organisation')}:</label>
              <input 
                type="text"
                value={fpoName}
                onChange={(e) => setFpoName(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          {/* Member Lots Table */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                👨‍🌾 {t('fpo.contributing_members', 'Contributing Member Farmers')} ({members.length}):
              </span>
              <button
                type="button"
                onClick={addMember}
                className="text-xs text-primary-700 font-bold bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200 hover:bg-primary-100 transition"
              >
                + {t('fpo.add_member', 'Add Member')}
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {members.map((m, idx) => (
                <div key={m.id || idx} className="bg-white p-2.5 rounded-xl border border-gray-200 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-5">
                    <input 
                      type="text"
                      value={m.farmer_name}
                      onChange={(e) => updateMember(idx, 'farmer_name', e.target.value)}
                      placeholder="Member Name"
                      className="w-full p-1.5 border border-gray-200 rounded font-medium"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-1">
                      <input 
                        type="number"
                        value={m.quantity}
                        onChange={(e) => updateMember(idx, 'quantity', Number(e.target.value))}
                        className="w-full p-1.5 border border-gray-200 rounded font-bold text-center"
                        min="1"
                      />
                      <span className="text-[10px] text-gray-400">qtl</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <select
                      value={m.quality_grade}
                      onChange={(e) => updateMember(idx, 'quality_grade', e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded font-bold"
                    >
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                    </select>
                  </div>
                  <div className="col-span-1 text-right">
                    <button 
                      type="button" 
                      onClick={() => removeMember(idx)} 
                      className="text-red-500 hover:text-red-700 font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Aggregated Total Banner */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs font-bold text-dark">
              <span>{t('fpo.total_bulk_volume', 'Total Pooled Volume')}:</span>
              <span className="text-base text-primary-700 font-black">{totalQuantity} quintals</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('listings.price', 'Asking Price per Qtl (₹)')}:</label>
              <input 
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-bold text-primary-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('listings.location', 'Location')}:</label>
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 bg-gray-200 rounded-xl font-medium text-xs text-gray-700 hover:bg-gray-300"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button 
              type="submit" 
              disabled={loading || totalQuantity <= 0}
              className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? t('common.loading', 'Aggregating...') : `👥 ${t('fpo.create_bulk_lot', 'Publish FPO Bulk Lot')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

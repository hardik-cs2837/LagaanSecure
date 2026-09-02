import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { bulkRequirements } from '../services/api';
import toast from 'react-hot-toast';

export default function BulkRequirementsModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [cropName, setCropName] = useState('Onion');
  const [businessType, setBusinessType] = useState('supermarket');
  const [quantity, setQuantity] = useState(200);
  const [minPrice, setMinPrice] = useState(1350);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [qualityGrade, setQualityGrade] = useState('A');
  const [deliveryLocation, setDeliveryLocation] = useState('Pune Distribution Center, Maharashtra');
  const [requiredByDate, setRequiredByDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [additionalSpecs, setAdditionalSpecs] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await bulkRequirements.createRequirement({
        crop_name: cropName,
        business_type: businessType,
        quantity_quintals: Number(quantity),
        target_price_min: Number(minPrice),
        target_price_max: Number(maxPrice),
        quality_grade: qualityGrade,
        delivery_location: deliveryLocation,
        required_by_date: requiredByDate,
        additional_specs: additionalSpecs
      });
      toast.success(t('bulk.posted_success', 'Bulk institutional tender published successfully!'));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to publish requirement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 animate-fadeIn">
        <div className="bg-gradient-to-r from-primary-800 to-primary-700 p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              🏢 {t('bulk.modal_title', 'Post Institutional Bulk Purchase Requirement')}
            </h3>
            <p className="text-xs text-primary-100 mt-0.5">
              {t('bulk.modal_subtitle', 'Tender direct farm procurement with transparent price parameters')}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Commodity:</label>
              <select 
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
              >
                {['Onion', 'Tomato', 'Wheat', 'Rice', 'Potato', 'Soybean', 'Cotton'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Business Type:</label>
              <select 
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
              >
                <option value="supermarket">Retail / Supermarket Chain</option>
                <option value="processor">Food Processing Unit / Mill</option>
                <option value="restaurant_chain">Restaurant / Hotel Network</option>
                <option value="exporter">Agri Exporter</option>
                <option value="wholesaler">Institutional Wholesaler</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Total Qty (Quintals):</label>
              <input 
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold"
                min="10"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Target Min (₹/q):</label>
              <input 
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Target Max (₹/q):</label>
              <input 
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quality Grade Required:</label>
              <select 
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold"
              >
                <option value="A">Grade A (Premium)</option>
                <option value="B">Grade B (Standard)</option>
                <option value="C">Grade C (Processing)</option>
                <option value="ANY">Any Grade</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Required By Date:</label>
              <input 
                type="date"
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Destination Hub:</label>
            <input 
              type="text"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
              placeholder="e.g. Pune Cold Storage Yard"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Specific Packaging / Specifications (Optional):</label>
            <textarea 
              rows="2"
              value={additionalSpecs}
              onChange={(e) => setAdditionalSpecs(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
              placeholder="e.g. 50kg jute bags, moisture <11%, graded sizes only"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-xl text-xs font-bold text-gray-700">
              {t('common.cancel', 'Cancel')}
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-primary-700 hover:bg-primary-800 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? t('common.loading', 'Publishing...') : `📢 ${t('bulk.publish_btn', 'Publish Bulk Requirement')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

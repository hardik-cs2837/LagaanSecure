import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { listings } from '../services/api';
import toast from 'react-hot-toast';

const COMMON_CROPS = [
  'Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 
  'Soybean', 'Cotton', 'Maize', 'Sugarcane', 'Garlic', 'Mustard'
];

export default function CreateListing() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    crop_name: '',
    custom_crop: '',
    quantity: '',
    unit: 'quintal',
    quality_grade: 'A',
    price: '',
    location: user?.location || '',
    is_fpo_pool: false,
    fpo_name: user?.fpo_name || '',
    harvest_date: '',
    description: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalCropName = formData.crop_name === 'other' || !COMMON_CROPS.includes(formData.crop_name) 
      ? formData.custom_crop || formData.crop_name 
      : formData.crop_name;

    if (!finalCropName || !formData.quantity || !formData.location) {
      toast.error(t('common.fill_required', 'Please fill all required fields.'));
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit = {
        crop_name: finalCropName,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        quality_grade: formData.quality_grade,
        price_per_unit: formData.price ? Number(formData.price) : null,
        location: formData.location,
        is_fpo_pool: formData.is_fpo_pool,
        fpo_name: formData.is_fpo_pool ? (formData.fpo_name || user?.fpo_name || 'Kisan Agro FPO') : null,
        harvest_date: formData.harvest_date || null,
        description: formData.description
      };

      await listings.createListing(dataToSubmit);
      
      toast.success(t('farmer.listing_created', 'Listing created successfully!'));
      navigate('/farmer/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(t('common.error_occurred', 'An error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      {/* Header */}
      <div className="bg-primary-700 text-white p-4 flex items-center shadow-md">
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="mr-4 text-white hover:bg-primary-600 p-2 rounded-full transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-xl font-bold">{t('farmer.create_listing', 'Create New Listing')}</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          
          {/* Crop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('listings.crop_name', 'Crop Name')} <span className="text-red-500">*</span>
            </label>
            <select 
              name="crop_name" 
              value={formData.crop_name} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
            >
              <option value="">{t('common.select_crop', 'Select a crop...')}</option>
              {COMMON_CROPS.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
              <option value="other">{t('common.other', 'Other')}</option>
            </select>
            
            {formData.crop_name === 'other' && (
              <input 
                type="text" 
                name="custom_crop"
                value={formData.custom_crop}
                onChange={handleChange}
                placeholder={t('farmer.type_crop_name', 'Type crop name')}
                className="w-full mt-3 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            )}
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('listings.quantity', 'Quantity')} <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                placeholder="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('listings.unit', 'Unit')}
              </label>
              <select 
                name="unit" 
                value={formData.unit} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
              >
                <option value="quintal">{t('listings.quintal', 'Quintal (100kg)')}</option>
                <option value="kg">{t('listings.kg', 'Kilogram (kg)')}</option>
                <option value="ton">{t('listings.ton', 'Ton')}</option>
              </select>
            </div>
          </div>

          {/* Quality Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('listings.quality_grade', 'Quality Grade')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'A', label: 'Grade A', desc: t('farmer.grade_a_desc', 'Premium') },
                { id: 'B', label: 'Grade B', desc: t('farmer.grade_b_desc', 'Good') },
                { id: 'C', label: 'Grade C', desc: t('farmer.grade_c_desc', 'Fair') }
              ].map(grade => (
                <label 
                  key={grade.id} 
                  className={`
                    cursor-pointer border rounded-lg p-3 text-center transition-all flex flex-col items-center justify-center
                    ${formData.quality_grade === grade.id 
                      ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' 
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <input 
                    type="radio" 
                    name="quality_grade" 
                    value={grade.id} 
                    checked={formData.quality_grade === grade.id}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`font-bold text-lg ${
                    grade.id === 'A' ? 'text-green-600' : 
                    grade.id === 'B' ? 'text-yellow-600' : 'text-orange-600'
                  }`}>{grade.id}</span>
                  <span className="text-xs text-gray-500 mt-1">{grade.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('listings.price_per_unit', 'Price per Unit (₹)')} <span className="text-gray-400 font-normal text-xs ml-1">({t('common.optional', 'Optional')})</span>
            </label>
            <input 
              type="number" 
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              placeholder={t('farmer.price_placeholder', 'Set your price or leave blank for offers')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('listings.location', 'Location')} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder={t('farmer.location_placeholder', 'Village, District, State')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('listings.description', 'Description')} <span className="text-gray-400 font-normal text-xs ml-1">({t('common.optional', 'Optional')})</span>
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder={t('farmer.desc_placeholder', 'Add any details about harvest date, pesticide use, etc.')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none"
            ></textarea>
          </div>

          {/* FPO / Farmer Group Pooling */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox"
                name="is_fpo_pool"
                checked={formData.is_fpo_pool}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <div>
                <span className="font-bold text-sm text-amber-950 block">👥 {t('farmer.fpo_pool_label', 'FPO / Farmer Group Collective Lot')}</span>
                <span className="text-xs text-amber-800">
                  {t('farmer.fpo_pool_desc', 'Pool this produce with other members of your Farmer Producer Organisation for bulk pricing')}
                </span>
              </div>
            </label>

            {formData.is_fpo_pool && (
              <div className="pt-2 border-t border-amber-200 animate-fadeIn">
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  {t('farmer.fpo_name_label', 'FPO / Group Name')}:
                </label>
                <input 
                  type="text"
                  name="fpo_name"
                  value={formData.fpo_name}
                  onChange={handleChange}
                  placeholder="e.g. Sahyadri Farmers Producer Co."
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Harvest Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 {t('listings.harvest_date', 'Harvest Date')} <span className="text-gray-400 font-normal text-xs ml-1">({t('common.optional', 'Optional')})</span>
            </label>
            <input 
              type="date"
              name="harvest_date"
              value={formData.harvest_date}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('listings.photo', 'Photo')} <span className="text-gray-400 font-normal text-xs ml-1">({t('common.optional', 'Optional')})</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex flex-col items-center justify-center w-24 h-24 bg-gray-50 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="text-xs text-gray-500 mt-1">{t('common.upload', 'Upload')}</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              {photoPreview && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => {setPhoto(null); setPhotoPreview('');}} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm text-red-500 hover:bg-red-50">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed mt-8"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : t('farmer.submit_listing', 'Publish Listing')}
          </button>
        </form>
      </div>
    </div>
  );
}

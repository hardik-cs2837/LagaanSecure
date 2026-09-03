import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { listings } from '../services/api';
import toast from 'react-hot-toast';
import { Camera, Trash, Mic, MicOff, Info, ArrowLeft, Volume2, ShieldCheck, HelpCircle, RefreshCw } from 'lucide-react';
import TextToSpeechButton from '../components/TextToSpeechButton';
import { motion } from 'framer-motion';

const COMMON_CROPS = [
  'Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Cotton', 'Sugarcane', 'Soybean', 'Maize', 'Turmeric', 'Chilli'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const CreateListing = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const loc = useLocation();
  const prefill = loc.state || {};

  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Extract state and district from existing location string if possible
  let initialLocStr = prefill.location || user?.location || '';
  let initialDist = '';
  let initialSt = '';
  if (initialLocStr.includes(',')) {
    let parts = initialLocStr.split(',');
    initialDist = parts[0].trim();
    initialSt = parts[1].trim();
  }

  const [formData, setFormData] = useState({
    crop_name: prefill.crop_name || '',
    custom_crop: prefill.custom_crop || '',
    quantity: prefill.quantity || '',
    unit: prefill.unit || 'quintal',
    quality_grade: prefill.quality_grade || 'A',
    price: prefill.price || '',
    district: initialDist,
    state: initialSt,
    is_fpo_pool: prefill.is_fpo_pool || false,
    fpo_name: prefill.fpo_name || user?.fpo_name || '',
    harvest_date: prefill.harvest_date || '',
    description: prefill.description || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error(t('common.voice_not_supported', 'Voice input not supported in this browser.'));
      return;
    }

    if (isListening) {
      window.speechRecognition?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Set language based on current i18n language
    const currentLang = localStorage.getItem('language') || 'en';
    if (currentLang === 'hi') recognition.lang = 'hi-IN';
    else if (currentLang === 'mr') recognition.lang = 'mr-IN';
    else if (currentLang === 'te') recognition.lang = 'te-IN';
    else recognition.lang = 'en-IN';

    window.speechRecognition = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({
        ...prev,
        description: prev.description ? `${prev.description} ${transcript}` : transcript
      }));
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error(t('common.voice_error', 'Voice recognition failed.'));
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalCropName = formData.crop_name === 'other' || !COMMON_CROPS.includes(formData.crop_name) 
      ? formData.custom_crop || formData.crop_name 
      : formData.crop_name;

    if (!finalCropName || !formData.quantity || !formData.district || !formData.state) {
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
        location: `${formData.district}, ${formData.state}`,
        quality_checklist: {
          moisture_pct: 11.5,
          foreign_matter_pct: 0.6,
          damage_pct: 0.9,
          grain_size_uniformity: 'Standard',
          declaration_type: 'Farmer Self-Declared Quality'
        },
        is_fpo_pool: formData.is_fpo_pool,
        fpo_name: formData.is_fpo_pool ? (formData.fpo_name || user?.fpo_name || 'Agri FPO') : null,
        harvest_date: formData.harvest_date || null,
        description: formData.description
      };

      await listings.createListing(dataToSubmit);
      toast.success(t('farmer.listing_created', 'Produce listed successfully on national market!'));
      navigate('/farmer/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(t('common.error_occurred', 'Failed to publish listing. Please check connection.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header - Government Style Banner */}
      <div className="bg-emerald-800 text-white shadow-md border-b-4 border-amber-500">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 bg-emerald-700/50 hover:bg-emerald-700 rounded-full transition">
              <ArrowLeft className="w-5 h-5 text-emerald-50" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{t('farmer.add_produce', 'Publish Produce Listing')}</h1>
              <p className="text-emerald-100 text-xs md:text-sm font-medium mt-0.5 tracking-wide uppercase">{t('common.marketplace_subtitle', 'KisanConnect National Marketplace')}</p>
            </div>
          </div>
          <TextToSpeechButton text={t('farmer.add_produce', 'Publish Produce Listing')} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 mt-4">
        {/* Government Info Notice */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 shadow-sm"
        >
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-900 text-sm">{t('listings.gov_notice_title', 'Secure Market Access')}</h3>
            <p className="text-xs text-blue-800 mt-1">
              {t('listings.gov_notice_desc', 'Your listing will be visible to verified institutional buyers nationwide. Ensure details are accurate for best prices.')}
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-6 md:p-8 space-y-8">
            {/* Section 1: Produce Identity */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-lg font-bold text-slate-800">{t('listings.produce_details', 'Produce Details')}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('listings.crop_name', 'Crop Name')} <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="crop_name" 
                    value={formData.crop_name} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-slate-50 hover:bg-white"
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
                      className="w-full mt-3 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('listings.harvest_date', 'Harvest Date (Optional)')}
                  </label>
                  <input 
                    type="date" 
                    name="harvest_date"
                    value={formData.harvest_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Volume and Quality */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg font-bold text-slate-800">{t('listings.volume_quality', 'Volume & Quality')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('listings.quantity', 'Available Quantity')} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      placeholder="e.g. 50"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-bold text-slate-800"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('listings.unit', 'Unit')}
                    </label>
                    <select 
                      name="unit" 
                      value={formData.unit} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-medium bg-slate-50"
                    >
                      <option value="quintal">{t('listings.unitQuintal', 'Quintal')}</option>
                      <option value="ton">{t('listings.unitTon', 'Ton')}</option>
                      <option value="kg">{t('listings.unitKg', 'Kg')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between">
                    <span>{t('listings.quality_grade', 'Quality Grade')}</span>
                    <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded">{t('listings.selfDeclared', 'Self-Declared')}</span>
                  </label>
                  <select 
                    name="quality_grade" 
                    value={formData.quality_grade} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800 bg-slate-50"
                  >
                    <option value="A">{t('listings.gradeA', 'Grade A (Premium/Export Quality)')}</option>
                    <option value="B">{t('listings.gradeB', 'Grade B (Standard Market Quality)')}</option>
                    <option value="C">{t('listings.gradeC', 'Grade C (Processing/Fair Average)')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-lg font-bold text-slate-800">{t('listings.expected_price', 'Pricing Strategy')}</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('listings.expected_price', 'Expected Price')} ({t('listings.per_unit', 'per unit')})
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-lg">₹</span>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder={t('farmer.leave_blank', 'Leave blank to accept market offers')}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg text-slate-800"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Prices are protected by National Escrow guidelines.
                </p>
              </div>
            </div>

            {/* Section 4: Location */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">4</div>
                <h2 className="text-lg font-bold text-slate-800">{t('listings.location', 'Origin Location')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('common.state', 'State')} <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                  >
                    <option value="">{t('common.select_state', 'Select State')}</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('common.district', 'District / Village')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder={t('farmer.location_placeholder', 'e.g. Nashik')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Voice Description */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">5</div>
                <h2 className="text-lg font-bold text-slate-800">{t('listings.description', 'Produce Description')}</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between items-center">
                  <span>{t('listings.additionalDetails', 'Additional Details for Buyers')}</span>
                  <button 
                    type="button"
                    onClick={handleMicClick}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm border ${
                      isListening ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isListening ? t('common.listening', 'Listening...') : t('common.voice_type', 'Voice Type')}
                  </button>
                </label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder={t('farmer.desc_placeholder', 'Tell buyers about farming methods, special care taken, etc...')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-slate-50/50"
                ></textarea>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 font-medium max-w-sm text-center md:text-left">
              By publishing, you agree to the National eNAM trading guidelines and terms of service.
            </p>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full md:w-auto px-10 py-3.5 rounded-xl text-white font-bold text-lg shadow-md hover:shadow-lg transition-all ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" /> {t('common.publishing', 'Publishing...')}
                </span>
              ) : (
                t('farmer.publish_btn', 'Publish Listing Now')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;

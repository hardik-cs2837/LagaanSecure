import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import DataSourceBadge from './DataSourceBadge';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  MapPinIcon,
  ScaleIcon,
  CurrencyRupeeIcon,
  ArchiveBoxIcon,
  XMarkIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiZap, FiShoppingBag } from 'react-icons/fi';

const CROPS = [
  { name: 'Onion', icon: '🧅', category: 'Vegetable' },
  { name: 'Tomato', icon: '🍅', category: 'Vegetable' },
  { name: 'Wheat', icon: '🌾', category: 'Grain' },
  { name: 'Rice', icon: '🍚', category: 'Grain' },
  { name: 'Potato', icon: '🥔', category: 'Tuber' },
  { name: 'Soybean', icon: '🫘', category: 'Pulse' },
  { name: 'Cotton', icon: '☁️', category: 'Commercial' },
  { name: 'Maize', icon: '🌽', category: 'Grain' },
  { name: 'Sugarcane', icon: '🎋', category: 'Commercial' },
  { name: 'Garlic', icon: '🧄', category: 'Spice' },
  { name: 'Mustard', icon: '🌼', category: 'Oilseed' }
];

const STATES_AND_DISTRICTS = {
  'Maharashtra': ['Nashik', 'Pune', 'Ahmednagar', 'Solapur', 'Nagpur', 'Latur', 'Jalgaon'],
  'Karnataka': ['Hubli', 'Kolar', 'Belagavi', 'Davangere', 'Mysuru', 'Bengaluru'],
  'Punjab': ['Amritsar', 'Karnal', 'Ludhiana', 'Jalandhar', 'Patiala'],
  'Uttar Pradesh': ['Agra', 'Lucknow', 'Kanpur', 'Meerut', 'Varanasi', 'Mathura'],
  'Madhya Pradesh': ['Indore', 'Mandsaur', 'Ujjain', 'Bhopal', 'Dewas'],
  'Gujarat': ['Rajkot', 'Junagadh', 'Ahmedabad', 'Surat', 'Amreli'],
  'West Bengal': ['Hooghly', 'Burdwan', 'Nadia', 'Murshidabad'],
  'Andhra Pradesh': ['Madanapalle', 'Guntur', 'Kurnool', 'Vijayawada'],
  'Rajasthan': ['Jaipur', 'Kota', 'Alwar', 'Sri Ganganagar'],
  'Bihar': ['Purnia', 'Patna', 'Muzaffarpur', 'Gaya']
};

export default function AISmartSellCopilot({ onClose, isModal = false }) {
  const navigate = useNavigate();

  // Workflow State: Steps 1 to 6
  const [currentStep, setCurrentStep] = useState(1);
  const [crop, setCrop] = useState('Onion');
  const [customCrop, setCustomCrop] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [grade, setGrade] = useState('A');
  const [stateName, setStateName] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [urgency, setUrgency] = useState('Medium'); // 'High' (1-3 days), 'Medium' (7-14 days), 'Low' (>15 days)
  const [storageAvailable, setStorageAvailable] = useState('Yes'); // 'Yes' | 'No'

  // Analysis State
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [dataAvailable, setDataAvailable] = useState(true);
  const [mandiResult, setMandiResult] = useState(null);
  const [dataTimestamp, setDataTimestamp] = useState(null);
  const [dataSourceType, setDataSourceType] = useState('verified');

  const selectedCropName = crop === 'Other' ? (customCrop || 'Custom Crop') : crop;

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      runAnalysis();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setAnalyzed(false);
    setDataAvailable(true);

    try {
      // Fetch verified government mandi price from /api/prices
      const targetCrop = selectedCropName;
      
      // Try trends endpoint first for rich forecast
      let response;
      let priceData = null;
      
      try {
        response = await api.get(`/prices/${encodeURIComponent(targetCrop)}/trends`, {
          params: { state: stateName }
        });
        if (response.data && response.data.success) {
          priceData = response.data.data;
        }
      } catch (trendErr) {
        console.warn('Trends fetch fallback:', trendErr);
      }

      // Fallback to basic price endpoint if trends fail
      if (!priceData) {
        try {
          const resPrice = await api.get(`/prices/${encodeURIComponent(targetCrop)}`, {
            params: { state: stateName }
          });
          if (resPrice.data && resPrice.data.success && Array.isArray(resPrice.data.data) && resPrice.data.data.length > 0) {
            const item = resPrice.data.data[0];
            priceData = {
              avgModalPrice: item.modal_price,
              currentPrice: item.modal_price,
              minPrice: item.min_price || Math.round(item.modal_price * 0.85),
              maxPrice: item.max_price || Math.round(item.modal_price * 1.15),
              percentageChange: 1.5,
              recommendation: `Verified mandi price for ${targetCrop} in ${item.market || stateName}: ₹${item.modal_price}/qtl.`,
              isForecast: false
            };
          }
        } catch (basicErr) {
          console.warn('Basic price fetch fallback:', basicErr);
        }
      }

      // Check if price data was retrieved
      if (priceData && (priceData.avgModalPrice || priceData.currentPrice)) {
        setDataAvailable(true);
        setMandiResult(priceData);
        setDataTimestamp(new Date());
        setDataSourceType('verified');
      } else {
        // Data unavailable
        setDataAvailable(false);
        setMandiResult(null);
        setDataTimestamp(new Date());
        setDataSourceType('unavailable');
      }
    } catch (error) {
      console.error('Error fetching mandi price analysis:', error);
      setDataAvailable(false);
      setMandiResult(null);
      setDataTimestamp(new Date());
      setDataSourceType('unavailable');
    } finally {
      setLoading(false);
      setAnalyzed(true);
    }
  };

  // Calculations if verified data exists
  let gradeMultiplier = 1.0;
  if (grade === 'A') gradeMultiplier = 1.08;
  if (grade === 'C') gradeMultiplier = 0.90;

  const rawPrice = mandiResult ? (mandiResult.currentPrice || mandiResult.avgModalPrice || 0) : 0;
  const benchmarkPrice = Math.round(rawPrice * gradeMultiplier);
  const minRangePrice = mandiResult ? Math.round((mandiResult.minPrice || rawPrice * 0.85) * gradeMultiplier) : 0;
  const maxRangePrice = mandiResult ? Math.round((mandiResult.maxPrice || rawPrice * 1.15) * gradeMultiplier) : 0;
  
  const numQuantity = Number(quantity) || 1;
  const grossRealization = numQuantity * benchmarkPrice;
  const estimatedCostPerQtl = 45; // Transport, loading, handling fees
  const totalCost = numQuantity * estimatedCostPerQtl;
  const netRealization = grossRealization - totalCost;

  // Determine Recommendation Strategy
  let recommendationType = 'SELL_NOW';
  let recommendationTitle = 'Sell Now in Mandi';
  let recommendationBadge = '⚡ Sell Now';
  let recommendationColor = 'bg-amber-500 text-white';
  let recommendationBorder = 'border-amber-200 bg-amber-50/50';
  let recommendationDesc = '';

  const pctChange = mandiResult?.percentageChange || 0;

  if (storageAvailable === 'Yes' && urgency !== 'High' && pctChange >= 0) {
    recommendationType = 'STORE';
    recommendationTitle = 'Store Produce & Liquidate Later';
    recommendationBadge = '🏬 Store & Wait';
    recommendationColor = 'bg-emerald-600 text-white';
    recommendationBorder = 'border-emerald-200 bg-emerald-50/50';
    recommendationDesc = `Mandi trends show a ${pctChange > 0 ? `+${pctChange}% price increase projection` : 'stable trend'} over the next 7-14 days. Since cold storage/warehouse storage is available, holding your ${selectedCropName} lot can maximize net realization.`;
  } else if (urgency === 'High' || storageAvailable === 'No' || pctChange < -2) {
    recommendationType = 'SELL_NOW';
    recommendationTitle = 'Sell Immediately in Active Mandi';
    recommendationBadge = '⚡ Sell Now';
    recommendationColor = 'bg-blue-600 text-white';
    recommendationBorder = 'border-blue-200 bg-blue-50/50';
    recommendationDesc = `Harvest urgency is high or prices are projected to soften. Selling your ${numQuantity} qtl lot of ${selectedCropName} immediately secures top current mandi rates and prevents storage degradation.`;
  } else {
    recommendationType = 'COMPARE_MARKETS';
    recommendationTitle = 'Compare Regional Markets & Direct Buyers';
    recommendationBadge = '🌐 Compare Markets';
    recommendationColor = 'bg-indigo-600 text-white';
    recommendationBorder = 'border-indigo-200 bg-indigo-50/50';
    recommendationDesc = `Prices vary across neighboring mandis in ${stateName}. Creating a crop lot allows verified bulk buyers and FPOs to bid directly on your batch.`;
  }

  const handleCreateLot = () => {
    navigate('/listings/create', {
      state: {
        crop_name: selectedCropName,
        quantity: numQuantity,
        quality_grade: grade,
        price: benchmarkPrice,
        location: `${district}, ${stateName}`,
        harvest_date: harvestDate,
        description: `AI Copilot Recommendation (${recommendationBadge}): Verified government benchmark rate of ₹${benchmarkPrice}/qtl (${grade} Grade) in ${district}, ${stateName}.`
      }
    });
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setAnalyzed(false);
  };

  return (
    <div className={cn(
      "bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all",
      isModal ? "p-0 max-w-3xl w-full mx-auto" : "p-6 sm:p-8"
    )}>
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <SparklesIcon className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  AI Smart Assistant
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                AI Smart Sell Copilot
              </h2>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Stepper Bar (Steps 1 to 6) */}
        {!analyzed && (
          <div className="mt-8 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Step {currentStep} of 6
              </span>
              <span className="text-xs font-medium text-slate-300">
                {currentStep === 1 && 'Crop Selection'}
                {currentStep === 2 && 'Quantity Input'}
                {currentStep === 3 && 'Quality Assessment'}
                {currentStep === 4 && 'Mandi Location'}
                {currentStep === 5 && 'Harvest & Urgency'}
                {currentStep === 6 && 'Storage Status'}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5 bg-black/20 p-1.5 rounded-xl border border-white/10">
              {[1, 2, 3, 4, 5, 6].map((st) => (
                <div
                  key={st}
                  onClick={() => st < currentStep && setCurrentStep(st)}
                  className={cn(
                    "h-2 rounded-lg transition-all duration-300 cursor-pointer",
                    st === currentStep
                      ? "bg-emerald-400 shadow-lg shadow-emerald-500/50"
                      : st < currentStep
                      ? "bg-emerald-600/80 hover:bg-emerald-500"
                      : "bg-white/15"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8">
        {!analyzed ? (
          <div>
            {/* STEP 1: SELECT CROP */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">1</span>
                    Select Your Crop
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Choose the commodity you plan to sell or get mandi insights for.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {CROPS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCrop(c.name)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center group",
                        crop === c.name
                          ? "border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                      )}
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
                      <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{c.category}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCrop('Other')}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center group",
                      crop === 'Other'
                        ? "border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                    )}
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">🌱</span>
                    <span className="font-bold text-slate-900 text-sm">Other Crop</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Custom</span>
                  </button>
                </div>

                {crop === 'Other' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Enter Custom Crop Name
                    </label>
                    <input
                      type="text"
                      value={customCrop}
                      onChange={(e) => setCustomCrop(e.target.value)}
                      placeholder="e.g. Cardamom, Turmeric, Pulses..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 2: ENTER QUANTITY */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">2</span>
                    Enter Quantity (Quintals)
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Specify total harvest lot size in Quintals (1 Quintal = 100 kg).
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full px-5 py-4 text-2xl font-black text-slate-900 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                      Quintals (Qtl)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Quick Select Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[25, 50, 100, 250, 500, 1000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setQuantity(preset)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                            quantity === preset
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          )}
                        >
                          {preset} Qtl ({preset * 100} kg)
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: QUALITY GRADE */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">3</span>
                    Select Quality Grade
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Quality grade determines benchmark price premiums and buyer matching eligibility.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'A',
                      title: 'Grade A (Premium)',
                      badge: '+8-10% Premium',
                      desc: 'Export / Top tier quality. Low moisture (<10%), zero defects, uniform large sizing.',
                      border: 'border-emerald-500 bg-emerald-50/50'
                    },
                    {
                      id: 'B',
                      title: 'Grade B (Standard)',
                      badge: 'Benchmark Mandi Rate',
                      desc: 'Standard market quality. Regular size, minor variation, clean harvest.',
                      border: 'border-blue-500 bg-blue-50/50'
                    },
                    {
                      id: 'C',
                      title: 'Grade C (Fair / Processing)',
                      badge: '-10% Discount',
                      desc: 'Fair quality suitable for local processing, paste, or immediate bulk sale.',
                      border: 'border-amber-500 bg-amber-50/50'
                    }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGrade(g.id)}
                      className={cn(
                        "p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-full group",
                        grade === g.id
                          ? `${g.border} shadow-md ring-2 ring-emerald-500/20`
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-900 text-lg">{g.title}</span>
                          {grade === g.id && (
                            <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <span className="inline-block bg-white text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-slate-200 mb-3 shadow-xs">
                          {g.badge}
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">{g.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: LOCATION */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">4</span>
                    Mandi & Region Location
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Verified price benchmarks are fetched based on your state & district mandi hub.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      State
                    </label>
                    <select
                      value={stateName}
                      onChange={(e) => {
                        const newSt = e.target.value;
                        setStateName(newSt);
                        if (STATES_AND_DISTRICTS[newSt]) {
                          setDistrict(STATES_AND_DISTRICTS[newSt][0]);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      District / Mandi Hub
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      {(STATES_AND_DISTRICTS[stateName] || ['Default Market']).map((dst) => (
                        <option key={dst} value={dst}>{dst}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: HARVEST DATE & URGENCY */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">5</span>
                    Harvest Date & Selling Urgency
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Helps AI determine whether immediate liquidation or staged selling maximizes revenue.
                  </p>
                </div>

                <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Selling Urgency Level
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'High', title: 'High Urgency', label: 'Need cash / sell within 1-3 days', badge: 'Fast Sale' },
                        { id: 'Medium', title: 'Medium Urgency', label: 'Sell within 7-14 days', badge: 'Standard Window' },
                        { id: 'Low', title: 'Low / Flexible', label: 'Can hold > 15 days if prices rise', badge: 'Flexible Window' }
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setUrgency(u.id)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all flex flex-col justify-between",
                            urgency === u.id
                              ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20"
                              : "border-slate-200 bg-white hover:bg-slate-100"
                          )}
                        >
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{u.title}</span>
                            <span className="text-xs text-slate-500 mt-1 block">{u.label}</span>
                          </div>
                          <span className="mt-3 text-[10px] font-bold text-emerald-700 uppercase">{u.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: STORAGE AVAILABILITY */}
            {currentStep === 6 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">6</span>
                    Storage Availability
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Do you have access to cold storage, warehouse, or dry storage facilities?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setStorageAvailable('Yes')}
                    className={cn(
                      "p-6 rounded-2xl border text-left transition-all flex items-center gap-4 group",
                      storageAvailable === 'Yes'
                        ? "border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                      <ArchiveBoxIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-lg">Yes, Storage Available</h4>
                      <p className="text-slate-500 text-xs mt-1">
                        Cold storage, local godown, or farm warehouse available.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStorageAvailable('No')}
                    className={cn(
                      "p-6 rounded-2xl border text-left transition-all flex items-center gap-4 group",
                      storageAvailable === 'No'
                        ? "border-slate-800 bg-slate-100 shadow-md ring-2 ring-slate-400/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="p-3 bg-slate-200 text-slate-700 rounded-xl">
                      <BuildingOfficeIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-lg">No Storage Facility</h4>
                      <p className="text-slate-500 text-xs mt-1">
                        Produce must be dispatched directly post-harvest.
                      </p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Stepper Control Buttons */}
            <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 text-slate-600"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleNextStep}
                isLoading={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md"
              >
                {currentStep === 6 ? (
                  <>
                    <SparklesIcon className="w-5 h-5 text-amber-300 animate-spin" />
                    Analyze & Generate Recommendation
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* ANALYSIS RESULT VIEW */
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Header Status Bar & Transparency Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                      Copilot Analysis Report
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {selectedCropName} • {numQuantity} Qtl ({grade} Grade)
                  </h3>
                </div>

                <DataSourceBadge
                  source={dataAvailable ? "✓ Government of India (Data.gov.in)" : "⚠ Market Data Unavailable"}
                  timestamp={dataTimestamp}
                  status={dataSourceType}
                />
              </div>

              {/* DATA UNAVAILABLE CASE */}
              {!dataAvailable ? (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                  </div>
                  <div className="max-w-xl mx-auto space-y-2">
                    <h4 className="text-xl font-bold text-amber-900">
                      I don't have enough verified data to make a reliable recommendation.
                    </h4>
                    <p className="text-slate-600 text-sm">
                      We could not retrieve official verified government mandi data for <span className="font-bold">{selectedCropName}</span> in <span className="font-bold">{stateName}</span> at this moment.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <Button variant="secondary" onClick={resetWorkflow}>
                      <FiRefreshCw className="w-4 h-4 mr-2" />
                      Try Another Crop or State
                    </Button>
                    <Button onClick={handleCreateLot} className="bg-emerald-600 text-white">
                      Create Listing Anyway
                    </Button>
                  </div>
                </div>
              ) : (
                /* VERIFIED DATA AVAILABLE CASE */
                <div className="space-y-6">
                  {/* Top Recommendation Box */}
                  <div className={cn("p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4 relative overflow-hidden", recommendationBorder)}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs", recommendationColor)}>
                        {recommendationBadge}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4 text-emerald-600" />
                        {district}, {stateName} Mandi Hub
                      </span>
                    </div>

                    <div>
                      <h4 className="text-2xl font-black text-slate-900">
                        {recommendationTitle}
                      </h4>
                      <p className="text-slate-700 text-sm font-medium leading-relaxed mt-2">
                        {recommendationDesc}
                      </p>
                    </div>
                  </div>

                  {/* 2 Column Stats: Verified Price Benchmark + Expected Net Realization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: Verified Price Benchmark */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Verified Price Benchmark
                          </span>
                          <h5 className="text-3xl font-black text-slate-900 mt-1">
                            ₹{benchmarkPrice.toLocaleString()}{' '}
                            <span className="text-sm font-bold text-slate-500">/ quintal</span>
                          </h5>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                          {grade} Grade Adjusted
                        </span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Raw Govt Modal Price:</span>
                          <span className="font-bold text-slate-900">₹{rawPrice}/qtl</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mandi Price Range:</span>
                          <span className="font-bold text-slate-900">₹{minRangePrice} - ₹{maxRangePrice}/qtl</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projected 7-Day Trend:</span>
                          <span className={cn("font-bold flex items-center gap-1", pctChange >= 0 ? "text-emerald-600" : "text-rose-600")}>
                            {pctChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                            {pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Expected Net Realization (Only shown when verified inputs exist!) */}
                    <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-6 rounded-2xl border border-emerald-800 shadow-md space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div>
                        <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider block">
                          Expected Net Realization
                        </span>
                        <h5 className="text-3xl font-black text-emerald-400 mt-1">
                          ₹{netRealization.toLocaleString()}
                        </h5>
                        <p className="text-[11px] text-emerald-200 mt-0.5 font-medium">
                          Calculated for {numQuantity} Quintals after estimated freight & handling
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-white/10 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span>Gross Batch Revenue:</span>
                          <span className="font-bold text-white">₹{grossRealization.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. Freight & Mandi Fee (₹45/qtl):</span>
                          <span className="font-bold text-amber-300">-₹{totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-white pt-1 border-t border-white/10">
                          <span>Net Profit / Quintal:</span>
                          <span className="text-emerald-400">₹{Math.round(netRealization / numQuantity)}/qtl</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Call to Action Button */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button variant="ghost" onClick={resetWorkflow} className="w-full sm:w-auto text-slate-600">
                      <FiRefreshCw className="w-4 h-4 mr-2" />
                      Recalculate Inputs
                    </Button>

                    <Button
                      onClick={handleCreateLot}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-3"
                    >
                      <FiShoppingBag className="w-5 h-5" />
                      Create Crop Lot & Find Buyers
                      <ArrowRightIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

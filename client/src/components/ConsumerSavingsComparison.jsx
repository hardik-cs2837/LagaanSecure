import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ConsumerSavingsComparison({ 
  cropName = 'Onion', 
  farmerPrice = 1350, 
  quantity = 50,
  unit = 'quintal' 
}) {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState(cropName);
  const [directPrice, setDirectPrice] = useState(farmerPrice || 1350);

  // Benchmarks based on agricultural market studies (avg intermediary stack)
  const cropBenchmarks = {
    Onion: { middlemanFarmerCut: 800, intermediaryMarkup: 650, traditionalRetail: 1650 },
    Tomato: { middlemanFarmerCut: 700, intermediaryMarkup: 800, traditionalRetail: 1750 },
    Wheat: { middlemanFarmerCut: 1900, intermediaryMarkup: 550, traditionalRetail: 2650 },
    Rice: { middlemanFarmerCut: 1800, intermediaryMarkup: 700, traditionalRetail: 2750 },
    Potato: { middlemanFarmerCut: 450, intermediaryMarkup: 450, traditionalRetail: 1000 },
    Soybean: { middlemanFarmerCut: 3800, intermediaryMarkup: 1100, traditionalRetail: 5200 },
    Cotton: { middlemanFarmerCut: 5200, intermediaryMarkup: 1400, traditionalRetail: 7000 }
  };

  const benchmark = cropBenchmarks[selectedCrop] || cropBenchmarks['Onion'];
  const traditionalFarmerPrice = benchmark.middlemanFarmerCut;
  const traditionalConsumerPrice = benchmark.traditionalRetail;
  const currentDirectPrice = Number(directPrice) || benchmark.middlemanFarmerCut + 400;

  // Impact Calculations
  const farmerExtraEarningsPerUnit = Math.max(0, currentDirectPrice - traditionalFarmerPrice);
  const farmerGainPercentage = (((currentDirectPrice - traditionalFarmerPrice) / traditionalFarmerPrice) * 100).toFixed(1);

  const consumerSavingsPerUnit = Math.max(0, traditionalConsumerPrice - currentDirectPrice);
  const consumerSavingsPercentage = (((traditionalConsumerPrice - currentDirectPrice) / traditionalConsumerPrice) * 100).toFixed(1);

  const totalLotFarmerGain = Math.round(farmerExtraEarningsPerUnit * Number(quantity));
  const totalLotConsumerSavings = Math.round(consumerSavingsPerUnit * Number(quantity));

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-primary-700 to-accent-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚖️</span>
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold">
              {t('savings.title', 'Direct Trade vs Traditional Intermediaries')}
            </h3>
            <p className="text-emerald-100 text-xs md:text-sm mt-0.5">
              {t('savings.subtitle', 'Visual proof of how eliminating middlemen benefits both Farmer & Buyer simultaneously')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Comparison Cards: Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TRADITIONAL MULTI-TIER INTERMEDIARY SYSTEM */}
          <div className="bg-red-50/70 rounded-2xl p-5 border-2 border-red-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-red-200">
                <span className="font-extrabold text-red-900 text-sm md:text-base flex items-center gap-1.5">
                  ❌ {t('savings.traditional_chain', 'Traditional Middlemen Chain')}
                </span>
                <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded font-bold">
                  3–5 Intermediaries
                </span>
              </div>

              {/* Step Flow */}
              <div className="py-4 space-y-2.5 text-xs md:text-sm text-gray-700">
                <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-lg border border-red-100">
                  <span>👨‍🌾 {t('savings.farmer_receives', 'Farmer receives (Village Agent cut)')}</span>
                  <span className="font-bold text-red-600">₹{traditionalFarmerPrice}/{unit}</span>
                </div>
                <div className="flex justify-between items-center px-3 text-gray-500 text-xs">
                  <span>↳ Village Aggregator margin</span>
                  <span className="font-medium">+₹120</span>
                </div>
                <div className="flex justify-between items-center px-3 text-gray-500 text-xs">
                  <span>↳ Mandi Dalal & APMC Cess</span>
                  <span className="font-medium">+₹180</span>
                </div>
                <div className="flex justify-between items-center px-3 text-gray-500 text-xs">
                  <span>↳ Secondary Wholesale & Transit leak</span>
                  <span className="font-medium">+₹220</span>
                </div>
                <div className="flex justify-between items-center px-3 text-gray-500 text-xs">
                  <span>↳ Urban Retailer markup</span>
                  <span className="font-medium">+₹230</span>
                </div>
                <div className="flex justify-between items-center bg-red-100 p-2.5 rounded-lg font-bold text-red-950 border border-red-200">
                  <span>🛒 {t('savings.consumer_pays', 'End Buyer / Consumer pays')}</span>
                  <span className="text-base text-red-700">₹{traditionalConsumerPrice}/{unit}</span>
                </div>
              </div>
            </div>

            <div className="bg-red-200/60 p-3 rounded-xl text-center text-xs text-red-900 font-semibold mt-2">
              ⚠️ {t('savings.leakage_warning', 'Middlemen siphon ₹{{amt}}/quintal without adding produce value', { amt: traditionalConsumerPrice - traditionalFarmerPrice })}
            </div>
          </div>

          {/* DIRECT Lagaan Secure TRADE */}
          <div className="bg-emerald-50/70 rounded-2xl p-5 border-2 border-emerald-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <span className="font-extrabold text-emerald-900 text-sm md:text-base flex items-center gap-1.5">
                  ✅ {t('savings.kisaan_direct', 'Direct Lagaan Secure Trade')}
                </span>
                <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  Zero Intermediaries
                </span>
              </div>

              {/* Direct Flow */}
              <div className="py-4 space-y-3 text-xs md:text-sm">
                <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs">👨‍🌾 {t('savings.farmer_direct_earning', 'Farmer Direct Earning')}</p>
                    <p className="text-2xl font-black text-emerald-700 mt-0.5">₹{currentDirectPrice}<span className="text-xs text-gray-500">/{unit}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full text-xs">
                      +{farmerGainPercentage}% {t('savings.more_income', 'More')}
                    </span>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">+₹{farmerExtraEarningsPerUnit}/{unit} gain</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs">🛒 {t('savings.buyer_direct_cost', 'Buyer / Consumer Cost')}</p>
                    <p className="text-2xl font-black text-primary-700 mt-0.5">₹{currentDirectPrice}<span className="text-xs text-gray-500">/{unit}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-100 text-blue-800 font-extrabold px-2.5 py-1 rounded-full text-xs">
                      -{consumerSavingsPercentage}% {t('savings.savings', 'Savings')}
                    </span>
                    <p className="text-[11px] text-blue-600 font-medium mt-1">₹{consumerSavingsPerUnit}/{unit} saved</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-100 p-3 rounded-xl text-center text-xs text-emerald-900 font-bold mt-2">
              🌟 {t('savings.win_win', 'Both parties win: Farmer earns more, Buyer pays less!')}
            </div>
          </div>
        </div>

        {/* Aggregate Deal Lot Impact */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-xs text-primary-200 uppercase tracking-wider font-semibold">
                {t('savings.total_lot_impact', 'Combined Impact on this {{qty}} {{unit}} Lot', { qty: quantity, unit })}
              </p>
              <h4 className="text-lg md:text-xl font-bold mt-1">
                {t('savings.value_creation', 'Total Value Unlocked from Middlemen Margins')}
              </h4>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl text-center backdrop-blur-sm border border-white/10">
                <p className="text-xs text-emerald-300 font-medium">{t('savings.farmer_extra', 'Farmer Extra Gain')}</p>
                <p className="text-xl font-extrabold text-white mt-0.5">₹{totalLotFarmerGain.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl text-center backdrop-blur-sm border border-white/10">
                <p className="text-xs text-accent-300 font-medium">{t('savings.buyer_savings', 'Buyer Net Savings')}</p>
                <p className="text-xl font-extrabold text-white mt-0.5">₹{totalLotConsumerSavings.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { prices, advisor } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MarkupCalculator = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [commodities, setCommodities] = useState([]);
  const [states, setStates] = useState([]);
  const [crop, setCrop] = useState('');
  const [state, setState] = useState('');
  const [market, setMarket] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data } = await prices.getAvailableCommodities();
        if (data.success) {
          setCommodities(data.data.commodities || []);
          setStates(data.data.states || []);
          if (data.data.commodities?.length) setCrop(data.data.commodities[0]);
          if (data.data.states?.length) setState(data.data.states[0]);
        }
      } catch {
        setCommodities(['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato']);
        setStates(['Maharashtra', 'Punjab', 'Karnataka', 'Uttar Pradesh']);
        setCrop('Wheat');
        setState('Punjab');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleCheck = async () => {
    if (!price || !crop || !state) return;
    setLoading(true);
    setResult(null);
    try {
      // First get mandi price
      const priceRes = await prices.getPrice(crop, state, market || undefined);
      let mandiPrice = null;

      if (priceRes.data.success) {
        const priceData = priceRes.data.data;
        if (Array.isArray(priceData) && priceData.length > 0) {
          mandiPrice = priceData[0].modal_price;
          if (!market) setMarket(priceData[0].market);
        } else if (priceData?.modal_price) {
          mandiPrice = priceData.modal_price;
        }
      }

      if (!mandiPrice) {
        setResult({ error: 'Mandi price not available for this selection. Try a different state/market.' });
        setLoading(false);
        return;
      }

      // Get advisor explanation
      const adviceRes = await advisor.getAdvice({
        mandiPrice,
        enteredPrice: Number(price),
        crop,
      });

      const diffPercent = ((mandiPrice - Number(price)) / mandiPrice) * 100;

      setResult({
        mandiPrice,
        offeredPrice: Number(price),
        diffPercent,
        potentialLoss: mandiPrice > Number(price) ? mandiPrice - Number(price) : 0,
        verdict: adviceRes.data.data?.explanation || adviceRes.data.data?.verdict ||
          (diffPercent <= 0
            ? 'This offer is at or above market rate. Great deal!'
            : `This offer is ${diffPercent.toFixed(1)}% below the mandi price.`),
      });
    } catch (err) {
      console.error(err);
      setResult({ error: 'Mandi price not available. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  const getGaugeColor = (diff) => {
    if (diff <= 0) return 'bg-green-500';
    if (diff <= 10) return 'bg-yellow-400';
    if (diff <= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = (diff) => {
    if (diff <= 0) return 'text-green-600';
    if (diff <= 10) return 'text-yellow-600';
    if (diff <= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusEmoji = (diff) => {
    if (diff <= 0) return '✅';
    if (diff <= 10) return '⚠️';
    if (diff <= 20) return '🔶';
    return '🚨';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          🔍 {t('farmer.markupCalculator', 'Intermediary Markup Calculator')}
        </h2>
        <p className="text-primary-100 mt-1 text-sm md:text-base">
          {t('farmer.markupDesc', 'Enter the price a local agent offered you — see if it\'s fair')}
        </p>
      </div>

      {/* Form */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listings.crop', 'Crop')}
            </label>
            <select
              className="w-full p-3 border-2 border-gray-200 rounded-xl min-h-[48px] text-lg focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              disabled={loadingOptions}
            >
              {commodities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listings.state', 'State')}
            </label>
            <select
              className="w-full p-3 border-2 border-gray-200 rounded-xl min-h-[48px] text-lg focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={loadingOptions}
            >
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('markup.enterPrice', 'Agent\'s Offer (₹/quintal)')}
            </label>
            <input
              type="number"
              placeholder="e.g. 1800"
              className="w-full p-3 border-2 border-gray-200 rounded-xl min-h-[48px] text-lg focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading || !price}
          className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl min-h-[56px] text-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              {t('common.loading', 'Checking...')}
            </span>
          ) : (
            t('markup.checkPrice', '🔍 Check Price Now')
          )}
        </button>

        {/* Results */}
        {result && !result.error && (
          <div className="mt-6 p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 space-y-6 animate-[fadeIn_0.5s_ease-out]">
            {/* Price Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">
                  {t('markup.mandiPrice', 'Mandi Price')}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-primary-700 mt-1">
                  ₹{result.mandiPrice?.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-400">/quintal</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">
                  {t('markup.yourPrice', 'Agent\'s Offer')}
                </p>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 ${getTextColor(result.diffPercent)}`}>
                  ₹{result.offeredPrice?.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-400">/quintal</p>
              </div>
            </div>

            {/* Gauge Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-600">
                  {t('markup.fairness', 'Price Fairness')}
                </span>
                <span className={`font-bold ${getTextColor(result.diffPercent)}`}>
                  {getStatusEmoji(result.diffPercent)}{' '}
                  {result.diffPercent <= 0
                    ? t('markup.atMarket', 'At/Above Market Rate')
                    : `${result.diffPercent.toFixed(1)}% ${t('markup.belowMarket', 'Below Market')}`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className={`h-8 rounded-full transition-all duration-1000 ease-out flex items-center justify-center text-white font-bold text-sm ${getGaugeColor(result.diffPercent)}`}
                  style={{ width: `${Math.min(100, Math.max(8, 100 - Math.max(0, result.diffPercent)))}%` }}
                >
                  {result.diffPercent <= 0 ? '100%' : `${(100 - result.diffPercent).toFixed(0)}%`}
                </div>
              </div>
            </div>

            {/* Loss Highlight */}
            {result.potentialLoss > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600 font-medium">
                  {t('markup.potentialLoss', 'Potential Loss Per Quintal')}
                </p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  ₹{result.potentialLoss.toLocaleString('en-IN')}
                </p>
              </div>
            )}

            {/* Verdict */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 text-base leading-relaxed">
                💡 {result.verdict}
              </p>
            </div>

            {/* CTA */}
            {result.diffPercent > 0 && (
              <button
                onClick={() => navigate('/listings/create')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-xl min-h-[56px] text-lg transition-all shadow-md hover:shadow-lg"
              >
                🌾 {t('markup.sellDirect', 'Sell Directly on Lagaan Secure')}
              </button>
            )}
          </div>
        )}

        {/* Error state */}
        {result?.error && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
            ⚠️ {result.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkupCalculator;

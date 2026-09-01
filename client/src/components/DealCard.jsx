import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deals } from '../services/api';
import toast from 'react-hot-toast';

const DealCard = ({ deal, userRole, userId, onUpdate }) => {
  const { t } = useTranslation();
  const [showCounter, setShowCounter] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [updating, setUpdating] = useState(false);

  const listing = deal.listing || {};
  const buyer = deal.buyer || {};
  const isFarmer = userRole === 'farmer';
  const isPending = deal.status === 'pending';
  const isCountered = deal.status === 'countered';
  const isAccepted = deal.status === 'accepted';
  const isRejected = deal.status === 'rejected';

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    accepted: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    countered: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const handleAction = async (status, counter_price = null) => {
    setUpdating(true);
    try {
      const body = { status };
      if (counter_price) body.counter_price = parseFloat(counter_price);
      await deals.updateDeal(deal.id, body);
      toast.success(`Deal ${status}!`);
      setShowCounter(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update deal');
    } finally {
      setUpdating(false);
    }
  };

  const cropEmojis = { wheat: '🌾', rice: '🍚', tomato: '🍅', onion: '🧅', potato: '🥔', cotton: '🏵️', maize: '🌽', soybean: '🫘' };
  const emoji = cropEmojis[listing.crop_name?.toLowerCase()] || '🌱';

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border ${isAccepted ? 'border-green-300' : 'border-gray-100'}`}>
      {/* Accepted celebration header */}
      {isAccepted && (
        <div className="bg-gradient-to-r from-green-500 to-green-400 p-4 text-center">
          <p className="text-white font-bold text-lg">{t('deals.dealConfirmed', 'Deal Confirmed!')} 🎉</p>
          <p className="text-green-100 text-sm mt-1">{t('deals.bothBenefit', 'Both parties benefit from direct trade!')}</p>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Listing Info */}
        <div className="flex items-start gap-3">
          <div className="text-3xl">{emoji}</div>
          <div className="flex-1">
            <h3 className="font-bold text-dark text-lg">{listing.crop_name || 'Crop'}</h3>
            <p className="text-gray-500 text-sm">
              {listing.quantity} {listing.unit || 'quintal'} • {listing.location || 'N/A'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {isFarmer ? `Buyer: ${buyer.name || 'Unknown'}` : `Farmer: ${listing.farmer?.name || 'Unknown'}`}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[deal.status] || 'bg-gray-100 text-gray-600'}`}>
            {t(`deals.${deal.status}`, deal.status)}
          </span>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">{t('deals.offerPrice', 'Offered Price')}</p>
            <p className="text-xl font-bold text-accent-600">₹{deal.offered_price?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400">/quintal</p>
          </div>
          {deal.counter_price && (
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-500 font-medium">{t('deals.counterPrice', 'Counter Price')}</p>
              <p className="text-xl font-bold text-blue-600">₹{deal.counter_price?.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400">/quintal</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isFarmer && isPending && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleAction('accepted')}
              disabled={updating}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl min-h-[48px] transition-colors"
            >
              ✓ {t('deals.accept', 'Accept')}
            </button>
            <button
              onClick={() => handleAction('rejected')}
              disabled={updating}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl min-h-[48px] transition-colors"
            >
              ✕ {t('deals.reject', 'Reject')}
            </button>
            <button
              onClick={() => setShowCounter(!showCounter)}
              disabled={updating}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl min-h-[48px] transition-colors"
            >
              ↩ {t('deals.counter', 'Counter')}
            </button>
          </div>
        )}

        {!isFarmer && isCountered && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleAction('accepted')}
              disabled={updating}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl min-h-[48px] transition-colors"
            >
              ✓ {t('deals.accept', 'Accept')}
            </button>
            <button
              onClick={() => setShowCounter(!showCounter)}
              disabled={updating}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl min-h-[48px] transition-colors"
            >
              ↩ {t('deals.counter', 'Counter')}
            </button>
          </div>
        )}

        {/* Counter Input */}
        {showCounter && (
          <div className="flex gap-2 pt-2">
            <input
              type="number"
              value={counterPrice}
              onChange={(e) => setCounterPrice(e.target.value)}
              placeholder="₹ Your counter price"
              className="flex-1 p-3 border-2 border-blue-200 rounded-xl min-h-[48px] focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={() => counterPrice && handleAction('countered', counterPrice)}
              disabled={updating || !counterPrice}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium px-6 rounded-xl min-h-[48px] transition-colors"
            >
              {t('deals.sendOffer', 'Send')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealCard;

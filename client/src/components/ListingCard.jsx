import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const cropEmojis = {
  wheat: '🌾', rice: '🍚', tomato: '🍅', onion: '🧅', potato: '🥔',
  cotton: '🏵️', maize: '🌽', soybean: '🫘', sugarcane: '🎋',
  garlic: '🧄', mustard: '🌼',
};

const gradeColors = {
  A: 'bg-green-100 text-green-700 border-green-300',
  B: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  C: 'bg-orange-100 text-orange-700 border-orange-300',
};

const ListingCard = ({ listing, showOfferButton = true }) => {
  const { t } = useTranslation();
  const emoji = cropEmojis[listing.crop_name?.toLowerCase()] || '🌱';
  const farmer = listing.farmer || {};

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
      {/* Photo or emoji header */}
      {listing.photo_url ? (
        <div className="h-40 bg-gray-100 overflow-hidden">
          <img
            src={listing.photo_url}
            alt={listing.crop_name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
          <span className="text-6xl">{emoji}</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Title + Status */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-dark">{listing.crop_name}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              listing.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {listing.status === 'active' ? t('listings.active', 'Active') : t('listings.sold', 'Sold')}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
            📦 {listing.quantity} {listing.unit || 'quintal'}
          </span>
          {listing.quality_grade && (
            <span className={`px-2 py-1 rounded-md border text-xs font-medium ${gradeColors[listing.quality_grade] || 'bg-gray-100'}`}>
              Grade {listing.quality_grade}
            </span>
          )}
        </div>

        {/* Price */}
        {listing.price_per_unit && (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary-700">
              ₹{listing.price_per_unit?.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-gray-400">/{listing.unit || 'quintal'}</span>
          </div>
        )}

        {/* Location + Farmer */}
        <div className="text-sm text-gray-500 space-y-1">
          {listing.location && <p>📍 {listing.location}</p>}
          {farmer.name && <p>👨‍🌾 {farmer.name}</p>}
        </div>

        {/* Action */}
        {showOfferButton && listing.status === 'active' && (
          <Link
            to={`/listings/${listing.id}`}
            className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl min-h-[48px] transition-colors leading-[48px]"
          >
            {t('deals.makeOffer', 'View & Offer')}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ListingCard;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

const cropEmojis = {
  wheat: '🌾', rice: '🍚', tomato: '🍅', onion: '🧅', potato: '🥔',
  cotton: '🧶', maize: '🌽', soybean: '🌱', sugarcane: '🎋',
  garlic: '🧄', mustard: '🌼',
};

const ListingCard = ({ listing, showOfferButton = true }) => {
  const { t } = useTranslation();
  const emoji = cropEmojis[listing.crop_name?.toLowerCase()] || '🌾';
  const farmer = listing.farmer || {};

  return (
    <Card hover animate className="overflow-hidden flex flex-col h-full border-gray-100">
      {listing.photo_url ? (
        <div className="h-44 bg-gray-100 overflow-hidden relative">
          <img
            src={listing.photo_url}
            alt={listing.crop_name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-primary-50 to-emerald-100 flex items-center justify-center relative">
          <motion.span 
            initial={{ scale: 0.8 }} 
            animate={{ scale: 1 }} 
            className="text-6xl drop-shadow-sm"
          >
            {emoji}
          </motion.span>
        </div>
      )}

      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-extrabold text-dark tracking-tight">{listing.crop_name}</h3>
            <Badge variant={listing.status === 'active' ? 'success' : 'default'} className="uppercase tracking-wider">
              {listing.status === 'active' ? t('listings.active', 'Active') : t('listings.sold', 'Sold')}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 text-sm mb-4">
            <span className="bg-gray-50 text-gray-700 font-medium px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1">
              📦 <span className="font-bold">{listing.quantity}</span> {listing.unit || 'qtl'}
            </span>
            {listing.quality_grade && (
              <Badge variant={
                listing.quality_grade === 'A' ? 'success' : 
                listing.quality_grade === 'B' ? 'warning' : 'danger'
              }>
                Grade {listing.quality_grade}
              </Badge>
            )}
            {listing.is_bulk_fpo && (
              <Badge variant="primary">FPO Bulk Lot</Badge>
            )}
            {listing.is_in_storage && (
              <Badge variant="warning">🏬 In Storage</Badge>
            )}
          </div>

          {listing.quality_checklist && (
            <div className="mb-4 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span className="flex items-center gap-1">💧 {listing.quality_checklist.moisture_pct || 11}%</span>
              <span className="flex items-center gap-1">🌾 {listing.quality_checklist.foreign_matter_pct || 0.5}%</span>
              <span className="flex items-center gap-1">📐 {listing.quality_checklist.grain_size_uniformity?.split(' ')[0] || 'Uniform'}</span>
            </div>
          )}

          {listing.price_per_unit && (
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-3xl font-black text-primary-700 tracking-tight">
                ₹{listing.price_per_unit?.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-medium text-gray-400">/{listing.unit || 'qtl'}</span>
            </div>
          )}

          <div className="text-sm text-gray-500 space-y-1.5 font-medium mt-4">
            {listing.location && <p className="flex items-center gap-2">📍 {listing.location}</p>}
            {farmer.name && <p className="flex items-center gap-2">👨‍🌾 {farmer.name}</p>}
          </div>
        </div>

        {showOfferButton && listing.status === 'active' && (
          <Link to={`/listings/${listing.id}`} className="block w-full mt-4">
            <Button className="w-full">
              {t('deals.makeOffer', 'View & Offer')}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default ListingCard;

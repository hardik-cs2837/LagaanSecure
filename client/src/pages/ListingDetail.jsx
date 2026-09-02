import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { listings, deals, prices } from '../services/api';
import toast from 'react-hot-toast';
import ConsumerSavingsComparison from '../components/ConsumerSavingsComparison';
import BuyerBadge from '../components/BuyerBadge';
import StorageDirectoryModal from '../components/StorageDirectoryModal';

export default function ListingDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user, isBuyer, isFarmer } = useContext(AuthContext);
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [mandiPrice, setMandiPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incomingDeals, setIncomingDeals] = useState([]);
  const [showStorageModal, setShowStorageModal] = useState(false);

  // Offer State
  const [offerPrice, setOfferPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listings.getListing(id);
      const data = res.data?.data || res.data?.listing || res.data || res;
      setListing(data);
      
      // If user is the farmer who owns this, fetch deals on this listing
      if (isFarmer && data.farmer_id === user?.id) {
         fetchIncomingDeals(data.id);
      }

      // Try to fetch mandi price
      if (data.crop_name) {
         fetchMandiPrice(data.crop_name, data.location);
      }
    } catch (err) {
      console.error(err);
      setError(t('common.not_found', 'Listing not found or error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchMandiPrice = async (crop, location) => {
    try {
      const state = location?.split(',')[1]?.trim() || '';
      const market = location?.split(',')[0]?.trim() || '';
      const res = await prices.getPrice(crop, state, market);
      const p = res.data?.data || res.data;
      setMandiPrice(p?.modal_price || p?.price || null);
    } catch (e) {
      console.log('Mandi price fetch failed', e);
    }
  };

  const fetchIncomingDeals = async (listingId) => {
     try {
       const res = await deals.getMyDeals();
       const allDeals = res.data?.data || res.data?.deals || [];
       setIncomingDeals(allDeals.filter(d => d.listing_id === Number(listingId)));
     } catch (e) {
       console.error('Failed to fetch deals', e);
     }
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!offerPrice || Number(offerPrice) <= 0) {
      toast.error(t('buyer.enter_valid_price', 'Please enter a valid price.'));
      return;
    }
    try {
      setIsSubmitting(true);
      await deals.createDeal({
        listing_id: Number(id),
        offered_price: Number(offerPrice)
      });
      toast.success(t('deals.offer_sent', 'Offer sent directly to farmer!'));
      navigate('/deals');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || t('common.error_occurred', 'Failed to submit offer.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 animate-pulse">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl h-96"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">{error}</h2>
        <button onClick={() => navigate(-1)} className="text-primary-600 font-bold hover:underline">
          ← {t('common.back', 'Go Back')}
        </button>
      </div>
    );
  }

  const isOwner = isFarmer && listing.farmer_id === user?.id;
  const effectiveFarmerPrice = listing.price_per_unit || listing.price || (mandiPrice ? Math.round(mandiPrice * 1.05) : 1350);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold truncate text-dark">{listing.crop_name}</h1>
            <p className="text-xs text-gray-400">Lot #{listing.id} • {listing.location}</p>
          </div>
        </div>
        <button
          onClick={() => setShowStorageModal(true)}
          className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-200 hover:bg-primary-100 transition"
        >
          🏬 {t('storage.btn', 'Storage Facilities')}
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-2">
        {/* Main Listing Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header Banner / Photo */}
          {listing.photo_url ? (
            <img src={listing.photo_url} alt={listing.crop_name} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-emerald-800 to-primary-700 flex flex-col items-center justify-center text-white p-4">
              <span className="text-6xl select-none">🌾</span>
              <p className="text-emerald-100 text-xs font-semibold mt-2">KisaanConnect Direct Farm Lot</p>
            </div>
          )}

          <div className="p-6 md:p-8 space-y-6">
            {/* Title & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-3xl font-extrabold text-dark">{listing.crop_name}</h2>
                  {listing.is_fpo_pool && (
                    <span className="px-3 py-1 text-xs font-extrabold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                      👥 FPO Collective Lot ({listing.fpo_name || 'Agro FPO'})
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                  <span>📍</span> {listing.location}
                  {listing.harvest_date && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                      📅 Harvested: {listing.harvest_date}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 font-bold text-sm rounded-xl border ${
                  listing.quality_grade === 'A' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                  listing.quality_grade === 'B' ? 'bg-yellow-50 text-yellow-800 border-yellow-300' :
                  'bg-orange-50 text-orange-800 border-orange-300'
                }`}>
                  {t('listings.quality', 'Grade')} {listing.quality_grade}
                </span>
                <span className="px-3 py-1 text-sm font-bold bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300">
                  {listing.status === 'active' ? t('listings.active', 'Active Lot') : t('listings.sold', 'Sold')}
                </span>
              </div>
            </div>

            {/* Quantity and Price Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <p className="text-xs text-gray-500 font-medium uppercase">{t('listings.quantity', 'Quantity Available')}</p>
                <p className="text-2xl font-extrabold text-dark mt-1">
                  {listing.quantity} <span className="text-sm font-normal text-gray-600">{listing.unit}</span>
                </p>
              </div>
              <div className="bg-primary-50 p-4 rounded-2xl border border-primary-200">
                <p className="text-xs text-primary-800 font-medium uppercase">{t('listings.price', 'Farmer Asking Price')}</p>
                <p className="text-2xl font-extrabold text-primary-800 mt-1">
                  {listing.price_per_unit || listing.price ? `₹${listing.price_per_unit || listing.price}/${listing.unit}` : t('deals.pending', 'Open to Offers')}
                </p>
              </div>
            </div>

            {/* Live Mandi Benchmark */}
            {mandiPrice && (
              <div className="bg-amber-50 text-amber-900 p-4 rounded-2xl border border-amber-200 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <span className="font-semibold">{t('listings.current_mandi', 'Live Mandi Benchmark Modal Rate')}:</span>
                </div>
                <span className="font-extrabold text-base text-amber-950">₹{mandiPrice}/{listing.unit}</span>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">{t('listings.description', 'Produce Specifications & Notes')}</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {listing.description || t('listings.no_description', 'No additional descriptions provided by farmer.')}
              </p>
            </div>

            {/* Farmer Info & Verification */}
            <div className="border-t border-gray-100 pt-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                  👨‍🌾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-dark text-base">{listing.farmer?.name || 'Farmer'}</p>
                    {listing.farmer?.is_verified && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ Verified Farmer
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{listing.location}</p>
                </div>
              </div>

              {listing.farmer?.phone && isOwner && (
                <span className="text-xs text-gray-500 font-medium">📞 {listing.farmer.phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Consumer Savings & Markup Elimination Breakdown (PS 26033 Demo Moment) */}
        <ConsumerSavingsComparison 
          cropName={listing.crop_name}
          farmerPrice={effectiveFarmerPrice}
          quantity={listing.quantity}
          unit={listing.unit}
        />

        {/* Buyer Make-Offer Section */}
        {isBuyer && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h3 className="text-xl font-bold text-dark mb-2">{t('buyer.make_an_offer', 'Direct Digital Offer')}</h3>
            <p className="text-xs text-gray-500 mb-5">
              Submit your direct purchase offer without intermediary cess. The farmer will receive a real-time notification to accept or counter.
            </p>

            <form onSubmit={handleMakeOffer} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold text-lg">₹</span>
                <input 
                  type="number" 
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder={`e.g. ${listing.price_per_unit || listing.price || 1350}`}
                  className="w-full pl-9 pr-14 py-3 h-14 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none text-xl font-bold text-dark"
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 text-xs font-semibold">/{listing.unit}</span>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="h-14 px-8 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition shadow-md whitespace-nowrap disabled:opacity-70 text-base flex items-center justify-center gap-2"
              >
                {isSubmitting ? t('common.loading', 'Submitting...') : `🤝 ${t('buyer.submit_offer', 'Submit Direct Offer')}`}
              </button>
            </form>
          </div>
        )}

        {/* Storage Facilities Directory Modal */}
        <StorageDirectoryModal 
          isOpen={showStorageModal} 
          onClose={() => setShowStorageModal(false)} 
          defaultState={listing.location?.split(',')[1]?.trim() || 'Maharashtra'}
        />
      </div>
    </div>
  );
}

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { listings, deals, prices } from '../services/api';
import toast from 'react-hot-toast';

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
      const data = res.data?.listing || res.listing || res.data || res;
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
      // Simplistic location extraction for demo, real app might need proper state/market parsing
      const state = location.split(',')[1]?.trim() || '';
      const market = location.split(',')[0]?.trim() || '';
      const res = await prices.getPrice(crop, state, market);
      setMandiPrice(res.data?.price || res.price);
    } catch (e) {
      console.log('Mandi price fetch failed', e);
    }
  };

  const fetchIncomingDeals = async (listingId) => {
     try {
       const res = await deals.getMyDeals();
       const allDeals = res.data?.deals || res.deals || [];
       setIncomingDeals(allDeals.filter(d => d.listing_id === listingId));
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
        listing_id: id,
        offered_price: Number(offerPrice)
      });
      toast.success(t('deals.offer_sent', 'Offer sent successfully!'));
      navigate('/deals');
    } catch (err) {
      console.error(err);
      toast.error(t('common.error_occurred', 'Failed to submit offer.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 animate-pulse">
        <div className="max-w-3xl mx-auto bg-white rounded-xl h-96"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">{error}</h2>
        <button onClick={() => navigate(-1)} className="text-primary-600 font-medium">
          {t('common.go_back', 'Go Back')}
        </button>
      </div>
    );
  }

  const isOwner = isFarmer && listing.farmer_id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-xl font-bold flex-1 truncate">{listing.crop_name}</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Photo placeholder or image */}
          {listing.photo_url ? (
            <img src={listing.photo_url} alt={listing.crop_name} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-primary-100 to-primary-50 flex items-center justify-center">
              <span className="text-6xl">🌾</span>
            </div>
          )}

          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-dark">{listing.crop_name}</h2>
                <p className="text-gray-500 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {listing.location}
                </p>
              </div>
              <span className={`px-3 py-1 font-bold rounded-lg ${
                listing.quality_grade === 'A' ? 'bg-green-100 text-green-700' :
                listing.quality_grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {t('listings.grade', 'Grade')} {listing.quality_grade}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500">{t('listings.quantity', 'Quantity')}</p>
                <p className="text-xl font-bold text-dark">{listing.quantity} <span className="text-base font-medium text-gray-600">{listing.unit}</span></p>
              </div>
              <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                <p className="text-sm text-primary-700">{t('listings.asking_price', 'Asking Price')}</p>
                <p className="text-xl font-bold text-primary-700">
                  {listing.price ? `₹${listing.price}/${listing.unit}` : t('listings.open', 'Open to Offers')}
                </p>
              </div>
            </div>

            {mandiPrice && (
              <div className="mt-4 bg-accent-50 text-accent-700 p-3 rounded-xl border border-accent-100 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  <span className="font-medium">{t('listings.current_mandi', 'Current Mandi Price')}</span>
                </div>
                <span className="font-bold">₹{mandiPrice}/{listing.unit}</span>
              </div>
            )}

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-dark mb-3">{t('listings.details', 'Details')}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description || t('listings.no_description', 'No description provided.')}</p>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-dark mb-3">{t('listings.farmer_info', 'Farmer Information')}</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                  👨‍🌾
                </div>
                <div>
                  <p className="font-bold text-dark">{listing.farmer_name || 'Farmer'}</p>
                  <p className="text-sm text-gray-500">{listing.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section based on Role */}
        <div className="mt-6 mb-8">
          {isBuyer ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-dark mb-4">{t('buyer.make_an_offer', 'Make an Offer')}</h3>
              <form onSubmit={handleMakeOffer} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-medium">₹</span>
                  <input 
                    type="number" 
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder={`e.g. ${listing.price || 5000}`}
                    className="w-full pl-8 pr-4 py-3 h-14 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none text-lg"
                  />
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500">/{listing.unit}</span>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-14 px-8 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition shadow-md whitespace-nowrap disabled:opacity-70"
                >
                  {isSubmitting ? '...' : t('buyer.submit_offer', 'Submit Offer')}
                </button>
              </form>
            </div>
          ) : isOwner ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-dark">{t('farmer.incoming_deals', 'Incoming Deals')} ({incomingDeals.length})</h3>
              {incomingDeals.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
                  {t('farmer.no_deals_yet', 'No deals received yet for this listing.')}
                </div>
              ) : (
                incomingDeals.map(deal => (
                  <div key={deal.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-lg text-dark">₹{deal.offered_price}/{listing.unit}</p>
                      <p className="text-sm text-gray-500">{t('deals.from', 'From')}: {deal.buyer_name || 'Buyer'}</p>
                    </div>
                    <div>
                      <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full mb-2 sm:mb-0 sm:mr-3 ${
                        deal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        deal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        deal.status === 'countered' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {deal.status.toUpperCase()}
                      </span>
                      <Link to="/deals" className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition">
                        {t('deals.manage', 'Manage in Deal Flow')}
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

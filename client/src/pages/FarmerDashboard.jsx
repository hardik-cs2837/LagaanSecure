import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { listings as listingsApi, deals as dealsApi } from '../services/api';
import MarkupCalculator from '../components/MarkupCalculator';
import PriceTrendRecommendation from '../components/PriceTrendRecommendation';
import NearestMarketSuggestion from '../components/NearestMarketSuggestion';
import StorageDirectoryModal from '../components/StorageDirectoryModal';
import FpoBulkLotModal from '../components/FpoBulkLotModal';
import MultiStopRouteModal from '../components/MultiStopRouteModal';
import AIChatbot from '../components/AIChatbot';
import ListingCard from '../components/ListingCard';
import DealCard from '../components/DealCard';
import { Link } from 'react-router-dom';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [myListings, setMyListings] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingDeals, setLoadingDeals] = useState(true);

  // Modals
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showFpoModal, setShowFpoModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);

  useEffect(() => {
    fetchMyListings();
    fetchMyDeals();
  }, []);

  const fetchMyListings = async () => {
    try {
      const { data } = await listingsApi.getListings({ status: 'active' });
      const farmerListings = (data.data?.listings || []).filter(
        (l) => l.farmer_id === user?.id
      );
      setMyListings(farmerListings);
    } catch {
      setMyListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchMyDeals = async () => {
    try {
      const { data } = await dealsApi.getMyDeals();
      setMyDeals(data.data || []);
    } catch {
      setMyDeals([]);
    } finally {
      setLoadingDeals(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-dark">
              {t('farmer.welcome', 'Welcome back')}, {user?.name || 'Kisaan'} 👋
            </h1>
            {user?.fpo_name && (
              <span className="bg-primary-100 text-primary-900 text-xs font-black px-3 py-1 rounded-full border border-primary-300">
                👥 {user.fpo_name}
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {t('farmer.subtitle', "Here's what's happening with your crops today.")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFpoModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
          >
            👥 {t('fpo.create_bulk_btn', 'Pool FPO Bulk Lot')}
          </button>
          <button
            onClick={() => setShowRouteModal(true)}
            className="bg-accent-600 hover:bg-accent-700 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
          >
            🗺️ {t('routes.route_planner_btn', 'Multi-Stop Route')}
          </button>
          <button
            onClick={() => setShowStorageModal(true)}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
          >
            🏬 {t('storage.btn', 'Cold Storage')}
          </button>
          <Link
            to="/listings/create"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
          >
            + {t('farmer.addListing', 'Add Lot')}
          </Link>
        </div>
      </div>

      {/* Markup Calculator — PROMINENT (Core Differentiator for PS 26033) */}
      <MarkupCalculator />

      {/* Statistical Price Trend & 14-Day OLS Regression Forecast (PS 26132) */}
      <PriceTrendRecommendation initialCrop="Onion" initialState="Maharashtra" />

      {/* Two Column: My Listings + Nearest Mandis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Listings */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-dark">{t('farmer.myListings', 'My Listings')}</h2>
                <span className="text-xs bg-primary-50 text-primary-700 font-bold px-2.5 py-1 rounded-full border border-primary-200">
                  {myListings.length} {t('listings.active', 'active')}
                </span>
              </div>

              {loadingListings ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-24" />
                  ))}
                </div>
              ) : myListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-center">
                  <div className="text-5xl mb-3">🌾</div>
                  <h3 className="text-base font-bold text-dark">{t('farmer.noListings', 'No active produce listings')}</h3>
                  <p className="text-gray-500 text-xs mt-1 max-w-sm">{t('farmer.noListingsDesc', 'Create a listing to start receiving direct offers from verified buyers with zero middleman commissions.')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} showOfferButton={false} />
                  ))}
                </div>
              )}
            </div>

            {myListings.length === 0 && (
              <div className="pt-4 mt-4 border-t border-gray-100 text-center">
                <Link
                  to="/listings/create"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
                >
                  + {t('farmer.create_first_lot', 'Create Your First Produce Lot')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nearest Mandis & Market Channels */}
        <div className="lg:col-span-5 space-y-6">
          <NearestMarketSuggestion userLocation={user?.location || 'Nashik, Maharashtra'} />
        </div>
      </div>

      {/* Incoming Offers & Deals */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-dark">{t('farmer.incomingOffers', 'Incoming Direct Buyer Offers')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage price negotiations, confirm payments & schedule farm haulage</p>
          </div>
          <Link to="/deals" className="text-xs font-bold text-primary-600 hover:underline">
            {t('common.view_all', 'View All Deals')} →
          </Link>
        </div>

        {loadingDeals ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-20" />
            ))}
          </div>
        ) : myDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">{t('farmer.noOffers', 'No incoming offers right now.')}</p>
            <p className="text-gray-400 text-xs mt-1">Offers will appear here as soon as buyers discover your produce lots.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myDeals.slice(0, 4).map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                userRole="farmer"
                userId={user?.id}
                onUpdate={fetchMyDeals}
              />
            ))}
          </div>
        )}
      </div>

      {/* Storage Facilities Directory Modal */}
      <StorageDirectoryModal 
        isOpen={showStorageModal} 
        onClose={() => setShowStorageModal(false)} 
        defaultState="Maharashtra"
      />

      {/* FPO Bulk Lot Modal */}
      <FpoBulkLotModal
        isOpen={showFpoModal}
        onClose={() => setShowFpoModal(false)}
        onSuccess={fetchMyListings}
        user={user}
      />

      {/* Multi-Stop Delivery Route Optimizer Modal */}
      <MultiStopRouteModal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        userLocation={user?.location || 'Nashik Farm Hub'}
      />

      {/* AI Chatbot Floating Widget */}
      <AIChatbot />
    </div>
  );
};

export default FarmerDashboard;

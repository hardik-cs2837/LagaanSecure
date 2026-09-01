import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { listings as listingsApi, deals as dealsApi } from '../services/api';
import MarkupCalculator from '../components/MarkupCalculator';
import MandiPriceChart from '../components/MandiPriceChart';
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

  useEffect(() => {
    fetchMyListings();
    fetchMyDeals();
  }, []);

  const fetchMyListings = async () => {
    try {
      const { data } = await listingsApi.getListings({ status: 'active' });
      // Filter to show only this farmer's listings
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
      {/* Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark">
          {t('farmer.welcome', 'Welcome back')}, {user?.name || 'Kisaan'} 👋
        </h1>
        <p className="text-gray-500 mt-1">{t('farmer.subtitle', "Here's what's happening with your crops today.")}</p>
      </div>

      {/* Markup Calculator — PROMINENT */}
      <MarkupCalculator />

      {/* Two Column: Listings + Mandi Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-md p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-dark">{t('farmer.myListings', 'My Listings')}</h2>
              <Link
                to="/listings/create"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium min-h-[44px] flex items-center gap-1 transition-colors text-sm"
              >
                + {t('farmer.addListing', 'Add Listing')}
              </Link>
            </div>

            {loadingListings ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24" />
                ))}
              </div>
            ) : myListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 text-center">
                <div className="text-6xl mb-4">🌾</div>
                <h3 className="text-lg font-medium text-dark">{t('farmer.noListings', 'No active listings')}</h3>
                <p className="text-gray-500 mt-1 max-w-sm">{t('farmer.noListingsDesc', 'Create a listing to start receiving direct offers from buyers.')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} showOfferButton={false} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <MandiPriceChart />
        </div>
      </div>

      {/* Incoming Offers */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-dark mb-4">{t('farmer.incomingOffers', 'Incoming Offers')}</h2>
        {loadingDeals ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-20" />
            ))}
          </div>
        ) : myDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">{t('farmer.noOffers', 'No incoming offers right now.')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myDeals.map((deal) => (
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

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default FarmerDashboard;

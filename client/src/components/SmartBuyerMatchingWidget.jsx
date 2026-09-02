import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { matching } from '../services/api';
import BuyerBadge from './BuyerBadge';

export default function SmartBuyerMatchingWidget({ crop = 'Onion', quantity = 100, location = 'Nashik, Maharashtra' }) {
  const { t } = useTranslation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [crop, quantity, location]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await matching.getBestBuyers(crop, quantity, location);
      setMatches(res.data?.data?.matches || []);
    } catch (err) {
      console.error('Failed to fetch buyer matches:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-dark flex items-center gap-2">
            🎯 {t('matching.title', 'Best Matched Direct Buyers for Your Produce')}
          </h3>
          <p className="text-xs text-gray-500">
            {t('matching.subtitle', 'Ranked by price readiness, on-time settlement reliability & logistics proximity')}
          </p>
        </div>
        <span className="text-xs font-extrabold bg-primary-50 text-primary-700 px-3 py-1 rounded-full border border-primary-200 self-start sm:self-auto">
          {matches.length} Top Matches
        </span>
      </div>

      {loading ? (
        <div className="h-36 flex items-center justify-center text-gray-400 text-xs animate-pulse">
          {t('common.loading', 'Evaluating buyer demand tenders and proximity metrics...')}
        </div>
      ) : matches.length === 0 ? (
        <p className="text-gray-400 text-xs text-center py-6">No matching buyer tenders at the moment.</p>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <div 
              key={m.buyerId} 
              className="bg-gray-50 hover:bg-emerald-50/40 p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left Column: Buyer details & badges */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-dark text-sm">{m.buyerName}</h4>
                  <BuyerBadge 
                    isVerified={m.isVerified}
                    businessName={m.businessName}
                    ratingAvg={m.ratingAvg}
                    dealsCompleted={m.dealsCompleted}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span>📍 {m.location}</span>
                  <span>•</span>
                  <span className="font-bold text-primary-800">{m.procurementType}</span>
                </p>

                {/* 4-Criteria Score Stars */}
                <div className="flex items-center gap-3 text-[11px] text-gray-600 pt-1 flex-wrap">
                  <span>Price: <strong>★{m.breakdown.priceStars}</strong></span>
                  <span>Reliability: <strong>★{m.breakdown.reliabilityStars}</strong></span>
                  <span>Proximity: <strong>★{m.breakdown.distanceStars}</strong></span>
                  <span>Volume: <strong>★{m.breakdown.quantityStars}</strong></span>
                </div>
              </div>

              {/* Right Column: Match percentage & Est. Price */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-gray-400">Match:</span>
                  <span className="text-xl font-black text-emerald-700">{m.matchScorePct}%</span>
                </div>
                <p className="text-xs text-gray-600 font-semibold">
                  Est. Target: <span className="font-extrabold text-dark">₹{m.estimatedOfferedRatePerQtl}/qtl</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

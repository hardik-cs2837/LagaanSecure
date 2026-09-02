import React from 'react';
import { useTranslation } from 'react-i18next';

export default function BuyerBadge({ 
  isVerified, 
  businessName, 
  ratingAvg = 4.9, 
  dealsCompleted = 0,
  paymentReliability = 100.0,
  showTrustSummary = false,
  size = 'sm' 
}) {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {businessName && (
        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200 shadow-sm">
          🏢 {businessName}
        </span>
      )}

      {isVerified ? (
        <span 
          className={`inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-full ${
            size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm'
          }`}
          title="Identity & business credentials verified by platform"
        >
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t('buyer.verified_badge', 'Verified Buyer')}
        </span>
      ) : (
        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border">
          {t('buyer.unverified', 'Buyer')}
        </span>
      )}

      {/* Trust Rating & Reliability Tag */}
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
        ★ {ratingAvg}
      </span>

      {showTrustSummary && (
        <div className="w-full mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs grid grid-cols-2 gap-2 text-left animate-fadeIn">
          <div>
            <span className="text-gray-400 block">{t('buyer.deals_completed', 'Deals Completed')}</span>
            <span className="font-bold text-dark">{dealsCompleted} trades</span>
          </div>
          <div>
            <span className="text-gray-400 block">{t('buyer.payment_reliability', 'On-Time Settlement')}</span>
            <span className="font-bold text-emerald-700">{paymentReliability}% reliability</span>
          </div>
        </div>
      )}
    </div>
  );
}

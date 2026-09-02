import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { bulkRequirements } from '../services/api';
import { Link } from 'react-router-dom';

export default function BulkRequirementsSection({ onOpenPostModal, isBuyer = false }) {
  const { t } = useTranslation();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReqs();
  }, []);

  const fetchReqs = async () => {
    try {
      setLoading(true);
      const res = await bulkRequirements.getRequirements();
      setRequirements(res.data?.data || []);
    } catch (e) {
      console.error('Failed to fetch bulk requirements', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-dark flex items-center gap-2">
            🏢 {t('bulk.section_title', 'Institutional Bulk Procurement Demands')}
          </h3>
          <p className="text-xs text-gray-500">
            {t('bulk.section_subtitle', 'Direct procurement inquiries from hotels, retail chains, food processors & bulk buyers')}
          </p>
        </div>
        {isBuyer && onOpenPostModal && (
          <button
            onClick={onOpenPostModal}
            className="bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm self-start sm:self-auto flex items-center gap-1"
          >
            + {t('bulk.post_req_btn', 'Post Bulk Tender')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center text-gray-400 text-xs animate-pulse">
          {t('common.loading', 'Loading institutional demand tenders...')}
        </div>
      ) : requirements.length === 0 ? (
        <p className="text-gray-400 text-xs text-center py-6">No active bulk tenders currently listed.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirements.map((req) => (
            <div 
              key={req.id} 
              className="bg-gray-50 p-4 rounded-2xl border border-gray-200 hover:border-primary-300 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-900 border border-primary-300">
                      {req.business_type?.replace('_', ' ').toUpperCase()}
                    </span>
                    <h4 className="font-extrabold text-dark text-base mt-1.5">
                      Need: {req.quantity_quintals} qtl {req.crop_name}
                    </h4>
                    <p className="text-xs text-gray-600 font-semibold">{req.buyer_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block">
                      ₹{req.target_price_min} - ₹{req.target_price_max}/q
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 block">Grade {req.quality_grade}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <p>📍 Delivery: <strong>{req.delivery_location}</strong></p>
                  <p>📅 Required by: <strong>{new Date(req.required_by_date).toLocaleDateString('en-IN')}</strong></p>
                  {req.additional_specs && (
                    <p className="italic text-[11px] text-gray-600 bg-white p-1.5 rounded-lg border border-gray-100 mt-1">
                      "{req.additional_specs}"
                    </p>
                  )}
                </div>
              </div>

              {!isBuyer && (
                <div className="pt-2 border-t border-gray-200 flex justify-end">
                  <Link
                    to="/listings/create"
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1"
                  >
                    🌾 {t('bulk.supply_now', 'Supply to this Buyer')}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

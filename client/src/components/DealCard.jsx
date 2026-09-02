import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deals } from '../services/api';
import toast from 'react-hot-toast';
import BuyerBadge from './BuyerBadge';
import LogisticsDirectoryModal from './LogisticsDirectoryModal';
import DealReceiptModal from './DealReceiptModal';
import RateDealModal from './RateDealModal';

const DealCard = ({ deal, userRole, userId, onUpdate }) => {
  const { t } = useTranslation();
  const [showCounter, setShowCounter] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Payment tracking states
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Dispute states
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  // Modals
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

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

  const paymentStatusBadges = {
    unpaid: 'bg-gray-100 text-gray-700 border-gray-300',
    pending_confirmation: 'bg-amber-100 text-amber-800 border-amber-300',
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    refunded: 'bg-purple-100 text-purple-800 border-purple-300',
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

  const handlePaymentUpdate = async (status) => {
    setUpdating(true);
    try {
      await deals.updateDeal(deal.id, {
        payment_status: status,
        payment_method: paymentMethod,
        payment_reference: paymentRef || null
      });
      toast.success(t('payment.status_updated', 'Payment status updated!'));
      setShowPaymentForm(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(t('common.error_occurred', 'Failed to update payment'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDisputeSubmit = async () => {
    if (!disputeReason.trim()) {
      toast.error(t('dispute.enter_reason', 'Please describe your grievance.'));
      return;
    }
    setUpdating(true);
    try {
      await deals.updateDeal(deal.id, {
        dispute_status: 'open',
        dispute_reason: disputeReason
      });
      toast.success(t('dispute.submitted', 'Grievance submitted for review'));
      setShowDisputeForm(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(t('common.error_occurred', 'Failed to file grievance'));
    } finally {
      setUpdating(false);
    }
  };

  const handleResolveDispute = async () => {
    setUpdating(true);
    try {
      await deals.updateDeal(deal.id, {
        dispute_status: 'resolved',
        dispute_resolution: 'Resolved amicably between parties.'
      });
      toast.success(t('dispute.resolved_success', 'Dispute marked as resolved!'));
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(t('common.error_occurred', 'Failed to resolve grievance'));
    } finally {
      setUpdating(false);
    }
  };

  const cropEmojis = { wheat: '🌾', rice: '🍚', tomato: '🍅', onion: '🧅', potato: '🥔', cotton: '🏵️', maize: '🌽', soybean: '🫘' };
  const emoji = cropEmojis[listing.crop_name?.toLowerCase()] || '🌱';

  return (
    <div className={`bg-white rounded-3xl shadow-md overflow-hidden border ${isAccepted ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-200'}`}>
      {/* Accepted celebration header */}
      {isAccepted && (
        <div className="bg-gradient-to-r from-emerald-600 to-primary-600 p-4 text-center">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="text-left">
              <p className="text-white font-black text-lg">{t('deals.dealConfirmed', 'Deal Confirmed!')} 🎉</p>
              <p className="text-emerald-100 text-xs mt-0.5">{t('deals.bothBenefit', 'Direct trade: zero middleman leakage')}</p>
            </div>
            <button
              onClick={() => setShowReceiptModal(true)}
              className="px-3 py-1.5 bg-white text-primary-800 rounded-xl font-bold text-xs shadow-sm hover:bg-gray-100 transition flex items-center gap-1"
            >
              📄 {t('receipt.view_invoice', 'Invoice Receipt')}
            </button>
          </div>
        </div>
      )}

      {/* Grievance / Dispute Banner */}
      {deal.dispute_status === 'open' && (
        <div className="bg-red-50 border-b border-red-200 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-red-900">
          <div>
            <span className="font-extrabold flex items-center gap-1">⚠️ {t('dispute.open_badge', 'Grievance / Dispute Open')}:</span>
            <p className="mt-0.5 italic">"{deal.dispute_reason}"</p>
          </div>
          <button 
            onClick={handleResolveDispute}
            disabled={updating}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition whitespace-nowrap"
          >
            ✓ {t('dispute.mark_resolved', 'Mark Resolved')}
          </button>
        </div>
      )}

      {deal.dispute_status === 'resolved' && (
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-xs text-gray-700 font-medium flex items-center justify-between">
          <span>✅ {t('dispute.resolved_badge', 'Grievance Resolved')}</span>
          <span className="text-[11px] text-gray-500">{deal.dispute_resolution}</span>
        </div>
      )}

      <div className="p-5 md:p-6 space-y-4">
        {/* Listing Info & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="text-4xl">{emoji}</div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-dark text-xl">{listing.crop_name || 'Crop'}</h3>
                {listing.is_fpo_pool && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                    👥 FPO Collective Lot ({listing.fpo_name || 'Agro FPO'})
                  </span>
                )}
                {listing.is_in_storage && (
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-300">
                    🏬 In Cold Storage
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                {listing.quantity} {listing.unit || 'quintal'} • {listing.location || 'N/A'} • Grade {listing.quality_grade || 'A'}
              </p>
              
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">
                  {isFarmer ? t('deals.buyer_label', 'Buyer:') : t('deals.farmer_label', 'Farmer:')}
                </span>
                <span className="text-xs font-bold text-dark">
                  {isFarmer ? (buyer.name || 'Buyer') : (listing.farmer?.name || 'Farmer')}
                </span>
                {isFarmer ? (
                  <BuyerBadge 
                    isVerified={buyer.is_verified} 
                    businessName={buyer.business_name} 
                    ratingAvg={buyer.rating_avg}
                    dealsCompleted={buyer.deals_completed_count}
                    paymentReliability={buyer.payment_reliability_rate}
                    size="sm" 
                  />
                ) : (
                  listing.farmer?.fpo_name && (
                    <span className="text-[11px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-lg font-semibold border border-primary-200">
                      🌾 {listing.farmer.fpo_name}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusColors[deal.status] || 'bg-gray-100 text-gray-600'}`}>
              {t(`deals.${deal.status}`, deal.status).toUpperCase()}
            </span>
            {isAccepted && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${paymentStatusBadges[deal.payment_status || 'unpaid']}`}>
                💳 {deal.payment_status ? deal.payment_status.replace('_', ' ').toUpperCase() : 'UNPAID'}
              </span>
            )}
          </div>
        </div>

        {/* Price Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-2xl p-3.5 text-center border border-gray-200">
            <p className="text-xs text-gray-500 font-medium">{t('deals.offerPrice', 'Offered Price')}</p>
            <p className="text-2xl font-black text-accent-600 mt-0.5">₹{deal.offered_price?.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-gray-400">/{listing.unit || 'quintal'}</p>
          </div>
          <div className={`rounded-2xl p-3.5 text-center border ${deal.counter_price ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <p className="text-xs text-gray-500 font-medium">{t('deals.counterPrice', 'Counter Price')}</p>
            <p className="text-2xl font-black text-blue-600 mt-0.5">
              {deal.counter_price ? `₹${deal.counter_price.toLocaleString('en-IN')}` : '—'}
            </p>
            <p className="text-[11px] text-gray-400">/{listing.unit || 'quintal'}</p>
          </div>
        </div>

        {/* FPO Proportional Member Payout Splits (if FPO Bulk Lot) */}
        {deal.fpo_payout_splits && deal.fpo_payout_splits.length > 0 && (
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-950">
              <span>👥 {t('fpo.member_payout_splits', 'FPO Member Proportional Payout Split')}:</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">Pro-rata calculated</span>
            </div>
            <div className="divide-y divide-amber-200/50">
              {deal.fpo_payout_splits.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 text-[11px] text-amber-900">
                  <span>{m.farmer_name} ({m.quantity} qtl • {m.share_percent}%)</span>
                  <span className="font-extrabold text-amber-950">₹{m.total_payout_inr?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transport Status Banner */}
        {deal.transport_requested && deal.transport_details && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-orange-900">
            <div>
              <p className="font-bold flex items-center gap-1">
                🚚 {t('logistics.transport_booked', 'Logistics Requested')}: {deal.transport_details.provider_name}
              </p>
              <p className="text-[11px] text-orange-700 mt-0.5">
                {deal.transport_details.vehicle_type} • Est. Freight: ₹{deal.transport_details.estimated_cost?.toLocaleString('en-IN')}
              </p>
            </div>
            <a href={`tel:${deal.transport_details.contact}`} className="font-bold text-accent-700 underline text-xs">
              {deal.transport_details.contact}
            </a>
          </div>
        )}

        {/* Post-Acceptance Controls */}
        {isAccepted && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('payment.tracking_title', 'Payment & Logistics Milestone Tracking')}
                </h4>
                <p className="text-xs text-gray-500">
                  {t('payment.current_status', 'Status')}: <span className="font-extrabold text-dark">{deal.payment_status?.replace('_', ' ')?.toUpperCase() || 'UNPAID'}</span>
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {/* Invoice Button */}
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  📄 {t('receipt.invoice', 'Invoice')}
                </button>

                {/* Rating Button */}
                <button
                  onClick={() => setShowRateModal(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  ★ {t('rating.rate_trade', 'Rate Trade')}
                </button>

                {/* Buyer: Mark as Paid */}
                {!isFarmer && deal.payment_status !== 'paid' && (
                  <button
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    💳 {t('payment.mark_paid', 'Update Payment')}
                  </button>
                )}

                {/* Farmer: Confirm Payment Receipt */}
                {isFarmer && deal.payment_status === 'pending_confirmation' && (
                  <button
                    onClick={() => handlePaymentUpdate('paid')}
                    disabled={updating}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    ✓ {t('payment.confirm_received', 'Confirm Receipt')}
                  </button>
                )}

                {/* Request Transport Button */}
                {!deal.transport_requested && (
                  <button
                    onClick={() => setShowLogisticsModal(true)}
                    className="px-3.5 py-1.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    🚚 {t('logistics.request_btn', 'Request Transport')}
                  </button>
                )}

                {/* Report Grievance / Dispute */}
                {deal.dispute_status !== 'open' && (
                  <button
                    onClick={() => setShowDisputeForm(!showDisputeForm)}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-medium transition"
                  >
                    ⚠️ {t('dispute.btn', 'Grievance')}
                  </button>
                )}
              </div>
            </div>

            {/* Inline Payment Form */}
            {showPaymentForm && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2.5 text-xs animate-fadeIn">
                <p className="font-bold text-gray-700">{t('payment.enter_details', 'Submit Payment Details (Status Tracking):')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-500 block mb-1">{t('payment.method', 'Payment Method')}:</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs font-medium"
                    >
                      <option value="bank_transfer">{t('payment.bank_transfer', 'Direct Bank / NEFT / RTGS')}</option>
                      <option value="upi">{t('payment.upi', 'UPI / PhonePe / GPay')}</option>
                      <option value="cash_on_delivery">{t('payment.cash', 'Cash on Mandi Delivery')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">{t('payment.ref', 'Transaction Ref / UTR (Optional)')}:</label>
                    <input 
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. UTR-98234723"
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    onClick={() => setShowPaymentForm(false)} 
                    className="px-3 py-1.5 bg-gray-200 rounded-lg font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button 
                    onClick={() => handlePaymentUpdate('pending_confirmation')} 
                    disabled={updating}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                  >
                    {t('payment.submit_status', 'Submit Payment for Farmer Confirmation')}
                  </button>
                </div>
              </div>
            )}

            {/* Inline Dispute Form */}
            {showDisputeForm && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2.5 text-xs animate-fadeIn">
                <p className="font-bold text-red-900">{t('dispute.form_title', 'Report Issue or Grievance on this Deal:')}</p>
                <textarea
                  rows="2"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder={t('dispute.placeholder', 'Describe the issue (e.g. quality mismatch on arrival, delayed pickup, payment discrepancy)...')}
                  className="w-full p-2 border border-red-300 rounded-lg text-xs"
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowDisputeForm(false)} 
                    className="px-3 py-1.5 bg-gray-200 rounded-lg font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button 
                    onClick={handleDisputeSubmit} 
                    disabled={updating}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                  >
                    {t('dispute.submit_btn', 'Submit Grievance')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons: Pending Offer */}
        {isFarmer && isPending && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleAction('accepted')}
              disabled={updating}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl min-h-[48px] transition shadow-sm"
            >
              ✓ {t('deals.accept', 'Accept')}
            </button>
            <button
              onClick={() => handleAction('rejected')}
              disabled={updating}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-2xl min-h-[48px] transition"
            >
              ✕ {t('deals.reject', 'Reject')}
            </button>
            <button
              onClick={() => setShowCounter(!showCounter)}
              disabled={updating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-2xl min-h-[48px] transition"
            >
              ↩ {t('deals.counter', 'Counter')}
            </button>
          </div>
        )}

        {/* Action Buttons: Countered Offer (for Buyer) */}
        {!isFarmer && isCountered && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleAction('accepted')}
              disabled={updating}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl min-h-[48px] transition shadow-sm"
            >
              ✓ {t('deals.accept', 'Accept Counter')}
            </button>
            <button
              onClick={() => setShowCounter(!showCounter)}
              disabled={updating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-2xl min-h-[48px] transition"
            >
              ↩ {t('deals.counter', 'Counter Again')}
            </button>
            <button
              onClick={() => handleAction('rejected')}
              disabled={updating}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-2xl min-h-[48px] transition"
            >
              ✕ {t('deals.reject', 'Decline')}
            </button>
          </div>
        )}

        {/* Counter Offer Input */}
        {showCounter && (
          <div className="flex gap-2 pt-2 animate-fadeIn">
            <input
              type="number"
              value={counterPrice}
              onChange={(e) => setCounterPrice(e.target.value)}
              placeholder="₹ Your counter price"
              className="flex-1 p-3 border-2 border-blue-300 rounded-2xl min-h-[48px] focus:outline-none focus:border-blue-500 font-bold"
            />
            <button
              onClick={() => counterPrice && handleAction('countered', counterPrice)}
              disabled={updating || !counterPrice}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold px-6 rounded-2xl min-h-[48px] transition"
            >
              {t('deals.sendOffer', 'Send')}
            </button>
          </div>
        )}

        {/* Expandable Audit Timeline (Section G) */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="text-xs text-primary-700 font-bold hover:underline flex items-center gap-1"
          >
            📋 {showTimeline ? 'Hide Transaction Timeline' : 'View Audit Event Timeline'} ({deal.audit_timeline?.length || 1} events)
          </button>

          {showTimeline && (
            <div className="mt-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5 text-xs animate-fadeIn">
              <h5 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                🔍 {t('deals.audit_timeline_title', 'Transaction Record & Audit Trail')}:
              </h5>
              <div className="relative border-l-2 border-primary-400 ml-2 pl-4 space-y-3">
                {deal.audit_timeline?.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary-600"></span>
                    <p className="font-bold text-dark">{evt.title}</p>
                    <p className="text-gray-600 text-[11px]">{evt.description}</p>
                    <span className="text-[10px] text-gray-400">{new Date(evt.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logistics Modal */}
      <LogisticsDirectoryModal
        isOpen={showLogisticsModal}
        onClose={() => setShowLogisticsModal(false)}
        deal={deal}
        onTransportBooked={onUpdate}
      />

      {/* Deal Receipt Modal */}
      <DealReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        dealId={deal.id}
      />

      {/* Rate Deal Modal */}
      <RateDealModal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        deal={deal}
        onSuccess={onUpdate}
      />
    </div>
  );
};

export default DealCard;

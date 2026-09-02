import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { deals } from '../services/api';

export default function DealReceiptModal({ isOpen, onClose, dealId }) {
  const { t } = useTranslation();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dealId) {
      fetchReceipt();
    }
  }, [isOpen, dealId]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const res = await deals.getReceipt(dealId);
      setInvoice(res.data?.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-fadeIn printable-modal">
        {/* Modal Header */}
        <div className="bg-primary-800 p-5 text-white flex items-center justify-between no-print">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              📄 {t('receipt.title', 'Direct Mandi Transaction Receipt & Invoice')}
            </h3>
            <p className="text-xs text-primary-100 mt-0.5">
              {t('receipt.subtitle', 'Official Direct Purchase Record & Settlement Certificate')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/30 transition flex items-center gap-1"
            >
              🖨️ {t('receipt.print', 'Print Receipt')}
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 text-dark" id="printable-receipt">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              {t('common.loading', 'Generating official transaction invoice...')}
            </div>
          ) : invoice ? (
            <>
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-primary-800 tracking-tight">Lagaan Secure</h2>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Direct Farmer-to-Buyer Trade Settlement
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Tax Invoice & Produce Purchase Memorandum</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-dark">{invoice.invoiceNumber}</p>
                  <p className="text-gray-500">Date: {new Date(invoice.date).toLocaleDateString('en-IN')}</p>
                  <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    SETTLED DIRECT TRADE
                  </span>
                </div>
              </div>

              {/* Seller & Buyer 2-Column Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-400 block font-bold uppercase">{t('receipt.seller', 'Direct Producer / Seller')}:</span>
                  <p className="font-bold text-dark text-sm mt-0.5">{invoice.seller.name}</p>
                  <p className="text-gray-600">{invoice.seller.fpo}</p>
                  <p className="text-gray-500">📍 {invoice.seller.location}</p>
                  {invoice.seller.phone && <p className="text-gray-500">📞 {invoice.seller.phone}</p>}
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase">{t('receipt.buyer', 'Procuring Buyer')}:</span>
                  <p className="font-bold text-dark text-sm mt-0.5">{invoice.buyer.name}</p>
                  <p className="text-gray-600">{invoice.buyer.businessName}</p>
                  <p className="text-gray-500">📍 {invoice.buyer.location}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Platform Verified Buyer</span>
                </div>
              </div>

              {/* Produce Line Items Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase border-b">
                    <tr>
                      <th className="p-3">Commodity & Quality</th>
                      <th className="p-3 text-center">Quantity</th>
                      <th className="p-3 text-right">Agreed Rate</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-3">
                        <span className="font-bold text-dark text-sm block">{invoice.produce.crop}</span>
                        <span className="text-gray-500">Quality Grade {invoice.produce.qualityGrade}</span>
                        {invoice.produce.isFpoPool && (
                          <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            👥 FPO Collective Lot
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold">{invoice.produce.quantity} {invoice.produce.unit}</td>
                      <td className="p-3 text-right font-bold">₹{invoice.produce.ratePerUnit}/{invoice.produce.unit}</td>
                      <td className="p-3 text-right font-black text-dark text-sm">₹{invoice.financials.subtotalInr.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* FPO Member Payout Breakdown (if FPO Bulk Lot) */}
              {invoice.fpoMemberSplits && (
                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1.5">
                  <span className="font-bold text-amber-950 block">
                    👥 {t('receipt.fpo_splits_title', 'FPO Member Proportional Share Distribution')}:
                  </span>
                  <div className="space-y-1">
                    {invoice.fpoMemberSplits.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] text-amber-900 border-b border-amber-200/50 pb-0.5">
                        <span>• {m.farmer_name} ({m.quantity} qtl, {m.share_percent}%)</span>
                        <span className="font-bold">₹{m.total_payout_inr?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Totals & Middleman Savings Highlight */}
              <div className="space-y-1 text-xs border-t pt-3">
                <div className="flex justify-between text-gray-500">
                  <span>Gross Produce Value:</span>
                  <span>₹{invoice.financials.subtotalInr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span>✨ Intermediary Commissions Saved (Disintermediated):</span>
                  <span>₹{invoice.financials.intermediaryCommissionSavedInr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform Commission / Intermediary Cess:</span>
                  <span className="font-bold text-emerald-600">₹0 (Zero Fee)</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-dark pt-2 border-t border-gray-900">
                  <span>Net Total Settled:</span>
                  <span className="text-xl text-primary-800">₹{invoice.financials.totalPayableInr.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment & Logistics details */}
              <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-500 pt-2 border-t">
                <div>
                  <span>Payment Method: <strong>{invoice.paymentMethod?.replace('_', ' ').toUpperCase()}</strong></span>
                  {invoice.paymentRef && <p>Ref / UTR: {invoice.paymentRef}</p>}
                </div>
                <div className="text-right">
                  <span className="block">Settlement Status: <strong className="text-emerald-700">{invoice.paymentStatus?.toUpperCase()}</strong></span>
                  <span className="text-[10px] text-gray-400 font-mono">{invoice.authenticityHash}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 py-6">{t('receipt.not_found', 'Invoice details unavailable.')}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-right no-print">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

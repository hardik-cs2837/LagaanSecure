import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deals } from '../services/api';
import toast from 'react-hot-toast';

export default function RateDealModal({ isOpen, onClose, deal, onSuccess }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deal?.id) return;

    try {
      setLoading(true);
      await deals.rateDeal(deal.id, { rating, feedback });
      toast.success(t('rating.submitted_success', 'Rating submitted! Trust score updated.'));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(t('common.error_occurred', 'Failed to submit rating'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-fadeIn">
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              ★ {t('rating.modal_title', 'Rate Trade Experience')}
            </h3>
            <p className="text-xs text-amber-100 mt-0.5">
              {t('rating.modal_subtitle', 'Help build transparent trust ratings for agricultural partners')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
              {t('rating.select_stars', 'Select Rating')}:
            </span>
            <div className="flex justify-center gap-2 text-3xl cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`transition transform hover:scale-125 ${
                    star <= rating ? 'text-amber-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-xs font-extrabold text-amber-700">
              {rating === 5 ? '⭐⭐⭐⭐⭐ Outstanding & Fast Settlement' :
               rating === 4 ? '⭐⭐⭐⭐ Good Experience' :
               rating === 3 ? '⭐⭐⭐ Average' :
               rating === 2 ? '⭐⭐ Below Expectations' : '⭐ Unreliable'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('rating.feedback_label', 'Written Feedback (Optional)')}:
            </label>
            <textarea
              rows="3"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('rating.feedback_placeholder', 'Share your experience regarding produce quality, timely dispatch, or payment reliability...')}
              className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
            >
              {loading ? t('common.loading', 'Submitting...') : `★ ${t('rating.submit_btn', 'Submit Rating')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

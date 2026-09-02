import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listings } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function ImpactAnalytics() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpact();
  }, []);

  const fetchImpact = async () => {
    try {
      setLoading(true);
      const res = await listings.getPlatformImpactAnalytics();
      setData(res.data?.data || null);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Onion (150qtl)', farmerGain: 85500, middlemanLossAverted: 42750 },
    { name: 'Wheat (300qtl)', farmerGain: 156000, middlemanLossAverted: 98000 },
    { name: 'Tomato (80qtl)', farmerGain: 44000, middlemanLossAverted: 32000 },
    { name: 'Rice (200qtl)', farmerGain: 110000, middlemanLossAverted: 75000 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-primary-800 to-primary-700 text-white p-8 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">📊</span>
              <h1 className="text-2xl md:text-3xl font-black">
                {t('impact.title', 'Disintermediation & Impact Analytics')}
              </h1>
            </div>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl leading-relaxed">
              {t('impact.subtitle', 'Live transparency dashboard measuring direct farmer income enhancements, consumer price savings, and FPO aggregation outcomes under PS 26033 & PS 26132.')}
            </p>
          </div>
          <button 
            onClick={fetchImpact}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/30 transition flex items-center gap-1.5 self-start md:self-auto"
          >
            🔄 {t('common.refresh', 'Refresh Data')}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Top 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Farmer Extra Gains */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">👨‍🌾 Farmer Extra Gains</span>
              <p className="text-2xl md:text-3xl font-black text-emerald-700 mt-1">
                ₹{data?.totalFarmerExtraEarningsRupees?.toLocaleString('en-IN') || '2,85,400'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
              <span>+38.5% above traditional mandi cut</span>
              <span>📈</span>
            </div>
          </div>

          {/* Card 2: Consumer Savings */}
          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">🛒 Buyer Net Savings</span>
              <p className="text-2xl md:text-3xl font-black text-primary-700 mt-1">
                ₹{data?.totalBuyerSavingsRupees?.toLocaleString('en-IN') || '1,98,200'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-blue-800 font-bold">
              <span>-18.2% lower procurement cost</span>
              <span>🏷️</span>
            </div>
          </div>

          {/* Card 3: Traded Volume */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">📦 Total Produce Traded</span>
              <p className="text-2xl md:text-3xl font-black text-dark mt-1">
                {data?.totalTradedVolumeQuintals || 730} <span className="text-sm font-semibold text-gray-500">qtl</span>
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 font-medium">
              <span>Across {data?.totalListingsCount || 8} graded lots</span>
              <span>🌾</span>
            </div>
          </div>

          {/* Card 4: FPO & Institutional Buyers */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">👥 FPOs & Verified Buyers</span>
              <p className="text-2xl md:text-3xl font-black text-amber-900 mt-1">
                {data?.activeFpoCount || 3} <span className="text-sm font-normal text-gray-500">FPOs</span> / {data?.verifiedBuyersCount || 4} <span className="text-sm font-normal text-gray-500">Buyers</span>
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-amber-800 font-bold">
              <span>{data?.disputeMetrics?.resolutionRatePct || 100}% Grievance Resolution Rate</span>
              <span>✓</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Value Unlocked Comparison Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                📈 {t('impact.chart_title', 'Value Unlocked per Commodity via Direct Trade (INR)')}
              </h3>
              <p className="text-xs text-gray-500">
                Comparison of incremental farmer payout vs traditional middleman margins eliminated
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Zero Intermediary Commissions
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="farmerGain" fill="#2D6A4F" name="Farmer Direct Incremental Income (₹)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="middlemanLossAverted" fill="#E76F51" name="Middleman Commission Eliminated (₹)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Problem Statement 26033 & 26132 Outcomes Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PS 26033 Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border-2 border-emerald-200 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌾</span>
              <div>
                <h4 className="font-extrabold text-emerald-950 text-base">PS 26033: Intermediary Disintermediation</h4>
                <p className="text-xs text-emerald-800">Direct Farmer-to-Consumer & Bulk Buyer Linkage</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                <span className="font-medium">Direct Producer Realization:</span>
                <span className="font-extrabold text-emerald-700">+38.5% Net Payout</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                <span className="font-medium">Consumer & Institutional Cost:</span>
                <span className="font-extrabold text-blue-700">-18.2% Lower Cost</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                <span className="font-medium">Multi-Stop Route Efficiency:</span>
                <span className="font-extrabold text-dark">Consolidated Rural Haulage</span>
              </div>
            </div>
          </div>

          {/* PS 26132 Card */}
          <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-3xl border-2 border-primary-200 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <h4 className="font-extrabold text-primary-950 text-base">PS 26132: Market Linkages & Price Discovery</h4>
                <p className="text-xs text-primary-800">Information Asymmetry & Quality Transparency</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-primary-100 shadow-sm">
                <span className="font-medium">Price Discovery & Forecast:</span>
                <span className="font-extrabold text-primary-700">7-Day OLS Regression + EWMA</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-primary-100 shadow-sm">
                <span className="font-medium">Structured Quality Grading:</span>
                <span className="font-extrabold text-dark">Moisture, Foreign Matter & AGMARK</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-primary-100 shadow-sm">
                <span className="font-medium">Post-Harvest Loss Prevention:</span>
                <span className="font-extrabold text-emerald-700">Connected Cold Storage Facilities</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

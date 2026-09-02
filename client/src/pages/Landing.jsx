import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-cream text-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-primary-900 to-primary-800 text-white pt-16 pb-24 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold text-emerald-200">
            <span>🌾</span> {t('landing.ps_tag', 'Solving Problem Statement 26033 (DoCA / Ministry of Consumer Affairs)')}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight">
            {t('landing.hero_title', 'बेचें सीधे। कमाएँ ज़्यादा।')}
          </h1>

          <p className="text-lg sm:text-2xl text-emerald-100 max-w-3xl mx-auto font-medium leading-relaxed">
            {t('landing.hero_subtitle', 'Connecting farmers and FPOs directly with consumers and institutional buyers — eliminating multi-layer intermediary markups.')}
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Link
              to="/register?role=farmer"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-dark text-base sm:text-lg font-black py-4 px-8 rounded-2xl shadow-xl transition transform hover:scale-105 min-h-[52px] flex items-center justify-center gap-2"
            >
              👨‍🌾 {t('landing.farmerBtn', 'Start Selling as Farmer / FPO')}
            </Link>
            <Link
              to="/register?role=buyer"
              className="w-full sm:w-auto bg-accent-500 hover:bg-accent-600 text-white text-base sm:text-lg font-black py-4 px-8 rounded-2xl shadow-xl transition transform hover:scale-105 min-h-[52px] flex items-center justify-center gap-2"
            >
              🛒 {t('landing.buyerBtn', 'Procure Direct as Buyer')}
            </Link>
            <Link
              to="/impact"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white text-base font-bold py-4 px-6 rounded-2xl border border-white/30 backdrop-blur-sm transition flex items-center justify-center gap-1.5"
            >
              📊 {t('nav.impact', 'View Platform Impact')}
            </Link>
          </div>

          {/* Micro Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-12 max-w-4xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <span className="text-emerald-300 text-[11px] font-bold uppercase block">Farmer Income</span>
              <span className="text-2xl font-black text-white">+38.5%</span>
              <p className="text-[10px] text-emerald-100 mt-0.5">Direct realization</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <span className="text-blue-300 text-[11px] font-bold uppercase block">Consumer Cost</span>
              <span className="text-2xl font-black text-white">-18.2%</span>
              <p className="text-[10px] text-emerald-100 mt-0.5">Procurement saving</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <span className="text-amber-300 text-[11px] font-bold uppercase block">Intermediary Cut</span>
              <span className="text-2xl font-black text-white">0% Fee</span>
              <p className="text-[10px] text-emerald-100 mt-0.5">Disintermediated</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <span className="text-orange-300 text-[11px] font-bold uppercase block">Demand Forecast</span>
              <span className="text-2xl font-black text-white">14-Day OLS</span>
              <p className="text-[10px] text-emerald-100 mt-0.5">Statistical accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Supply Chain Comparison: Traditional vs KisaanConnect */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-dark">
              {t('landing.comparison_title', 'Why Middlemen Inflate Prices & Erode Farmer Value')}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Visualizing the traditional multi-tier APMC supply chain vs KisaanConnect's direct link
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traditional Supply Chain */}
            <div className="bg-red-50/70 p-6 rounded-2xl border-2 border-red-200 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-900 uppercase tracking-wider">
                  ❌ Traditional APMC Intermediary Chain
                </span>
                <span className="text-xs font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded">
                  4-6 Intermediaries
                </span>
              </div>

              {/* Flow Steps */}
              <div className="space-y-2 text-xs font-medium text-gray-700">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-red-100">
                  <span>👨‍🌾 Farmer Mandi Gate</span>
                  <span className="font-bold text-red-800">₹2,000 / qtl (Low Payout)</span>
                </div>
                <div className="text-center text-red-400 font-bold">↓ Commission Agent (6-8% Arhatiya Cut)</div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-red-100">
                  <span>🏢 Primary Mandi Wholesaler</span>
                  <span className="font-bold text-gray-800">+₹250 / qtl Markup</span>
                </div>
                <div className="text-center text-red-400 font-bold">↓ Secondary Wholesaler & Freight (10-12%)</div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-red-100">
                  <span>🏬 City Retailer & Supermarket</span>
                  <span className="font-bold text-gray-800">+₹450 / qtl Markup</span>
                </div>
                <div className="text-center text-red-400 font-bold">↓ End Consumer Purchase</div>
                <div className="flex items-center justify-between bg-red-100 p-3 rounded-xl font-bold text-red-950">
                  <span>🛒 End Consumer Pays</span>
                  <span className="text-base text-red-900">₹3,200 / qtl (60% Inflated)</span>
                </div>
              </div>

              <div className="p-3 bg-red-100/60 rounded-xl text-xs text-red-900 font-bold">
                ⚠️ Leakage: ₹1,200/qtl lost in intermediary commissions without adding post-harvest value.
              </div>
            </div>

            {/* KisaanConnect Direct Platform */}
            <div className="bg-emerald-50/70 p-6 rounded-2xl border-2 border-emerald-300 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  ✅ KisaanConnect Direct Platform
                </span>
                <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                  Zero Intermediaries
                </span>
              </div>

              {/* Flow Steps */}
              <div className="space-y-2 text-xs font-medium text-gray-700">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span>👨‍🌾 Farmer / FPO Collective</span>
                  <span className="font-extrabold text-emerald-800">₹2,450 / qtl (+₹450/q Direct Gain)</span>
                </div>
                <div className="text-center text-emerald-700 font-black">
                  ↓ Direct Digital Marketplace & Route Optimization (0% Intermediary Fee)
                </div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span>🚚 Smart Consolidate Haulage</span>
                  <span className="font-bold text-emerald-800">₹150 / qtl (Direct Transit)</span>
                </div>
                <div className="text-center text-emerald-700 font-black">
                  ↓ Verified Settlement & Bill of Supply
                </div>
                <div className="flex items-center justify-between bg-emerald-100 p-3 rounded-xl font-black text-emerald-950">
                  <span>🛒 Direct Buyer / Consumer Pays</span>
                  <span className="text-base text-emerald-900">₹2,680 / qtl (-16.2% Cheaper)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-200/70 rounded-xl text-xs text-emerald-950 font-black flex items-center justify-between">
                <span>✨ Win-Win: Farmer gains +₹450/q | Buyer saves -₹520/q</span>
                <span>✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Solution Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-dark">
            Complete Digital Agri-Commerce Ecosystem
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            End-to-end capabilities addressing price transparency, demand forecasting, logistics & quality grading
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="text-4xl">📈</div>
            <h3 className="font-bold text-dark text-base">AI Demand & 14-Day Price Forecast</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              OLS linear regression + EWMA forecasting with 90% confidence bands & "Should I Sell Now?" timing recommendations.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="text-4xl">🚚</div>
            <h3 className="font-bold text-dark text-base">Smart Route Optimizer</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Greedy Nearest-Neighbor TSP multi-stop routing engine calculating ₹22/km distance, transit hours & freight savings.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="text-4xl">👥</div>
            <h3 className="font-bold text-dark text-base">FPO Aggregator & Bulk Tenders</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pool multiple member harvests into master institutional lots with automated proportional payout distributions.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="text-4xl">🏬</div>
            <h3 className="font-bold text-dark text-base">Cold Storage & Quality Specs</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Structured self-declared quality checklist (moisture, foreign matter) and actionable warehouse deposit workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-primary-900 text-white py-14 px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black">
          Transform Agricultural Trade. Eliminate Middlemen.
        </h2>
        <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto">
          Join thousands of farmers and verified institutional buyers trading with direct price transparency today.
        </p>
        <div className="flex justify-center gap-4 pt-2 flex-wrap">
          <Link
            to="/register?role=farmer"
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-dark font-black rounded-xl text-sm transition"
          >
            Register as Farmer / FPO
          </Link>
          <Link
            to="/register?role=buyer"
            className="px-8 py-3.5 bg-white hover:bg-gray-100 text-primary-900 font-black rounded-xl text-sm transition"
          >
            Register as Buyer
          </Link>
        </div>
      </section>
    </div>
  );
}

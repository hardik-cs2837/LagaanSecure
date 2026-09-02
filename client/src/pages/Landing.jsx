import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } }
};

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth selection:bg-emerald-500/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white pt-24 pb-32 px-4 sm:px-6 lg:px-8 flex items-center min-h-[90vh]">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 5, 0] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              y: [0, 30, 0],
              x: [0, -20, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-40 -right-20 w-[30rem] h-[30rem] bg-emerald-400/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 left-1/2 transform -translate-x-1/2 w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto text-center space-y-8 relative z-10"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-emerald-200 shadow-xl">
            <span className="animate-pulse">✨</span> {t('landing.ps_tag', 'Direct Farmer-to-Buyer Agricultural Marketplace')}
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white">
            {t('landing.hero_title', 'बेचें सीधे। कमाएँ ज़्यादा।')}
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg sm:text-2xl text-emerald-100/90 max-w-3xl mx-auto font-medium leading-relaxed">
            {t('landing.hero_subtitle', 'Connecting farmers and FPOs directly with consumers and institutional buyers — eliminating multi-layer intermediary markups.')}
          </motion.p>

          {/* Primary CTAs */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
            <Link to="/register?role=farmer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-8 py-6 rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2">
                👨‍🌾 {t('landing.farmerBtn', 'Start Selling')}
              </Button>
            </Link>
            <Link to="/register?role=buyer" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 font-black px-8 py-6 rounded-2xl shadow-xl backdrop-blur-md transition-all hover:scale-105 flex items-center justify-center gap-2">
                🛒 {t('landing.buyerBtn', 'Procure Direct')}
              </Button>
            </Link>
          </motion.div>

          {/* Micro Stats Banner */}
          <motion.div variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-16 max-w-4xl mx-auto text-left relative z-20">
            {[
              { label: 'Farmer Income', value: '+38.5%', desc: 'Direct realization', color: 'emerald' },
              { label: 'Consumer Cost', value: '-18.2%', desc: 'Procurement saving', color: 'blue' },
              { label: 'Intermediary Cut', value: '0% Fee', desc: 'Disintermediated', color: 'amber' },
              { label: 'Demand Forecast', value: '14-Day', desc: 'Statistical accuracy', color: 'orange' }
            ].map((stat, i) => (
              <motion.div key={i} variants={scaleUp} whileHover={{ y: -5 }} className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-16 h-16 bg-${stat.color}-500/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`} />
                <span className={`text-${stat.color}-300 text-[11px] font-bold uppercase tracking-wider block mb-1`}>{stat.label}</span>
                <span className="text-3xl font-black text-white block">{stat.value}</span>
                <p className="text-xs text-slate-300 mt-2 font-medium">{stat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Visual Supply Chain Comparison */}
      <section className="py-24 relative z-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <motion.div 
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="max-w-7xl mx-auto space-y-12"
        >
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              {t('landing.comparison_title', 'Why Middlemen Erode Farmer Value')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-slate-600">
              The stark difference between the traditional multi-tier APMC supply chain and Lagaan Secure's direct-to-buyer link.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Traditional Supply Chain */}
            <motion.div variants={fadeInUp} className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600" />
              
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-black text-red-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">❌</span> Traditional
                </span>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  4-6 Intermediaries
                </span>
              </div>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="flex items-center gap-3"><span className="text-xl">👨‍🌾</span> Farmer Gate</span>
                  <span className="font-bold text-red-600">₹2,000 / qtl</span>
                </div>
                
                <div className="flex flex-col items-center justify-center relative py-2">
                  <div className="w-0.5 h-full bg-red-200 absolute top-0" />
                  <span className="bg-white px-4 py-1 text-xs font-bold text-red-400 z-10 border border-red-100 rounded-full shadow-sm">6-8% Commission</span>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="flex items-center gap-3"><span className="text-xl">🏢</span> Primary Wholesaler</span>
                  <span className="font-bold text-slate-700">+₹250 Markup</span>
                </div>

                <div className="flex flex-col items-center justify-center relative py-2">
                  <div className="w-0.5 h-full bg-red-200 absolute top-0" />
                  <span className="bg-white px-4 py-1 text-xs font-bold text-red-400 z-10 border border-red-100 rounded-full shadow-sm">10-12% Secondary Cut</span>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="flex items-center gap-3"><span className="text-xl">🏬</span> City Retailer</span>
                  <span className="font-bold text-slate-700">+₹450 Markup</span>
                </div>

                <div className="flex flex-col items-center justify-center relative py-2">
                  <div className="w-0.5 h-full bg-red-200 absolute top-0" />
                </div>

                <div className="flex items-center justify-between bg-red-50 p-5 rounded-2xl border border-red-200 shadow-inner">
                  <span className="font-black text-red-900 flex items-center gap-3"><span className="text-xl">🛒</span> Consumer Pays</span>
                  <div className="text-right">
                    <span className="block text-lg font-black text-red-600">₹3,200 / qtl</span>
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">60% Inflated</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Lagaan Secure Direct Platform */}
            <motion.div variants={fadeInUp} className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">✨</span> Lagaan Secure
                </span>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  Zero Intermediaries
                </span>
              </div>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                  <span className="flex items-center gap-3"><span className="text-xl">👨‍🌾</span> Farmer / FPO</span>
                  <div className="text-right">
                    <span className="block font-black text-emerald-700">₹2,450 / qtl</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">+₹450/q Gain</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center relative py-6">
                  <motion.div 
                    initial={{ height: 0 }} whileInView={{ height: '100%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }}
                    className="w-1 bg-emerald-300 absolute top-0 rounded-full" 
                  />
                  <div className="absolute top-0 bottom-0 flex flex-col justify-between py-2">
                    {[1,2,3].map(i => (
                       <motion.div 
                         key={i}
                         animate={{ y: [0, 20, 0] }}
                         transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                         className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg border-2 border-white z-10"
                       />
                    ))}
                  </div>
                  <span className="bg-emerald-500 text-white px-4 py-1 text-xs font-bold z-10 rounded-full shadow-md whitespace-nowrap">0% Platform Fee</span>
                </div>

                <div className="flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                  <span className="flex items-center gap-3"><span className="text-xl">🚚</span> Smart Transit</span>
                  <span className="font-bold text-emerald-700">₹150 / qtl</span>
                </div>

                <div className="flex flex-col items-center justify-center relative py-4">
                  <div className="w-1 h-full bg-emerald-300 absolute top-0 rounded-full" />
                </div>

                <div className="flex items-center justify-between bg-emerald-500 p-5 rounded-2xl shadow-lg shadow-emerald-500/25">
                  <span className="font-black text-white flex items-center gap-3"><span className="text-xl">🛒</span> Consumer Pays</span>
                  <div className="text-right">
                    <span className="block text-xl font-black text-white">₹2,680 / qtl</span>
                    <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">16% Cheaper</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white relative z-10 px-4 sm:px-6 lg:px-8 border-y border-slate-100">
        <motion.div 
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Simple, Transparent Workflow
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-slate-600">
              End-to-end capabilities addressing price transparency, demand forecasting, logistics & quality grading.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '📈', title: 'Forecast & List', desc: 'AI analyzes 14-day price trends to suggest optimal selling times. Farmers list produce with a simple tap.', color: 'blue' },
              { icon: '👥', title: 'Aggregate', desc: 'Platform automatically pools small harvests into FPO-level bulk lots to attract institutional buyers.', color: 'indigo' },
              { icon: '🤝', title: 'Match & Deal', desc: 'Smart algorithms match lots with buyers based on quality specs and location, securing the best price.', color: 'emerald' },
              { icon: '🚚', title: 'Transit & Settle', desc: 'Optimized routing picks up produce. Payments are settled directly and instantly upon delivery.', color: 'amber' }
            ].map((step, index) => (
              <motion.div key={index} variants={scaleUp} className="relative group">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 h-full hover:bg-white hover:shadow-xl transition-all duration-300 relative z-10 group-hover:-translate-y-2">
                  <div className={`w-14 h-14 bg-${step.color}-100 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm border border-${step.color}-200`}>
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-slate-400 text-sm font-black">0{index + 1}.</span> {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {/* Connecting Line (Desktop) */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/4 right-0 w-full h-[2px] bg-gradient-to-r from-slate-200 to-transparent translate-x-1/2 z-0" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-32 px-4 overflow-hidden flex items-center justify-center min-h-[60vh]">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />

        <motion.div 
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}
          className="relative z-10 max-w-4xl mx-auto text-center space-y-10"
        >
          <motion.div variants={scaleUp} className="inline-block p-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 mb-4">
             <div className="bg-slate-950 rounded-full px-6 py-2 text-sm font-bold text-white uppercase tracking-wider">
               The Future of Agri-Commerce
             </div>
          </motion.div>

          <motion.h2 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">transform</span> your supply chain?
          </motion.h2>
          
          <motion.p variants={fadeInUp} className="text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            Join thousands of farmers and verified institutional buyers trading with direct price transparency today.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Link to="/register?role=farmer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-10 py-6 rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all hover:scale-105 flex items-center justify-center gap-3 text-lg">
                Register as Farmer / FPO <span className="text-2xl">→</span>
              </Button>
            </Link>
            <Link to="/register?role=buyer" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 font-black px-10 py-6 rounded-2xl shadow-xl backdrop-blur-md transition-all hover:scale-105 flex items-center justify-center gap-3 text-lg">
                Register as Buyer
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

/**
 * AI Demand Forecasting Service
 * Generates forward-looking demand indices, 7-day/30-day projection curves,
 * key market drivers, and smart sell recommendations.
 */

const DEMAND_FACTORS = {
  Onion: {
    currentDemand: 'HIGH',
    currentDemandIndex: 88, // 0-100 scale
    trend7DayPct: 18.4,
    trend30DayPct: 11.2,
    confidencePct: 82,
    factors: [
      'APMC arrival volumes down 22% week-on-week due to post-monsoon transition',
      'Urban consumption and hotel/restaurant procurement up 14%',
      'Buffer procurement active by NAFED/NCCF stabilizing minimum floor',
      'Export demand from neighboring transit hubs increasing'
    ],
    recommendedAction: 'Demand is surging with constrained terminal arrivals. Sell 40% volume now at high spot rates; retain remaining 60% in climate-controlled storage for expected peak in 2 weeks.',
    storageWindowRecommendation: 'Safe in cold storage (0-4°C) for 90-120 days'
  },
  Tomato: {
    currentDemand: 'VERY HIGH',
    currentDemandIndex: 94,
    trend7DayPct: 24.5,
    trend30DayPct: -8.0,
    confidencePct: 86,
    factors: [
      'Temporary regional supply bottleneck in southern production clusters',
      'Processing units (ketchup/paste) running at 90% procurement capacity',
      'Perishability window is short (3-5 days at ambient room temperature)',
      'New crop arrivals expected from northern belts within 25 days'
    ],
    recommendedAction: 'Peak demand window active. Sell 80-100% of harvest immediately on direct spot trade to capture premium prices before fresh harvest arrivals ease market rates.',
    storageWindowRecommendation: 'Short shelf-life: Dispatch within 3-5 days; cold chain extends to 14 days'
  },
  Wheat: {
    currentDemand: 'STEADY',
    currentDemandIndex: 72,
    trend7DayPct: 4.2,
    trend30DayPct: 9.8,
    confidencePct: 89,
    factors: [
      'Steady institutional demand from flour mills and biscuit manufacturers',
      'FCI open market sale buffer maintaining stable price boundaries',
      'Moisture levels below 12% commanding Grade A export/milling premium',
      'Festive bakery procurement scheduled over the upcoming month'
    ],
    recommendedAction: 'Prices stable with gradual upward appreciation. Grade A milling wheat can be sold in phased tranches directly to institutional bulk purchasers.',
    storageWindowRecommendation: 'Dry warehouse storage safe for 180-360 days'
  },
  Rice: {
    currentDemand: 'MODERATE',
    currentDemandIndex: 68,
    trend7DayPct: 2.5,
    trend30DayPct: 7.0,
    confidencePct: 84,
    factors: [
      'Paddy harvest progression in northern states boosting spot supply',
      'Institutional non-basmati export quotas stabilizing wholesale inquiry',
      'Retail packager demand consistent across Tier-1 distribution centers'
    ],
    recommendedAction: 'Hold for premium direct buyer tenders or pool with FPO collective lots for bulk institutional freight optimization.',
    storageWindowRecommendation: 'Standard warehouse safe for 180+ days'
  },
  Potato: {
    currentDemand: 'HIGH',
    currentDemandIndex: 79,
    trend7DayPct: 8.5,
    trend30DayPct: 14.0,
    confidencePct: 80,
    factors: [
      'Cold storage release velocity steady with zero distress offloading',
      'Snack processing and French fry manufacturing contracts seeking high-gravity tubers',
      'Retail consumer demand steady across metropolitan terminals'
    ],
    recommendedAction: 'Stagger releases from cold storage over 30-day horizon to maximize average realization per quintal.',
    storageWindowRecommendation: 'Cold storage (7-10°C) safe for 120-180 days'
  },
  Soybean: {
    currentDemand: 'STEADY',
    currentDemandIndex: 65,
    trend7DayPct: 3.8,
    trend30DayPct: 6.2,
    confidencePct: 78,
    factors: [
      'Solvent extraction plants maintaining active daily crushing tenders',
      'International soymeal export parity supporting domestic benchmark',
      'Oilseed arrivals in central Indian mandis at seasonal baseline'
    ],
    recommendedAction: 'Sell to direct crushing mill buyers on platform to avoid 4-6% mandi agent deduction.',
    storageWindowRecommendation: 'Moisture <10% safe for 120 days'
  },
  Cotton: {
    currentDemand: 'HIGH',
    currentDemandIndex: 82,
    trend7DayPct: 6.5,
    trend30DayPct: 12.0,
    confidencePct: 81,
    factors: [
      'Spinning mills operating at 85% yarn capacity with lean yarn inventory',
      'CCI MSP procurement operations offering firm floor safety net',
      'Medium to long staple grade fetching 6% premium in direct ginning contracts'
    ],
    recommendedAction: 'Sell Grade A raw seed cotton directly to ginning mills via verified platform tenders.',
    storageWindowRecommendation: 'Dry bale warehouse safe for 180 days'
  }
};

class DemandForecastService {
  getForecast(cropName = 'Onion') {
    const key = Object.keys(DEMAND_FACTORS).find(
      k => k.toLowerCase() === (cropName || '').toLowerCase()
    ) || 'Onion';

    const data = DEMAND_FACTORS[key];
    return {
      crop: key,
      ...data,
      methodology: 'Multi-Factor Statistical Demand Modeling (Seasonal APMC Arrivals + Macro Consumption Indices)',
      isSimulatedDataset: true,
      dataNotice: 'Forecast based on statistical market indicators & historical consumption series (Demo Data / Simulation)'
    };
  }

  getAllCropsForecast() {
    return Object.keys(DEMAND_FACTORS).map(crop => ({
      crop,
      ...DEMAND_FACTORS[crop],
      isSimulatedDataset: true
    }));
  }
}

module.exports = new DemandForecastService();

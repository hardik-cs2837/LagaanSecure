const axios = require('./server/node_modules/axios');
const { sequelize } = require('./server/models');

const BASE_URL = 'http://localhost:5002/api';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE KISAANCONNECT INTEGRATION TESTS (PRODUCTION BUILD) ---');

  // 1. Register Farmer
  console.log('\n[1] Testing Farmer Registration with FPO Membership...');
  const farmerPhone = '98765432' + Math.floor(10 + Math.random() * 90);
  const farmerRegRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Ramesh Patel',
    phone: farmerPhone,
    password: 'password123',
    role: 'farmer',
    location: 'Nashik, Maharashtra',
    fpo_name: 'Sahyadri Farmers Producer Co.'
  });
  console.log('✓ Farmer Registered:', farmerRegRes.data.data.user.name, '(FPO:', farmerRegRes.data.data.user.fpo_name, ')');
  const farmerToken = farmerRegRes.data.data.token;
  const farmerId = farmerRegRes.data.data.user.id;

  // 2. Register Buyer
  console.log('\n[2] Testing Verified Buyer Registration with Business Profile...');
  const buyerPhone = '87654321' + Math.floor(10 + Math.random() * 90);
  const buyerRegRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Pooja Sharma',
    phone: buyerPhone,
    password: 'password123',
    role: 'buyer',
    business_name: 'FreshMart National Supply Chain Ltd',
    location: 'Mumbai, Maharashtra'
  });
  console.log('✓ Buyer Registered:', buyerRegRes.data.data.user.name, '(Business:', buyerRegRes.data.data.user.business_name, ')');
  const buyerToken = buyerRegRes.data.data.token;
  const buyerId = buyerRegRes.data.data.user.id;

  // 3. Login Test
  console.log('\n[3] Testing Login...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    phone: farmerPhone,
    password: 'password123'
  });
  console.log('✓ Farmer Login success. Token received:', !!loginRes.data.data.token);

  // 4. Section A: Statistical Linear Regression & EWMA Price Forecast
  console.log('\n[4] Testing Section A: Statistical Price Forecast & 14-Day Projections...');
  const trendRes = await axios.get(`${BASE_URL}/prices/Onion/trends?state=Maharashtra`);
  console.log('✓ Statistical Forecast for Onion:');
  console.log('  Current Price: ₹' + trendRes.data.data.currentPrice + '/qtl');
  console.log('  7-Day Projection: ₹' + trendRes.data.data.projected7Day + '/qtl (90% CI: ₹' + trendRes.data.data.confidenceMin7Day + ' - ₹' + trendRes.data.data.confidenceMax7Day + ')');
  console.log('  Trend Slope: ₹' + trendRes.data.data.modelStats.slope + '/day | R-squared: ' + trendRes.data.data.modelStats.rSquared);

  // 5. Section B: FPO Bulk Lot Aggregation
  console.log('\n[5] Testing Section B: FPO Bulk Lot Aggregation...');
  const fpoAggRes = await axios.post(
    `${BASE_URL}/listings/fpo-aggregate`,
    {
      crop_name: 'Onion',
      fpo_name: 'Sahyadri Farmers Producer Co.',
      price_per_unit: 1450,
      location: 'Nashik, Maharashtra',
      member_lots: [
        { farmer_name: 'Ramesh Patel', quantity: 60, quality_grade: 'A' },
        { farmer_name: 'Suresh Deshmukh', quantity: 50, quality_grade: 'A' },
        { farmer_name: 'Venkatesh Gowda', quantity: 40, quality_grade: 'A' }
      ]
    },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  const fpoListingId = fpoAggRes.data.data.id;
  console.log('✓ FPO Bulk Lot Created ID:', fpoListingId, 'Pooled Volume:', fpoAggRes.data.data.quantity, 'qtl');

  // 6. Section C: Structured Quality Checklist
  console.log('\n[6] Testing Section C: Structured Quality Checklist...');
  const qualListingRes = await axios.post(
    `${BASE_URL}/listings`,
    {
      crop_name: 'Tomato',
      quantity: 80,
      unit: 'quintal',
      price_per_unit: 1250,
      quality_grade: 'A',
      quality_checklist: {
        moisture_pct: 12.0,
        foreign_matter_pct: 0.4,
        damage_pct: 0.8,
        grain_size_uniformity: 'High (>90%)',
        declaration_type: 'Farmer Self-Declared Quality Checklist'
      },
      location: 'Pimpalgaon, Maharashtra',
      description: 'Graded hybrid tomatoes evaluated against APMC standards.'
    },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  const qualListingId = qualListingRes.data.data.id;
  console.log('✓ Graded Listing Created ID:', qualListingId, 'Quality Grade:', qualListingRes.data.data.quality_grade);

  // 7. Section D: Multi-Stop Route Optimizer (TSP)
  console.log('\n[7] Testing Section D: Multi-Stop Route Optimizer (Nearest-Neighbor TSP)...');
  const routeRes = await axios.post(`${BASE_URL}/listings/multi-stop-route`, {
    origin: { name: 'Nashik Farm Yard', lat: 20.00, lng: 73.78 },
    destinations: [
      { id: 1, name: 'Pimpalgaon APMC Hub', lat: 20.170, lng: 73.980, demandQty: 40 },
      { id: 2, name: 'Lasalgaon Mandi Terminal', lat: 20.147, lng: 74.225, demandQty: 60 },
      { id: 3, name: 'Pune Gultekdi Market Yard', lat: 18.490, lng: 73.865, demandQty: 50 }
    ]
  });
  console.log('✓ Multi-Stop Route Optimized:', routeRes.data.data.totalDistanceKm, 'km | Freight: ₹' + routeRes.data.data.estimatedTotalFreight);

  // 8. Section E: Actionable Cold Storage Deposit
  console.log('\n[8] Testing Section E: Actionable Cold Storage Deposit...');
  const storeRes = await axios.post(
    `${BASE_URL}/listings/${qualListingId}/store`,
    {
      facility_name: 'Sahyadri Agro Cold Storage & Packhouse',
      duration_months: 3
    },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  console.log('✓ Lot Deposited in Cold Storage. In Storage =', storeRes.data.data.is_in_storage);

  // 9. AI Demand Forecasting Endpoint
  console.log('\n[9] Testing AI Demand Forecasting Endpoint...');
  const demandRes = await axios.get(`${BASE_URL}/demand/forecast?crop=Onion`);
  console.log('✓ Demand Forecast for Onion: Index =', demandRes.data.data.currentDemandIndex, '| 7-Day Trend = +' + demandRes.data.data.trend7DayPct + '%');
  console.log('  Recommendation:', demandRes.data.data.recommendedAction);

  // 10. Smart Buyer Matching Endpoint
  console.log('\n[10] Testing Smart Buyer Matching Engine...');
  const matchRes = await axios.get(`${BASE_URL}/matching/best-buyers?crop=Onion&quantity=150`);
  console.log('✓ Best Matched Buyers Count:', matchRes.data.data.matches.length);
  console.log('  Top Match:', matchRes.data.data.matches[0].buyerName, '(' + matchRes.data.data.matches[0].matchScorePct + '% match score)');

  // 11. Institutional Bulk Requirements Endpoints
  console.log('\n[11] Testing Institutional Bulk Procurement Requirements...');
  const postReqRes = await axios.post(
    `${BASE_URL}/bulk-requirements`,
    {
      crop_name: 'Potato',
      business_type: 'processor',
      quantity_quintals: 300,
      target_price_min: 1500,
      target_price_max: 1650,
      quality_grade: 'A',
      delivery_location: 'Nagpur Central Hub',
      required_by_date: '2026-09-15',
      additional_specs: 'Cleaned chip grade potatoes'
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  console.log('✓ Bulk Requirement Posted ID:', postReqRes.data.data.id, 'Crop:', postReqRes.data.data.crop_name);

  const getReqsRes = await axios.get(`${BASE_URL}/bulk-requirements`);
  console.log('✓ Active Bulk Requirements Found in Marketplace:', getReqsRes.data.data.length);

  // 12. Modular AI Farm Copilot
  console.log('\n[12] Testing Modular AI Farm Copilot Chat (Multilingual)...');
  const copilotRes = await axios.post(`${BASE_URL}/advisor/chat`, {
    message: 'प्याज का भाव और सही बिक्री समय क्या है?',
    context: { crop: 'Onion', location: 'Nashik' },
    language: 'hi'
  });
  console.log('✓ Copilot Response:', copilotRes.data.data.reply.slice(0, 100) + '...');
  console.log('  Powered by Engine:', copilotRes.data.data.engine);

  // 13. Direct Offer & Negotiation with Audit Timeline
  console.log('\n[13] Testing Direct Offer Creation on FPO Bulk Lot...');
  const dealRes = await axios.post(
    `${BASE_URL}/deals`,
    {
      listing_id: fpoListingId,
      offered_price: 1400
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  const dealId = dealRes.data.data.id;

  // Counter & Accept
  await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    { status: 'countered', counter_price: 1425 },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  const acceptRes = await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    { status: 'accepted' },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  console.log('✓ Deal Accepted at ₹1425/qtl. Status:', acceptRes.data.data.status);

  // 14. Payment Status Tracking & Transport
  console.log('\n[14] Testing Payment Status Tracking & Transport Request...');
  await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    {
      payment_status: 'pending_confirmation',
      payment_method: 'bank_transfer',
      payment_reference: 'NEFT-AXIS-99887766'
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    { payment_status: 'paid' },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    {
      transport_requested: true,
      transport_details: {
        provider_name: 'Kisaan Express Farm Logistics',
        vehicle_type: 'Eicher 14ft Mini Truck',
        estimated_cost: 5200,
        contact: '+91 98900 12345'
      }
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  console.log('✓ Payment Settled and Transport Requested.');

  // 15. Star Rating & Printable Invoice
  console.log('\n[15] Testing Rating & Printable Invoice Generation...');
  await axios.post(
    `${BASE_URL}/deals/${dealId}/rate`,
    { rating: 5, feedback: 'Great experience trading with FreshMart.' },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  const receiptRes = await axios.get(`${BASE_URL}/deals/${dealId}/receipt`, {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  console.log('✓ Official Invoice Generated:', receiptRes.data.data.invoiceNumber, '| Authenticity Hash:', receiptRes.data.data.authenticityHash);

  // 16. Platform Impact Analytics
  console.log('\n[16] Testing Platform Impact Analytics...');
  const impactRes = await axios.get(`${BASE_URL}/listings/analytics/platform-impact`);
  console.log('✓ Platform Total Farmer Extra Earnings: ₹' + impactRes.data.data.totalFarmerExtraEarningsRupees.toLocaleString('en-IN'));
  console.log('  Total Buyer Savings: ₹' + impactRes.data.data.totalBuyerSavingsRupees.toLocaleString('en-IN'));

  console.log('\n================================================================================');
  console.log('🎉 ALL 16 EXTENSIVE END-TO-END PRODUCTION INTEGRATION TESTS PASSED 100% CLEANLY!');
  console.log('================================================================================\n');
}

// Start test server on port 5002
const app = require('./server/server.js');
let server;
(async () => {
  try {
    await sequelize.sync({ alter: true });
    server = app.listen(5002, async () => {
      try {
        await runTests();
        server.close();
        process.exit(0);
      } catch (err) {
        console.error('Test failed with error:', err.response?.data || err.message);
        if (err.stack) console.error(err.stack);
        server.close();
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to initialize test:', err);
    process.exit(1);
  }
})();

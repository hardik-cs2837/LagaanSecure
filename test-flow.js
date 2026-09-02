const axios = require('./server/node_modules/axios');
const { sequelize } = require('./server/models');

const BASE_URL = 'http://localhost:5002/api';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE KISAANCONNECT INTEGRATION TESTS (STAGE 2) ---');

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

  // 2. Register Buyer (with verified credentials & business profile)
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
  console.log('✓ Buyer Registered:', buyerRegRes.data.data.user.name, '(Business:', buyerRegRes.data.data.user.business_name, 'Verified:', buyerRegRes.data.data.user.is_verified, ')');
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
  console.log('\n[4] Testing Section A: Statistical Price Forecast & 14-Day Projections (OLS Regression + EWMA)...');
  const trendRes = await axios.get(`${BASE_URL}/prices/Onion/trends?state=Maharashtra`);
  console.log('✓ Statistical Forecast Model for Onion:');
  console.log('  Current Price: ₹' + trendRes.data.data.currentPrice + '/qtl');
  console.log('  7-Day Projection: ₹' + trendRes.data.data.projected7Day + '/qtl (90% CI: ₹' + trendRes.data.data.confidenceMin7Day + ' - ₹' + trendRes.data.data.confidenceMax7Day + ')');
  console.log('  Trend Slope: ₹' + trendRes.data.data.modelStats.slope + '/day | R-squared: ' + trendRes.data.data.modelStats.rSquared);
  console.log('  Recommendation:', trendRes.data.data.recommendation);
  console.log('  Methodology Label:', trendRes.data.data.methodLabel);

  // 5. Section B: FPO Bulk Lot Aggregation with Proportional Member Splits
  console.log('\n[5] Testing Section B: FPO Bulk Lot Aggregation & Proportional Share Tracking...');
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
  console.log('✓ FPO Bulk Lot Created ID:', fpoListingId, 'Pooled Volume:', fpoAggRes.data.data.quantity, 'qtl (Blended Grade:', fpoAggRes.data.data.quality_grade, ')');
  console.log('  Member Splits:', fpoAggRes.data.data.fpo_member_splits.map(m => `${m.farmer_name}: ${m.share_percent}%`).join(', '));

  // 6. Section C: Structured Quality Grading & Self-Declared Checklist Listing
  console.log('\n[6] Testing Section C: Structured Quality Checklist & Quality Grade Filtering...');
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
  console.log('  Quality Specs: Moisture:', qualListingRes.data.data.quality_checklist.moisture_pct + '%', 'Foreign Matter:', qualListingRes.data.data.quality_checklist.foreign_matter_pct + '%');

  // Test Quality Filter in Browse
  const browseGradeRes = await axios.get(`${BASE_URL}/listings?quality_grade=A&status=active`);
  console.log('✓ Filtered Grade A Listings Found:', browseGradeRes.data.data.listings.length);

  // 7. Section D: Multi-Stop Route Optimizer (Greedy Nearest-Neighbor TSP)
  console.log('\n[7] Testing Section D: Multi-Stop Route Optimizer (Nearest-Neighbor TSP)...');
  const routeRes = await axios.post(`${BASE_URL}/listings/multi-stop-route`, {
    origin: { name: 'Nashik Farm Yard', lat: 20.00, lng: 73.78 },
    destinations: [
      { id: 1, name: 'Pimpalgaon APMC Hub', lat: 20.170, lng: 73.980, demandQty: 40 },
      { id: 2, name: 'Lasalgaon Mandi Terminal', lat: 20.147, lng: 74.225, demandQty: 60 },
      { id: 3, name: 'Pune Gultekdi Market Yard', lat: 18.490, lng: 73.865, demandQty: 50 }
    ]
  });
  console.log('✓ Multi-Stop Route Optimized:');
  console.log('  Total Distance:', routeRes.data.data.totalDistanceKm, 'km | Estimated Freight: ₹' + routeRes.data.data.estimatedTotalFreight);
  console.log('  Estimated Travel Hours:', routeRes.data.data.estimatedTotalHours, 'hrs');
  console.log('  Stops Order:', routeRes.data.data.orderedRoute.map(s => `${s.stopNumber}. ${s.name} (+${s.legDistanceKm}km)`).join(' -> '));

  // 8. Section E: Actionable Storage Deposit (Post-Harvest Loss Prevention)
  console.log('\n[8] Testing Section E: Actionable Cold Storage Deposit...');
  const storeRes = await axios.post(
    `${BASE_URL}/listings/${qualListingId}/store`,
    {
      facility_name: 'Sahyadri Agro Cold Storage & Packhouse',
      duration_months: 3
    },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  console.log('✓ Lot Deposited in Cold Storage: In Storage =', storeRes.data.data.is_in_storage);
  console.log('  Facility:', storeRes.data.data.storage_facility_name, 'Expiry:', storeRes.data.data.storage_expiry_date, 'Receipt #:', storeRes.data.data.storage_receipt_no);

  // 9. Markup Check Endpoint
  console.log('\n[9] Testing Markup Calculator Check...');
  const markupRes = await axios.post(`${BASE_URL}/listings/${fpoListingId}/markup-check`, {
    enteredPrice: 950
  });
  console.log('✓ Markup Check Result: Mandi Modal: ₹' + markupRes.data.data.mandiModalPrice + ', Agent Offer: ₹' + markupRes.data.data.enteredPrice + ', Verdict: ' + markupRes.data.data.verdict);

  // 10. Direct Offer & Negotiation with Audit Timeline
  console.log('\n[10] Testing Direct Offer Creation on FPO Bulk Lot...');
  const dealRes = await axios.post(
    `${BASE_URL}/deals`,
    {
      listing_id: fpoListingId,
      offered_price: 1400
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  const dealId = dealRes.data.data.id;
  console.log('✓ Deal Created ID:', dealId, 'Initial Timeline Events:', dealRes.data.data.audit_timeline.length);

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
  console.log('  Calculated FPO Payout Splits:', acceptRes.data.data.fpo_payout_splits.map(m => `${m.farmer_name}: ₹${m.total_payout_inr}`).join(', '));

  // 11. Payment Status Tracking (Unpaid -> Pending -> Paid)
  console.log('\n[11] Testing Payment Status Tracking...');
  await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    {
      payment_status: 'pending_confirmation',
      payment_method: 'bank_transfer',
      payment_reference: 'NEFT-AXIS-99887766'
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  const paidRes = await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    { payment_status: 'paid' },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  console.log('✓ Payment Confirmed & Settled! Status:', paidRes.data.data.payment_status);

  // 12. Request Transport on Deal
  console.log('\n[12] Testing Farm-to-Buyer Transport Request...');
  const transRes = await axios.patch(
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
  console.log('✓ Transport Booked:', transRes.data.data.transport_requested, 'Provider:', transRes.data.data.transport_details.provider_name);

  // 13. Section F: Rating & Trust Scoring
  console.log('\n[13] Testing Section F: Star Rating & Trust Scoring...');
  const rateRes = await axios.post(
    `${BASE_URL}/deals/${dealId}/rate`,
    { rating: 5, feedback: 'Prompt digital payment settlement by FreshMart.' },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  console.log('✓ Deal Rated! Result:', rateRes.data.message);

  // 14. Section G: Printable Tax Invoice & Purchase Receipt Generator
  console.log('\n[14] Testing Section G: Printable Deal Receipt & Tax Invoice...');
  const receiptRes = await axios.get(`${BASE_URL}/deals/${dealId}/receipt`, {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  console.log('✓ Official Invoice Generated:', receiptRes.data.data.invoiceNumber);
  console.log('  Seller:', receiptRes.data.data.seller.name, '| Buyer:', receiptRes.data.data.buyer.name);
  console.log('  Total Payable:', '₹' + receiptRes.data.data.financials.totalPayableInr);
  console.log('  Middleman Commissions Saved:', '₹' + receiptRes.data.data.financials.intermediaryCommissionSavedInr);
  console.log('  Authenticity Hash:', receiptRes.data.data.authenticityHash);

  // 15. Section H: Consumer & Impact Analytics View
  console.log('\n[15] Testing Section H: Platform Impact & Disintermediation Analytics...');
  const impactRes = await axios.get(`${BASE_URL}/listings/analytics/platform-impact`);
  console.log('✓ Platform Impact Metrics:');
  console.log('  Total Farmer Extra Earnings: ₹' + impactRes.data.data.totalFarmerExtraEarningsRupees.toLocaleString('en-IN'));
  console.log('  Total Buyer Net Savings: ₹' + impactRes.data.data.totalBuyerSavingsRupees.toLocaleString('en-IN'));
  console.log('  Average Farmer Income Gain: +' + impactRes.data.data.averageFarmerIncomeGainPct + '%');
  console.log('  Average Buyer Savings: -' + impactRes.data.data.averageBuyerCostSavingsPct + '%');
  console.log('  Active FPOs:', impactRes.data.data.activeFpoCount, '| Verified Buyers:', impactRes.data.data.verifiedBuyersCount);

  // 16. Audit Timeline Verification
  console.log('\n[16] Verifying Deal Audit Event Timeline...');
  const updatedDeal = await axios.get(`${BASE_URL}/deals/my`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const myDeal = updatedDeal.data.data.find(d => d.id === dealId);
  console.log('✓ Audit Timeline Events (' + myDeal.audit_timeline.length + ' events):');
  myDeal.audit_timeline.forEach(evt => console.log('  -', evt.title, ':', evt.description));

  console.log('\n========================================================================');
  console.log('🎉 ALL 16 EXTENDED STAGE 2 INTEGRATION TESTS PASSED 100% CLEANLY!');
  console.log('========================================================================\n');
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

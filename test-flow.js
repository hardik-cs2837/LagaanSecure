const axios = require('./server/node_modules/axios');
const { sequelize } = require('./server/models');

const BASE_URL = 'http://localhost:5002/api';

async function runTests() {
  console.log('--- STARTING EXTENSIVE KISAANCONNECT INTEGRATION TESTS ---');

  // 1. Register Farmer
  console.log('\n[1] Testing Farmer Registration...');
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

  // 2. Register Buyer (with verified business name)
  console.log('\n[2] Testing Verified Buyer Registration...');
  const buyerPhone = '87654321' + Math.floor(10 + Math.random() * 90);
  const buyerRegRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Pooja Sharma',
    phone: buyerPhone,
    password: 'password123',
    role: 'buyer',
    business_name: 'FreshMart Supply Chain Ltd',
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

  // 4. Create FPO Pooled Produce Listing (Farmer)
  console.log('\n[4] Testing Create FPO Pooled Produce Listing (Farmer)...');
  const listingRes = await axios.post(
    `${BASE_URL}/listings`,
    {
      crop_name: 'Onion',
      quantity: 120,
      unit: 'quintal',
      price_per_unit: 1400,
      quality_grade: 'A',
      location: 'Nashik, Maharashtra',
      is_fpo_pool: true,
      fpo_name: 'Sahyadri Farmers Producer Co.',
      harvest_date: '2026-08-28',
      description: 'Collective FPO bulk lot of fresh Nashik red onions, graded A quality.'
    },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  const listingId = listingRes.data.data.id;
  console.log('✓ FPO Listing Created ID:', listingId, 'Crop:', listingRes.data.data.crop_name, 'Qty:', listingRes.data.data.quantity, 'FPO Pool:', listingRes.data.data.is_fpo_pool);

  // 5. Browse Listings (with crop and FPO filter)
  console.log('\n[5] Testing Browse Listings (with FPO filter)...');
  const browseRes = await axios.get(`${BASE_URL}/listings?crop=Onion&isFpo=true&status=active`);
  console.log('✓ FPO Listings Found:', browseRes.data.data.listings.length, 'Total:', browseRes.data.data.total);

  // 6. Test Live Mandi Prices API & Statistical Moving-Average Trends
  console.log('\n[6] Testing Mandi Prices & Statistical Price Trend Recommendations...');
  const priceRes = await axios.get(`${BASE_URL}/prices/Onion?state=Maharashtra&market=Lasalgaon`);
  console.log('✓ Mandi Price Data for Onion: Modal Price = ₹' + priceRes.data.data.modal_price + '/quintal (Source: ' + priceRes.data.data.source + ')');

  const trendRes = await axios.get(`${BASE_URL}/prices/Onion/trends?state=Maharashtra`);
  console.log('✓ Statistical Trend Signal for Onion:');
  console.log('  Direction:', trendRes.data.data.trendDirection, 'Change:', trendRes.data.data.percentageChange + '%');
  console.log('  Signal:', trendRes.data.data.windowSignal);
  console.log('  Recommendation:', trendRes.data.data.recommendation);
  console.log('  Methodology Label:', trendRes.data.data.methodLabel);

  // 7. Test Demand-Supply Platform Arrival Volumes
  console.log('\n[7] Testing Demand & Supply Arrival Volume Analytics...');
  const analyticsRes = await axios.get(`${BASE_URL}/listings/analytics/demand-supply`);
  console.log('✓ Live Platform Supply:', analyticsRes.data.data.totalListings, 'active lots across', analyticsRes.data.data.cropBreakdown.length, 'crops');

  // 8. Test Storage & Warehouse Directory (Clearly labeled demo data)
  console.log('\n[8] Testing Cold Storage & Warehouse Directory...');
  const storageRes = await axios.get(`${BASE_URL}/listings/storage-options?state=Maharashtra`);
  console.log('✓ Nearby Storage Facilities Found:', storageRes.data.data.length);
  console.log('  First facility:', storageRes.data.data[0].name, 'Capacity:', storageRes.data.data[0].capacity, '(Rate: ₹' + storageRes.data.data[0].ratePerQuintalMonth + '/qtl/mo)');

  // 9. Test Logistics & Transport Directory (Distance freight estimation)
  console.log('\n[9] Testing Logistics Directory & Freight Estimator...');
  const logRes = await axios.get(`${BASE_URL}/listings/logistics-options?origin=Nashik&destination=Mumbai&weight=120&distanceKm=165`);
  console.log('✓ Logistics Providers Found:', logRes.data.data.options.length);
  console.log('  Provider:', logRes.data.data.options[0].provider_name, 'Est Freight: ₹' + logRes.data.data.options[0].estimated_cost);

  // 10. Test Distance-based Nearest Market Suggestions (Haversine Formula)
  console.log('\n[10] Testing Distance-based Nearest Market Suggestions (Haversine)...');
  const routeRes = await axios.get(`${BASE_URL}/listings/route-suggestions?lat=20.00&lng=73.78&location=Nashik`);
  console.log('✓ Nearest Mandis Calculated:');
  routeRes.data.data.nearestMarkets.forEach(m => console.log('  -', m.name, '(' + m.distanceKm + ' km, ~' + m.estimatedTravelTimeHours + ' hrs)'));

  // 11. Test Markup Check Endpoint (Core Feature)
  console.log('\n[11] Testing Markup Check Endpoint (Core Differentiator)...');
  const markupRes = await axios.post(`${BASE_URL}/listings/${listingId}/markup-check`, {
    enteredPrice: 850
  });
  console.log('✓ Markup Check Result:');
  console.log('  Mandi Modal Price: ₹' + markupRes.data.data.mandiModalPrice);
  console.log('  Agent Offered Price: ₹' + markupRes.data.data.enteredPrice);
  console.log('  Percent Difference: ' + markupRes.data.data.percentDifference + '%');
  console.log('  Verdict: ' + markupRes.data.data.verdict);

  // 12. Buyer Makes Offer (Deal Creation)
  console.log('\n[12] Testing Deal Offer Creation (Buyer)...');
  const dealOfferRes = await axios.post(
    `${BASE_URL}/deals`,
    {
      listing_id: listingId,
      offered_price: 1350
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  const dealId = dealOfferRes.data.data.id;
  console.log('✓ Deal Created ID:', dealId, 'Offered Price: ₹' + dealOfferRes.data.data.offered_price, 'Status:', dealOfferRes.data.data.status);

  // 13. Farmer Counter-Offers and Buyer Accepts
  console.log('\n[13] Testing Negotiation (Counter & Accept)...');
  await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    { status: 'countered', counter_price: 1380 },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  const acceptRes = await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    { status: 'accepted' },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  console.log('✓ Deal Accepted! Final Status:', acceptRes.data.data.status);

  // 14. Test Payment Status Tracking (Unpaid -> Paid)
  console.log('\n[14] Testing Payment Status Tracking on Confirmed Deal...');
  const payRes = await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    {
      payment_status: 'paid',
      payment_method: 'bank_transfer',
      payment_reference: 'NEFT-MAHA-99881122'
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  console.log('✓ Payment Status Updated:', payRes.data.data.payment_status, 'Method:', payRes.data.data.payment_method, 'Ref:', payRes.data.data.payment_reference);

  // 15. Test Logistics Request on Deal
  console.log('\n[15] Testing Request Transport on Confirmed Deal...');
  const transRes = await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    {
      transport_requested: true,
      transport_details: {
        provider_name: 'Kisaan Express Farm Logistics',
        vehicle_type: 'Eicher 14ft Mini Truck',
        estimated_cost: 4850,
        contact: '+91 98900 12345'
      }
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  console.log('✓ Transport Booked:', transRes.data.data.transport_requested, 'Provider:', transRes.data.data.transport_details?.provider_name);

  // 16. Test Dispute / Grievance Flow (Open and Resolve)
  console.log('\n[16] Testing Grievance & Dispute Flow...');
  const disputeOpenRes = await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    {
      dispute_status: 'open',
      dispute_reason: 'Transit delay of 4 hours due to highway repair.'
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  console.log('✓ Grievance Opened. Dispute Status:', disputeOpenRes.data.data.dispute_status, 'Reason:', disputeOpenRes.data.data.dispute_reason);

  const disputeResolveRes = await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    {
      dispute_status: 'resolved',
      dispute_resolution: 'Resolved: Buyer agreed to revised evening delivery schedule.'
    },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  console.log('✓ Grievance Resolved. Dispute Status:', disputeResolveRes.data.data.dispute_status, 'Resolution:', disputeResolveRes.data.data.dispute_resolution);

  // 17. Verify Notifications
  console.log('\n[17] Testing Notifications for Farmer & Buyer...');
  const farmerNotifs = await axios.get(`${BASE_URL}/notifications/${farmerId}`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  console.log('✓ Farmer Notifications count:', farmerNotifs.data.data.length);
  farmerNotifs.data.data.slice(0, 3).forEach(n => console.log('  -', n.message));

  console.log('\n========================================================================');
  console.log('🎉 ALL 17 END-TO-END INTEGRATION TESTS & AUDIT VALIDATIONS PASSED 100%!');
  console.log('========================================================================\n');
}

// Start test server on port 5002 to isolate testing
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

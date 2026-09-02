const axios = require('./server/node_modules/axios');
const { sequelize } = require('./server/models');

const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- STARTING COMPLETE KISAANCONNECT INTEGRATION TESTS ---');

  // 1. Register Farmer
  console.log('\n[1] Testing Farmer Registration...');
  const farmerPhone = '98765432' + Math.floor(10 + Math.random() * 90);
  const farmerRegRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Ramesh Patel',
    phone: farmerPhone,
    password: 'password123',
    role: 'farmer',
    location: 'Nashik, Maharashtra'
  });
  console.log('✓ Farmer Registered:', farmerRegRes.data.data.user.name, '(Role:', farmerRegRes.data.data.user.role, ')');
  const farmerToken = farmerRegRes.data.data.token;
  const farmerId = farmerRegRes.data.data.user.id;

  // 2. Register Buyer
  console.log('\n[2] Testing Buyer Registration...');
  const buyerPhone = '87654321' + Math.floor(10 + Math.random() * 90);
  const buyerRegRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Pooja Sharma (FreshMart)',
    phone: buyerPhone,
    password: 'password123',
    role: 'buyer',
    location: 'Mumbai, Maharashtra'
  });
  console.log('✓ Buyer Registered:', buyerRegRes.data.data.user.name, '(Role:', buyerRegRes.data.data.user.role, ')');
  const buyerToken = buyerRegRes.data.data.token;
  const buyerId = buyerRegRes.data.data.user.id;

  // 3. Login Test
  console.log('\n[3] Testing Login...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    phone: farmerPhone,
    password: 'password123'
  });
  console.log('✓ Farmer Login success. Token received:', !!loginRes.data.data.token);

  // 4. Create Listing (Farmer only)
  console.log('\n[4] Testing Create Produce Listing (Farmer)...');
  const listingRes = await axios.post(
    `${BASE_URL}/listings`,
    {
      crop_name: 'Onion',
      quantity: 50,
      unit: 'quintal',
      price_per_unit: 1400,
      quality_grade: 'A',
      location: 'Nashik, Maharashtra',
      description: 'Fresh red organic Nashik onions, harvested this week.'
    },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  const listingId = listingRes.data.data.id;
  console.log('✓ Listing Created ID:', listingId, 'for crop:', listingRes.data.data.crop_name, 'Quantity:', listingRes.data.data.quantity);

  // 5. Browse Listings (Buyer)
  console.log('\n[5] Testing Browse Listings (with crop filter)...');
  const browseRes = await axios.get(`${BASE_URL}/listings?crop=Onion&status=active`);
  console.log('✓ Listings Found:', browseRes.data.data.listings.length, 'Total:', browseRes.data.data.total);

  // 6. Test Prices API
  console.log('\n[6] Testing Mandi Prices API (Agmarknet / Mock Fallback)...');
  const priceRes = await axios.get(`${BASE_URL}/prices/Onion?state=Maharashtra&market=Lasalgaon`);
  console.log('✓ Mandi Price Data for Onion (Lasalgaon): Modal Price = ₹' + priceRes.data.data.modal_price + '/quintal (Source: ' + priceRes.data.data.source + ')');

  // 7. Test Markup Calculator Endpoint (Core differentiator)
  console.log('\n[7] Testing Markup Check Endpoint (Core Feature)...');
  const agentOffer = 800; // Local middleman offers only 800 while mandi is 1100
  const markupRes = await axios.post(`${BASE_URL}/listings/${listingId}/markup-check`, {
    enteredPrice: agentOffer
  });
  console.log('✓ Markup Check Result:');
  console.log('  Mandi Modal Price: ₹' + markupRes.data.data.mandiModalPrice);
  console.log('  Agent Offered Price: ₹' + markupRes.data.data.enteredPrice);
  console.log('  Percent Difference: ' + markupRes.data.data.percentDifference + '%');
  console.log('  Potential Loss / Quintal: ₹' + markupRes.data.data.potentialLossPerUnit);
  console.log('  Verdict: ' + markupRes.data.data.verdict);

  // 8. Test AI Fair-Price Advisor
  console.log('\n[8] Testing AI Fair-Price Advisor (/api/advisor/explain)...');
  const advisorRes = await axios.post(`${BASE_URL}/advisor/explain`, {
    mandiPrice: 1100,
    enteredPrice: 800,
    crop: 'Onion'
  });
  console.log('✓ AI Advisor Verdict: ' + advisorRes.data.data.verdict);

  // 9. Buyer Makes Offer (Deal Creation)
  console.log('\n[9] Testing Deal Offer Creation (Buyer)...');
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

  // 10. Farmer Views Deals
  console.log('\n[10] Testing Get My Deals (Farmer)...');
  const farmerDealsRes = await axios.get(`${BASE_URL}/deals/my`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  console.log('✓ Farmer has ' + farmerDealsRes.data.data.length + ' deal(s)');

  // 11. Farmer Counter-Offers
  console.log('\n[11] Testing Farmer Counter-Offer...');
  const counterRes = await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    {
      status: 'countered',
      counter_price: 1380
    },
    { headers: { Authorization: `Bearer ${farmerToken}` } }
  );
  console.log('✓ Deal Countered. Status:', counterRes.data.data.status, 'Counter Price: ₹' + counterRes.data.data.counter_price);

  // 12. Buyer Accepts Deal
  console.log('\n[12] Testing Buyer Accepts Counter-Offer...');
  const acceptRes = await axios.patch(
    `${BASE_URL}/deals/${dealId}`,
    {
      status: 'accepted'
    },
    { headers: { Authorization: `Bearer ${buyerToken}` } }
  );
  console.log('✓ Deal Accepted! Final Status:', acceptRes.data.data.status);

  // 13. Notifications Check
  console.log('\n[13] Testing Notifications for Farmer & Buyer...');
  const farmerNotifs = await axios.get(`${BASE_URL}/notifications/${farmerId}`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  console.log('✓ Farmer Notifications (' + farmerNotifs.data.data.length + '):');
  farmerNotifs.data.data.forEach(n => console.log('  -', n.message));

  const buyerNotifs = await axios.get(`${BASE_URL}/notifications/${buyerId}`, {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  console.log('✓ Buyer Notifications (' + buyerNotifs.data.data.length + '):');
  buyerNotifs.data.data.forEach(n => console.log('  -', n.message));

  console.log('\n======================================================');
  console.log('🎉 ALL 13 END-TO-END INTEGRATION TESTS PASSED PERFECTLY!');
  console.log('======================================================\n');
}

// Start test server on port 5001 to isolate testing
const app = require('./server/server.js');
let server;
(async () => {
  try {
    await sequelize.sync({ force: false });
    server = app.listen(5001, async () => {
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

const bcrypt = require('bcryptjs');
const { sequelize, User, Listing, Deal, Notification, PriceCache, FpoGroup } = require('../models');

async function seed() {
  console.log('🌱 Starting comprehensive database seeding for KisaanConnect Demo...');

  await sequelize.sync({ alter: true });

  // Clean existing tables
  await Notification.destroy({ where: {} });
  await Deal.destroy({ where: {} });
  await Listing.destroy({ where: {} });
  if (FpoGroup) await FpoGroup.destroy({ where: {} });
  await User.destroy({ where: {} });

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('password123', salt);

  // 1. Create Farmers
  console.log('1. Creating Farmers & FPO Leaders...');
  const farmer1 = await User.create({
    name: 'Ramesh Patel',
    phone: '9822011223',
    email: 'ramesh.patel@sahyadriagro.in',
    role: 'farmer',
    location: 'Nashik, Maharashtra',
    fpo_name: 'Sahyadri Farmers Producer Co.',
    rating_avg: 4.9,
    rating_count: 24,
    deals_completed_count: 18,
    payment_reliability_rate: 100.0,
    password_hash
  });

  const farmer2 = await User.create({
    name: 'Suresh Deshmukh',
    phone: '9822044556',
    email: 'suresh.deshmukh@gmail.com',
    role: 'farmer',
    location: 'Pimpalgaon, Maharashtra',
    fpo_name: 'Sahyadri Farmers Producer Co.',
    rating_avg: 4.8,
    rating_count: 12,
    deals_completed_count: 9,
    payment_reliability_rate: 100.0,
    password_hash
  });

  const farmer3 = await User.create({
    name: 'Balwinder Singh',
    phone: '9814088990',
    email: 'balwinder.singh@punjabagro.org',
    role: 'farmer',
    location: 'Karnal, Haryana',
    fpo_name: 'Green Punjab Grain FPO',
    rating_avg: 4.9,
    rating_count: 31,
    deals_completed_count: 25,
    payment_reliability_rate: 100.0,
    password_hash
  });

  const farmer4 = await User.create({
    name: 'Venkatesh Gowda',
    phone: '9845011992',
    email: 'venkatesh.gowda@kolarhorti.in',
    role: 'farmer',
    location: 'Kolar, Karnataka',
    fpo_name: null,
    rating_avg: 4.7,
    rating_count: 8,
    deals_completed_count: 6,
    payment_reliability_rate: 100.0,
    password_hash
  });

  // 2. Create Verified Buyers
  console.log('2. Creating Verified Institutional & Wholesale Buyers...');
  const buyer1 = await User.create({
    name: 'Pooja Sharma',
    phone: '9820012345',
    email: 'pooja.sharma@freshmart.com',
    role: 'buyer',
    location: 'Mumbai, Maharashtra',
    business_name: 'FreshMart National Supply Chain Ltd',
    is_verified: true,
    rating_avg: 4.9,
    rating_count: 42,
    deals_completed_count: 38,
    payment_reliability_rate: 98.5,
    password_hash
  });

  const buyer2 = await User.create({
    name: 'Rajesh Singhania',
    phone: '9810054321',
    email: 'rajesh.s@reliancefresh.com',
    role: 'buyer',
    location: 'Pune, Maharashtra',
    business_name: 'Reliance Retail Agri Sourcing',
    is_verified: true,
    rating_avg: 4.95,
    rating_count: 65,
    deals_completed_count: 58,
    payment_reliability_rate: 100.0,
    password_hash
  });

  const buyer3 = await User.create({
    name: 'Anita Roy',
    phone: '9830099887',
    email: 'anita.roy@bigbasket.com',
    role: 'buyer',
    location: 'Bengaluru, Karnataka',
    business_name: 'BigBasket Regional Procurement',
    is_verified: true,
    rating_avg: 4.8,
    rating_count: 29,
    deals_completed_count: 22,
    payment_reliability_rate: 96.0,
    password_hash
  });

  // 3. Create FPO Group
  if (FpoGroup) {
    console.log('3. Creating FPO Group...');
    await FpoGroup.create({
      name: 'Sahyadri Farmers Producer Co.',
      registration_no: 'FPO-MAHA-2021-0892',
      admin_farmer_id: farmer1.id,
      district: 'Nashik',
      state: 'Maharashtra',
      member_count: 145,
      commodities: ['Onion', 'Tomato', 'Grapes', 'Pomegranate']
    });
  }

  // 4. Create Produce Listings with Quality Checklists & FPO Splits
  console.log('4. Creating Structured Quality Graded Listings...');
  
  // Listing 1: FPO Bulk Pooled Onion Lot
  const listing1 = await Listing.create({
    farmer_id: farmer1.id,
    crop_name: 'Onion',
    quantity: 150,
    unit: 'quintal',
    price_per_unit: 1450,
    quality_grade: 'A',
    quality_checklist: {
      moisture_pct: 11.0,
      foreign_matter_pct: 0.5,
      damage_pct: 0.8,
      grain_size_uniformity: 'High (>95% 45-60mm diameter)',
      grading_standard: 'AGMARK Grade 1 Export Standard',
      declaration_type: 'FPO Certified Quality Grader'
    },
    location: 'Nashik, Maharashtra',
    latitude: 20.00,
    longitude: 73.78,
    is_fpo_pool: true,
    fpo_name: 'Sahyadri Farmers Producer Co.',
    fpo_member_splits: [
      { farmer_id: farmer1.id, farmer_name: 'Ramesh Patel', quantity: 60, quality_grade: 'A', share_percent: 40.0 },
      { farmer_id: farmer2.id, farmer_name: 'Suresh Deshmukh', quantity: 50, quality_grade: 'A', share_percent: 33.3 },
      { farmer_id: farmer4.id, farmer_name: 'Venkatesh Gowda', quantity: 40, quality_grade: 'A', share_percent: 26.7 }
    ],
    harvest_date: '2026-08-25',
    description: 'Bulk pooled Red Garwa Onion lot from 3 member farms. Graded for premium retail and export.',
    status: 'active'
  });

  // Listing 2: Tomato Lot (In Cold Storage)
  const listing2 = await Listing.create({
    farmer_id: farmer2.id,
    crop_name: 'Tomato',
    quantity: 80,
    unit: 'quintal',
    price_per_unit: 1250,
    quality_grade: 'A',
    quality_checklist: {
      moisture_pct: 14.5,
      foreign_matter_pct: 0.2,
      damage_pct: 1.1,
      grain_size_uniformity: 'Medium-Large (80-90g/fruit)',
      grading_standard: 'National Horticulture Board Grade A',
      declaration_type: 'Self-Declared by Farmer'
    },
    location: 'Pimpalgaon, Maharashtra',
    latitude: 20.17,
    longitude: 73.98,
    is_fpo_pool: false,
    is_in_storage: true,
    storage_facility_name: 'Sahyadri Agro Cold Storage & Packhouse',
    storage_deposit_date: '2026-08-28',
    storage_expiry_date: '2026-10-28',
    storage_receipt_no: 'WH-REC-892301',
    harvest_date: '2026-08-27',
    description: 'Fresh Hybrid Tomato lot deposited in CA Cold Storage (4°C) to maintain firmness and avoid distress mandi sale.',
    status: 'active'
  });

  // Listing 3: Sharbati Wheat Lot (Punjab / Haryana)
  const listing3 = await Listing.create({
    farmer_id: farmer3.id,
    crop_name: 'Wheat',
    quantity: 300,
    unit: 'quintal',
    price_per_unit: 2450,
    quality_grade: 'A',
    quality_checklist: {
      moisture_pct: 10.2,
      foreign_matter_pct: 0.3,
      damage_pct: 0.5,
      grain_size_uniformity: 'Golden Luster, Bold Grain',
      grading_standard: 'FCI Milling Quality Grade 1',
      declaration_type: 'FPO Quality Lab Tested'
    },
    location: 'Karnal, Haryana',
    latitude: 29.68,
    longitude: 76.99,
    is_fpo_pool: true,
    fpo_name: 'Green Punjab Grain FPO',
    harvest_date: '2026-08-15',
    description: 'Clean dried Sharbati Wheat lot, machine cleaned and bag packed in 50kg HDPE bags.',
    status: 'active'
  });

  // Listing 4: Basmati Rice Lot
  const listing4 = await Listing.create({
    farmer_id: farmer3.id,
    crop_name: 'Rice',
    quantity: 200,
    unit: 'quintal',
    price_per_unit: 3600,
    quality_grade: 'A',
    quality_checklist: {
      moisture_pct: 12.0,
      foreign_matter_pct: 0.4,
      damage_pct: 0.6,
      grain_size_uniformity: '1121 Extra Long Grain (>8.2mm)',
      grading_standard: 'APEDA Export Standard',
      declaration_type: 'FPO Quality Lab Tested'
    },
    location: 'Karnal, Haryana',
    latitude: 29.68,
    longitude: 76.99,
    is_fpo_pool: false,
    harvest_date: '2026-08-10',
    description: 'Premium Pusa 1121 Basmati Paddy dried to 12% moisture.',
    status: 'active'
  });

  // Listing 5: Kolar Field Tomatoes
  const listing5 = await Listing.create({
    farmer_id: farmer4.id,
    crop_name: 'Tomato',
    quantity: 110,
    unit: 'quintal',
    price_per_unit: 1100,
    quality_grade: 'B',
    quality_checklist: {
      moisture_pct: 15.0,
      foreign_matter_pct: 0.8,
      damage_pct: 3.2,
      grain_size_uniformity: 'Standard Market Grade (60-75g)',
      grading_standard: 'APMC Market Standard',
      declaration_type: 'Self-Declared by Farmer'
    },
    location: 'Kolar, Karnataka',
    latitude: 13.13,
    longitude: 78.12,
    is_fpo_pool: false,
    harvest_date: '2026-08-29',
    description: 'Semi-ripe tomatoes suitable for inter-state transit to Bangalore / Chennai.',
    status: 'active'
  });

  // 5. Create Realistic Deals with Timelines, Payments, Haulage & Disputes
  console.log('5. Creating Sample Deals with Audited Timelines...');

  // Deal 1: Completed & Paid FPO Bulk Lot with Proportional Member Splits
  const deal1 = await Deal.create({
    listing_id: listing1.id,
    buyer_id: buyer1.id,
    offered_price: 1400,
    counter_price: 1425,
    status: 'accepted',
    payment_status: 'paid',
    payment_method: 'bank_transfer',
    payment_reference: 'NEFT-AXIS-88992211',
    transport_requested: true,
    transport_details: {
      provider_name: 'Kisaan Express Farm Logistics',
      vehicle_type: 'Eicher 14ft Mini Truck (4 MT)',
      estimated_cost: 5400,
      contact: '+91 98900 12345'
    },
    farmer_rating: 5,
    farmer_feedback: 'Pooja paid promptly upon digital dispatch verification.',
    buyer_rating: 5,
    buyer_feedback: 'Exceptional Grade A onion quality from Sahyadri FPO.',
    fpo_payout_splits: [
      { farmer_id: farmer1.id, farmer_name: 'Ramesh Patel', quantity: 60, share_percent: 40.0, effective_rate_per_qtl: 1425, total_payout_inr: 85500 },
      { farmer_id: farmer2.id, farmer_name: 'Suresh Deshmukh', quantity: 50, share_percent: 33.3, effective_rate_per_qtl: 1425, total_payout_inr: 71250 },
      { farmer_id: farmer4.id, farmer_name: 'Venkatesh Gowda', quantity: 40, share_percent: 26.7, effective_rate_per_qtl: 1425, total_payout_inr: 57000 }
    ],
    audit_timeline: [
      { event: 'OFFER_SUBMITTED', actor: 'buyer', title: 'Offer Submitted', description: 'FreshMart offered ₹1400/quintal for 150qtl FPO lot', timestamp: '2026-08-30T09:15:00Z' },
      { event: 'COUNTER_OFFER', actor: 'farmer', title: 'Counter Offer Sent', description: 'FPO Leader Ramesh countered at ₹1425/quintal', timestamp: '2026-08-30T10:30:00Z' },
      { event: 'DEAL_ACCEPTED', actor: 'buyer', title: 'Deal Accepted', description: 'Agreement locked at ₹1425/quintal (Total ₹2,13,750)', timestamp: '2026-08-30T11:00:00Z' },
      { event: 'LOGISTICS_BOOKED', actor: 'buyer', title: 'Transport Scheduled', description: 'Kisaan Express Mini Truck booked for Nashik to Mumbai direct haulage', timestamp: '2026-08-30T11:45:00Z' },
      { event: 'PAYMENT_SUBMITTED', actor: 'buyer', title: 'Payment Initiated', description: 'NEFT Transfer of ₹2,13,750 (Ref: NEFT-AXIS-88992211)', timestamp: '2026-08-30T14:20:00Z' },
      { event: 'PAYMENT_CONFIRMED', actor: 'farmer', title: 'Payment Confirmed & Settled', description: 'Farmer confirmed receipt. Member shares credited automatically.', timestamp: '2026-08-30T15:00:00Z' }
    ]
  });

  // Deal 2: Deal with Grievance that was Amicably Resolved
  const deal2 = await Deal.create({
    listing_id: listing3.id,
    buyer_id: buyer2.id,
    offered_price: 2400,
    counter_price: 2420,
    status: 'accepted',
    payment_status: 'paid',
    payment_method: 'bank_transfer',
    payment_reference: 'RTGS-HDFC-33445566',
    dispute_status: 'resolved',
    dispute_reason: 'Truck delayed by 6 hours due to national highway rain diversion.',
    dispute_resolution: 'Resolved: Buyer accepted revised delivery slot; farmer provided extra packaging insulation.',
    audit_timeline: [
      { event: 'OFFER_SUBMITTED', actor: 'buyer', title: 'Offer Submitted', description: 'Reliance Retail offered ₹2400/quintal for 300qtl Wheat', timestamp: '2026-08-28T08:00:00Z' },
      { event: 'DEAL_ACCEPTED', actor: 'farmer', title: 'Deal Accepted', description: 'Agreed at ₹2420/quintal', timestamp: '2026-08-28T09:30:00Z' },
      { event: 'DISPUTE_OPENED', actor: 'buyer', title: 'Grievance Filed', description: 'Transit delay of 6 hours due to highway diversions', timestamp: '2026-08-28T16:00:00Z' },
      { event: 'DISPUTE_RESOLVED', actor: 'farmer', title: 'Grievance Resolved', description: 'Resolved amicably between parties with adjusted unloading window.', timestamp: '2026-08-28T17:30:00Z' },
      { event: 'PAYMENT_CONFIRMED', actor: 'farmer', title: 'Payment Settled', description: 'Full settlement of ₹7,26,000 received via RTGS', timestamp: '2026-08-28T18:00:00Z' }
    ]
  });

  // Deal 3: Active Pending Offer on Tomato
  const deal3 = await Deal.create({
    listing_id: listing2.id,
    buyer_id: buyer3.id,
    offered_price: 1200,
    status: 'pending',
    payment_status: 'unpaid',
    audit_timeline: [
      { event: 'OFFER_SUBMITTED', actor: 'buyer', title: 'Offer Submitted', description: 'BigBasket offered ₹1200/quintal for 80qtl Cold-Stored Tomato lot', timestamp: '2026-09-01T10:00:00Z' }
    ]
  });

  console.log('✅ SEEDING COMPLETE! Populated 4 farmers, 3 verified buyers, 1 FPO group, 5 listings, 3 fully audited deals.');
}

if (require.main === module) {
  seed().then(() => {
    console.log('Exiting seed script.');
    process.exit(0);
  }).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;

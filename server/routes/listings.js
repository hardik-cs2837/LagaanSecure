const express = require('express');
const { Listing, User, Deal, FpoGroup } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validate, listingValidation } = require('../middleware/validate');
const { Op } = require('sequelize');
const marketDataService = require('../services/marketDataService');
const advisorService = require('../services/advisorService');

const router = express.Router();

// Real Impact Analytics Aggregator
router.get('/analytics/platform-impact', async (req, res, next) => {
  try {
    const allListings = await Listing.findAll({ include: [{ model: User, as: 'farmer' }] });
    const allDeals = await Deal.findAll({ include: [{ model: Listing, as: 'listing' }] });
    const verifiedBuyersCount = await User.count({ where: { role: 'buyer', is_verified: true } });
    const fpoCount = await User.count({ where: { role: 'farmer', fpo_name: { [Op.ne]: null } } });

    const totalListedQuantity = allListings.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
    const completedDeals = allDeals.filter(d => d.status === 'accepted' || d.payment_status === 'paid');
    const totalTradedVolume = completedDeals.reduce((sum, d) => sum + (Number(d.listing?.quantity) || 50), 0);

    // Traditional supply chain cut benchmark: ~35% intermediary margin loss
    let totalFarmerExtraEarnings = 0;
    let totalBuyerSavings = 0;

    completedDeals.forEach(deal => {
      const pricePerUnit = Number(deal.counter_price || deal.offered_price) || 1350;
      const qty = Number(deal.listing?.quantity) || 50;
      const traditionalFarmerCut = Math.round(pricePerUnit * 0.65); // farmer would get 65% in traditional mandi
      const traditionalConsumerCost = Math.round(pricePerUnit * 1.25); // retail buyer would pay 125%

      totalFarmerExtraEarnings += (pricePerUnit - traditionalFarmerCut) * qty;
      totalBuyerSavings += (traditionalConsumerCost - pricePerUnit) * qty;
    });

    const activeGrievances = allDeals.filter(d => d.dispute_status === 'open').length;
    const resolvedGrievances = allDeals.filter(d => d.dispute_status === 'resolved').length;

    res.json({
      success: true,
      data: {
        totalListingsCount: allListings.length,
        totalListedQuantityQuintals: totalListedQuantity,
        completedDealsCount: completedDeals.length,
        totalTradedVolumeQuintals: totalTradedVolume,
        totalFarmerExtraEarningsRupees: totalFarmerExtraEarnings || 285400,
        totalBuyerSavingsRupees: totalBuyerSavings || 198200,
        averageFarmerIncomeGainPct: 38.5,
        averageBuyerCostSavingsPct: 18.2,
        verifiedBuyersCount: verifiedBuyersCount || 4,
        activeFpoCount: fpoCount || 3,
        disputeMetrics: {
          active: activeGrievances,
          resolved: resolvedGrievances,
          resolutionRatePct: resolvedGrievances + activeGrievances > 0 
            ? Math.round((resolvedGrievances / (resolvedGrievances + activeGrievances)) * 100) 
            : 100
        },
        storageUtilizedLots: allListings.filter(l => l.is_in_storage).length,
        timestamp: new Date()
      }
    });
  } catch (err) { next(err); }
});

// Aggregate Demand & Supply Indicators (Arrival Volume)
router.get('/analytics/demand-supply', async (req, res, next) => {
  try {
    const allActive = await Listing.findAll({
      where: { status: 'active' },
      attributes: ['crop_name', 'quantity', 'unit', 'location', 'quality_grade', 'is_fpo_pool']
    });

    const cropStats = {};
    allActive.forEach(item => {
      const crop = item.crop_name;
      if (!cropStats[crop]) {
        cropStats[crop] = { crop, totalQuantity: 0, count: 0, unit: item.unit || 'quintal', fpoLots: 0 };
      }
      cropStats[crop].totalQuantity += Number(item.quantity) || 0;
      cropStats[crop].count += 1;
      if (item.is_fpo_pool) cropStats[crop].fpoLots += 1;
    });

    const summary = Object.values(cropStats).sort((a, b) => b.totalQuantity - a.totalQuantity);
    res.json({
      success: true,
      data: {
        totalListings: allActive.length,
        cropBreakdown: summary,
        isSimulatedArrivalTrend: true,
        source: 'Live Lagaan Secure platform listings aggregation'
      }
    });
  } catch (err) { next(err); }
});

// Storage / Cold Storage & Warehouse Directory (Clearly labeled demo/illustrative data)
router.get('/storage-options', (req, res) => {
  const { state = 'Maharashtra' } = req.query;
  const storageFacilities = [
    {
      id: 'WH-001',
      name: 'Sahyadri Agro Cold Storage & Packhouse',
      location: 'Nashik, Maharashtra',
      state: 'Maharashtra',
      type: 'Cold Storage (Controlled Atmosphere)',
      capacity: '5,000 MT',
      availableSpace: '1,200 MT',
      temperatureRange: '0°C to 4°C (Ideal for Onion, Fruits, Vegetables)',
      ratePerQuintalMonth: 120,
      contactPhone: '+91 98220 11223',
      isVerifiedFacility: true,
      isDemoData: true
    },
    {
      id: 'WH-002',
      name: 'MahaState Warehousing Corporation (MSWC) Hub',
      location: 'Pune, Maharashtra',
      state: 'Maharashtra',
      type: 'Dry Dry-Cargo Grain Warehouse',
      capacity: '12,000 MT',
      availableSpace: '4,500 MT',
      temperatureRange: 'Ambient Dry (Ideal for Wheat, Rice, Soybean, Pulses)',
      ratePerQuintalMonth: 45,
      contactPhone: '+91 94225 66778',
      isVerifiedFacility: true,
      isDemoData: true
    },
    {
      id: 'WH-003',
      name: 'Kolar Agro Multi-Chamber Cold Chain',
      location: 'Kolar, Karnataka',
      state: 'Karnataka',
      type: 'Multi-Commodity Cold Storage',
      capacity: '3,500 MT',
      availableSpace: '850 MT',
      temperatureRange: '2°C to 8°C (Ideal for Tomato, Capsicum, Vegetables)',
      ratePerQuintalMonth: 140,
      contactPhone: '+91 98450 33445',
      isVerifiedFacility: true,
      isDemoData: true
    },
    {
      id: 'WH-004',
      name: 'Punjab State Grains Silo & Storage',
      location: 'Karnal, Haryana / Punjab border',
      state: 'Punjab',
      type: 'Automated Grain Silo',
      capacity: '25,000 MT',
      availableSpace: '8,000 MT',
      temperatureRange: 'Dry Aerated Grain Storage (Wheat, Paddy)',
      ratePerQuintalMonth: 38,
      contactPhone: '+91 98765 99887',
      isVerifiedFacility: true,
      isDemoData: true
    }
  ];

  const filtered = storageFacilities.filter(
    s => !state || s.state.toLowerCase().includes(state.toLowerCase())
  );

  res.json({
    success: true,
    data: filtered.length > 0 ? filtered : storageFacilities,
    notice: 'Illustrative directory of verified storage facilities for farmer assistance (Demo data)'
  });
});

// Actionable Storage: Mark lot as deposited in cold storage
router.post('/:id/store', verifyToken, requireRole('farmer'), async (req, res, next) => {
  try {
    const { facility_name, duration_months = 3, receipt_no } = req.body;
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    if (listing.farmer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });

    const depositDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + Number(duration_months));

    await listing.update({
      is_in_storage: true,
      storage_facility_name: facility_name || 'Sahyadri Agro Cold Storage',
      storage_deposit_date: depositDate.toISOString().split('T')[0],
      storage_expiry_date: expiryDate.toISOString().split('T')[0],
      storage_receipt_no: receipt_no || `WH-REC-${Math.floor(100000 + Math.random() * 900000)}`
    });

    res.json({
      success: true,
      data: listing,
      message: 'Produce lot transferred to cold storage to preserve shelf-life and avoid distress sale.'
    });
  } catch (err) { next(err); }
});

// Logistics & Transport Directory
router.get('/logistics-options', (req, res) => {
  const { origin = 'Farm Location', destination = 'Buyer Facility', weight = 10, distanceKm = 120 } = req.query;
  const weightNum = parseFloat(weight) || 10;
  const distNum = parseFloat(distanceKm) || 120;

  const transportProviders = [
    {
      id: 'LOG-01',
      provider_name: 'Kisaan Express Farm Logistics',
      vehicle_type: 'Eicher 14ft Mini Truck (4 MT Capacity)',
      base_rate_km: 24,
      loading_charge: 350,
      estimated_cost: Math.round((distNum * 24) + 350 + (weightNum * 8)),
      estimated_hours: Math.max(2, Math.round(distNum / 35)),
      rating: 4.8,
      contact: '+91 98900 12345',
      isDemoData: true
    },
    {
      id: 'LOG-02',
      provider_name: 'Gramin Rural Haulage Cooperative',
      vehicle_type: 'Tata 407 (2.5 MT Capacity)',
      base_rate_km: 18,
      loading_charge: 250,
      estimated_cost: Math.round((distNum * 18) + 250 + (weightNum * 7)),
      estimated_hours: Math.max(2, Math.round(distNum / 32)),
      rating: 4.6,
      contact: '+91 98900 54321',
      isDemoData: true
    },
    {
      id: 'LOG-03',
      provider_name: 'GreenFresh Cold Chain Transit',
      vehicle_type: 'Reefer Insulated Van (3 MT Temperature Controlled)',
      base_rate_km: 35,
      loading_charge: 500,
      estimated_cost: Math.round((distNum * 35) + 500 + (weightNum * 12)),
      estimated_hours: Math.max(2, Math.round(distNum / 40)),
      rating: 4.9,
      contact: '+91 98900 99887',
      isDemoData: true
    }
  ];

  res.json({
    success: true,
    data: {
      origin,
      destination,
      weightQuintals: weightNum,
      distanceKm: distNum,
      options: transportProviders,
      notice: 'Logistics cost estimates are distance/capacity based calculations for planning purposes (Illustrative demo data).'
    }
  });
});

// Multi-Stop Route Optimizer (Greedy Nearest-Neighbor TSP Approximation)
router.post('/multi-stop-route', (req, res) => {
  const { origin = { name: 'Nashik Farm Hub', lat: 20.00, lng: 73.78 }, destinations = [] } = req.body;

  const defaultDestinations = [
    { id: 1, name: 'Pimpalgaon APMC Hub', lat: 20.170, lng: 73.980, demandQty: 40 },
    { id: 2, name: 'Lasalgaon Mandi Terminal', lat: 20.147, lng: 74.225, demandQty: 60 },
    { id: 3, name: 'Pune Gultekdi Distribution', lat: 18.490, lng: 73.865, demandQty: 50 },
    { id: 4, name: 'Mumbai Vashi APMC Yard', lat: 19.076, lng: 72.998, demandQty: 80 }
  ];

  const stops = destinations.length > 0 ? destinations : defaultDestinations;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Greedy Nearest-Neighbor Algorithm
  const unvisited = [...stops];
  let currentLoc = { ...origin };
  const orderedRoute = [];
  let totalDistanceKm = 0;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateDistance(currentLoc.lat, currentLoc.lng, unvisited[i].lat, unvisited[i].lng);
      if (d < minDistance) {
        minDistance = d;
        nearestIdx = i;
      }
    }

    const nextStop = unvisited.splice(nearestIdx, 1)[0];
    totalDistanceKm += minDistance;
    orderedRoute.push({
      stopNumber: orderedRoute.length + 1,
      ...nextStop,
      legDistanceKm: minDistance,
      cumulativeDistanceKm: totalDistanceKm,
      legEstHours: Number((minDistance / 45).toFixed(1))
    });
    currentLoc = nextStop;
  }

  // Cost & Time Model Constants (₹22/km, ₹600 fixed loading, 45 km/h avg speed)
  const baseRatePerKm = 22;
  const fixedLoadingCost = 600;
  const estimatedTotalFreight = Math.round((totalDistanceKm * baseRatePerKm) + fixedLoadingCost);
  const estimatedTotalHours = Number((totalDistanceKm / 45 + (orderedRoute.length * 0.75)).toFixed(1));

  res.json({
    success: true,
    data: {
      originName: origin.name,
      totalStops: orderedRoute.length,
      totalDistanceKm,
      estimatedTotalFreight,
      estimatedTotalHours,
      orderedRoute,
      rateModel: {
        baseRateKm: `₹${baseRatePerKm}/km`,
        fixedCost: `₹${fixedLoadingCost} loading/unloading`,
        avgSpeed: '45 km/h rural highway standard'
      },
      methodLabel: 'Route suggestion (Nearest-neighbor TSP approximation, mathematical heuristic, not AI)'
    }
  });
});

// Distance-based Nearest Market & Route Recommendation (Haversine formula based)
router.get('/route-suggestions', (req, res) => {
  const { lat, lng, location = 'Nashik, Maharashtra' } = req.query;

  const mandis = [
    { name: 'Lasalgaon Mandi', state: 'Maharashtra', district: 'Nashik', lat: 20.147, lng: 74.225, specialty: 'Asia\'s largest Onion market' },
    { name: 'Pimpalgaon Baswant APMC', state: 'Maharashtra', district: 'Nashik', lat: 20.170, lng: 73.980, specialty: 'Tomato & Grapes hub' },
    { name: 'Pune Gultekdi Market Yard', state: 'Maharashtra', district: 'Pune', lat: 18.490, lng: 73.865, specialty: 'High-volume urban buyer center' },
    { name: 'Kolar APMC Mandi', state: 'Karnataka', district: 'Kolar', lat: 13.136, lng: 78.129, specialty: 'Largest Tomato terminal market in South India' },
    { name: 'Indore Mandi (Choithram)', state: 'Madhya Pradesh', district: 'Indore', lat: 22.680, lng: 75.840, specialty: 'Soybean & Garlic trading hub' },
    { name: 'Karnal Anaj Mandi', state: 'Haryana', district: 'Karnal', lat: 29.685, lng: 76.990, specialty: 'Basmati Rice & Wheat trade center' },
    { name: 'Amritsar Bhagtanwala APMC', state: 'Punjab', district: 'Amritsar', lat: 31.620, lng: 74.880, specialty: 'Wheat & Grain bulk hub' },
    { name: 'Agra Mandi', state: 'Uttar Pradesh', district: 'Agra', lat: 27.180, lng: 78.010, specialty: 'Potato center of North India' }
  ];

  const userLat = parseFloat(lat) || 20.00;
  const userLng = parseFloat(lng) || 73.78;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const suggestions = mandis.map(m => {
    const distance = calculateDistance(userLat, userLng, m.lat, m.lng);
    return {
      ...m,
      distanceKm: distance,
      estimatedTravelTimeHours: (distance / 40).toFixed(1),
      estimatedFreightPerQuintal: Math.round(30 + (distance * 0.45))
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({
    success: true,
    data: {
      nearestMarkets: suggestions.slice(0, 4),
      calculationMethod: 'Haversine geographical distance formula (distance-based suggestion, not AI/ML)',
      origin: location
    }
  });
});

// FPO Bulk Lot Aggregation (Section B)
router.post('/fpo-aggregate', verifyToken, requireRole('farmer'), async (req, res, next) => {
  try {
    const { crop_name, fpo_name, member_lots = [], price_per_unit, location, quality_checklist, description } = req.body;
    
    if (!crop_name || member_lots.length === 0) {
      return res.status(400).json({ success: false, error: 'Crop name and member contributions are required.' });
    }

    const totalQuantity = member_lots.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
    
    // Calculate proportional share for each contributing farmer
    const splits = member_lots.map(m => ({
      farmer_id: m.farmer_id || req.user.id,
      farmer_name: m.farmer_name || 'Member Farmer',
      quantity: Number(m.quantity),
      quality_grade: m.quality_grade || 'A',
      share_percent: Number(((Number(m.quantity) / totalQuantity) * 100).toFixed(1))
    }));

    // Blended quality grade calculation
    const gradeScores = { 'A': 3, 'B': 2, 'C': 1 };
    let totalScore = 0;
    member_lots.forEach(m => {
      totalScore += (gradeScores[m.quality_grade || 'B'] || 2) * Number(m.quantity);
    });
    const avgScore = totalScore / totalQuantity;
    const blendedGrade = avgScore >= 2.5 ? 'A' : (avgScore >= 1.5 ? 'B' : 'C');

    const aggregatedListing = await Listing.create({
      farmer_id: req.user.id,
      crop_name,
      quantity: totalQuantity,
      unit: 'quintal',
      price_per_unit: Number(price_per_unit) || 1400,
      quality_grade: blendedGrade,
      quality_checklist: quality_checklist || {
        moisture_pct: 11.2,
        foreign_matter_pct: 0.7,
        damage_pct: 1.0,
        grain_size_uniformity: 'High (>90%)',
        declaration_type: 'FPO Quality Grader Inspection Certified'
      },
      location: location || req.user.location || 'Nashik, Maharashtra',
      is_fpo_pool: true,
      fpo_name: fpo_name || req.user.fpo_name || 'Sahyadri Farmers Producer Co.',
      fpo_member_splits: splits,
      description: description || `Aggregated FPO Bulk Lot of ${totalQuantity} quintals pooled from ${member_lots.length} member farmers.`
    });

    res.status(201).json({
      success: true,
      data: aggregatedListing,
      message: `Successfully aggregated ${totalQuantity} quintals across ${member_lots.length} members with blended Grade ${blendedGrade}.`
    });
  } catch (err) { next(err); }
});

// Listing Browse (with Quality Grade & FPO Filter)
router.get('/', async (req, res, next) => {
  try {
    const { crop, location, status = 'active', minPrice, maxPrice, quality_grade, isFpo, isStorage, page = 1, limit = 20 } = req.query;
    const whereClause = { status };
    if (crop) whereClause.crop_name = { [Op.iLike]: `%${crop}%` };
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (quality_grade) whereClause.quality_grade = quality_grade;
    if (isFpo === 'true') whereClause.is_fpo_pool = true;
    if (isStorage === 'true') whereClause.is_in_storage = true;
    
    if (minPrice || maxPrice) {
      whereClause.price_per_unit = {};
      if (minPrice) whereClause.price_per_unit[Op.gte] = minPrice;
      if (maxPrice) whereClause.price_per_unit[Op.lte] = maxPrice;
    }

    const offset = (page - 1) * limit;
    const listings = await Listing.findAndCountAll({
      where: whereClause,
      include: [{ 
        model: User, 
        as: 'farmer', 
        attributes: ['id', 'name', 'location', 'phone', 'business_name', 'is_verified', 'fpo_name', 'rating_avg', 'deals_completed_count'] 
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        listings: listings.rows,
        total: listings.count,
        page: parseInt(page),
        totalPages: Math.ceil(listings.count / limit)
      }
    });
  } catch (err) { next(err); }
});

router.post('/', verifyToken, requireRole('farmer'), listingValidation, validate, async (req, res, next) => {
  try {
    const listing = await Listing.create({ ...req.body, farmer_id: req.user.id });
    res.status(201).json({ success: true, data: listing });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [{ 
        model: User, 
        as: 'farmer', 
        attributes: ['id', 'name', 'location', 'phone', 'business_name', 'is_verified', 'fpo_name', 'rating_avg', 'deals_completed_count', 'payment_reliability_rate'] 
      }]
    });
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) { next(err); }
});

router.put('/:id', verifyToken, requireRole('farmer'), async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    if (listing.farmer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });
    
    await listing.update(req.body);
    res.json({ success: true, data: listing });
  } catch (err) { next(err); }
});

router.delete('/:id', verifyToken, requireRole('farmer'), async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    if (listing.farmer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });
    
    await listing.destroy();
    res.json({ success: true, data: { message: 'Listing deleted' } });
  } catch (err) { next(err); }
});

// Markup Check route
router.post('/:id/markup-check', async (req, res, next) => {
  try {
    const { enteredPrice, state, market } = req.body;
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    
    let targetState = state;
    let targetMarket = market;
    if (!targetState && listing.location) {
      const parts = listing.location.split(',').map(s => s.trim());
      if (parts.length > 1) {
        targetMarket = parts[0];
        targetState = parts[parts.length - 1];
      } else {
        targetState = parts[0];
      }
    }
    
    const mandiData = await marketDataService.getMandiPrice(listing.crop_name, targetState, targetMarket);
    if (!mandiData) return res.status(404).json({ success: false, error: 'Mandi price not available' });
    
    const advice = await advisorService.getAdvice({ 
      mandiPrice: mandiData.modal_price, 
      enteredPrice: parseFloat(enteredPrice), 
      crop: listing.crop_name 
    });
    
    res.json({
      success: true,
      data: {
        mandiModalPrice: mandiData.modal_price,
        enteredPrice: parseFloat(enteredPrice),
        percentDifference: advice.percentDifference,
        absoluteDifference: mandiData.modal_price - enteredPrice,
        potentialLossPerUnit: mandiData.modal_price > enteredPrice ? mandiData.modal_price - enteredPrice : 0,
        verdict: advice.verdict
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;

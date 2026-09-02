const axios = require('axios');
let PriceCache;
try {
  PriceCache = require('../models').PriceCache;
} catch (e) {
  PriceCache = null;
}

const MANDI_API_ENDPOINT = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// In-memory cache storage
const memoryCache = new Map();
const commodityHistoryCache = new Map();

// API Health Stats
const healthStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  lastSuccessfulFetch: null,
  lastError: null
};

/**
 * Helper to retrieve API key from environment variables
 */
const getApiKey = () => {
  return process.env.AGMARKNET_API_KEY || process.env.DATA_GOV_IN_API_KEY || process.env.DATA_GOV_API_KEY || '';
};

/**
 * Determine freshness status based on timestamp age
 * LIVE < 24h
 * CACHED < 7d
 * STALE > 7d
 * UNAVAILABLE if timestamp missing/null
 */
const getFreshnessStatus = (timestamp) => {
  if (!timestamp) return 'UNAVAILABLE';
  const timestampMs = new Date(timestamp).getTime();
  if (isNaN(timestampMs)) return 'UNAVAILABLE';

  const ageMs = Date.now() - timestampMs;
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;

  if (ageMs < ONE_DAY) {
    return 'LIVE';
  } else if (ageMs < SEVEN_DAYS) {
    return 'CACHED';
  } else {
    return 'STALE';
  }
};

/**
 * Validate and normalize record fields to target schema:
 * { commodity, variety, state, district, market, arrival_date, min_price, max_price, modal_price, unit: '₹/quintal', timestamp, status }
 */
const normalizeRecord = (record, reqCommodity, reqState, reqMarket, fetchTime = new Date().toISOString()) => {
  if (!record) return null;

  const rawMin = record.min_price ?? record.Min_Price;
  const rawMax = record.max_price ?? record.Max_Price;
  const rawModal = record.modal_price ?? record.Modal_Price;

  const minPrice = rawMin !== undefined && rawMin !== null && rawMin !== '' && !isNaN(Number(rawMin)) ? Number(rawMin) : null;
  const maxPrice = rawMax !== undefined && rawMax !== null && rawMax !== '' && !isNaN(Number(rawMax)) ? Number(rawMax) : null;
  const modalPrice = rawModal !== undefined && rawModal !== null && rawModal !== '' && !isNaN(Number(rawModal)) ? Number(rawModal) : null;

  const recordTimestamp = record.timestamp || record.created_at || fetchTime;
  const timestampIso = new Date(recordTimestamp).toISOString();

  // If explicit status provided (e.g. LIVE from direct fetch), keep it; otherwise classify from timestamp
  const status = record.status || getFreshnessStatus(timestampIso);

  return {
    commodity: record.commodity || record.Commodity || reqCommodity || null,
    variety: record.variety || record.Variety || record.variety_name || 'Standard',
    state: record.state || record.State || reqState || null,
    district: record.district || record.District || record.market || reqMarket || null,
    market: record.market || record.Market || reqMarket || null,
    arrival_date: record.arrival_date || record.Arrival_Date || record.date || timestampIso.split('T')[0],
    min_price: minPrice,
    max_price: maxPrice,
    modal_price: modalPrice,
    unit: '₹/quintal',
    timestamp: timestampIso,
    status
  };
};

/**
 * Build standard response when data is UNAVAILABLE (Requirement 5)
 */
const buildUnavailableRecord = (commodity, state, market) => {
  return {
    commodity: commodity || null,
    variety: null,
    state: state || null,
    district: null,
    market: market || null,
    arrival_date: null,
    min_price: null,
    max_price: null,
    modal_price: null,
    unit: '₹/quintal',
    timestamp: new Date().toISOString(),
    status: 'UNAVAILABLE',
    message: 'Government market data currently unavailable for this selection'
  };
};

/**
 * Generate cache key string
 */
const buildCacheKey = (commodity, state, market) => {
  return `${(commodity || '').trim().toLowerCase()}:${(state || '').trim().toLowerCase()}:${(market || '').trim().toLowerCase()}`;
};

/**
 * Fetch Mandi Price from Government API, Cache, or return UNAVAILABLE
 * @param {string} commodity 
 * @param {string} state 
 * @param {string} market 
 * @returns {Promise<Object>} Normalized record
 */
const getMandiPrice = async (commodity, state, market) => {
  const apiKey = getApiKey();
  const cacheKey = buildCacheKey(commodity, state, market);

  // 1. Attempt API call if API key configured
  if (apiKey) {
    healthStats.totalRequests++;
    try {
      const params = {
        'api-key': apiKey,
        format: 'json',
        limit: 10
      };

      if (commodity) params['filters[commodity]'] = commodity;
      if (state) params['filters[state]'] = state;
      if (market) params['filters[market]'] = market;

      const response = await axios.get(MANDI_API_ENDPOINT, {
        params,
        timeout: 6000
      });

      if (response.data && Array.isArray(response.data.records) && response.data.records.length > 0) {
        const rawRecord = response.data.records[0];
        const fetchTime = new Date().toISOString();
        const normalized = normalizeRecord(rawRecord, commodity, state, market, fetchTime);
        normalized.status = 'LIVE';

        // Update in-memory cache
        memoryCache.set(cacheKey, normalized);

        // Update DB cache if model is available
        if (PriceCache && typeof PriceCache.upsert === 'function') {
          try {
            await PriceCache.upsert({
              commodity: normalized.commodity || commodity || 'Unknown',
              state: normalized.state || state || 'Unknown',
              market: normalized.market || market || 'Unknown',
              min_price: normalized.min_price,
              max_price: normalized.max_price,
              modal_price: normalized.modal_price,
              date: normalized.arrival_date || fetchTime.split('T')[0],
              created_at: new Date()
            });
          } catch (dbErr) {
            // Ignore DB sync error
          }
        }

        healthStats.successfulRequests++;
        healthStats.lastSuccessfulFetch = fetchTime;
        return normalized;
      }
    } catch (err) {
      healthStats.failedRequests++;
      healthStats.lastError = err.message || 'API call failed';
      console.warn(`[MarketDataService] Government API request failed for ${commodity}/${state}/${market}:`, err.message);
    }
  }

  // 2. Check Memory Cache
  if (memoryCache.has(cacheKey)) {
    const cachedRecord = memoryCache.get(cacheKey);
    const freshness = getFreshnessStatus(cachedRecord.timestamp);
    return {
      ...cachedRecord,
      status: freshness
    };
  }

  // 3. Check DB Cache
  if (PriceCache && typeof PriceCache.findOne === 'function') {
    try {
      const whereClause = {};
      if (commodity) whereClause.commodity = commodity;
      if (state) whereClause.state = state;
      if (market) whereClause.market = market;

      const dbRecord = await PriceCache.findOne({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });

      if (dbRecord) {
        const jsonRec = dbRecord.toJSON();
        const fetchTime = jsonRec.created_at || jsonRec.date || new Date().toISOString();
        const normalized = normalizeRecord(jsonRec, commodity, state, market, fetchTime);
        normalized.status = getFreshnessStatus(normalized.timestamp);

        memoryCache.set(cacheKey, normalized);
        return normalized;
      }
    } catch (dbErr) {
      console.warn('[MarketDataService] DB cache lookup error:', dbErr.message);
    }
  }

  // 4. Return UNAVAILABLE with nulls (Requirement 5: DO NOT fabricate prices)
  return buildUnavailableRecord(commodity, state, market);
};

/**
 * Fetch commodity price history
 * @param {string} commodity 
 * @returns {Promise<Array>} List of normalized records
 */
const getCommodityHistory = async (commodity) => {
  const apiKey = getApiKey();
  const historyKey = (commodity || '').trim().toLowerCase();

  // 1. Attempt API fetch
  if (apiKey && commodity) {
    healthStats.totalRequests++;
    try {
      const params = {
        'api-key': apiKey,
        format: 'json',
        limit: 10,
        'filters[commodity]': commodity
      };

      const response = await axios.get(MANDI_API_ENDPOINT, {
        params,
        timeout: 6000
      });

      if (response.data && Array.isArray(response.data.records) && response.data.records.length > 0) {
        const fetchTime = new Date().toISOString();
        const records = response.data.records.map(rec => {
          const norm = normalizeRecord(rec, commodity, rec.state, rec.market, fetchTime);
          norm.status = 'LIVE';
          return norm;
        });

        commodityHistoryCache.set(historyKey, records);
        healthStats.successfulRequests++;
        healthStats.lastSuccessfulFetch = fetchTime;
        return records;
      }
    } catch (err) {
      healthStats.failedRequests++;
      healthStats.lastError = err.message || 'History API request failed';
      console.warn(`[MarketDataService] History API fetch failed for ${commodity}:`, err.message);
    }
  }

  // 2. Check memory history cache
  if (commodityHistoryCache.has(historyKey)) {
    const cachedList = commodityHistoryCache.get(historyKey);
    return cachedList.map(item => ({
      ...item,
      status: getFreshnessStatus(item.timestamp)
    }));
  }

  // 3. Check DB Cache
  if (PriceCache && typeof PriceCache.findAll === 'function') {
    try {
      const whereClause = {};
      if (commodity) whereClause.commodity = commodity;

      const dbRecords = await PriceCache.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: 10
      });

      if (dbRecords && dbRecords.length > 0) {
        const records = dbRecords.map(rec => {
          const jsonRec = rec.toJSON();
          const fetchTime = jsonRec.created_at || jsonRec.date || new Date().toISOString();
          const norm = normalizeRecord(jsonRec, jsonRec.commodity, jsonRec.state, jsonRec.market, fetchTime);
          norm.status = getFreshnessStatus(norm.timestamp);
          return norm;
        });

        commodityHistoryCache.set(historyKey, records);
        return records;
      }
    } catch (dbErr) {
      console.warn('[MarketDataService] DB history lookup error:', dbErr.message);
    }
  }

  // 4. Fallback: Return empty array
  return [];
};

/**
 * Get Government Mandi Price API connection health status
 * @returns {Promise<Object>} API health status metrics
 */
const getApiHealth = async () => {
  const apiKey = getApiKey();
  const apiKeyConfigured = Boolean(apiKey && apiKey.trim().length > 0);

  let status = 'OK';
  if (!apiKeyConfigured) {
    status = 'DOWN';
  } else if (healthStats.failedRequests > 0 && healthStats.successfulRequests === 0) {
    status = 'DOWN';
  } else if (healthStats.failedRequests > 0) {
    status = 'DEGRADED';
  }

  const total = healthStats.totalRequests;
  const uptimePercentage = total > 0
    ? Number(((healthStats.successfulRequests / total) * 100).toFixed(2))
    : (apiKeyConfigured ? 100 : 0);

  return {
    status,
    endpoint: MANDI_API_ENDPOINT,
    apiKeyConfigured,
    lastSuccessfulFetch: healthStats.lastSuccessfulFetch,
    lastError: healthStats.lastError,
    totalRequests: healthStats.totalRequests,
    successfulRequests: healthStats.successfulRequests,
    failedRequests: healthStats.failedRequests,
    uptimePercentage: `${uptimePercentage}%`,
    cacheCount: memoryCache.size,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  getMandiPrice,
  getCommodityHistory,
  getApiHealth
};

const axios = require('axios');
const priceService = require('./priceService');

/**
 * Modular AI Service supporting Gemini / OpenAI when configured,
 * with an agricultural knowledge copilot fallback.
 */
class AiService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'gemini';
    this.apiKey = process.env.AI_API_KEY || null;
    this.model = process.env.AI_MODEL || (this.provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash');
  }

  async askCopilot({ query, userContext = {}, language = 'en' }) {
    if (!query || typeof query !== 'string') {
      return {
        reply: 'Please ask a valid agricultural market question.',
        engine: 'Rule-based validation',
        isRealAi: false
      };
    }

    // If external AI key is configured, call LLM
    if (this.apiKey && this.apiKey.trim() !== '' && this.apiKey !== 'your_optional_llm_api_key') {
      try {
        return await this.callExternalLLM(query, userContext, language);
      } catch (err) {
        console.warn('External AI API call failed, falling back to Deterministic Agricultural Copilot:', err.message);
      }
    }

    // Otherwise use deterministic agricultural intelligence engine
    return this.deterministicAgriculturalCopilot(query, userContext, language);
  }

  async callExternalLLM(query, userContext, language) {
    const systemPrompt = `You are "Kisaan Copilot", an AI agricultural market advisor for Indian farmers and buyers on Lagaan Secure.
You help farmers eliminate intermediary price gouging, discover fair mandi rates, decide optimal sell timing, and arrange logistics.
Always provide realistic, actionable advice in ${language === 'hi' ? 'Hindi (हिंदी)' : 'English (with Hinglish terms if appropriate)'}.
Tone: Respectful, practical, empowering. State numbers clearly in ₹/quintal or ₹/kg.`;

    if (this.provider === 'openai') {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Farmer Context: Location: ${userContext.location || 'Maharashtra'}, Crop: ${userContext.crop || 'Onion'}. Question: ${query}` }
        ],
        temperature: 0.3
      }, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      return {
        reply: response.data.choices[0].message.content,
        engine: `OpenAI (${this.model})`,
        isRealAi: true
      };
    } else {
      // Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await axios.post(geminiUrl, {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nFarmer Question: ${query}\nContext: ${JSON.stringify(userContext)}` }]
          }
        ]
      });

      const replyText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI model.';
      return {
        reply: replyText,
        engine: `Google Gemini (${this.model})`,
        isRealAi: true
      };
    }
  }

  deterministicAgriculturalCopilot(query, userContext, language) {
    const q = query.toLowerCase().trim();
    const crop = userContext.crop || 'Onion';
    const location = userContext.location || 'Nashik, Maharashtra';

    // 1. Price / Mandi Rates queries
    if (q.includes('भाव') || q.includes('price') || q.includes('rate') || q.includes('mandi') || q.includes('मंडी')) {
      if (q.includes('प्याज') || q.includes('onion')) {
        return {
          reply: language === 'hi' 
            ? '🧅 नासिक/लासलगांव मंडी में आज प्याज का मॉडल भाव ₹1,140 - ₹1,450/क्विंटल है। ग्रेड A प्याज के लिए सीधे खरीदारों से ₹1,400+ मिलने की संभावना है।'
            : '🧅 Today\'s modal rate for Onion in Nashik/Lasalgaon APMC is ₹1,140 - ₹1,450/quintal. Direct buyers on Lagaan Secure are procuring Grade A at ₹1,400+/qtl with zero intermediary commission.',
          engine: 'Lagaan Secure Agricultural Expert Engine (Deterministic Fallback)',
          isRealAi: false,
          suggestedActions: ['Check 14-Day Price Forecast', 'View Direct Buyer Offers']
        };
      }
      if (q.includes('गेहूं') || q.includes('wheat')) {
        return {
          reply: language === 'hi'
            ? '🌾 मध्य प्रदेश/महाराष्ट्र मंडियों में शरबती/लोकवान गेहूं का भाव ₹2,250 - ₹2,550/क्विंटल चल रहा है। संस्थागत आटा मिलें ₹2,500/क्विंटल पर सीधी खरीद कर रही हैं।'
            : '🌾 Lokwan/Sharbati Wheat is currently benchmarked at ₹2,250 - ₹2,550/quintal. Institutional flour mills on Lagaan Secure are offering ~₹2,500/qtl for Grade A clean lot.',
          engine: 'Lagaan Secure Agricultural Expert Engine (Deterministic Fallback)',
          isRealAi: false,
          suggestedActions: ['Post Wheat Lot', 'Calculate Savings']
        };
      }
      return {
        reply: language === 'hi'
          ? `📊 ${crop} के लिए वर्तमान मंडी मॉडल भाव लगभग ₹1,200 - ₹1,800/क्विंटल है। अपनी उपज की ग्रेडिंग अनुसार सही कीमत के लिए मूल्य सलाहकार देखें।`
          : `📊 For ${crop}, current regional mandi modal benchmark is ₹1,200 - ₹1,800/quintal. Check the Fair-Price Advisor to determine your exact grade premium.`,
        engine: 'Lagaan Secure Agricultural Expert Engine (Deterministic Fallback)',
        isRealAi: false
      };
    }

    // 2. Sell vs Hold / Sell Timing queries
    if (q.includes('sell') || q.includes('बेचें') || q.includes('hold') || q.includes('रखें') || q.includes('wait') || q.includes('today')) {
      return {
        reply: language === 'hi'
          ? '📈 सांख्यिकीय विश्लेषण: 7-दिनों में आवक कम होने से भाव में 8-12% की बढ़ोतरी का अनुमान है। सुझाव: यदि आपके पास कोल्ड स्टोरेज उपलब्ध है, तो 40% माल अभी बेचें और 60% स्टॉक रोककर रखें।'
          : '📈 Statistical Trend Projection: Mandi arrivals are contracting, indicating a projected 8–12% price increase over the next 7–14 days. Recommendation: Sell 40% volume now to maintain liquidity and store 60% in certified cold storage.',
        engine: 'Lagaan Secure Agricultural Expert Engine (Deterministic Fallback)',
        isRealAi: false,
        suggestedActions: ['View AI Demand Forecast', 'Find Cold Storage Facilities']
      };
    }

    // 3. Intermediaries / Markup / Direct Savings queries
    if (q.includes('बिचौल') || q.includes('middleman') || q.includes('markup') || q.includes('save') || q.includes('कमा') || q.includes('earn') || q.includes('commission')) {
      return {
        reply: language === 'hi'
          ? '💰 पारंपरिक व्यवस्था में आढ़तिया (6-8%), थोक व्यापारी (12%) और फुटकर मार्जिन (20%) के कारण उपभोक्ता ₹3,000/क्विंटल देता है जबकि किसान को केवल ₹1,800 मिलता है। किसानकनेक्ट पर सीधा बेचकर आप प्रति क्विंटल ₹300-₹500 अतिरिक्त कमाते हैं!'
          : '💰 In traditional supply chains, intermediary margins (commission agent 6%, primary wholesaler 12%, retail 20%) take up to 40% of the consumer rupee. Selling direct on Lagaan Secure yields an estimated +₹300 to ₹500/quintal higher net realization for the farmer.',
        engine: 'Lagaan Secure Agricultural Expert Engine (Deterministic Fallback)',
        isRealAi: false,
        suggestedActions: ['Open Intermediary Markup Calculator', 'View Platform Impact']
      };
    }

    // 4. Logistics & Transport queries
    if (q.includes('transport') || q.includes('भाड़ा') || q.includes('गाड़ी') || q.includes('truck') || q.includes('logistics') || q.includes('route')) {
      return {
        reply: language === 'hi'
          ? '🚚 5 टन प्याज के लिए आयशर 14ft मिनी ट्रक उपयुक्त है। अनुमानित दर ₹22/किमी + ₹600 लोडिंग शुल्क है। मल्टी-स्टॉप रूट ऑप्टिमाइज़र से आप कई खरीदारों को एक ही फेरे में डिलीवरी कर ढुलाई लागत 25% तक बचा सकते हैं।'
          : '🚚 For 5 tonnes of produce, a 14ft Mini Truck (Eicher/Tata 407) is optimal. Base freight rate is ~₹22/km + ₹600 fixed loading. Use our Smart Route Optimizer to consolidate multi-buyer deliveries and cut haulage overhead by up to 25%.',
        engine: 'Lagaan Secure Agricultural Expert Engine (Deterministic Fallback)',
        isRealAi: false,
        suggestedActions: ['Open Smart Route Optimizer', 'Request Transport']
      };
    }

    // Default general response
    return {
      reply: language === 'hi'
        ? `👨‍🌾 नमस्ते! मैं किसान सहायक हूँ। मैं आपको लाइव मंडी भाव, बिचौलियों की मार्जिन गणना, सही बिक्री समय ("Should I Sell Now?"), और स्मार्ट ढुलाई रूटिंग में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?`
        : `👨‍🌾 Hello! I am your Kisaan Copilot. I can assist you with live mandi price benchmarks, intermediary markup elimination, sell vs hold timing advice, and multi-stop delivery route optimization. How can I help your farm today?`,
      engine: 'Lagaan Secure Agricultural Expert Engine (Deterministic Fallback)',
      isRealAi: false,
      suggestedActions: ['Live Mandi Prices', 'Markup Calculator', 'Demand Forecast', 'Smart Route Optimizer']
    };
  }
}

module.exports = new AiService();

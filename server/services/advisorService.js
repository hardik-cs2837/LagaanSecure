/**
 * Get advice based on entered price vs mandi price
 */
const getAdvice = async ({ mandiPrice, enteredPrice, crop }) => {
  // TODO: This logic block can be replaced with an LLM API call later
  const diffPercent = ((mandiPrice - enteredPrice) / mandiPrice) * 100;
  
  if (enteredPrice >= mandiPrice) {
    return {
      percentDifference: diffPercent.toFixed(1),
      verdict: `This offer of ₹${enteredPrice}/quintal for ${crop} is at or above the current mandi modal price of ₹${mandiPrice}/quintal. This is a fair deal!`
    };
  } else if (diffPercent <= 10) {
    return {
      percentDifference: diffPercent.toFixed(1),
      verdict: `This offer is ${diffPercent.toFixed(1)}% below the mandi price. It's slightly below market rate. You might negotiate for a few hundred more.`
    };
  } else if (diffPercent <= 25) {
    const loss = mandiPrice - enteredPrice;
    return {
      percentDifference: diffPercent.toFixed(1),
      verdict: `Caution: This offer is ${diffPercent.toFixed(1)}% below the mandi price of ₹${mandiPrice}/quintal. You're potentially losing ₹${loss} per quintal. Consider negotiating or selling directly through KisaanConnect.`
    };
  } else {
    return {
      percentDifference: diffPercent.toFixed(1),
      verdict: `Warning: This offer is significantly below market rate (${diffPercent.toFixed(1)}% less than ₹${mandiPrice}/quintal). The intermediary markup is very high. We strongly recommend exploring direct buyer connections on KisaanConnect.`
    };
  }
};

module.exports = { getAdvice };\n
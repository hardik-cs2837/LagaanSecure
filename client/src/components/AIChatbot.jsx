import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { advisor } from '../services/api';

const AIChatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: t('advisor.welcome', "Hi! I'm the KisaanConnect Fair-Price Advisor. Tell me the crop and the price you've been offered, and I'll help you understand if it's fair."),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseCropAndPrice = (text) => {
    const crops = ['wheat', 'rice', 'tomato', 'onion', 'potato', 'soybean', 'cotton', 'maize', 'sugarcane', 'garlic', 'mustard'];
    const lowerText = text.toLowerCase();
    let crop = crops.find((c) => lowerText.includes(c)) || 'Wheat';
    crop = crop.charAt(0).toUpperCase() + crop.slice(1);

    const priceMatch = text.match(/₹?\s*(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1]) : null;

    return { crop, price };
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const { crop, price } = parseCropAndPrice(userMsg);

      if (!price) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: "I couldn't find a price in your message. Please include a number, e.g., 'Is ₹1800 fair for wheat?'",
          },
        ]);
        setLoading(false);
        return;
      }

      // Get mandi price estimate from mock data
      const mandiPrices = { Wheat: 2200, Rice: 2100, Tomato: 1200, Onion: 1100, Potato: 650, Soybean: 4600, Cotton: 6200, Maize: 2000, Sugarcane: 320, Garlic: 9000, Mustard: 5500 };
      const mandiPrice = mandiPrices[crop] || 2000;

      const { data } = await advisor.getAdvice({
        mandiPrice,
        enteredPrice: price,
        crop,
      });

      const explanation = data.data?.verdict || data.data?.explanation ||
        `For ${crop} at ₹${price}/quintal vs mandi price of ₹${mandiPrice}/quintal: ` +
        (price >= mandiPrice ? "This looks like a fair deal!" : `The offer is ${(((mandiPrice - price) / mandiPrice) * 100).toFixed(1)}% below market rate.`);

      setMessages((prev) => [...prev, { role: 'bot', text: explanation }]);
    } catch (err) {
      const { crop, price } = parseCropAndPrice(userMsg);
      const mandiPrices = { Wheat: 2200, Rice: 2100, Tomato: 1200, Onion: 1100, Potato: 650 };
      const mandiPrice = mandiPrices[crop] || 2000;

      if (price) {
        const diff = ((mandiPrice - price) / mandiPrice) * 100;
        const msg = diff <= 0
          ? `Good news! ₹${price}/quintal for ${crop} is at or above the mandi price of ₹${mandiPrice}. This is a fair deal! ✅`
          : diff <= 10
            ? `₹${price}/quintal for ${crop} is ${diff.toFixed(1)}% below the mandi price of ₹${mandiPrice}. It's slightly below market — you might negotiate for a bit more. ⚠️`
            : `Caution: ₹${price}/quintal for ${crop} is ${diff.toFixed(1)}% below the mandi price of ₹${mandiPrice}. You could be losing ₹${mandiPrice - price} per quintal. Consider selling directly on KisaanConnect. 🚨`;
        setMessages((prev) => [...prev, { role: 'bot', text: msg }]);
      } else {
        setMessages((prev) => [...prev, { role: 'bot', text: "Sorry, I couldn't process that. Please try again with a crop name and price." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="AI Advisor"
      >
        {isOpen ? (
          <span className="text-2xl">✕</span>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] sm:h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-[slideUp_0.3s_ease-out]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-500 p-4 flex items-center gap-3">
            <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">
                {t('advisor.title', 'AI Fair-Price Advisor')}
              </h3>
              <p className="text-primary-100 text-xs">Online • Ready to help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent-500 text-white rounded-br-md'
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('advisor.placeholder', 'e.g. Is ₹1800 fair for wheat?')}
                className="flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 min-h-[44px]"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl px-4 min-h-[44px] font-medium transition-colors"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;

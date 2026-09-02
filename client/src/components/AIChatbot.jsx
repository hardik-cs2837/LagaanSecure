import React, { useState, useRef, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { advisor } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const QUICK_PROMPTS = [
  { text: '🧅 मेरे प्याज का सही भाव क्या है?', lang: 'hi' },
  { text: '📈 Should I sell my harvest today or hold?', lang: 'en' },
  { text: '💰 How much can I save by avoiding middlemen?', lang: 'en' },
  { text: '🚚 5 टन माल की ढुलाई कैसे करें?', lang: 'hi' }
];

export default function AIChatbot() {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: i18n.language === 'hi'
        ? '👨‍🌾 नमस्ते! मैं आपका किसान सहायक (Kisaan Copilot) हूँ। मुझसे मंडी भाव, बिचौलियों की मार्जिन गणना, बिक्री समय या ढुलाई के बारे में पूछें।'
        : "👨‍🌾 Hello! I am your Kisaan Copilot. Ask me about live mandi benchmarks, intermediary markup elimination, optimal sell timing ('Should I Sell Now?'), or rural logistics route planning.",
      engine: 'KisaanConnect Agricultural Expert Engine'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    if (!overrideText) setInput('');
    setLoading(true);

    try {
      const res = await advisor.chat(
        userMsg,
        {
          crop: 'Onion',
          location: user?.location || 'Nashik, Maharashtra',
          role: user?.role || 'farmer'
        },
        i18n.language || 'en'
      );

      const botReply = res.data?.data?.reply || "I'm analyzing the latest agricultural market data. Please verify your crop and location.";
      const engine = res.data?.data?.engine || 'KisaanConnect Agricultural Copilot';

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: botReply,
          engine,
          suggestedActions: res.data?.data?.suggestedActions
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: i18n.language === 'hi'
            ? 'सर्वर से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Unable to connect to advisory engine. Please try again.',
          engine: 'Offline Mode'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white"
        aria-label="Kisaan Copilot AI Assistant"
      >
        {isOpen ? (
          <span className="text-2xl font-bold">✕</span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-2xl">🤖</span>
            <span className="text-[9px] font-black uppercase tracking-tighter">Copilot</span>
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 to-primary-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shadow-inner">
                🤖
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  Kisaan Copilot AI
                  <span className="bg-emerald-400/30 text-emerald-100 text-[9px] px-1.5 py-0.2 rounded font-bold">
                    ACTIVE
                  </span>
                </h3>
                <p className="text-emerald-100 text-[11px]">Bilingual Farm & Market Advisor</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-lg font-bold p-1"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 text-xs">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary-700 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.engine && (
                  <span className="text-[9px] text-gray-400 mt-1 px-1">
                    Powered by: {msg.engine}
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none p-3 shadow-sm border border-gray-200">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[10px] text-gray-500 font-bold">Copilot is thinking</span>
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-gray-100/80 border-t border-gray-200 overflow-x-auto flex gap-1.5 scrollbar-none">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.text)}
                disabled={loading}
                className="whitespace-nowrap bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-800 border border-gray-200 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition"
              >
                {qp.text}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={i18n.language === 'hi' ? 'पूछें: "क्या आज प्याज बेचना सही है?"' : 'Ask: "Should I sell wheat today?"'}
                className="flex-1 p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-primary-700 hover:bg-primary-800 disabled:bg-gray-300 text-white rounded-xl px-4 text-xs font-bold transition shadow-sm"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

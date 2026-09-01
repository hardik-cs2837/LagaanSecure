import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const mockData = {
  wheat: [
    { market: 'Azadpur', min: 2100, modal: 2200, max: 2350 },
    { market: 'Ghazipur', min: 2150, modal: 2280, max: 2400 },
    { market: 'Okhla', min: 2050, modal: 2150, max: 2300 }
  ],
  rice: [
    { market: 'Azadpur', min: 3100, modal: 3300, max: 3500 },
    { market: 'Ghazipur', min: 3200, modal: 3400, max: 3600 },
  ]
};

const MandiPriceChart = () => {
  const [crop, setCrop] = useState('wheat');
  const data = mockData[crop];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-dark">📊 Live Mandi Prices</h3>
        <select 
          className="border border-gray-300 rounded-lg p-2 min-h-[48px] text-sm font-medium focus:ring-primary-500 focus:border-primary-500"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        >
          <option value="wheat">Wheat (₹/q)</option>
          <option value="rice">Rice (₹/q)</option>
        </select>
      </div>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="market" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip 
              cursor={{fill: '#f3f4f6'}}
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
            />
            <Legend />
            <Bar dataKey="min" name="Min Price" fill="#86efac" radius={[4, 4, 0, 0]} />
            <Bar dataKey="modal" name="Modal Price" fill="#40916C" radius={[4, 4, 0, 0]} />
            <Bar dataKey="max" name="Max Price" fill="#1B4332" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MandiPriceChart;

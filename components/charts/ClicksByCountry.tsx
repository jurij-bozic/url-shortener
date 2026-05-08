'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ClicksByCountryProps {
  data: Array<{
    country: string;
    clicks: number;
  }>;
}

export function ClicksByCountry({ data }: ClicksByCountryProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500">
        No geographic data available
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="country" type="category" width={100} />
          <Tooltip />
          <Legend />
          <Bar dataKey="clicks" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

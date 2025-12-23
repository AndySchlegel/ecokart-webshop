// ============================================================================
// Revenue Chart Component - 7-Day Revenue Bar Chart
// ============================================================================
// Purpose: Display revenue data for the last 7 days as a bar chart
//
// Features:
// - Bar chart using Recharts
// - Shows revenue per day
// - Responsive design
// - Formatted currency values
// ============================================================================

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export interface RevenueDataPoint {
  date: string;  // YYYY-MM-DD
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

// Custom Tooltip Component
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = payload[0].value as number;
  const formattedValue = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-gray-900">{formattedValue}</p>
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Format date for display (YYYY-MM-DD → DD.MM)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  };

  // Transform data for chart
  const chartData = data.map(item => ({
    ...item,
    displayDate: formatDate(item.date)
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Umsatz (letzte 7 Tage)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="revenue"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

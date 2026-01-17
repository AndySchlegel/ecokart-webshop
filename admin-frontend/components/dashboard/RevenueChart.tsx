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
  period?: number; // 7 or 30 days
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

export function RevenueChart({ data, period = 7 }: RevenueChartProps) {
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

  // Check if data is empty or all zeros (Bug Fix: After fresh deploy, no orders exist)
  const hasData = data.length > 0 && data.some(item => item.revenue > 0);

  return (
    <div className="bg-bg-dark border-2 border-bg-darker rounded-lg shadow-md p-6 hover:border-accent-orange transition-all">
      <h3 className="text-lg font-semibold text-white mb-4">
        Umsatz (letzte {period} Tage)
      </h3>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">Keine Umsatzdaten verfügbar</p>
          <p className="text-sm mt-2">In den letzten {period} Tagen wurden keine Bestellungen mit Umsatz erfasst.</p>
          <p className="text-xs mt-1 opacity-75">💡 Tipp: Erstelle eine Test-Bestellung im Shop, um Daten anzuzeigen.</p>
        </div>
      ) : (
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
            fill="#ff6b00"
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}

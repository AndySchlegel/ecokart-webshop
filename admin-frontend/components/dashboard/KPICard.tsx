// ============================================================================
// KPI Card Component - Individual Metric Card with Trend Indicator
// ============================================================================
// Purpose: Reusable card component for displaying KPI metrics
//
// Features:
// - Title + Value display
// - Trend indicator (percentage change with arrow)
// - Color-coded trend (green = positive, red = negative)
// - Responsive design
// ============================================================================

'use client';

import React from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  trend: number;
  icon?: React.ReactNode;
  formatter?: (value: number) => string;
}

export function KPICard({ title, value, trend, icon, formatter }: KPICardProps) {
  const isPositive = trend >= 0;
  const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
  const trendBg = isPositive ? 'bg-green-50' : 'bg-red-50';
  const trendIcon = isPositive ? '↑' : '↓';

  const formattedValue = typeof value === 'number' && formatter
    ? formatter(value)
    : value;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header with Icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      {/* Value */}
      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900">{formattedValue}</p>
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trendBg} ${trendColor}`}>
          <span className="mr-1">{trendIcon}</span>
          {Math.abs(trend)}%
        </span>
        <span className="ml-2 text-xs text-gray-500">vs. vorherige Periode</span>
      </div>
    </div>
  );
}

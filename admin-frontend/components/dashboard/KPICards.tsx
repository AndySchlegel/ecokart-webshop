// ============================================================================
// KPI Cards Container - Dashboard Metrics Overview
// ============================================================================
// Purpose: Container component displaying all 4 KPI metrics
//
// Metrics:
// - Orders Today (with trend)
// - Revenue Today (with trend)
// - New Customers (7 days, with trend)
// - Average Order Value (with trend)
// ============================================================================

'use client';

import React from 'react';
import { KPICard } from './KPICard';

export interface AdminStats {
  ordersToday: number;
  ordersTrend: number;
  revenueToday: number;
  revenueTrend: number;
  newCustomers7d: number;
  customersTrend: number;
  averageOrderValue: number;
  aovTrend: number;
}

interface KPICardsProps {
  stats: AdminStats;
}

export function KPICards({ stats }: KPICardsProps) {
  // Formatters
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Orders Today */}
      <KPICard
        title="Bestellungen Heute"
        value={stats.ordersToday}
        trend={stats.ordersTrend}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
      />

      {/* Revenue Today */}
      <KPICard
        title="Umsatz Heute"
        value={stats.revenueToday}
        trend={stats.revenueTrend}
        formatter={formatCurrency}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* New Customers (7 days) */}
      <KPICard
        title="Neue Kunden (7 Tage)"
        value={stats.newCustomers7d}
        trend={stats.customersTrend}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
      />

      {/* Average Order Value */}
      <KPICard
        title="Durchschnittlicher Bestellwert"
        value={stats.averageOrderValue}
        trend={stats.aovTrend}
        formatter={formatCurrency}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  );
}

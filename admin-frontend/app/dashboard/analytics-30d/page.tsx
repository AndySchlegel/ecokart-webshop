// ============================================================================
// Dashboard Analytics 30-Day Page - Extended Analytics View
// ============================================================================
// Purpose: Extended dashboard page displaying 30-day KPIs, charts, and alerts
//
// Features:
// - Real-time KPI metrics (Orders, Revenue, Customers, AOV)
// - Revenue 30-day chart
// - Top 5 products
// - Low stock alerts
// - Auto-refresh every 60 seconds
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { KPICards, type AdminStats } from '@/components/dashboard/KPICards';
import { RevenueChart, type RevenueDataPoint } from '@/components/dashboard/RevenueChart';
import { TopProducts, type TopProduct } from '@/components/dashboard/TopProducts';
import { LowStockAlert, type LowStockProduct } from '@/components/dashboard/LowStockAlert';

// API Base URL (server-side ADMIN_API_URL takes precedence, fallback to client-side NEXT_PUBLIC_API_URL)
const BASE_URL = process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_URL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export default function Dashboard30DaysPage() {
  // State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Fetch all data in parallel
      const [statsRes, revenueRes, topProductsRes, lowStockRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`),
        fetch(`${API_URL}/api/admin/analytics/revenue-30d`),
        fetch(`${API_URL}/api/admin/analytics/top-products?limit=5`),
        fetch(`${API_URL}/api/admin/products/low-stock?threshold=10`)
      ]);

      // Check for errors
      if (!statsRes.ok || !revenueRes.ok || !topProductsRes.ok || !lowStockRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      // Parse responses
      const statsData = await statsRes.json();
      const revenueDataResponse = await revenueRes.json();
      const topProductsResponse = await topProductsRes.json();
      const lowStockResponse = await lowStockRes.json();

      // Update state
      setStats(statsData);
      setRevenueData(revenueDataResponse.data);
      setTopProducts(topProductsResponse.products);
      setLowStockProducts(lowStockResponse.products);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Fehler beim Laden der Dashboard-Daten');
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto mb-4"></div>
            <p className="text-gray-400">Lade Dashboard-Daten...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold">Fehler</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              fetchDashboardData();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard (30 Tage)</h1>
            <p className="text-gray-400 mt-1">Erweiterte Übersicht über Ihre wichtigsten Kennzahlen</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Letzte Aktualisierung: {lastUpdate.toLocaleTimeString('de-DE')}
            </p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-sm text-accent-orange hover:text-orange-500 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Aktualisieren
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && <KPICards stats={stats} />}

      {/* Charts and Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <RevenueChart data={revenueData} period={30} />

        {/* Top Products */}
        <TopProducts products={topProducts} />
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert products={lowStockProducts} />
    </div>
  );
}

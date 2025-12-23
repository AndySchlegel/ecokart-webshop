// ============================================================================
// Analytics Service - Dashboard Metrics & Statistics
// ============================================================================
// Purpose: Aggregierte Business Metrics für Admin Dashboard
//
// Features:
// - KPI Stats (Orders, Revenue, Customers, AOV)
// - Revenue 7 Days (für Chart)
// - Top Products (meistverkaufte)
// - Trend Calculation (vs. previous period)
// ============================================================================

import database from '../config/database-adapter';
import type { Order } from '../models/Order';
import { logger } from '../utils/logger';

// ============================================================================
// Admin Stats - KPI Metrics für Dashboard Cards
// ============================================================================

export interface AdminStats {
  ordersToday: number;
  ordersTrend: number;  // Prozent vs. gestern
  revenueToday: number;
  revenueTrend: number;
  newCustomers7d: number;
  customersTrend: number;
  averageOrderValue: number;
  aovTrend: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    logger.info('Fetching admin stats');

    // Get all orders
    const allOrders = await database.getAllOrders();

    // Get date strings for filtering
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];

    // Filter orders by date
    const ordersToday = allOrders.filter(o => o.createdAt.startsWith(today));
    const ordersYesterday = allOrders.filter(o => o.createdAt.startsWith(yesterday));
    const orders7d = allOrders.filter(o => o.createdAt >= sevenDaysAgo);
    const orders14d = allOrders.filter(o =>
      o.createdAt >= fourteenDaysAgo && o.createdAt < sevenDaysAgo
    );

    // Calculate metrics for today
    const orderCountToday = ordersToday.length;
    const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0);

    // Calculate metrics for yesterday (for trend)
    const orderCountYesterday = ordersYesterday.length;
    const revenueYesterday = ordersYesterday.reduce((sum, o) => sum + o.total, 0);

    // Calculate trends
    const ordersTrend = calculateTrend(orderCountToday, orderCountYesterday);
    const revenueTrend = calculateTrend(revenueToday, revenueYesterday);

    // Calculate Average Order Value (AOV)
    const aovToday = orderCountToday > 0 ? revenueToday / orderCountToday : 0;
    const aovYesterday = orderCountYesterday > 0 ? revenueYesterday / orderCountYesterday : 0;
    const aovTrend = calculateTrend(aovToday, aovYesterday);

    // Get unique customers (last 7 days vs. previous 7 days)
    const uniqueCustomers7d = new Set(orders7d.map(o => o.userId)).size;
    const uniqueCustomers14d = new Set(orders14d.map(o => o.userId)).size;
    const customersTrend = calculateTrend(uniqueCustomers7d, uniqueCustomers14d);

    const stats: AdminStats = {
      ordersToday: orderCountToday,
      ordersTrend,
      revenueToday,
      revenueTrend,
      newCustomers7d: uniqueCustomers7d,
      customersTrend,
      averageOrderValue: aovToday,
      aovTrend
    };

    logger.info('Admin stats calculated', { stats });
    return stats;
  } catch (error) {
    logger.error('Failed to fetch admin stats', {}, error as Error);
    throw error;
  }
}

// ============================================================================
// Revenue 7 Days - Data für Bar Chart
// ============================================================================

export interface RevenueDataPoint {
  date: string;  // YYYY-MM-DD
  revenue: number;
}

export async function getRevenue7d(): Promise<RevenueDataPoint[]> {
  try {
    logger.info('Fetching revenue for last 7 days');

    const allOrders = await database.getAllOrders();

    // Get date strings for last 7 days
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Group orders by date and calculate revenue
    const revenueByDate = dates.map(date => {
      const ordersOnDate = allOrders.filter(o => o.createdAt.startsWith(date));
      const revenue = ordersOnDate.reduce((sum, o) => sum + o.total, 0);

      return {
        date,
        revenue
      };
    });

    logger.info('Revenue 7d calculated', { dataPoints: revenueByDate.length });
    return revenueByDate;
  } catch (error) {
    logger.error('Failed to fetch revenue 7d', {}, error as Error);
    throw error;
  }
}

// ============================================================================
// Top Products - Meistverkaufte Produkte
// ============================================================================

export interface TopProduct {
  id: string;
  name: string;
  salesCount: number;
}

export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
  try {
    logger.info('Fetching top products', { limit });

    const allOrders = await database.getAllOrders();

    // Count sales per product
    const productSales = new Map<string, { name: string; count: number }>();

    allOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.count += item.quantity;
        } else {
          productSales.set(item.productId, {
            name: item.name,
            count: item.quantity
          });
        }
      });
    });

    // Convert to array and sort by count
    const topProducts: TopProduct[] = Array.from(productSales.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        salesCount: data.count
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, limit);

    logger.info('Top products calculated', { count: topProducts.length });
    return topProducts;
  } catch (error) {
    logger.error('Failed to fetch top products', {}, error as Error);
    throw error;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate percentage trend between current and previous value
 * Returns percentage change (e.g., 20 = +20%, -15 = -15%)
 */
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

// ============================================================================
// Exports
// ============================================================================

export const analyticsService = {
  getAdminStats,
  getRevenue7d,
  getTopProducts
};

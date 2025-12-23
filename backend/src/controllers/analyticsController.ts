// ============================================================================
// Analytics Controller - API Endpoints für Admin Dashboard
// ============================================================================
// Purpose: REST API Endpoints für Dashboard Metriken
//
// Endpoints:
// - GET /api/admin/stats - KPI Stats (Orders, Revenue, etc.)
// - GET /api/admin/analytics/revenue-7d - Revenue Chart Data
// - GET /api/admin/analytics/top-products - Top Selling Products
// ============================================================================

import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';
import { logger } from '../utils/logger';

// ============================================================================
// GET /api/admin/stats
// ============================================================================

/**
 * Get aggregated KPI stats for dashboard cards
 */
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Admin stats requested', { action: 'getAdminStats' });

    const stats = await analyticsService.getAdminStats();

    res.json(stats);
  } catch (error) {
    logger.error('Failed to get admin stats', { action: 'getAdminStats' }, error as Error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
};

// ============================================================================
// GET /api/admin/analytics/revenue-7d
// ============================================================================

/**
 * Get revenue data for last 7 days (for bar chart)
 */
export const getRevenue7d = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Revenue 7d requested', { action: 'getRevenue7d' });

    const data = await analyticsService.getRevenue7d();

    res.json({ data });
  } catch (error) {
    logger.error('Failed to get revenue 7d', { action: 'getRevenue7d' }, error as Error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
};

// ============================================================================
// GET /api/admin/analytics/top-products
// ============================================================================

/**
 * Get top selling products
 * Query params: ?limit=5 (default)
 */
export const getTopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    logger.info('Top products requested', { action: 'getTopProducts', limit });

    const products = await analyticsService.getTopProducts(limit);

    res.json({ products });
  } catch (error) {
    logger.error('Failed to get top products', { action: 'getTopProducts' }, error as Error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
};

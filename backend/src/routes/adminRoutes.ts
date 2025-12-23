// ============================================================================
// Admin Routes - Dashboard & Analytics Endpoints
// ============================================================================
// Purpose: Admin-only endpoints für Dashboard, Analytics, Management
//
// Routes:
// - GET /api/admin/stats - KPI Statistics
// - GET /api/admin/analytics/revenue-7d - Revenue Chart Data
// - GET /api/admin/analytics/top-products - Top Selling Products
// - GET /api/admin/products/low-stock - Low Stock Alert
// ============================================================================

import express from 'express';
import * as analyticsController from '../controllers/analyticsController';
import * as productController from '../controllers/productController';

const router = express.Router();

// ============================================================================
// Analytics Endpoints
// ============================================================================

// KPI Stats for dashboard cards
router.get('/stats', analyticsController.getAdminStats);

// Revenue data for bar chart (last 7 days)
router.get('/analytics/revenue-7d', analyticsController.getRevenue7d);

// Top selling products
router.get('/analytics/top-products', analyticsController.getTopProducts);

// ============================================================================
// Product Management Endpoints
// ============================================================================

// Low stock products alert
router.get('/products/low-stock', productController.getLowStockProducts);

// ============================================================================
// Exports
// ============================================================================

export default router;

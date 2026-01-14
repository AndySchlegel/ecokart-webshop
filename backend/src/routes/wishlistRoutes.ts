// ============================================================================
// 🛣️ WISHLIST ROUTES - API Endpoints für Wishlist/Favoriten
// ============================================================================

import { Router } from 'express';
import * as wishlistController from '../controllers/wishlistController';
import { requireAuth } from '../middleware/cognitoJwtAuth';

const router = Router();

// ============================================================================
// 🔒 ALLE ROUTES BENÖTIGEN AUTHENTIFIZIERUNG
// ============================================================================
router.use(requireAuth);

// ============================================================================
// WISHLIST ENDPOINTS
// ============================================================================

/**
 * GET /api/wishlist
 * Get user's wishlist with full product details
 * Returns: { items: Product[] }
 */
router.get('/', wishlistController.getWishlist);

/**
 * POST /api/wishlist
 * Add product to wishlist
 * Body: { productId: string }
 * Returns: { message: string, item: WishlistItem }
 */
router.post('/', wishlistController.addItem);

/**
 * DELETE /api/wishlist/:productId
 * Remove product from wishlist
 * Returns: { message: string }
 */
router.delete('/:productId', wishlistController.removeItem);

/**
 * POST /api/wishlist/toggle
 * Smart toggle - add if not in wishlist, remove if in wishlist
 * Body: { productId: string }
 * Returns: { message: string, action: 'added'|'removed', inWishlist: boolean }
 */
router.post('/toggle', wishlistController.toggleItem);

export default router;

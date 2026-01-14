// ============================================================================
// 📦 WISHLIST CONTROLLER - Business-Logik für Wishlist/Favoriten
// ============================================================================
// Folgt dem Pattern von orderController.ts und cartController.ts

import { Request, Response } from 'express';
import { wishlistsService } from '../services/dynamodb/wishlists.service';
import { productsService } from '../services/dynamodb/products.service';
import { logger } from '../utils/logger';
import { AddToWishlistInput, ToggleWishlistInput } from '../models/Wishlist';

// ============================================================================
// 📋 FUNKTION 1: Wishlist abrufen (mit Product Details)
// ============================================================================
/**
 * GET /api/wishlist - Liste aller Favoriten des Users (mit Product Details)
 * - Fetch productIds from wishlist
 * - Hydrate with full product details
 */
export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get wishlist productIds
    const productIds = await wishlistsService.getWishlistByUserId(userId);

    // If empty wishlist, return empty array
    if (productIds.length === 0) {
      res.json({ items: [] });
      return;
    }

    // Fetch full product details for each productId
    const products = await Promise.all(
      productIds.map(async (productId) => {
        try {
          return await productsService.getById(productId);
        } catch (error) {
          logger.error('Failed to fetch product for wishlist', { productId }, error as Error);
          return null;
        }
      })
    );

    // Filter out null values (products that couldn't be fetched)
    const validProducts = products.filter(p => p !== null);

    res.json({ items: validProducts });

  } catch (error) {
    logger.error('Failed to get wishlist', { action: 'getWishlist', userId: req.user?.userId }, error as Error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
};

// ============================================================================
// 📋 FUNKTION 2: Produkt zur Wishlist hinzufügen
// ============================================================================
/**
 * POST /api/wishlist - Produkt zur Wishlist hinzufügen
 * Body: { productId: string }
 */
export const addItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { productId }: AddToWishlistInput = req.body;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    // Verify product exists
    const product = await productsService.getById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if already in wishlist
    const alreadyInWishlist = await wishlistsService.isInWishlist(userId, productId);
    if (alreadyInWishlist) {
      res.status(409).json({ error: 'Product already in wishlist' });
      return;
    }

    // Add to wishlist
    const wishlistItem = await wishlistsService.addToWishlist(userId, productId);

    res.status(201).json({
      message: 'Added to wishlist',
      item: wishlistItem,
    });

  } catch (error) {
    logger.error('Failed to add to wishlist', {
      action: 'addItem',
      userId: req.user?.userId,
      productId: req.body.productId,
    }, error as Error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

// ============================================================================
// 📋 FUNKTION 3: Produkt aus Wishlist entfernen
// ============================================================================
/**
 * DELETE /api/wishlist/:productId - Produkt aus Wishlist entfernen
 */
export const removeItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { productId } = req.params;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    // Remove from wishlist (no check if exists, DynamoDB DeleteItem is idempotent)
    await wishlistsService.removeFromWishlist(userId, productId);

    res.json({ message: 'Removed from wishlist' });

  } catch (error) {
    logger.error('Failed to remove from wishlist', {
      action: 'removeItem',
      userId: req.user?.userId,
      productId: req.params.productId,
    }, error as Error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};

// ============================================================================
// 📋 FUNKTION 4: Wishlist-Item togglen (Smart Add/Remove)
// ============================================================================
/**
 * POST /api/wishlist/toggle - Smart toggle (add if not in wishlist, remove if in wishlist)
 * Body: { productId: string }
 */
export const toggleItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { productId }: ToggleWishlistInput = req.body;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    // Verify product exists
    const product = await productsService.getById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check current state
    const isInWishlist = await wishlistsService.isInWishlist(userId, productId);

    if (isInWishlist) {
      // Remove from wishlist
      await wishlistsService.removeFromWishlist(userId, productId);
      res.json({
        message: 'Removed from wishlist',
        action: 'removed',
        inWishlist: false,
      });
    } else {
      // Add to wishlist
      const wishlistItem = await wishlistsService.addToWishlist(userId, productId);
      res.json({
        message: 'Added to wishlist',
        action: 'added',
        inWishlist: true,
        item: wishlistItem,
      });
    }

  } catch (error) {
    logger.error('Failed to toggle wishlist', {
      action: 'toggleItem',
      userId: req.user?.userId,
      productId: req.body.productId,
    }, error as Error);
    res.status(500).json({ error: 'Failed to toggle wishlist' });
  }
};

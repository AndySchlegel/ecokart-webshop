// ============================================================================
// WISHLISTS SERVICE - DynamoDB Operations für Wishlist
// ============================================================================
// Folgt dem Pattern von orders.service.ts

import { GetCommand, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TableNames } from './client';
import { WishlistItem } from '../../models/Wishlist';

export class WishlistsService {
  /**
   * Add product to user's wishlist
   * Creates a new WishlistItem with composite key (userId, productId)
   */
  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    const now = new Date().toISOString();

    const wishlistItem: WishlistItem = {
      userId,
      productId,
      addedAt: now,
      updatedAt: now,
    };

    await dynamodb.send(new PutCommand({
      TableName: TableNames.WISHLISTS,
      Item: wishlistItem,
    }));

    return wishlistItem;
  }

  /**
   * Remove product from user's wishlist
   */
  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await dynamodb.send(new DeleteCommand({
      TableName: TableNames.WISHLISTS,
      Key: {
        userId,
        productId,
      },
    }));
  }

  /**
   * Get all wishlist items for a user (returns productIds)
   * Sorted by addedAt descending (newest first)
   */
  async getWishlistByUserId(userId: string): Promise<string[]> {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TableNames.WISHLISTS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Sort by addedAt descending
    }));

    const items = (result.Items || []) as WishlistItem[];
    return items.map(item => item.productId);
  }

  /**
   * Check if a product is in user's wishlist
   */
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const result = await dynamodb.send(new GetCommand({
      TableName: TableNames.WISHLISTS,
      Key: {
        userId,
        productId,
      },
    }));

    return !!result.Item;
  }

  /**
   * Get full wishlist items (with timestamps) for a user
   * Used for admin or detailed views
   */
  async getFullWishlistByUserId(userId: string): Promise<WishlistItem[]> {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TableNames.WISHLISTS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
    }));

    return (result.Items || []) as WishlistItem[];
  }
}

export const wishlistsService = new WishlistsService();

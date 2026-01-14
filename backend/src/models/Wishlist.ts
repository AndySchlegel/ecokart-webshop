// ============================================================================
// WISHLIST MODEL - TypeScript Interfaces
// ============================================================================

/**
 * WishlistItem - Einzelnes Item in der Wishlist
 *
 * DynamoDB Schema:
 * - Partition Key: userId (String)
 * - Sort Key: productId (String)
 * - GSI: ProductWishlistIndex (productId + addedAt)
 */
export interface WishlistItem {
  userId: string;      // Cognito User ID (PK)
  productId: string;   // Product UUID (SK)
  addedAt: string;     // ISO timestamp (für GSI)
  updatedAt: string;   // ISO timestamp
}

/**
 * AddToWishlistInput - Input für POST /api/wishlist
 */
export interface AddToWishlistInput {
  productId: string;   // Product UUID zum hinzufügen
}

/**
 * RemoveFromWishlistInput - Input für DELETE /api/wishlist/:productId
 * (productId kommt aus URL params, kein Body benötigt)
 */

/**
 * ToggleWishlistInput - Input für POST /api/wishlist/toggle
 * Smart add/remove based on current state
 */
export interface ToggleWishlistInput {
  productId: string;   // Product UUID
}

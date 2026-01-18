export type Article = {
  id: string;
  name: string;
  price: number;
  description?: string; // ✅ Optional (compatible with Product type from WishlistContext)
  imageUrl: string;
  category?: string;
  stock?: number; // ✅ NEU: Available inventory
  reserved?: number; // ✅ NEU: Reserved in carts
  rating?: number; // 0-5 stars
  reviewCount?: number; // number of reviews
  originalPrice?: number; // ✅ Phase 3: Originalpreis für Sale-Produkte
};

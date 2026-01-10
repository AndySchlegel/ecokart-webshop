export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category?: string;
  stock?: number;
  reserved?: number; // ← Für Inventory Management
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
  // Phase 3: Tagging & Categorization
  targetGroup?: 'kinder' | 'männer' | 'frauen' | 'unisex'; // Zielgruppe
  tags?: string[]; // ["bestseller", "bio", "vegan", "winter"]
  searchTerms?: string[]; // ["sneaker", "turnschuh", "laufschuh"]
}

export interface ProductCreateInput {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category?: string;
  stock?: number;
  reserved?: number;
  rating?: number;
  reviewCount?: number;
  targetGroup?: 'kinder' | 'männer' | 'frauen' | 'unisex';
  tags?: string[];
  searchTerms?: string[];
}

export interface ProductUpdateInput {
  name?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  stock?: number;
  reserved?: number;
  rating?: number;
  reviewCount?: number;
  targetGroup?: 'kinder' | 'männer' | 'frauen' | 'unisex';
  tags?: string[];
  searchTerms?: string[];
}

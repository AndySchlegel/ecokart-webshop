import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/database-adapter';
import { Product, ProductCreateInput, ProductUpdateInput } from '../models/Product';
import { logger } from '../utils/logger';

/**
 * Converts relative image URLs to absolute CloudFront URLs
 * Leaves external URLs (Unsplash, etc.) unchanged
 */
function convertImageUrl(imageUrl: string): string {
  const assetsBaseUrl = process.env.ASSETS_BASE_URL || '';

  if (imageUrl && imageUrl.startsWith('/')) {
    // Relative path → convert to absolute CloudFront URL
    // e.g. /images/product.jpg → https://cloudfront-domain/images/product.jpg
    return `${assetsBaseUrl}${imageUrl}`;
  }

  // External URL (Unsplash, etc.) → return as-is
  return imageUrl;
}

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await database.getAllProducts();

    // Convert relative imageUrls to absolute CloudFront URLs for frontend
    const productsWithAbsoluteUrls = products.map(product => ({
      ...product,
      imageUrl: convertImageUrl(product.imageUrl)
    }));

    res.json({ items: productsWithAbsoluteUrls, count: productsWithAbsoluteUrls.length });
  } catch (error) {
    logger.error('Failed to fetch products', { action: 'getAllProducts' }, error as Error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await database.getProductById(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Convert relative imageUrl to absolute CloudFront URL for frontend
    const productWithAbsoluteUrl = {
      ...product,
      imageUrl: convertImageUrl(product.imageUrl)
    };

    res.json(productWithAbsoluteUrl);
  } catch (error) {
    logger.error('Failed to fetch product', { action: 'getProductById', productId: req.params.id }, error as Error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const input: ProductCreateInput = req.body;

    if (!input.name || !input.price || !input.description || !input.imageUrl) {
      res.status(400).json({ error: 'Missing required fields: name, price, description, imageUrl' });
      return;
    }

    const newProduct: Product = {
      id: uuidv4(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await database.createProduct(newProduct);
    res.status(201).json(created);
  } catch (error) {
    logger.error('Failed to create product', { action: 'createProduct', input: req.body }, error as Error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: ProductUpdateInput = req.body;

    const updated = await database.updateProduct(id, updates);

    if (!updated) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(updated);
  } catch (error) {
    logger.error('Failed to update product', { action: 'updateProduct', productId: req.params.id }, error as Error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await database.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete product', { action: 'deleteProduct', productId: req.params.id }, error as Error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// ============================================================================
// GET /api/admin/products/low-stock
// ============================================================================

/**
 * Get products with low stock (below threshold)
 * Query params: ?threshold=10 (default)
 */
export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;

    logger.info('Low stock products requested', { action: 'getLowStockProducts', threshold });

    const allProducts = await database.getAllProducts();

    // Filter products below threshold and sort by stock (lowest first)
    const lowStockProducts = allProducts
      .filter(product => typeof product.stock === 'number' && product.stock < threshold)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
      .map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock ?? 0
      }));

    logger.info('Low stock products found', { count: lowStockProducts.length });

    res.json({ products: lowStockProducts });
  } catch (error) {
    logger.error('Failed to get low stock products', { action: 'getLowStockProducts' }, error as Error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
};

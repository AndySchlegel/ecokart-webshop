import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} from '../controllers/productController';

const router = Router();

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/search - Advanced search with filters
// IMPORTANT: Must be BEFORE /:id route to avoid "search" being treated as an ID
router.get('/search', searchProducts);

// GET /api/products/:id - Get single product
router.get('/:id', getProductById);

// POST /api/products - Create new product
router.post('/', createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct);

export default router;

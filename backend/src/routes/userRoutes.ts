/**
 * User Routes
 * Routes for user profile management
 */

import { Router } from 'express';
import * as userController from '../controllers/userController';
import { requireAuth } from '../middleware/cognitoJwtAuth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/users/profile - Get user profile
router.get('/profile', userController.getProfile);

// PATCH /api/users/profile - Update user profile
router.patch('/profile', userController.updateProfile);

export default router;

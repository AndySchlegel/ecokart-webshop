/**
 * User Controller
 * Handles user profile operations
 */

import { Request, Response } from 'express';
import databaseAdapter from '../config/database-adapter';
import { logger } from '../utils/logger';

/**
 * GET /api/users/profile
 * Get user profile information
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch user from database
    const user = await databaseAdapter.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return user profile (without sensitive data)
    res.json({
      userId: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  } catch (error) {
    logger.error('Failed to fetch user profile', { userId: req.user?.userId }, error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /api/users/profile
 * Update user profile (name only for now)
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Update user in database
    const updatedUser = await databaseAdapter.updateUser(userId, { name: name.trim() });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return updated profile
    res.json({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    logger.error('Failed to update user profile', { userId: req.user?.userId }, error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

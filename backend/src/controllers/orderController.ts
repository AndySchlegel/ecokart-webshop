// ============================================================================
// 📦 ORDER CONTROLLER - Business-Logik für Bestellungen
// ============================================================================
// Diese Datei enthält alle Order-Funktionen (erstellen, abrufen, Status ändern).
//
// 📌 HINWEIS: Wichtige Konzepte sind bereits in cartController.ts erklärt:
//    - Cognito Auth (req.user?.userId)
//    - Stock Management (reserved vs stock)
//    - Error Codes (401, 404, 400, 500)
//
// ⚠️ WICHTIG: Bei Order-Erstellung wird Stock DAUERHAFT reduziert!
//    - reserved wird um X reduziert (Produkt nicht mehr im Cart)
//    - stock wird um X reduziert (Produkt verkauft)
//    - Beispiel: stock=100, reserved=15 → Nach Order: stock=99, reserved=14
// ============================================================================

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/database-adapter';
import { Order, CreateOrderInput } from '../models/Order';
import { logger } from '../utils/logger';

// ============================================================================
// 📋 FUNKTION 1: Bestellung erstellen
// ============================================================================
/**
 * POST /api/orders - Neue Bestellung erstellen
 * - Reduziert Stock DAUERHAFT (stock - X, reserved - X)
 * - Leert Cart nach erfolgreicher Bestellung
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { items, shippingAddress, totalAmount }: CreateOrderInput = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item' });
      return;
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      res.status(400).json({ error: 'Complete shipping address is required' });
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      res.status(400).json({ error: 'Valid total is required' });
      return;
    }

    const newOrder: Order = {
      id: uuidv4(),
      userId,
      items,
      totalAmount,
      shippingAddress,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await database.createOrder(newOrder);

    // ✅ INVENTORY: Decrease stock for each item (stock and reserved)
    for (const item of items) {
      await database.decreaseStock(item.productId, item.quantity);
    }

    // Clear the user's cart after successful order
    const cart = await database.getCartByUserId(userId);
    if (cart) {
      await database.updateCart(userId, { items: [] });
    }

    res.status(201).json(created);
  } catch (error) {
    logger.error('Failed to create order', {
      action: 'createOrder',
      userId: req.user?.userId,
      itemCount: req.body.items?.length,
      totalAmount: req.body.totalAmount
    }, error as Error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// ============================================================================
// 📋 FUNKTION 2: Alle Bestellungen des Users abrufen
// ============================================================================
/**
 * GET /api/orders - Liste aller Bestellungen des aktuellen Users
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // User-Authentifizierung
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Alle Orders des Users aus DynamoDB laden
    const rawOrders = await database.getOrdersByUserId(userId);

    // Map old 'total' field to 'totalAmount' for backward compatibility
    const orders = rawOrders.map((order: any) => ({
      ...order,
      totalAmount: order.totalAmount ?? order.total ?? 0
    }));

    res.json({ orders });  // Fixed: Wrap in object for consistent API response

  } catch (error) {
    logger.error('Failed to get orders', { action: 'getOrders', userId: req.user?.userId }, error as Error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// ============================================================================
// 📋 FUNKTION 3: Einzelne Bestellung abrufen (mit Zugriffskontrolle)
// ============================================================================
/**
 * GET /api/orders/:id - Einzelne Bestellung abrufen
 * - Prüft dass User nur EIGENE Orders abrufen kann (Security!)
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    // User-Authentifizierung
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const rawOrder = await database.getOrderById(id);

    if (!rawOrder) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // ⚠️ SICHERHEIT: User darf nur eigene Orders sehen!
    // Wenn order.userId nicht mit eingeloggtem User übereinstimmt → 403 Forbidden
    if (rawOrder.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Map old 'total' field to 'totalAmount' for backward compatibility
    const order = {
      ...rawOrder,
      totalAmount: (rawOrder as any).totalAmount ?? (rawOrder as any).total ?? 0
    };

    res.json(order);

  } catch (error) {
    logger.error('Failed to get order', {
      action: 'getOrderById',
      userId: req.user?.userId,
      orderId: req.params.id
    }, error as Error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// ============================================================================
// 📋 FUNKTION 4: Order-Status ändern
// ============================================================================
/**
 * PATCH /api/orders/:id/status - Order-Status aktualisieren
 * - Erlaubte Status: pending, processing, shipped, delivered, cancelled
 * - Prüft dass User nur EIGENE Orders ändern kann
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // User-Authentifizierung
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    // Status-Validierung
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Valid status is required', validStatuses });
      return;
    }

    // Order laden
    const order = await database.getOrderById(id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // ⚠️ SICHERHEIT: User darf nur eigene Orders ändern!
    if (order.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Status aktualisieren
    const updated = await database.updateOrder(id, { status });
    res.json(updated);

  } catch (error) {
    logger.error('Failed to update order status', {
      action: 'updateOrderStatus',
      userId: req.user?.userId,
      orderId: req.params.id,
      newStatus: req.body.status
    }, error as Error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

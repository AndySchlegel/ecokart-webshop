// ============================================================================
// E-Mail Service - AWS SES Integration
// ============================================================================
// Purpose: Versenden von transaktionalen E-Mails via Amazon SES
//
// Features:
// - Order Confirmation E-Mails (mit Template)
// - Welcome E-Mails (optional)
// - Error Handling & Logging
// ============================================================================

import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';
import { logger } from '../utils/logger';
import type { Order } from '../models/Order';

// SES Client initialisieren
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'eu-central-1',
});

// ============================================================================
// E-Mail Service Interface
// ============================================================================

export interface OrderConfirmationEmailData {
  order: Order;
  customerEmail: string;
  customerName: string;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  shopUrl: string;
}

// ============================================================================
// Order Confirmation E-Mail
// ============================================================================

/**
 * Sendet Order Confirmation E-Mail an Kunde
 *
 * @param data - Order Daten + Customer Info
 * @returns Promise<void>
 *
 * Template Variables:
 * - customerName: Name des Kunden
 * - orderId: Order ID
 * - items: Array von Order Items
 * - totalAmount: Gesamtsumme
 * - shippingAddress: Lieferadresse
 * - orderTrackingUrl: Link zum Order Tracking
 */
export async function sendOrderConfirmationEmail(
  data: OrderConfirmationEmailData
): Promise<void> {
  const { order, customerEmail, customerName } = data;

  try {
    logger.info('Sending order confirmation email', {
      orderId: order.id,
      customerEmail,
    });

    // SES Sender E-Mail aus Environment Variable
    const senderEmail = process.env.SES_SENDER_EMAIL;
    if (!senderEmail) {
      throw new Error('SES_SENDER_EMAIL environment variable not set');
    }

    // Template Daten vorbereiten
    const templateData = {
      customerName,
      orderId: order.id,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price.toFixed(2),
        price: (item.price * item.quantity).toFixed(2),
      })),
      totalAmount: order.total.toFixed(2),
      shippingAddress: order.shippingAddress,
      orderTrackingUrl: `${process.env.FRONTEND_URL || 'https://shop.aws.his4irness23.de'}/orders/${order.id}`,
    };

    // SES SendTemplatedEmail Command
    const command = new SendTemplatedEmailCommand({
      Source: senderEmail, // FROM Adresse
      Destination: {
        ToAddresses: [customerEmail], // TO Adresse
      },
      Template: 'ecokart-order-confirmation', // Template Name (aus Terraform)
      TemplateData: JSON.stringify(templateData),
      // Configuration Set für Tracking (optional)
      ConfigurationSetName: `ecokart-${process.env.ENVIRONMENT || 'development'}`,
    });

    // E-Mail senden
    const response = await sesClient.send(command);

    logger.info('Order confirmation email sent successfully', {
      orderId: order.id,
      customerEmail,
      messageId: response.MessageId,
    });
  } catch (error) {
    // E-Mail Fehler sollen Order Creation NICHT blockieren!
    // Deshalb nur loggen, nicht werfen
    logger.error(
      'Failed to send order confirmation email',
      {
        orderId: order.id,
        customerEmail,
      },
      error instanceof Error ? error : undefined
    );

    // Optional: Hier könnte man ein Retry-Mechanismus einbauen
    // Oder E-Mail in DLQ (Dead Letter Queue) schreiben
  }
}

// ============================================================================
// Welcome E-Mail (optional)
// ============================================================================

/**
 * Sendet Welcome E-Mail an neuen User
 *
 * @param data - User Info
 * @returns Promise<void>
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData
): Promise<void> {
  const { userName, userEmail, shopUrl } = data;

  try {
    logger.info('Sending welcome email', { userEmail });

    const senderEmail = process.env.SES_SENDER_EMAIL;
    if (!senderEmail) {
      throw new Error('SES_SENDER_EMAIL environment variable not set');
    }

    const templateData = {
      userName,
      shopUrl,
    };

    const command = new SendTemplatedEmailCommand({
      Source: senderEmail,
      Destination: {
        ToAddresses: [userEmail],
      },
      Template: 'ecokart-welcome',
      TemplateData: JSON.stringify(templateData),
      ConfigurationSetName: `ecokart-${process.env.ENVIRONMENT || 'development'}`,
    });

    const response = await sesClient.send(command);

    logger.info('Welcome email sent successfully', {
      userEmail,
      messageId: response.MessageId,
    });
  } catch (error) {
    logger.error(
      'Failed to send welcome email',
      { userEmail },
      error instanceof Error ? error : undefined
    );
  }
}

// ============================================================================
// Exports
// ============================================================================

export const emailService = {
  sendOrderConfirmationEmail,
  sendWelcomeEmail,
};

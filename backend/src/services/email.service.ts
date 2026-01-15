// ============================================================================
// E-Mail Service - Resend Integration
// ============================================================================
// Purpose: Versenden von transaktionalen E-Mails via Resend
//
// Features:
// - Order Confirmation E-Mails (mit HTML Template)
// - Welcome E-Mails (optional)
// - Error Handling & Logging
//
// Migration: AWS SES → Resend (1. Januar 2026)
// Reason: AWS SES Production Access rejected, SendGrid rejected
// Solution: Resend (developer-friendly email service)
// ============================================================================

import { Resend } from 'resend';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';
import type { Order } from '../models/Order';

// Resend Client initialisieren
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================================
// Template Loading & Compilation
// ============================================================================

// Load HTML template from file
const orderConfirmationTemplateHtml = readFileSync(
  join(__dirname, '../templates/order-confirmation.html'),
  'utf-8'
);

// Compile Handlebars template
const orderConfirmationTemplate = Handlebars.compile(
  orderConfirmationTemplateHtml
);

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
    logger.info('Sending order confirmation email via Resend', {
      orderId: order.id,
      customerEmail,
    });

    // FROM Adresse aus Environment Variable
    const fromEmail = process.env.EMAIL_FROM || 'noreply@aws.his4irness23.de';

    // Template Daten vorbereiten
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://shop.aws.his4irness23.de';
    const assetsBaseUrl = process.env.ASSETS_BASE_URL || frontendUrl;

    const templateData = {
      customerName,
      orderId: order.id,
      items: order.items.map(item => {
        // Convert relative image paths to absolute URLs for email
        let imageUrl = item.imageUrl;

        if (imageUrl && imageUrl.startsWith('/')) {
          // Relative path → use ASSETS_BASE_URL (CloudFront)
          // e.g. /images/product.jpg → https://cloudfront-domain/images/product.jpg
          imageUrl = `${assetsBaseUrl}${imageUrl}`;
        }
        // External URLs (Unsplash, etc.) stay as-is

        return {
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price.toFixed(2),
          price: (item.price * item.quantity).toFixed(2),
          imageUrl, // Product image for email (absolute URL)
        };
      }),
      totalAmount: order.totalAmount.toFixed(2),
      shippingAddress: order.shippingAddress,
      orderTrackingUrl: `${frontendUrl}/orders/${order.id}`,
    };

    // DEBUG: Log template data to see if imageUrl is present
    logger.info('Email template data prepared', {
      orderId: order.id,
      itemCount: templateData.items.length,
      itemsWithImages: templateData.items.filter(item => item.imageUrl).length,
      firstItemImageUrl: templateData.items[0]?.imageUrl || 'MISSING',
    });

    // Render HTML template with Handlebars
    const html = orderConfirmationTemplate(templateData);

    // Send email via Resend
    const { data: resendData, error } = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: 'Deine AIR LEGACY Bestellung ist bestätigt',
      html,
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    logger.info('Order confirmation email sent successfully via Resend', {
      orderId: order.id,
      customerEmail,
      emailId: resendData?.id,
    });
  } catch (error) {
    // E-Mail Fehler sollen Order Creation NICHT blockieren!
    // Deshalb nur loggen, nicht werfen
    logger.error(
      'Failed to send order confirmation email via Resend',
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
 *
 * Note: Currently uses simple HTML instead of template
 * TODO: Create welcome email template if needed
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData
): Promise<void> {
  const { userName, userEmail, shopUrl } = data;

  try {
    logger.info('Sending welcome email via Resend', { userEmail });

    const fromEmail = process.env.EMAIL_FROM || 'noreply@aws.his4irness23.de';

    // Simple welcome email HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #fff; }
          .button { display: inline-block; background: #FF6B35; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AIR LEGACY</h1>
            <p>Willkommen bei uns!</p>
          </div>
          <div class="content">
            <h2>Hallo ${userName},</h2>
            <p>Willkommen bei AIR LEGACY! Wir freuen uns, dass du dabei bist.</p>
            <p>Entdecke jetzt unsere exklusive Kollektion:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${shopUrl}" class="button">Zum Shop</a>
            </p>
            <p>Bei Fragen sind wir jederzeit für dich da.</p>
            <p>Viel Spaß beim Shoppen!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data: resendData, error } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: 'Willkommen bei AIR LEGACY',
      html,
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    logger.info('Welcome email sent successfully via Resend', {
      userEmail,
      emailId: resendData?.id,
    });
  } catch (error) {
    logger.error(
      'Failed to send welcome email via Resend',
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

import { NotificationTemplate } from "@/lib/models";
import { renderTemplate, validateTemplateVariables } from "./template-renderer";
import { sendEmail } from "./email";
import { sendSMS } from "./sms";
import { logger } from "@/lib/logger";

/**
 * Default email templates (fallback if DB template not found or disabled)
 */
const DEFAULT_EMAIL_TEMPLATES: Record<
  string,
  { subject: string; body: string }
> = {
  order_confirmation: {
    subject: "Order Confirmation - {{orderNumber}}",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">Order Confirmed!</h1>
            <p>Thank you for your order, {{name}}. We've received your order and will begin processing it shortly.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Details</h2>
              <p><strong>Order Number:</strong> {{orderNumber}}</p>
              <p><strong>Total Amount:</strong> {{currency}} {{orderTotal}}</p>
            </div>
            
            <p>You will receive another email when your order ships.</p>
            
            <p>If you have any questions, please contact our customer service team.</p>
            
            <p>Best regards,<br>Toroglo Team</p>
          </div>
        </body>
      </html>
    `,
  },
  payment_confirmation: {
    subject: "Payment Confirmed - {{orderNumber}}",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">Payment Confirmed!</h1>
            <p>Your payment has been successfully processed.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Payment Details</h2>
              <p><strong>Order Number:</strong> {{orderNumber}}</p>
              <p><strong>Amount Paid:</strong> {{currency}} {{amount}}</p>
            </div>
            
            <p>Your order is now being processed and will be shipped soon.</p>
            
            <p>Best regards,<br>Toroglo Team</p>
          </div>
        </body>
      </html>
    `,
  },
  order_shipped: {
    subject: "Order Shipped - {{orderNumber}}",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Shipped</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2196F3;">Your Order Has Shipped!</h1>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Delivery Details</h2>
              <p><strong>Order Number:</strong> {{orderNumber}}</p>
              {{#if trackingNumber}}
              <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
              {{/if}}
            </div>
            
            <p>You can track your order status in your account or using the tracking number above.</p>
            
            <p>Best regards,<br>Toroglo Team</p>
          </div>
        </body>
      </html>
    `,
  },
  order_delivered: {
    subject: "Order Delivered - {{orderNumber}}",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Delivered</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">Your Order Has Been Delivered!</h1>
            <p>Your order has been successfully delivered.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Details</h2>
              <p><strong>Order Number:</strong> {{orderNumber}}</p>
            </div>
            
            <p>We hope you enjoy your purchase! If you have any questions or concerns, please don't hesitate to contact us.</p>
            
            <p>Thank you for shopping with us!</p>
            
            <p>Best regards,<br>Toroglo Team</p>
          </div>
        </body>
      </html>
    `,
  },
  otp: {
    subject: "Your Verification Code",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2196F3;">Verification Code</h1>
            <p>Your verification code is:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <h2 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #2196F3;">{{otp}}</h2>
            </div>
            
            <p>This code will expire in {{expiryMinutes}} minutes.</p>
            
            <p>If you didn't request this code, please ignore this email.</p>
            
            <p>Best regards,<br>Toroglo Team</p>
          </div>
        </body>
      </html>
    `,
  },
  account_welcome: {
    subject: "Welcome to Toroglo!",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Toroglo</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">Welcome, {{name}}!</h1>
            <p>Thank you for creating an account with Toroglo. We're excited to have you.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Browse our natural hair growth, wellness, and skincare products</li>
              <li>Save your favorite items and delivery addresses</li>
              <li>Track your orders and manage your account</li>
            </ul>
            
            <p>If you have any questions, visit our <a href="{{loginUrl}}">account page</a> or contact us.</p>
            
            <p>Best regards,<br>Toroglo Team</p>
          </div>
        </body>
      </html>
    `,
  },
  password_reset: {
    subject: "Reset Your Password",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2196F3;">Reset Your Password</h1>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetLink}}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{resetLink}}</p>
            
            <p>This link will expire in 1 hour.</p>
            
            <p>If you didn't request a password reset, please ignore this email.</p>
            
            <p>Best regards,<br>Toroglo Team</p>
          </div>
        </body>
      </html>
    `,
  },
  support_ticket_created: {
    subject: "Support Ticket Created - {{ticketNumber}}",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Support Ticket Created</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">Support Ticket Created</h1>
            <p>Hello {{firstName}},</p>
            <p>Thank you for contacting us. We've received your support request and will get back to you as soon as possible.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Ticket Details</h2>
              <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
              <p><strong>Subject:</strong> {{subject}}</p>
            </div>
            
            <p>You can track the status of your ticket using the ticket number above.</p>
            
            <p>We typically respond within 24 hours during business days.</p>
            
            <p>Best regards,<br>Toroglo Support Team</p>
          </div>
        </body>
      </html>
    `,
  },
  support_ticket_status_update: {
    subject: "Ticket Status Update - {{ticketNumber}}",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ticket Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2196F3;">Ticket Status Update</h1>
            <p>Hello {{firstName}},</p>
            <p>Your ticket status has been updated to {{status}}.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Ticket Details</h2>
              <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
              <p><strong>New Status:</strong> {{status}}</p>
            </div>
            
            <p>You can view your ticket and add responses in your account.</p>
            
            <p>Best regards,<br>Toroglo Support Team</p>
          </div>
        </body>
      </html>
    `,
  },
  support_ticket_response: {
    subject: "New Response - {{ticketNumber}}",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Response to Your Ticket</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2196F3;">New Response to Your Ticket</h1>
            <p>Hello {{firstName}},</p>
            <p>You have received a new response to your support ticket.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Ticket Details</h2>
              <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
              <p><strong>From:</strong> {{#if isFromAdmin}}Toroglo Support Team{{else}}Customer{{/if}}</p>
            </div>
            
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">{{message}}</p>
            </div>
            
            <p>You can respond to this ticket by logging into your account or replying to this email.</p>
            
            <p>Best regards,<br>Toroglo Support Team</p>
          </div>
        </body>
      </html>
    `,
  },
  admin_ticket_notification: {
    subject: "New Support Ticket - {{ticketNumber}} [{{priority}}]",
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Support Ticket</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #FF9800;">New Support Ticket</h1>
            <p>A new support ticket has been created and requires your attention.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Ticket Details</h2>
              <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
              <p><strong>Subject:</strong> {{subject}}</p>
              <p><strong>Priority:</strong> {{priority}}</p>
              <p><strong>Customer Email:</strong> {{customerEmail}}</p>
            </div>
            
            <p>Please review and respond to this ticket in the admin panel.</p>
            
            <p>Best regards,<br>Toroglo System</p>
          </div>
        </body>
      </html>
    `,
  },
};

/**
 * Default SMS templates (fallback if DB template not found or disabled)
 * These match the old SMS template system for consistency
 */
const DEFAULT_SMS_TEMPLATES: Record<string, string> = {
  order_confirmation:
    "Hi {{name}}, your order {{orderNumber}} has been confirmed. Total: {{currency}} {{orderTotal}}. We'll notify you when it ships. Thank you!",
  payment_confirmation:
    "Payment confirmed for order {{orderNumber}}. Amount: {{currency}} {{amount}}. Your order is being processed.",
  order_shipped:
    "Your order {{orderNumber}} has been shipped!{{#if trackingNumber}} Tracking: {{trackingNumber}}.{{/if}} Track in your account.",
  order_delivered:
    "Your order {{orderNumber}} has been delivered! We hope you enjoy your purchase. Thank you for shopping with Toroglo!",
  otp: "Your Toroglo verification code is: {{otp}}. This code expires in {{expiryMinutes}} minutes.",
  account_welcome:
    "Welcome to Toroglo, {{name}}! Your account is ready. Browse products and track orders at toroglo.com. Thank you!",
  // Additional event types for backward compatibility
  order_confirmed:
    "Hi {{name}}, your order {{orderNumber}} ({{currency}} {{orderTotal}}) has been confirmed and is being prepared.",
  order_processing:
    "Hi {{name}}, your order {{orderNumber}} is now being processed. Expected delivery: {{estimatedDelivery}}.",
  order_cancelled:
    "Hi {{name}}, your order {{orderNumber}} has been cancelled. Refund of {{currency}} {{refundAmount}} will be processed if applicable.",
  order_refunded:
    "Hi {{name}}, refund of {{currency}} {{refundAmount}} for order {{orderNumber}} has been processed via {{refundMethod}}.",
  password_reset:
    "Hi {{name}}, reset your password: {{resetLink}}. Link expires in {{expiryMinutes}} minutes.",
  support_ticket_created:
    "Hi {{name}}, we've received your support request (Ticket: {{ticketNumber}}). We'll respond within 24 hours.",
  support_ticket_status_update:
    "Hi {{name}}, your ticket {{ticketNumber}} status has been updated to {{status}}.",
  support_ticket_response:
    "Hi {{name}}, you have a new response to ticket {{ticketNumber}}. Check your account for details.",
};

/**
 * Send a templated email notification
 */
export async function sendTemplatedEmail(
  event: string,
  data: Record<string, any>,
): Promise<void> {
  try {
    // Try to get template from database
    const template = await NotificationTemplate.findOne({
      channel: "email",
      event,
      isEnabled: true,
      locale: data.locale || "en",
    });

    let subject: string;
    let body: string;

    if (template) {
      // Use database template
      subject = renderTemplate(template.subject || "", data);
      body = renderTemplate(template.body, data);
    } else {
      // Fallback to default template
      const defaultTemplate = DEFAULT_EMAIL_TEMPLATES[event];
      if (!defaultTemplate) {
        throw new Error(`No email template found for event: ${event}`);
      }
      subject = renderTemplate(defaultTemplate.subject, data);
      body = renderTemplate(defaultTemplate.body, data);
    }

    await sendEmail({
      to: data.email,
      subject,
      html: body,
    });
  } catch (error) {
    logger.error("Failed to send templated email", error as Error, {
      event,
      email: data.email,
    });
    throw error;
  }
}

/**
 * Send a templated SMS notification
 */
export async function sendTemplatedSMS(
  event: string,
  data: Record<string, any>,
): Promise<void> {
  try {
    // Try to get template from database
    const template = await NotificationTemplate.findOne({
      channel: "sms",
      event,
      isEnabled: true,
      locale: data.locale || "en",
    });

    let message: string;

    if (template) {
      // Use database template
      message = renderTemplate(template.body, data);
    } else {
      // Fallback to default template
      const defaultTemplate = DEFAULT_SMS_TEMPLATES[event];
      if (!defaultTemplate) {
        throw new Error(`No SMS template found for event: ${event}`);
      }
      message = renderTemplate(defaultTemplate, data);
    }

    // Validate SMS length (160 characters)
    if (message.length > 160) {
      logger.warn(`SMS message exceeds 160 characters for event: ${event}`, {
        length: message.length,
        event,
      });
      message = message.substring(0, 157) + "...";
    }

    await sendSMS({
      to: data.phone,
      message,
    });
  } catch (error) {
    logger.error("Failed to send templated SMS", error as Error, {
      event,
      phone: data.phone,
    });
    throw error;
  }
}

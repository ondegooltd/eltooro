import { config } from "dotenv";
import { resolve } from "path";
import { initModels } from "../lib/models/helpers";
import { NotificationTemplate } from "../lib/models";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const DEFAULT_EMAIL_TEMPLATES = [
  {
    channel: "email" as const,
    event: "order_confirmation",
    subject: "Order Confirmation - {{orderNumber}}",
    body: `<!DOCTYPE html>
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
</html>`,
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "email" as const,
    event: "payment_confirmation",
    subject: "Payment Confirmed - {{orderNumber}}",
    body: `<!DOCTYPE html>
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
</html>`,
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "email" as const,
    event: "order_shipped",
    subject: "Order Shipped - {{orderNumber}}",
    body: `<!DOCTYPE html>
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
      <h2 style="margin-top: 0;">Shipping Details</h2>
      <p><strong>Order Number:</strong> {{orderNumber}}</p>
      {{#if trackingNumber}}
      <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
      {{/if}}
    </div>
    
    <p>You can track your order status in your account or using the tracking number above.</p>
    
    <p>Best regards,<br>Toroglo Team</p>
  </div>
</body>
</html>`,
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "email" as const,
    event: "order_delivered",
    subject: "Order Delivered - {{orderNumber}}",
    body: `<!DOCTYPE html>
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
</html>`,
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "email" as const,
    event: "otp",
    subject: "Your Verification Code",
    body: `<!DOCTYPE html>
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
</html>`,
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "email" as const,
    event: "password_reset",
    subject: "Reset Your Password",
    body: `<!DOCTYPE html>
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
</html>`,
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "email" as const,
    event: "support_ticket_created",
    subject: "Support Ticket Created - {{ticketNumber}}",
    body: `<!DOCTYPE html>
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
</html>`,
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "email" as const,
    event: "support_ticket_status_update",
    subject: "Ticket Status Update - {{ticketNumber}}",
    body: `<!DOCTYPE html>
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
</html>`,
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "email" as const,
    event: "support_ticket_response",
    subject: "New Response - {{ticketNumber}}",
    body: `<!DOCTYPE html>
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
</html>`,
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "email" as const,
    event: "admin_ticket_notification",
    subject: "New Support Ticket - {{ticketNumber}} [{{priority}}]",
    body: `<!DOCTYPE html>
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
</html>`,
    isEnabled: true,
    locale: "en",
  },
];

const DEFAULT_SMS_TEMPLATES = [
  {
    channel: "sms" as const,
    event: "order_confirmation",
    body: "Hi {{name}}, your order {{orderNumber}} has been confirmed. Total: {{currency}} {{orderTotal}}. We'll notify you when it ships. Thank you!",
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "sms" as const,
    event: "payment_confirmation",
    body: "Payment confirmed for order {{orderNumber}}. Amount: {{currency}} {{amount}}. Your order is being processed.",
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "sms" as const,
    event: "order_shipped",
    body: "Your order {{orderNumber}} has been shipped!{{#if trackingNumber}} Tracking: {{trackingNumber}}.{{/if}} Track in your account.",
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "sms" as const,
    event: "order_delivered",
    body: "Your order {{orderNumber}} has been delivered! We hope you enjoy your purchase. Thank you for shopping with Toroglo!",
    isEnabled: true,
    locale: "en",
  },
  {
    channel: "sms" as const,
    event: "otp",
    body: "Your Toroglo verification code is: {{otp}}. This code expires in {{expiryMinutes}} minutes.",
    isEnabled: true,
    locale: "en",
  },
];

async function seedNotificationTemplates() {
  console.log("📧 Seeding notification templates...");

  try {
    await initModels();

    const allTemplates = [...DEFAULT_EMAIL_TEMPLATES, ...DEFAULT_SMS_TEMPLATES];

    for (const templateData of allTemplates) {
      await NotificationTemplate.updateOne(
        {
          channel: templateData.channel,
          event: templateData.event,
          locale: templateData.locale || "en",
        },
        {
          $set: {
            ...templateData,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    console.log(`✅ Seeded ${allTemplates.length} notification templates.`);
  } catch (error) {
    console.error("❌ Error seeding notification templates:", error);
    process.exit(1);
  }
}

seedNotificationTemplates();

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const from = options.from || process.env.EMAIL_FROM || "noreply@eltooro.com";

    await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  orderTotal: number,
  currency: string = "GHS"
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4CAF50;">Order Confirmed!</h1>
          <p>Thank you for your order. We've received your order and will begin processing it shortly.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order Details</h2>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Total Amount:</strong> ${currency} ${orderTotal.toFixed(
    2
  )}</p>
          </div>
          
          <p>You will receive another email when your order ships.</p>
          
          <p>If you have any questions, please contact our customer service team.</p>
          
          <p>Best regards,<br>Eltooro Team</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html,
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  orderNumber: string,
  amount: number,
  currency: string = "GHS"
): Promise<void> {
  const html = `
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
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Amount Paid:</strong> ${currency} ${amount.toFixed(
    2
  )}</p>
          </div>
          
          <p>Your order is now being processed and will be shipped soon.</p>
          
          <p>Best regards,<br>Eltooro Team</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Payment Confirmed - ${orderNumber}`,
    html,
  });
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(
  email: string,
  orderNumber: string,
  trackingNumber?: string
): Promise<void> {
  const html = `
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
            <h2 style="margin-top: 0;">Shipping Details</h2>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            ${
              trackingNumber
                ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>`
                : ""
            }
          </div>
          
          <p>You can track your order status in your account or using the tracking number above.</p>
          
          <p>Best regards,<br>Eltooro Team</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Order Shipped - ${orderNumber}`,
    html,
  });
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(
  email: string,
  orderNumber: string
): Promise<void> {
  const html = `
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
            <p><strong>Order Number:</strong> ${orderNumber}</p>
          </div>
          
          <p>We hope you enjoy your purchase! If you have any questions or concerns, please don't hesitate to contact us.</p>
          
          <p>Thank you for shopping with us!</p>
          
          <p>Best regards,<br>Eltooro Team</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Order Delivered - ${orderNumber}`,
    html,
  });
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const html = `
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
            <h2 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #2196F3;">${otp}</h2>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          
          <p>If you didn't request this code, please ignore this email.</p>
          
          <p>Best regards,<br>Eltooro Team</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Your Verification Code",
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl: string
): Promise<void> {
  const html = `
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
            <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <p>This link will expire in 1 hour.</p>
          
          <p>If you didn't request a password reset, please ignore this email.</p>
          
          <p>Best regards,<br>Eltooro Team</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
  });
}

/**
 * Send support ticket confirmation email
 */
export async function sendSupportTicketConfirmationEmail(
  email: string,
  ticketNumber: string,
  firstName: string,
  subject: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Support Ticket Created</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4CAF50;">Support Ticket Created</h1>
          <p>Hello ${firstName},</p>
          <p>Thank you for contacting us. We've received your support request and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Ticket Details</h2>
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <p>You can track the status of your ticket using the ticket number above.</p>
          
          <p>We typically respond within 24 hours during business days.</p>
          
          <p>Best regards,<br>Eltooro Support Team</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Support Ticket Created - ${ticketNumber}`,
    html,
  });
}

/**
 * Send support ticket status update email
 */
export async function sendSupportTicketStatusUpdateEmail(
  email: string,
  ticketNumber: string,
  status: string,
  firstName: string
): Promise<void> {
  const statusMessages: Record<string, string> = {
    open: "Your ticket has been opened",
    in_progress: "We're working on your ticket",
    resolved: "Your ticket has been resolved",
    closed: "Your ticket has been closed",
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2196F3;">Ticket Status Update</h1>
          <p>Hello ${firstName},</p>
          <p>${
            statusMessages[status] || "Your ticket status has been updated"
          }.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Ticket Details</h2>
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p><strong>New Status:</strong> ${status
              .replace("_", " ")
              .toUpperCase()}</p>
          </div>
          
          <p>You can view your ticket and add responses in your account.</p>
          
          <p>Best regards,<br>Eltooro Support Team</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Ticket Status Update - ${ticketNumber}`,
    html,
  });
}

/**
 * Send support ticket response email
 */
export async function sendSupportTicketResponseEmail(
  email: string,
  ticketNumber: string,
  message: string,
  isFromAdmin: boolean,
  firstName: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Response to Your Ticket</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2196F3;">New Response to Your Ticket</h1>
          <p>Hello ${firstName},</p>
          <p>You have received a new response to your support ticket.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Ticket Details</h2>
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p><strong>From:</strong> ${
              isFromAdmin ? "Eltooro Support Team" : "Customer"
            }</p>
          </div>
          
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p>You can respond to this ticket by logging into your account or replying to this email.</p>
          
          <p>Best regards,<br>Eltooro Support Team</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `New Response - ${ticketNumber}`,
    html,
  });
}

/**
 * Send admin notification for new ticket
 */
export async function sendAdminTicketNotificationEmail(
  email: string,
  ticketNumber: string,
  subject: string,
  priority: string,
  customerEmail: string
): Promise<void> {
  const html = `
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
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
          </div>
          
          <p>Please review and respond to this ticket in the admin panel.</p>
          
          <p>Best regards,<br>Eltooro System</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `New Support Ticket - ${ticketNumber} [${priority.toUpperCase()}]`,
    html,
  });
}

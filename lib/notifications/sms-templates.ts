/**
 * SMS Template System
 *
 * Event types and available variables for SMS templates
 */

export enum SMSEventType {
  // Order Events
  ORDER_CONFIRMATION = "order_confirmation",
  ORDER_CONFIRMED = "order_confirmed",
  ORDER_PROCESSING = "order_processing",
  ORDER_SHIPPED = "order_shipped",
  ORDER_DELIVERED = "order_delivered",
  ORDER_CANCELLED = "order_cancelled",
  ORDER_REFUNDED = "order_refunded",

  // Delivery Events
  DELIVERY_ATTEMPTED = "delivery_attempted",
  DELIVERY_FAILED = "delivery_failed",
  DELIVERY_RESCHEDULED = "delivery_rescheduled",

  // Payment Events
  PAYMENT_CONFIRMATION = "payment_confirmation",
  PAYMENT_FAILED = "payment_failed",
  PAYMENT_PENDING = "payment_pending",
  REFUND_PROCESSED = "refund_processed",

  // Account Events
  ACCOUNT_WELCOME = "account_welcome",
  PASSWORD_RESET = "password_reset",
  EMAIL_VERIFIED = "email_verified",
  PHONE_VERIFIED = "phone_verified",

  // OTP & Verification
  OTP = "otp",

  // Support Events
  SUPPORT_TICKET_CREATED = "support_ticket_created",
  SUPPORT_TICKET_STATUS_UPDATE = "support_ticket_status_update",
  SUPPORT_TICKET_RESPONSE = "support_ticket_response",

  // Cart & Inventory
  ABANDONED_CART_REMINDER = "abandoned_cart_reminder",
  BACK_IN_STOCK = "back_in_stock",
}

/**
 * Available variables for each event type
 */
export const SMS_TEMPLATE_VARIABLES: Record<SMSEventType, string[]> = {
  // Order Events
  [SMSEventType.ORDER_CONFIRMATION]: [
    "name",
    "orderNumber",
    "orderTotal",
    "currency",
    "itemCount",
  ],
  [SMSEventType.ORDER_CONFIRMED]: [
    "name",
    "orderNumber",
    "orderTotal",
    "currency",
  ],
  [SMSEventType.ORDER_PROCESSING]: ["name", "orderNumber", "estimatedDelivery"],
  [SMSEventType.ORDER_SHIPPED]: [
    "name",
    "orderNumber",
    "trackingNumber",
    "estimatedDelivery",
  ],
  [SMSEventType.ORDER_DELIVERED]: ["name", "orderNumber"],
  [SMSEventType.ORDER_CANCELLED]: [
    "name",
    "orderNumber",
    "reason",
    "refundAmount",
    "currency",
  ],
  [SMSEventType.ORDER_REFUNDED]: [
    "name",
    "orderNumber",
    "refundAmount",
    "currency",
    "refundMethod",
  ],

  // Delivery Events
  [SMSEventType.DELIVERY_ATTEMPTED]: [
    "name",
    "orderNumber",
    "attemptDate",
    "nextAttemptDate",
  ],
  [SMSEventType.DELIVERY_FAILED]: [
    "name",
    "orderNumber",
    "reason",
    "contactNumber",
  ],
  [SMSEventType.DELIVERY_RESCHEDULED]: [
    "name",
    "orderNumber",
    "newDeliveryDate",
    "timeSlot",
  ],

  // Payment Events
  [SMSEventType.PAYMENT_CONFIRMATION]: [
    "name",
    "orderNumber",
    "amount",
    "currency",
  ],
  [SMSEventType.PAYMENT_FAILED]: [
    "name",
    "orderNumber",
    "amount",
    "currency",
    "reason",
    "retryLink",
  ],
  [SMSEventType.PAYMENT_PENDING]: [
    "name",
    "orderNumber",
    "amount",
    "currency",
    "paymentMethod",
  ],
  [SMSEventType.REFUND_PROCESSED]: [
    "name",
    "orderNumber",
    "refundAmount",
    "currency",
    "refundMethod",
    "processingTime",
  ],

  // Account Events
  [SMSEventType.ACCOUNT_WELCOME]: ["name", "accountType"],
  [SMSEventType.PASSWORD_RESET]: ["name", "resetLink", "expiryMinutes"],
  [SMSEventType.EMAIL_VERIFIED]: ["name"],
  [SMSEventType.PHONE_VERIFIED]: ["name"],

  // OTP & Verification
  [SMSEventType.OTP]: ["name", "otp", "expiryMinutes"],

  // Support Events
  [SMSEventType.SUPPORT_TICKET_CREATED]: ["name", "ticketNumber", "subject"],
  [SMSEventType.SUPPORT_TICKET_STATUS_UPDATE]: [
    "name",
    "ticketNumber",
    "status",
  ],
  [SMSEventType.SUPPORT_TICKET_RESPONSE]: [
    "name",
    "ticketNumber",
    "message",
    "isFromAdmin",
  ],

  // Cart & Inventory
  [SMSEventType.ABANDONED_CART_REMINDER]: [
    "name",
    "itemCount",
    "cartTotal",
    "currency",
    "cartLink",
  ],
  [SMSEventType.BACK_IN_STOCK]: ["name", "productName", "productLink"],
};

/**
 * Default templates for each event type
 */
export const DEFAULT_SMS_TEMPLATES: Record<SMSEventType, string> = {
  // Order Events
  [SMSEventType.ORDER_CONFIRMATION]:
    "Hi {{name}}, your order {{orderNumber}} has been confirmed. We'll notify you when it ships. Thank you for shopping with Eltooro!",
  [SMSEventType.ORDER_CONFIRMED]:
    "Hi {{name}}, your order {{orderNumber}} ({{currency}} {{orderTotal}}) has been confirmed and is being prepared.",
  [SMSEventType.ORDER_PROCESSING]:
    "Hi {{name}}, your order {{orderNumber}} is now being processed. Expected delivery: {{estimatedDelivery}}.",
  [SMSEventType.ORDER_SHIPPED]:
    "Your order {{orderNumber}} has been shipped! Tracking: {{trackingNumber}}. Track your order in your account.",
  [SMSEventType.ORDER_DELIVERED]:
    "Your order {{orderNumber}} has been delivered! We hope you enjoy your purchase. Thank you for shopping with Eltooro!",
  [SMSEventType.ORDER_CANCELLED]:
    "Hi {{name}}, your order {{orderNumber}} has been cancelled. Refund of {{currency}} {{refundAmount}} will be processed if applicable.",
  [SMSEventType.ORDER_REFUNDED]:
    "Hi {{name}}, refund of {{currency}} {{refundAmount}} for order {{orderNumber}} has been processed via {{refundMethod}}.",

  // Delivery Events
  [SMSEventType.DELIVERY_ATTEMPTED]:
    "Hi {{name}}, delivery attempt for order {{orderNumber}} was made on {{attemptDate}}. Next attempt: {{nextAttemptDate}}.",
  [SMSEventType.DELIVERY_FAILED]:
    "Hi {{name}}, delivery for order {{orderNumber}} failed. Reason: {{reason}}. Contact us: {{contactNumber}}.",
  [SMSEventType.DELIVERY_RESCHEDULED]:
    "Hi {{name}}, delivery for order {{orderNumber}} rescheduled to {{newDeliveryDate}} ({{timeSlot}}).",

  // Payment Events
  [SMSEventType.PAYMENT_CONFIRMATION]:
    "Payment confirmed for order {{orderNumber}}. Amount: {{currency}} {{amount}}. Your order is being processed.",
  [SMSEventType.PAYMENT_FAILED]:
    "Hi {{name}}, payment for order {{orderNumber}} ({{currency}} {{amount}}) failed. Reason: {{reason}}. Retry: {{retryLink}}.",
  [SMSEventType.PAYMENT_PENDING]:
    "Hi {{name}}, payment of {{currency}} {{amount}} for order {{orderNumber}} via {{paymentMethod}} is pending. We'll notify you once confirmed.",
  [SMSEventType.REFUND_PROCESSED]:
    "Hi {{name}}, refund of {{currency}} {{refundAmount}} for order {{orderNumber}} processed via {{refundMethod}}. Will reflect in {{processingTime}}.",

  // Account Events
  [SMSEventType.ACCOUNT_WELCOME]:
    "Welcome to Eltooro, {{name}}! Your {{accountType}} account has been created. Start shopping now!",
  [SMSEventType.PASSWORD_RESET]:
    "Hi {{name}}, reset your password: {{resetLink}}. Link expires in {{expiryMinutes}} minutes.",
  [SMSEventType.EMAIL_VERIFIED]:
    "Hi {{name}}, your email has been verified successfully. Your account is now fully activated.",
  [SMSEventType.PHONE_VERIFIED]:
    "Hi {{name}}, your phone number has been verified successfully. Your account is now fully activated.",

  // OTP & Verification
  [SMSEventType.OTP]:
    "Your Eltooro verification code is: {{otp}}. This code expires in {{expiryMinutes}} minutes.",

  // Support Events
  [SMSEventType.SUPPORT_TICKET_CREATED]:
    "Hi {{name}}, we've received your support request (Ticket: {{ticketNumber}}). We'll respond within 24 hours.",
  [SMSEventType.SUPPORT_TICKET_STATUS_UPDATE]:
    "Hi {{name}}, your ticket {{ticketNumber}} status has been updated to {{status}}.",
  [SMSEventType.SUPPORT_TICKET_RESPONSE]:
    "Hi {{name}}, you have a new response to ticket {{ticketNumber}}. Check your account for details.",

  // Cart & Inventory
  [SMSEventType.ABANDONED_CART_REMINDER]:
    "Hi {{name}}, you have {{itemCount}} items ({{currency}} {{cartTotal}}) in your cart. Complete your purchase: {{cartLink}}.",
  [SMSEventType.BACK_IN_STOCK]:
    "Hi {{name}}, {{productName}} is back in stock! Shop now: {{productLink}}.",
};

/**
 * Template engine - Simple variable replacement
 */
export function renderSMSTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let rendered = template;

  // Replace all {{variable}} placeholders
  const variableRegex = /\{\{(\w+)\}\}/g;
  rendered = rendered.replace(variableRegex, (match, varName) => {
    const value = variables[varName];
    // If variable is missing, replace with empty string
    return value !== undefined && value !== null ? String(value) : "";
  });

  // Clean up any double spaces or trailing spaces
  rendered = rendered.replace(/\s+/g, " ").trim();

  return rendered;
}

/**
 * Validate template message length (SMS limit: 160 characters)
 */
export function validateTemplateLength(message: string): {
  valid: boolean;
  length: number;
  exceeds: number;
} {
  const length = message.length;
  const maxLength = 160;
  return {
    valid: length <= maxLength,
    length,
    exceeds: length > maxLength ? length - maxLength : 0,
  };
}

/**
 * Extract variables from template string
 */
export function extractTemplateVariables(template: string): string[] {
  const variableRegex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = variableRegex.exec(template)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Validate template variables against available variables for event type
 */
export function validateTemplateVariables(
  template: string,
  eventType: SMSEventType
): {
  valid: boolean;
  invalidVariables: string[];
  availableVariables: string[];
} {
  const templateVars = extractTemplateVariables(template);
  const availableVars = SMS_TEMPLATE_VARIABLES[eventType];
  const invalidVariables = templateVars.filter(
    (v) => !availableVars.includes(v)
  );

  return {
    valid: invalidVariables.length === 0,
    invalidVariables,
    availableVariables: availableVars,
  };
}

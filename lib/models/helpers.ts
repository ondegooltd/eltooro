/**
 * Helper functions for using Mongoose models in API routes
 * This ensures the database connection is established before using models
 */

import connectDB from "@/lib/db/mongoose";
import {
  User,
  Product,
  Order,
  Category,
  Cart,
  Wishlist,
  Review,
  SupportTicket,
  AdminInfo,
  AdminSettings,
  SMSTemplate,
  NewsletterSubscription,
  ShippingMethod,
  NotificationTemplate,
} from "./index";

/**
 * Initialize database connection and return models
 * Call this at the start of API route handlers
 */
export async function initModels() {
  await connectDB();
  return {
    User,
    Product,
    Order,
    Category,
    Cart,
    Wishlist,
    Review,
    SupportTicket,
    AdminInfo,
    AdminSettings,
    SMSTemplate,
    NewsletterSubscription,
    ShippingMethod,
    NotificationTemplate,
  };
}

/**
 * Get models (assumes connection is already established)
 * Use this for subsequent operations in the same request
 */
export function getModels() {
  return {
    User,
    Product,
    Order,
    Category,
    Cart,
    Wishlist,
    Review,
    SupportTicket,
    AdminInfo,
    AdminSettings,
    SMSTemplate,
    NewsletterSubscription,
    ShippingMethod,
    NotificationTemplate,
  };
}

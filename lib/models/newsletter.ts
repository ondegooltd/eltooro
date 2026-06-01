import mongoose, { Schema, Document } from "mongoose";

export interface INewsletterSubscription extends Document {
  email: string;
  status: "active" | "unsubscribed";
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source?: string; // Where they subscribed from (footer, signup, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriptionSchema = new Schema<INewsletterSubscription>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "newsletter_subscriptions",
  }
);

// Indexes
NewsletterSubscriptionSchema.index({ email: 1 }, { unique: true });
NewsletterSubscriptionSchema.index({ status: 1 });
NewsletterSubscriptionSchema.index({ subscribedAt: -1 });

export const NewsletterSubscription =
  mongoose.models.NewsletterSubscription ||
  mongoose.model<INewsletterSubscription>(
    "NewsletterSubscription",
    NewsletterSubscriptionSchema
  );

import mongoose, { Schema, Document } from "mongoose";

export interface INotificationTemplate extends Document {
  channel: "email" | "sms";
  event: string; // e.g., "order_confirmation", "otp", "password_reset"
  subject?: string; // Email only
  body: string; // Template body with Handlebars variables
  isEnabled: boolean;
  locale?: string; // For future internationalization
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const NotificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    channel: {
      type: String,
      enum: ["email", "sms"],
      required: true,
    },
    event: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      // Required for email, optional for SMS - validation handled in API layer
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    locale: {
      type: String,
      default: "en",
      trim: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "notification_templates",
  }
);

// Compound index for efficient lookups
NotificationTemplateSchema.index({ channel: 1, event: 1, locale: 1 }, { unique: true });
NotificationTemplateSchema.index({ isEnabled: 1 });
NotificationTemplateSchema.index({ event: 1 });

export const NotificationTemplate =
  mongoose.models.NotificationTemplate ||
  mongoose.model<INotificationTemplate>("NotificationTemplate", NotificationTemplateSchema);

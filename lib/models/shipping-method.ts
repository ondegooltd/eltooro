import mongoose, { Schema, Document } from "mongoose";

export interface IShippingMethod extends Document {
  name: string;
  code: string; // e.g., "standard", "express"
  description: string; // e.g., "4-7 business days"
  deliveryTime: string; // e.g., "4-7 business days"
  multiplier: number; // Multiplier for base shipping cost (1.0 for standard, 1.5 for express)
  isActive: boolean;
  order: number; // Display order
  createdAt: Date;
  updatedAt: Date;
}

const ShippingMethodSchema = new Schema<IShippingMethod>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryTime: {
      type: String,
      required: true,
      trim: true,
    },
    multiplier: {
      type: Number,
      required: true,
      default: 1.0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "shipping_methods",
  }
);

// Indexes
// ShippingMethodSchema.index({ code: 1 }, { unique: true });
ShippingMethodSchema.index({ isActive: 1 });
ShippingMethodSchema.index({ order: 1 });

export const ShippingMethod =
  mongoose.models.ShippingMethod ||
  mongoose.model<IShippingMethod>("ShippingMethod", ShippingMethodSchema);

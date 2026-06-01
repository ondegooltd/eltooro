import mongoose, { Schema, Document } from "mongoose";
import { SMSEventType } from "@/lib/notifications/sms-templates";

export interface ISMSTemplate extends Document {
  eventType: SMSEventType;
  name: string;
  message: string;
  variables: string[];
  status: "active" | "inactive";
  isDefault: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const SMSTemplateSchema = new Schema<ISMSTemplate>(
  {
    eventType: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 160,
    },
    variables: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsedAt: {
      type: Date,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "sms_templates",
  }
);

// Indexes
SMSTemplateSchema.index({ eventType: 1 });
SMSTemplateSchema.index({ status: 1 });
SMSTemplateSchema.index({ isDefault: 1 });
SMSTemplateSchema.index({ createdAt: -1 });

export const SMSTemplate =
  mongoose.models.SMSTemplate ||
  mongoose.model<ISMSTemplate>("SMSTemplate", SMSTemplateSchema);

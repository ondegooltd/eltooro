import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicketResponse {
  message: string;
  isInternal: boolean;
  createdAt: Date;
  createdBy?: mongoose.Types.ObjectId;
}

export interface ISupportTicket extends Document {
  ticketNumber: string;
  userId?: mongoose.Types.ObjectId | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  orderNumber?: string;
  subject: "order" | "shipping" | "return" | "product" | "account" | "other";
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: mongoose.Types.ObjectId | null;
  responses: ISupportTicketResponse[];
  tags: string[];
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketResponseSchema = new Schema<ISupportTicketResponse>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    orderNumber: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      enum: ["order", "shipping", "return", "product", "account", "other"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    responses: {
      type: [SupportTicketResponseSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "support_tickets",
  }
);

// Indexes
// SupportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
SupportTicketSchema.index({ userId: 1 });
SupportTicketSchema.index({ email: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ subject: 1 });
SupportTicketSchema.index({ createdAt: -1 });

export const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);

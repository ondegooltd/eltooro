import mongoose, { Schema, Document } from "mongoose";

export type AdminInfoType =
  | "privacy_policy"
  | "terms_of_service"
  | "terms_and_conditions"
  | "faq"
  | "contact"
  | "about_us"
  | "shipping_policy"
  | "return_policy"
  | "refund_policy"
  | "cancellation_policy"
  | "accessibility"
  | "affiliate_terms"
  | "blog_post"
  | "announcement"
  | "help_article"
  | "custom";

export interface IAdminInfo extends Document {
  type: AdminInfoType;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: "draft" | "published" | "archived";
  order?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AdminInfoSchema = new Schema<IAdminInfo>(
  {
    type: {
      type: String,
      enum: [
        "privacy_policy",
        "terms_of_service",
        "terms_and_conditions",
        "faq",
        "contact",
        "about_us",
        "shipping_policy",
        "return_policy",
        "refund_policy",
        "cancellation_policy",
        "accessibility",
        "affiliate_terms",
        "blog_post",
        "announcement",
        "help_article",
        "custom",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "admininfo",
  }
);

// Indexes
// AdminInfoSchema.index({ slug: 1 }, { unique: true });
AdminInfoSchema.index({ type: 1 });
AdminInfoSchema.index({ status: 1 });
AdminInfoSchema.index({ order: 1 });
AdminInfoSchema.index({ createdAt: -1 });

export const AdminInfo =
  mongoose.models.AdminInfo ||
  mongoose.model<IAdminInfo>("AdminInfo", AdminInfoSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  type: "shipping" | "billing";
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  region: string;
  postalCode?: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface IUserPreferences {
  currency: "GHS" | "USD";
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
}

export interface IUser extends Document {
  email?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  password: string;
  name: {
    first: string;
    last: string;
  };
  addresses: IAddress[];
  role: "customer" | "admin";
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    type: {
      type: String,
      enum: ["shipping", "billing"],
      required: true,
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
    address: {
      type: String,
      required: true,
      trim: true,
    },
    apartment: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    currency: {
      type: String,
      enum: ["GHS", "USD"],
      default: "GHS",
    },
    language: {
      type: String,
      default: "en",
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      first: {
        type: String,
        required: true,
        trim: true,
      },
      last: {
        type: String,
        required: true,
        trim: true,
      },
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: true,
        },
      }),
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: undefined,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Indexes
// Partial unique indexes: only enforce uniqueness for documents where the
// field is a string. This avoids duplicate-key collisions on documents that
// have the field absent or set to null (sparse: true alone does not skip nulls).
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);
UserSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
);
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1 });
UserSchema.index({ lastLogin: -1 }); // For querying recently active users

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

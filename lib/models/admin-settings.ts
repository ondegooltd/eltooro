import mongoose, { Schema, Document } from "mongoose";

export interface IAdminSettingsDeliveryFees {
  winneba: number;
  mankesim: number;
  accra: number;
  capeCoast: number;
  takoradi: number;
  kumasi: number;
  sunyani: number;
  international: number;
}

export interface IAdminSettingsServiceFees {
  ghana: number;
  international: number;
}

export interface IAdminSettingsDeliveryTimes {
  winneba: { min: number; max: number };
  accraCentral: { min: number; max: number };
  outsideAccraCentral: { min: number; max: number };
  international: { min: number; max: number };
}

export interface IAdminSettingsCurrency {
  default: string;
  supported: string[];
}

export interface IAdminSettingsSettings {
  currency: IAdminSettingsCurrency;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  orderPrefix: string;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  maxCartItems?: number;
  maxQuantityPerItem?: number;
}

export interface IAdminSettingsPayment {
  paystackPublicKey: string;
  paystackSecretKey: string;
  testMode: boolean;
  allowedMethods?: string[];
}

export interface IAdminSettingsNotifications {
  emailEnabled: boolean;
  smsEnabled: boolean;
  emailProvider: string;
  smsProvider: string;
  emailFrom?: string;
  smsFrom?: string;
}

export interface IAdminSettingsSEO {
  siteName: string;
  siteDescription: string;
  defaultMetaTags: {
    title: string;
    description: string;
    keywords: string[];
  };
  ogImage?: string;
  twitterHandle?: string;
}

export interface IAdminSettingsBusinessAddress {
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
}

export interface IAdminSettingsBusiness {
  name: string;
  email: string;
  phone: string;
  address: IAdminSettingsBusinessAddress;
  taxId?: string;
  registrationNumber?: string;
}

export interface IAdminSettingsSocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
}

export interface IAdminSettings extends Document {
  deliveryFees: IAdminSettingsDeliveryFees;
  serviceFees: IAdminSettingsServiceFees;
  deliveryTimes: IAdminSettingsDeliveryTimes;
  settings: IAdminSettingsSettings;
  payment: IAdminSettingsPayment;
  notifications: IAdminSettingsNotifications;
  seo: IAdminSettingsSEO;
  business: IAdminSettingsBusiness;
  socialMedia: IAdminSettingsSocialMedia;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const DeliveryFeesSchema = new Schema<IAdminSettingsDeliveryFees>(
  {
    winneba: { type: Number, required: true, min: 0 },
    mankesim: { type: Number, required: true, min: 0 },
    accra: { type: Number, required: true, min: 0 },
    capeCoast: { type: Number, required: true, min: 0 },
    takoradi: { type: Number, required: true, min: 0 },
    kumasi: { type: Number, required: true, min: 0 },
    sunyani: { type: Number, required: true, min: 0 },
    international: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ServiceFeesSchema = new Schema<IAdminSettingsServiceFees>(
  {
    ghana: { type: Number, required: true, min: 0 },
    international: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const DeliveryTimesSchema = new Schema<IAdminSettingsDeliveryTimes>(
  {
    winneba: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    accraCentral: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    outsideAccraCentral: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    international: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
  },
  { _id: false }
);

const CurrencySchema = new Schema<IAdminSettingsCurrency>(
  {
    default: { type: String, required: true },
    supported: { type: [String], required: true },
  },
  { _id: false }
);

const SettingsSchema = new Schema<IAdminSettingsSettings>(
  {
    currency: { type: CurrencySchema, required: true },
    freeShippingThreshold: { type: Number, required: true, min: 0 },
    lowStockThreshold: { type: Number, required: true, min: 0 },
    orderPrefix: { type: String, required: true },
    maintenanceMode: { type: Boolean, default: false },
    allowGuestCheckout: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    requirePhoneVerification: { type: Boolean, default: false },
    maxCartItems: { type: Number, min: 1 },
    maxQuantityPerItem: { type: Number, min: 1 },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IAdminSettingsPayment>(
  {
    paystackPublicKey: { type: String, required: true },
    paystackSecretKey: { type: String, required: true },
    testMode: { type: Boolean, default: true },
    allowedMethods: { type: [String] },
  },
  { _id: false }
);

const NotificationsSchema = new Schema<IAdminSettingsNotifications>(
  {
    emailEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: true },
    emailProvider: { type: String, required: true },
    smsProvider: { type: String, required: true },
    emailFrom: { type: String },
    smsFrom: { type: String },
  },
  { _id: false }
);

const SEOSchema = new Schema<IAdminSettingsSEO>(
  {
    siteName: { type: String, required: true },
    siteDescription: { type: String, required: true },
    defaultMetaTags: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      keywords: { type: [String], required: true },
    },
    ogImage: { type: String },
    twitterHandle: { type: String },
  },
  { _id: false }
);

const BusinessAddressSchema = new Schema<IAdminSettingsBusinessAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String },
  },
  { _id: false }
);

const BusinessSchema = new Schema<IAdminSettingsBusiness>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: BusinessAddressSchema, required: true },
    taxId: { type: String },
    registrationNumber: { type: String },
  },
  { _id: false }
);

const SocialMediaSchema = new Schema<IAdminSettingsSocialMedia>(
  {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    youtube: { type: String },
    linkedin: { type: String },
  },
  { _id: false }
);

const AdminSettingsSchema = new Schema<IAdminSettings>(
  {
    deliveryFees: {
      type: DeliveryFeesSchema,
      required: true,
    },
    serviceFees: {
      type: ServiceFeesSchema,
      required: true,
    },
    deliveryTimes: {
      type: DeliveryTimesSchema,
      required: true,
    },
    settings: {
      type: SettingsSchema,
      required: true,
    },
    payment: {
      type: PaymentSchema,
      required: true,
    },
    notifications: {
      type: NotificationsSchema,
      required: true,
    },
    seo: {
      type: SEOSchema,
      required: true,
    },
    business: {
      type: BusinessSchema,
      required: true,
    },
    socialMedia: {
      type: SocialMediaSchema,
      default: {},
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "adminsettings",
  }
);

export const AdminSettings =
  mongoose.models.AdminSettings ||
  mongoose.model<IAdminSettings>("AdminSettings", AdminSettingsSchema);

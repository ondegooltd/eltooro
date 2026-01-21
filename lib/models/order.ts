import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrderPricing {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  currency: "GHS" | "USD";
}

export interface IOrderShipping {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  region: string;
  postalCode?: string;
  phone: string;
  deliveryLocation: string;
  estimatedDelivery: Date;
  deliveryTime: string;
}

export interface IOrderBilling {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
}

export interface IOrderPayment {
  method: "momo" | "card" | "paystack";
  provider: string;
  transactionId?: string;
  reference: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  amount: number;
  paidAt?: Date;
}

export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  pricing: IOrderPricing;
  shipping: IOrderShipping;
  billing: IOrderBilling;
  payment: IOrderPayment;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  statusHistory: IOrderStatusHistory[];
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const OrderPricingSchema = new Schema<IOrderPricing>(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceFee: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["GHS", "USD"],
      required: true,
    },
  },
  { _id: false }
);

const OrderShippingSchema = new Schema<IOrderShipping>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    apartment: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
    },
    estimatedDelivery: {
      type: Date,
      required: true,
    },
    deliveryTime: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const OrderBillingSchema = new Schema<IOrderBilling>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
    },
  },
  { _id: false }
);

const OrderPaymentSchema = new Schema<IOrderPayment>(
  {
    method: {
      type: String,
      enum: ["momo", "card", "paystack"],
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAt: {
      type: Date,
    },
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    pricing: {
      type: OrderPricingSchema,
      required: true,
    },
    shipping: {
      type: OrderShippingSchema,
      required: true,
    },
    billing: {
      type: OrderBillingSchema,
      required: true,
    },
    payment: {
      type: OrderPaymentSchema,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    statusHistory: {
      type: [OrderStatusHistorySchema],
      default: [],
    },
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

// Indexes
// OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ userId: 1 });
// OrderSchema.index({ "payment.reference": 1 }, { unique: true });
OrderSchema.index({ status: 1 });
OrderSchema.index({ "payment.status": 1 });
OrderSchema.index({ createdAt: -1 });

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

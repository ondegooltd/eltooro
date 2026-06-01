import mongoose, { Schema, Document } from "mongoose";

export interface IProductImage {
  url: string;
  publicId: string;
  alt: string;
  order: number;
}

export interface IProductCategory {
  main: string;
  sub?: string;
}

export interface IProductStock {
  quantity: number;
  lowStockThreshold: number;
  inStock: boolean;
}

export interface IProductPrice {
  ghs: number;
  usd?: number;
}

export interface IProductRating {
  average: number;
  count: number;
}

export interface IProductSpecification {
  label: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand?: string;
  sku: string;
  description: string;
  shortDescription?: string;
  images: IProductImage[];
  category: IProductCategory;
  price: IProductPrice;
  costPrice?: number;
  originalPrice?: IProductPrice;
  stock: IProductStock;
  specifications?: IProductSpecification[];
  highlights?: string[];
  rating: IProductRating;
  reviews?: mongoose.Types.ObjectId[];
  tags?: string[];
  status: "active" | "inactive" | "draft";
  views: number;
  sales: number;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const ProductCategorySchema = new Schema<IProductCategory>(
  {
    main: {
      type: String,
      required: true,
    },
    sub: {
      type: String,
    },
  },
  { _id: false }
);

const ProductPriceSchema = new Schema<IProductPrice>(
  {
    ghs: {
      type: Number,
      required: true,
      min: 0,
    },
    usd: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const ProductStockSchema = new Schema<IProductStock>(
  {
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const ProductRatingSchema = new Schema<IProductRating>(
  {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const ProductSpecificationSchema = new Schema<IProductSpecification>(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
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
    brand: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      text: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    images: {
      type: [ProductImageSchema],
      default: [],
    },
    category: {
      type: ProductCategorySchema,
      required: true,
    },
    price: {
      type: ProductPriceSchema,
      required: true,
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    originalPrice: {
      type: ProductPriceSchema,
    },
    stock: {
      type: ProductStockSchema,
      required: true,
    },
    specifications: {
      type: [ProductSpecificationSchema],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    rating: {
      type: ProductRatingSchema,
      default: () => ({
        average: 0,
        count: 0,
      }),
    },
    reviews: {
      type: [Schema.Types.ObjectId],
      ref: "Review",
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    sales: {
      type: Number,
      default: 0,
      min: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: {
        type: Number,
        min: 0,
      },
      width: {
        type: Number,
        min: 0,
      },
      height: {
        type: Number,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

// Indexes
ProductSchema.index({ "category.main": 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ "price.ghs": 1 });
ProductSchema.index({ "rating.average": -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ isTrending: 1 });
ProductSchema.index({ isNewArrival: 1 });
ProductSchema.index({ isBestSeller: 1 });
ProductSchema.index({ name: "text", description: "text", tags: "text" });

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

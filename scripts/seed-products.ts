// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file (Next.js convention)
config({ path: resolve(process.cwd(), ".env.local") });
// Also try .env as fallback
config({ path: resolve(process.cwd(), ".env") });

import mongoose from "mongoose";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync, readdirSync, statSync } from "fs";
import { v2 as cloudinary } from "cloudinary";
import { Product, Category } from "../lib/models";

// MongoDB connection URI with fallback
const MONGODB_URI = process.env.MONGODB_URI;

// Set MONGODB_URI in process.env for models that might need it
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = MONGODB_URI;
}

// Configure Cloudinary (only if credentials are available)
const hasCloudinaryConfig =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✅ Cloudinary configured successfully");
} else {
  console.log(
    "⚠️  Cloudinary credentials not found. Images will not be uploaded."
  );
  console.log(
    "   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local to enable image uploads."
  );
  // Debug: Show which variables are missing
  if (process.env.CLOUDINARY_CLOUD_NAME === undefined) {
    console.log("   Missing: CLOUDINARY_CLOUD_NAME");
  }
  if (process.env.CLOUDINARY_API_KEY === undefined) {
    console.log("   Missing: CLOUDINARY_API_KEY");
  }
  if (process.env.CLOUDINARY_API_SECRET === undefined) {
    console.log("   Missing: CLOUDINARY_API_SECRET");
  }
}

// Upload image to Cloudinary
async function uploadImageToCloudinary(
  file: Buffer,
  folder: string
): Promise<{
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `iherb/${folder}`,
          transformation: [
            { width: 800, height: 800, crop: "limit", quality: "auto" },
            { format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              width: result.width || 0,
              height: result.height || 0,
            });
          } else {
            reject(new Error("Upload failed"));
          }
        }
      )
      .end(file);
  });
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Generate SKU from name and brand
function generateSKU(name: string, brand: string): string {
  const namePart = name
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  const brandPart = brand
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${namePart}-${brandPart}-${random}`;
}

/**
 * Find image file with fallback options (case-insensitive, different extensions)
 */
function findImageFile(imagePath: string, publicFolder: string): string | null {
  // Remove leading slash
  const cleanPath = imagePath.replace(/^\//, "");
  const fullPath = join(publicFolder, cleanPath);

  // Try exact path first
  if (existsSync(fullPath)) {
    return fullPath;
  }

  // Try case-insensitive search
  const fileName = cleanPath.split("/").pop() || "";
  const dirPath = cleanPath.substring(0, cleanPath.lastIndexOf("/"));
  const dir = dirPath ? join(publicFolder, dirPath) : publicFolder;

  if (existsSync(dir)) {
    const files = readdirSync(dir);
    const found = files.find(
      (f: string) => f.toLowerCase() === fileName.toLowerCase()
    );
    if (found) {
      return join(dir, found);
    }
  }

  // Try different extensions
  const baseName = fileName.substring(0, fileName.lastIndexOf("."));
  const extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const currentExt = fileName.substring(fileName.lastIndexOf("."));

  for (const ext of extensions) {
    if (ext === currentExt) continue;
    const altPath = join(publicFolder, cleanPath.replace(currentExt, ext));
    if (existsSync(altPath)) {
      return altPath;
    }
  }

  // Try in root public folder
  const rootPath = join(publicFolder, fileName);
  if (existsSync(rootPath)) {
    return rootPath;
  }

  return null;
}

/**
 * Upload image file to Cloudinary with improved error handling and validation
 */
async function uploadImageFile(
  imagePath: string,
  publicFolder: string
): Promise<{
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
} | null> {
  try {
    // Skip if Cloudinary is not configured
    if (!hasCloudinaryConfig) {
      console.log(
        `⏭️  Skipping upload (Cloudinary not configured): ${imagePath}`
      );
      return null;
    }

    // Skip placeholder images
    if (imagePath.includes("placeholder")) {
      console.log(`⏭️  Skipping placeholder: ${imagePath}`);
      return null;
    }

    // Find the actual file (with fallback options)
    const actualPath = findImageFile(imagePath, publicFolder);

    if (!actualPath) {
      console.error(`❌ Image not found: ${imagePath}`);
      console.error(
        `   Tried: ${join(publicFolder, imagePath.replace(/^\//, ""))}`
      );
      return null;
    }

    // Validate file exists and is readable
    const stats = statSync(actualPath);
    if (!stats.isFile()) {
      console.error(`❌ Path is not a file: ${actualPath}`);
      return null;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (stats.size > maxSize) {
      console.error(
        `❌ Image too large (${(stats.size / 1024 / 1024).toFixed(
          2
        )}MB): ${imagePath}`
      );
      return null;
    }

    if (stats.size === 0) {
      console.error(`❌ Image file is empty: ${imagePath}`);
      return null;
    }

    // Read file
    const imageBuffer = await readFile(actualPath);

    // Validate it's actually an image by checking magic bytes
    const isJPEG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
    const isPNG =
      imageBuffer[0] === 0x89 &&
      imageBuffer[1] === 0x50 &&
      imageBuffer[2] === 0x4e &&
      imageBuffer[3] === 0x47;
    const isGIF =
      imageBuffer[0] === 0x47 &&
      imageBuffer[1] === 0x49 &&
      imageBuffer[2] === 0x46;
    const isWebP =
      imageBuffer[8] === 0x57 &&
      imageBuffer[9] === 0x45 &&
      imageBuffer[10] === 0x42 &&
      imageBuffer[11] === 0x50;

    const isValidImage = isJPEG || isPNG || isGIF || isWebP;

    if (!isValidImage && !imagePath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      console.warn(`⚠️  File may not be a valid image: ${imagePath}`);
    }

    // Upload with retry logic
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await uploadImageToCloudinary(imageBuffer, "products");

        const fileSizeKB = (stats.size / 1024).toFixed(2);
        console.log(
          `✅ Uploaded: ${imagePath} (${fileSizeKB}KB, ${result.width}x${result.height})`
        );
        console.log(`   URL: ${result.secure_url}`);

        return {
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // Exponential backoff
          console.warn(
            `⚠️  Upload attempt ${attempt} failed for ${imagePath}, retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw lastError || new Error("Upload failed after retries");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to upload ${imagePath}: ${errorMessage}`);
    return null;
  }
}

// Product data with full details matching the product detail page
const products = [
  {
    name: "California Gold Nutrition, Gold C, Vitamin C, 1,000 mg, 240 Veggie Capsules",
    brand: "California Gold Nutrition",
    image: "/vitamin-c-supplement-bottle-front-view.jpg",
    rating: 4.7,
    reviewCount: 45892,
    price: 89.99,
    originalPrice: 120.0,
    category: "supplements",
    description:
      "California Gold Nutrition Gold C features USP grade Vitamin C in easy-to-swallow veggie capsules. Vitamin C is an essential nutrient that supports immune health and is vital for the production of collagen, carnitine, and certain neurotransmitters. This high-potency formula provides 1,000 mg of Vitamin C per serving, making it an excellent choice for those looking to support their immune system and overall health.",
    shortDescription:
      "USP grade Vitamin C in easy-to-swallow veggie capsules. Supports immune health and collagen production.",
    highlights: [
      "USP Grade Vitamin C",
      "1,000 mg per Serving",
      "Supports Immune Health",
      "Essential Antioxidant",
      "Non-GMO",
      "Gluten Free",
      "Suitable for Vegetarians",
    ],
    specifications: [
      { label: "Brand", value: "California Gold Nutrition" },
      { label: "Item Form", value: "Capsule" },
      { label: "Serving Size", value: "1 Capsule" },
      { label: "Servings Per Container", value: "240" },
      { label: "Vitamin C per Serving", value: "1,000 mg" },
      {
        label: "Dietary Restrictions",
        value: "Non-GMO, Gluten Free, Vegetarian",
      },
    ],
    tags: ["vitamin-c", "immune-support", "antioxidant", "vegetarian"],
    isBestSeller: true,
  },
  {
    name: "Vitamin D3 5000 IU Softgels",
    brand: "California Gold Nutrition",
    image: "/vitamin-d-supplement-bottle.jpg",
    rating: 4.9,
    reviewCount: 28456,
    price: 65.0,
    originalPrice: 85.0,
    category: "supplements",
    description:
      "California Gold Nutrition Vitamin D3 provides 5,000 IU of cholecalciferol (the most bioavailable form of Vitamin D) in easy-to-swallow softgels. Vitamin D3 is essential for calcium absorption, bone health, and immune function. This high-potency formula is perfect for those with low Vitamin D levels or limited sun exposure.",
    shortDescription:
      "High-potency Vitamin D3 (5,000 IU) in softgel form. Supports bone health and immune function.",
    highlights: [
      "5,000 IU per Softgel",
      "Cholecalciferol (D3)",
      "Supports Bone Health",
      "Immune System Support",
      "Easy-to-Swallow Softgels",
      "Non-GMO",
    ],
    specifications: [
      { label: "Brand", value: "California Gold Nutrition" },
      { label: "Item Form", value: "Softgel" },
      { label: "Serving Size", value: "1 Softgel" },
      { label: "Vitamin D3 per Serving", value: "5,000 IU" },
      { label: "Servings Per Container", value: "120" },
    ],
    tags: ["vitamin-d", "bone-health", "immune-support"],
    isBestSeller: true,
  },
  {
    name: "B-Complex Vitamin with Vitamin C",
    brand: "Nature's Way",
    image: "/b-complex-vitamin-bottle.jpg",
    rating: 4.7,
    reviewCount: 8923,
    price: 125.0,
    category: "supplements",
    description:
      "Nature's Way B-Complex with Vitamin C provides a comprehensive blend of B vitamins plus Vitamin C to support energy metabolism, nervous system health, and immune function. This formula includes all eight essential B vitamins in their active forms for optimal absorption.",
    shortDescription:
      "Complete B-Complex formula with Vitamin C. Supports energy metabolism and nervous system health.",
    highlights: [
      "Complete B-Complex",
      "Includes Vitamin C",
      "Energy Metabolism Support",
      "Nervous System Health",
      "Active Forms for Better Absorption",
      "Non-GMO",
    ],
    specifications: [
      { label: "Brand", value: "Nature's Way" },
      { label: "Item Form", value: "Tablet" },
      { label: "Serving Size", value: "1 Tablet" },
      { label: "Servings Per Container", value: "100" },
    ],
    tags: ["b-complex", "energy", "vitamin-c", "nervous-system"],
  },
  {
    name: "Vitamin E 400 IU Mixed Tocopherols",
    brand: "Solgar",
    image: "/vitamin-e-supplement-bottle.jpg",
    rating: 4.6,
    reviewCount: 4567,
    price: 145.0,
    originalPrice: 175.0,
    category: "supplements",
    description:
      "Solgar Vitamin E 400 IU features mixed tocopherols (alpha, beta, delta, and gamma) for comprehensive antioxidant support. Vitamin E is a powerful antioxidant that helps protect cells from oxidative stress and supports cardiovascular health.",
    shortDescription:
      "Mixed tocopherols Vitamin E (400 IU). Powerful antioxidant for cellular protection.",
    highlights: [
      "400 IU per Serving",
      "Mixed Tocopherols",
      "Antioxidant Support",
      "Cardiovascular Health",
      "Non-GMO",
      "Gluten Free",
    ],
    specifications: [
      { label: "Brand", value: "Solgar" },
      { label: "Item Form", value: "Softgel" },
      { label: "Serving Size", value: "1 Softgel" },
      { label: "Vitamin E per Serving", value: "400 IU" },
      { label: "Servings Per Container", value: "100" },
    ],
    tags: ["vitamin-e", "antioxidant", "cardiovascular"],
  },
  {
    name: "Omega-3 Fish Oil 1000mg",
    brand: "Nordic Naturals",
    image: "/omega-3-fish-oil.png",
    rating: 4.8,
    reviewCount: 32456,
    price: 195.0,
    category: "supplements",
    description:
      "Nordic Naturals Omega-3 Fish Oil provides high-quality EPA and DHA from sustainably sourced fish. This formula supports heart health, brain function, and joint mobility. The fish oil is molecularly distilled for purity and freshness.",
    shortDescription:
      "High-quality Omega-3 fish oil with EPA and DHA. Supports heart, brain, and joint health.",
    highlights: [
      "1,000 mg per Serving",
      "High EPA & DHA Content",
      "Heart Health Support",
      "Brain Function Support",
      "Molecularly Distilled",
      "Sustainably Sourced",
    ],
    specifications: [
      { label: "Brand", value: "Nordic Naturals" },
      { label: "Item Form", value: "Softgel" },
      { label: "Serving Size", value: "2 Softgels" },
      { label: "Servings Per Container", value: "90" },
      { label: "EPA per Serving", value: "650 mg" },
      { label: "DHA per Serving", value: "450 mg" },
    ],
    tags: ["omega-3", "fish-oil", "heart-health", "brain-health"],
    isBestSeller: true,
  },
  {
    name: "Probiotics 50 Billion CFU",
    brand: "Garden of Life",
    image: "/probiotics-supplement-bottle.jpg",
    rating: 4.6,
    reviewCount: 14567,
    price: 265.0,
    originalPrice: 320.0,
    category: "supplements",
    description:
      "Garden of Life Probiotics delivers 50 billion CFU of diverse probiotic strains to support digestive health and immune function. This formula includes 13 probiotic strains and is shelf-stable, requiring no refrigeration.",
    shortDescription:
      "50 billion CFU probiotic blend. Supports digestive health and immune function.",
    highlights: [
      "50 Billion CFU",
      "13 Probiotic Strains",
      "Digestive Health Support",
      "Immune System Support",
      "Shelf-Stable",
      "No Refrigeration Required",
    ],
    specifications: [
      { label: "Brand", value: "Garden of Life" },
      { label: "Item Form", value: "Capsule" },
      { label: "Serving Size", value: "1 Capsule" },
      { label: "Servings Per Container", value: "60" },
      { label: "CFU per Serving", value: "50 Billion" },
    ],
    tags: ["probiotics", "digestive-health", "immune-support"],
    isBestSeller: true,
    isNewArrival: true,
  },
  {
    name: "Collagen Peptides Powder",
    brand: "Vital Proteins",
    image: "/collagen-powder.png",
    rating: 4.9,
    reviewCount: 28765,
    price: 325.0,
    category: "supplements",
    description:
      "Vital Proteins Collagen Peptides is a premium hydrolyzed collagen powder that supports healthy hair, skin, nails, and joints. This unflavored powder easily dissolves in hot or cold liquids and contains 20g of collagen per serving.",
    shortDescription:
      "Hydrolyzed collagen peptides powder. Supports hair, skin, nails, and joints.",
    highlights: [
      "20g Collagen per Serving",
      "Hydrolyzed for Easy Absorption",
      "Hair, Skin & Nail Support",
      "Joint Health Support",
      "Unflavored",
      "Grass-Fed",
    ],
    specifications: [
      { label: "Brand", value: "Vital Proteins" },
      { label: "Item Form", value: "Powder" },
      { label: "Serving Size", value: "2 Scoops (20g)" },
      { label: "Servings Per Container", value: "28" },
      { label: "Collagen per Serving", value: "20g" },
    ],
    tags: ["collagen", "hair-skin-nails", "joint-health", "beauty"],
    isBestSeller: true,
    isNewArrival: true,
  },
  {
    name: "Women's Multivitamin Gummies",
    brand: "Garden of Life",
    image: "/women-multivitamin-gummies-bottle.jpg",
    rating: 4.7,
    reviewCount: 12345,
    price: 185.0,
    originalPrice: 220.0,
    category: "women-wellness",
    description:
      "Garden of Life Women's Multivitamin Gummies provide essential vitamins and minerals specifically formulated for women's health needs. These delicious gummies support energy, immune function, and overall wellness.",
    shortDescription:
      "Complete multivitamin gummies for women. Supports energy, immune function, and wellness.",
    highlights: [
      "Formulated for Women",
      "Essential Vitamins & Minerals",
      "Energy Support",
      "Immune Function Support",
      "Delicious Gummies",
      "No Artificial Colors",
    ],
    specifications: [
      { label: "Brand", value: "Garden of Life" },
      { label: "Item Form", value: "Gummy" },
      { label: "Serving Size", value: "2 Gummies" },
      { label: "Servings Per Container", value: "60" },
    ],
    tags: ["multivitamin", "women", "gummies", "wellness"],
    isBestSeller: true,
  },
  {
    name: "Men's One Daily Multivitamin",
    brand: "Rainbow Light",
    image: "/men-multivitamin-bottle.jpg",
    rating: 4.6,
    reviewCount: 9876,
    price: 165.0,
    category: "men-wellness",
    description:
      "Rainbow Light Men's One Daily Multivitamin provides comprehensive nutritional support for men. This once-daily formula includes vitamins, minerals, and antioxidants to support energy, immune function, and overall health.",
    shortDescription:
      "Complete once-daily multivitamin for men. Supports energy, immune function, and health.",
    highlights: [
      "Formulated for Men",
      "Once-Daily Formula",
      "Energy Support",
      "Immune Function Support",
      "Antioxidant Blend",
      "Easy-to-Swallow",
    ],
    specifications: [
      { label: "Brand", value: "Rainbow Light" },
      { label: "Item Form", value: "Tablet" },
      { label: "Serving Size", value: "1 Tablet" },
      { label: "Servings Per Container", value: "150" },
    ],
    tags: ["multivitamin", "men", "wellness", "energy"],
  },
  {
    name: "Prenatal DHA Omega-3",
    brand: "Nordic Naturals",
    image: "/prenatal-dha-omega-supplement.jpg",
    rating: 4.9,
    reviewCount: 7654,
    price: 210.0,
    originalPrice: 250.0,
    category: "women-wellness",
    description:
      "Nordic Naturals Prenatal DHA provides essential DHA omega-3 fatty acids for pregnant and nursing mothers. DHA is crucial for fetal brain and eye development and supports maternal health during pregnancy and breastfeeding.",
    shortDescription:
      "Prenatal DHA omega-3 for pregnant and nursing mothers. Supports fetal brain development.",
    highlights: [
      "Prenatal Formula",
      "High DHA Content",
      "Fetal Brain Development",
      "Eye Development Support",
      "Maternal Health Support",
      "Purified & Tested",
    ],
    specifications: [
      { label: "Brand", value: "Nordic Naturals" },
      { label: "Item Form", value: "Softgel" },
      { label: "Serving Size", value: "2 Softgels" },
      { label: "Servings Per Container", value: "60" },
      { label: "DHA per Serving", value: "830 mg" },
    ],
    tags: ["prenatal", "dha", "omega-3", "pregnancy", "women"],
  },
  {
    name: "Zinc Picolinate 50mg",
    brand: "Thorne Research",
    image: "/zinc-supplement-bottle.jpg",
    rating: 4.7,
    reviewCount: 4321,
    price: 115.0,
    originalPrice: 140.0,
    category: "supplements",
    description:
      "Thorne Research Zinc Picolinate provides highly bioavailable zinc in the picolinate form. Zinc is essential for immune function, wound healing, and cellular metabolism. This formula is gentle on the stomach.",
    shortDescription:
      "Highly bioavailable zinc picolinate (50mg). Supports immune function and wound healing.",
    highlights: [
      "50mg per Serving",
      "Zinc Picolinate Form",
      "Highly Bioavailable",
      "Immune Function Support",
      "Wound Healing Support",
      "Gentle on Stomach",
    ],
    specifications: [
      { label: "Brand", value: "Thorne Research" },
      { label: "Item Form", value: "Capsule" },
      { label: "Serving Size", value: "1 Capsule" },
      { label: "Servings Per Container", value: "120" },
      { label: "Zinc per Serving", value: "50 mg" },
    ],
    tags: ["zinc", "immune-support", "wound-healing"],
  },
  {
    name: "Magnesium Glycinate 400mg",
    brand: "Doctor's Best",
    image: "/magnesium-supplement-bottle.png",
    rating: 4.8,
    reviewCount: 18765,
    price: 135.0,
    category: "supplements",
    description:
      "Doctor's Best Magnesium Glycinate provides highly absorbable magnesium in the chelated glycinate form. Magnesium supports muscle function, nerve health, and sleep quality. This form is gentle on the digestive system.",
    shortDescription:
      "Highly absorbable magnesium glycinate (400mg). Supports muscle, nerve, and sleep health.",
    highlights: [
      "400mg per Serving",
      "Magnesium Glycinate",
      "Highly Absorbable",
      "Muscle Function Support",
      "Nerve Health Support",
      "Sleep Quality Support",
    ],
    specifications: [
      { label: "Brand", value: "Doctor's Best" },
      { label: "Item Form", value: "Tablet" },
      { label: "Serving Size", value: "2 Tablets" },
      { label: "Servings Per Container", value: "120" },
      { label: "Magnesium per Serving", value: "400 mg" },
    ],
    tags: ["magnesium", "muscle-health", "sleep", "nerve-health"],
    isTrending: true,
  },
  {
    name: "Biotin 10000mcg",
    brand: "Sports Research",
    image: "/biotin-supplement-bottle.jpg",
    rating: 4.8,
    reviewCount: 21098,
    price: 95.0,
    category: "supplements",
    description:
      "Sports Research Biotin 10,000mcg provides high-potency biotin to support healthy hair, skin, and nails. Biotin is a B-vitamin that plays a key role in the metabolism of fats, carbohydrates, and proteins.",
    shortDescription:
      "High-potency biotin (10,000mcg). Supports healthy hair, skin, and nails.",
    highlights: [
      "10,000mcg per Serving",
      "Hair Health Support",
      "Skin Health Support",
      "Nail Health Support",
      "Metabolism Support",
      "Non-GMO",
    ],
    specifications: [
      { label: "Brand", value: "Sports Research" },
      { label: "Item Form", value: "Softgel" },
      { label: "Serving Size", value: "1 Softgel" },
      { label: "Servings Per Container", value: "120" },
      { label: "Biotin per Serving", value: "10,000 mcg" },
    ],
    tags: ["biotin", "hair-skin-nails", "beauty"],
    isNewArrival: true,
  },
  {
    name: "CoQ10 200mg Ubiquinol",
    brand: "Qunol",
    image: "/coq10-supplement-bottle.jpg",
    rating: 4.9,
    reviewCount: 15678,
    price: 285.0,
    originalPrice: 350.0,
    category: "supplements",
    description:
      "Qunol CoQ10 Ubiquinol provides the active, reduced form of CoQ10 for enhanced absorption. CoQ10 is a powerful antioxidant that supports heart health, energy production, and cellular health.",
    shortDescription:
      "Active form CoQ10 ubiquinol (200mg). Supports heart health and energy production.",
    highlights: [
      "200mg per Serving",
      "Ubiquinol (Active Form)",
      "Enhanced Absorption",
      "Heart Health Support",
      "Energy Production Support",
      "Antioxidant Support",
    ],
    specifications: [
      { label: "Brand", value: "Qunol" },
      { label: "Item Form", value: "Softgel" },
      { label: "Serving Size", value: "1 Softgel" },
      { label: "Servings Per Container", value: "60" },
      { label: "CoQ10 per Serving", value: "200 mg" },
    ],
    tags: ["coq10", "heart-health", "energy", "antioxidant"],
  },
  {
    name: "Turmeric Curcumin with BioPerine",
    brand: "Doctor's Best",
    image: "/placeholder.svg",
    rating: 4.8,
    reviewCount: 19876,
    price: 125.0,
    category: "supplements",
    description:
      "Doctor's Best Turmeric Curcumin with BioPerine provides high-potency curcumin with black pepper extract for enhanced absorption. Curcumin supports joint health, inflammation response, and antioxidant activity.",
    shortDescription:
      "High-potency curcumin with BioPerine. Supports joint health and inflammation response.",
    highlights: [
      "High-Potency Curcumin",
      "BioPerine for Absorption",
      "Joint Health Support",
      "Inflammation Response Support",
      "Antioxidant Activity",
      "Non-GMO",
    ],
    specifications: [
      { label: "Brand", value: "Doctor's Best" },
      { label: "Item Form", value: "Capsule" },
      { label: "Serving Size", value: "1 Capsule" },
      { label: "Servings Per Container", value: "120" },
      { label: "Curcumin per Serving", value: "500 mg" },
    ],
    tags: ["turmeric", "curcumin", "joint-health", "inflammation"],
    isTrending: true,
    isNewArrival: true,
  },
  {
    name: "Elderberry Immune Support",
    brand: "Sambucol",
    image: "/elderberry-supplement-bottle.jpg",
    rating: 4.7,
    reviewCount: 12345,
    price: 145.0,
    originalPrice: 175.0,
    category: "supplements",
    description:
      "Sambucol Elderberry Immune Support provides concentrated elderberry extract to support immune system health. Elderberry is rich in antioxidants and has been traditionally used for immune support.",
    shortDescription:
      "Concentrated elderberry extract. Supports immune system health with antioxidants.",
    highlights: [
      "Concentrated Elderberry Extract",
      "Immune System Support",
      "Rich in Antioxidants",
      "Traditional Formula",
      "No Artificial Colors",
      "Gluten Free",
    ],
    specifications: [
      { label: "Brand", value: "Sambucol" },
      { label: "Item Form", value: "Liquid" },
      { label: "Serving Size", value: "2 Teaspoons (10ml)" },
      { label: "Servings Per Container", value: "15" },
    ],
    tags: ["elderberry", "immune-support", "antioxidant"],
  },
  {
    name: "Hyaluronic Acid Serum, 1 fl oz",
    brand: "The Ordinary",
    image: "/hyaluronic-acid-serum-bottle.jpg",
    rating: 4.8,
    reviewCount: 22456,
    price: 89.0,
    category: "facial-care",
    description:
      "The Ordinary Hyaluronic Acid Serum provides intense hydration for the skin. Hyaluronic acid can hold up to 1000 times its weight in water, making it an excellent moisturizing ingredient for all skin types.",
    shortDescription:
      "Intense hydration serum with hyaluronic acid. Suitable for all skin types.",
    highlights: [
      "Intense Hydration",
      "Holds 1000x Weight in Water",
      "All Skin Types",
      "Lightweight Formula",
      "No Parabens",
      "Cruelty-Free",
    ],
    specifications: [
      { label: "Brand", value: "The Ordinary" },
      { label: "Item Form", value: "Serum" },
      { label: "Volume", value: "1 fl oz (30ml)" },
      { label: "Hyaluronic Acid", value: "2% + B5" },
    ],
    tags: ["hyaluronic-acid", "serum", "hydration", "skincare"],
    isBestSeller: true,
  },
  {
    name: "Retinol Cream, 50ml",
    brand: "CeraVe",
    image: "/retinol-cream-jar.jpg",
    rating: 4.7,
    reviewCount: 18234,
    price: 156.0,
    category: "facial-care",
    description:
      "CeraVe Retinol Cream combines retinol with ceramides and niacinamide to help reduce the appearance of fine lines and wrinkles while maintaining the skin barrier. This gentle formula is suitable for sensitive skin.",
    shortDescription:
      "Retinol cream with ceramides. Reduces fine lines and wrinkles while maintaining skin barrier.",
    highlights: [
      "Retinol Formula",
      "Ceramides & Niacinamide",
      "Reduces Fine Lines",
      "Maintains Skin Barrier",
      "Suitable for Sensitive Skin",
      "Fragrance-Free",
    ],
    specifications: [
      { label: "Brand", value: "CeraVe" },
      { label: "Item Form", value: "Cream" },
      { label: "Volume", value: "50ml" },
      { label: "Retinol", value: "0.3%" },
    ],
    tags: ["retinol", "anti-aging", "skincare", "ceramides"],
    isBestSeller: true,
  },
  // Additional products from trending-products.tsx
  {
    name: "Triple Magnesium Complex, 120 Veggie Capsules",
    brand: "California Gold Nutrition",
    image: "/magnesium-supplement-bottle.png",
    rating: 4.9,
    reviewCount: 496,
    price: 246.76,
    category: "supplements",
    description:
      "California Gold Nutrition Triple Magnesium Complex provides three highly bioavailable forms of magnesium (magnesium glycinate, magnesium citrate, and magnesium malate) for comprehensive support of muscle function, nerve health, and energy production.",
    shortDescription:
      "Triple magnesium complex with three bioavailable forms. Supports muscle, nerve, and energy health.",
    highlights: [
      "Three Magnesium Forms",
      "Magnesium Glycinate",
      "Magnesium Citrate",
      "Magnesium Malate",
      "Muscle Function Support",
      "Nerve Health Support",
    ],
    specifications: [
      { label: "Brand", value: "California Gold Nutrition" },
      { label: "Item Form", value: "Capsule" },
      { label: "Serving Size", value: "2 Capsules" },
      { label: "Servings Per Container", value: "60" },
    ],
    tags: ["magnesium", "muscle-health", "nerve-health", "energy"],
    isTrending: true,
  },
  {
    name: "L-Theanine, AlphaWave®, 200 mg, 60 Veggie Capsules",
    brand: "California Gold Nutrition",
    image: "/l-theanine-supplement.png",
    rating: 4.8,
    reviewCount: 12342,
    price: 156.78,
    category: "supplements",
    description:
      "California Gold Nutrition L-Theanine AlphaWave provides 200mg of Suntheanine® brand L-theanine per serving. L-theanine is an amino acid found in green tea that promotes relaxation without drowsiness and supports focus and mental clarity.",
    shortDescription:
      "Suntheanine® L-theanine (200mg). Promotes relaxation and mental clarity without drowsiness.",
    highlights: [
      "200mg per Serving",
      "Suntheanine® Brand",
      "Promotes Relaxation",
      "Mental Clarity Support",
      "Non-Drowsy Formula",
      "Veggie Capsules",
    ],
    specifications: [
      { label: "Brand", value: "California Gold Nutrition" },
      { label: "Item Form", value: "Capsule" },
      { label: "Serving Size", value: "1 Capsule" },
      { label: "Servings Per Container", value: "60" },
      { label: "L-Theanine per Serving", value: "200 mg" },
    ],
    tags: ["l-theanine", "relaxation", "focus", "mental-clarity"],
    isTrending: true,
  },
  // Additional products from new-arrivals.tsx
  {
    name: "Organic Ashwagandha, 120 Capsules",
    brand: "Gaia Herbs",
    image: "/placeholder.svg",
    rating: 4.8,
    reviewCount: 234,
    price: 287.0,
    category: "supplements",
    description:
      "Gaia Herbs Organic Ashwagandha provides organic, full-spectrum ashwagandha root extract. Ashwagandha is an adaptogenic herb that helps the body manage stress and supports energy, mood, and overall wellness.",
    shortDescription:
      "Organic full-spectrum ashwagandha root extract. Supports stress management and overall wellness.",
    highlights: [
      "Organic",
      "Full-Spectrum Extract",
      "Adaptogenic Herb",
      "Stress Management Support",
      "Energy Support",
      "Mood Support",
    ],
    specifications: [
      { label: "Brand", value: "Gaia Herbs" },
      { label: "Item Form", value: "Capsule" },
      { label: "Serving Size", value: "2 Capsules" },
      { label: "Servings Per Container", value: "60" },
    ],
    tags: ["ashwagandha", "adaptogen", "stress", "wellness"],
    isNewArrival: true,
  },
  {
    name: "Elderberry Gummies, 60 Count",
    brand: "Nature's Way",
    image: "/placeholder.svg",
    rating: 4.7,
    reviewCount: 89,
    price: 156.0,
    category: "gummies",
    description:
      "Nature's Way Elderberry Gummies provide elderberry extract in a delicious gummy format. Elderberry is rich in antioxidants and has been traditionally used to support immune system health.",
    shortDescription:
      "Delicious elderberry gummies. Rich in antioxidants to support immune system health.",
    highlights: [
      "Elderberry Extract",
      "Delicious Gummies",
      "Antioxidant Rich",
      "Immune System Support",
      "No Artificial Colors",
      "Gluten Free",
    ],
    specifications: [
      { label: "Brand", value: "Nature's Way" },
      { label: "Item Form", value: "Gummy" },
      { label: "Serving Size", value: "2 Gummies" },
      { label: "Servings Per Container", value: "30" },
    ],
    tags: ["elderberry", "gummies", "immune-support", "antioxidant"],
    isNewArrival: true,
  },
];

async function seedProducts() {
  try {
    // Connect to MongoDB directly with fallback URI
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");
    console.log("✅ Models ready");

    // Check for --reset flag
    const args = process.argv.slice(2);
    const shouldReset = args.includes("--reset");

    if (shouldReset) {
      console.log("🗑️  Clearing existing products...");
      await Product.deleteMany({});
      console.log("✅ Products cleared");
    }

    // Get categories from database
    const categories = await Category.find({ isActive: true }).lean();
    const categoryMap = new Map<string, string>();

    for (const category of categories) {
      categoryMap.set(category.slug, category._id.toString());
    }

    console.log(`📦 Processing ${products.length} products...`);

    const publicFolder = join(process.cwd(), "public");
    let successCount = 0;
    let skipCount = 0;
    let failedCount = 0;
    const failedProducts: string[] = [];
    const missingImages: string[] = [];

    for (const product of products) {
      try {
        // Check if product already exists
        const slug = generateSlug(product.name);
        const existing = await Product.findOne({ slug });
        if (existing) {
          console.log(`⏭️  Skipping existing product: ${product.name}`);
          skipCount++;
          continue;
        }

        // Upload image to Cloudinary
        let imageData = null;
        let isPlaceholder = false;

        if (product.image) {
          // Check if it's a placeholder image
          isPlaceholder = product.image.includes("placeholder");

          if (!isPlaceholder) {
            imageData = await uploadImageFile(product.image, publicFolder);

            // If Cloudinary is configured and image upload failed (not a placeholder), skip product creation
            if (hasCloudinaryConfig && !imageData) {
              console.error(
                `❌ Skipping product (image upload failed): ${product.name}`
              );
              failedCount++;
              failedProducts.push(product.name);
              missingImages.push(product.image);
              continue;
            }
          } else {
            // Placeholder images are intentionally skipped - product can be created without image
            console.log(
              `ℹ️  Product will be created without image (placeholder): ${product.name}`
            );
          }
        }

        // Get category ID - use main category slug
        const categoryId = categoryMap.get(product.category);
        if (!categoryId) {
          console.error(
            `❌ Category not found for: ${
              product.category
            }. Available categories: ${Array.from(categoryMap.keys()).join(
              ", "
            )}`
          );
          continue;
        }

        // Calculate cost price (assume 60% of selling price)
        const costPrice = product.price * 0.6;

        // Create product images array
        const images = imageData
          ? [
              {
                url: imageData.secure_url,
                publicId: imageData.public_id,
                alt: product.name,
                order: 0,
              },
            ]
          : [];

        // Create product document
        const productDoc: any = {
          name: product.name,
          slug,
          brand: product.brand,
          sku: generateSKU(product.name, product.brand),
          description: product.description,
          shortDescription: product.shortDescription,
          category: {
            main: categoryId,
          },
          price: {
            ghs: product.price,
          },
          costPrice: costPrice,
          originalPrice: product.originalPrice
            ? {
                ghs: product.originalPrice,
              }
            : undefined,
          stock: {
            quantity: Math.floor(Math.random() * 200) + 50, // Random stock between 50-250
            lowStockThreshold: 20,
            inStock: true,
          },
          images,
          specifications: product.specifications || [],
          highlights: product.highlights || [],
          rating: {
            average: product.rating,
            count: product.reviewCount,
          },
          reviews: [],
          tags: product.tags || [],
          status: "active",
          views: 0,
          sales: 0,
          isTrending: product.isTrending || false,
          isNewArrival: product.isNewArrival || false,
          isBestSeller: product.isBestSeller || false,
        };

        // Remove undefined fields
        if (!productDoc.originalPrice) {
          delete productDoc.originalPrice;
        }

        await Product.create(productDoc);
        console.log(`✅ Created: ${product.name}`);
        successCount++;

        // Update category product count
        await Category.findByIdAndUpdate(categoryId, {
          $inc: { productCount: 1 },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Failed to create product ${product.name}:`,
          errorMessage
        );
        failedCount++;
        failedProducts.push(product.name);
      }
    }

    console.log("\n📊 Summary:");
    console.log(`✅ Successfully created: ${successCount} products`);
    console.log(`⏭️  Skipped (already exist): ${skipCount} products`);
    console.log(`❌ Failed: ${failedCount} products`);

    if (failedProducts.length > 0) {
      console.log("\n❌ Failed Products:");
      failedProducts.forEach((name) => console.log(`   - ${name}`));
    }

    if (missingImages.length > 0) {
      console.log("\n⚠️  Missing Images:");
      missingImages.forEach((img) => console.log(`   - ${img}`));
    }

    console.log("\n✅ Product seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
}

// Run the seed
seedProducts();

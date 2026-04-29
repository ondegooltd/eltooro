import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI as string;

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    console.log("🌱 Starting database seed...");

    // Check for --reset flag
    const args = process.argv.slice(2);
    const shouldReset = args.includes("--reset");

    if (shouldReset) {
      console.log("🗑️ Clearing existing data...");
      await db.collection("users").deleteMany({});
      await db.collection("categories").deleteMany({});
      await db.collection("adminsettings").deleteMany({});
      await db.collection("admininfo").deleteMany({});
      await db.collection("sms_templates").deleteMany({});
      console.log("✅ Database cleared");
    }

    // Seed in order
    await seedUsers(db);
    await seedCategories(db);
    await seedAdminSettings(db);
    await seedAdminInfo(db);
    await seedSMSTemplates(db);

    console.log("✅ Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

async function seedUsers(db: any) {
  console.log("👤 Seeding users...");

  const usersCollection = db.collection("users");

  // Hash password helper
  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 12);
  };

  const users = [
    // Admin Users
    {
      email: "admin@etoroo.com",
      phone: "+233537182367",
      emailVerified: true,
      phoneVerified: true,
      password: await hashPassword("Admin@123"),
      name: {
        first: "Admin",
        last: "User",
      },
      role: "admin",
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: true,
        },
      },
    },
    {
      email: "superadmin@etoroo.com",
      phone: "+233241234568",
      emailVerified: true,
      phoneVerified: true,
      password: await hashPassword("SuperAdmin@123"),
      name: {
        first: "Super",
        last: "Admin",
      },
      role: "admin",
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: true,
        },
      },
    },
    // Test Customers
    {
      email: "customer1@test.com",
      phone: "+233241234569",
      emailVerified: true,
      phoneVerified: true,
      password: await hashPassword("Customer@123"),
      name: {
        first: "John",
        last: "Doe",
      },
      role: "customer",
      addresses: [
        {
          _id: new ObjectId(),
          type: "shipping",
          firstName: "John",
          lastName: "Doe",
          address: "123 Main Street",
          apartment: "Apt 4B",
          city: "Accra",
          region: "Greater Accra",
          postalCode: "00233",
          phone: "+233241234569",
          isDefault: true,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: true,
        },
      },
    },
    {
      email: "customer2@test.com",
      phone: "+233241234570",
      emailVerified: true,
      phoneVerified: false,
      password: await hashPassword("Customer@123"),
      name: {
        first: "Jane",
        last: "Smith",
      },
      role: "customer",
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: false,
        },
      },
    },
    {
      phone: "+233241234571",
      emailVerified: false,
      phoneVerified: true,
      password: await hashPassword("PhoneUser@123"),
      name: {
        first: "Phone",
        last: "User",
      },
      role: "customer",
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: false,
          sms: true,
        },
      },
    },
  ];

  // Insert or update users
  for (const user of users) {
    const normalizedEmail = user.email?.toLowerCase();
    // Find user by email (case-insensitive) or phone
    const existingUser = await usersCollection.findOne({
      $or: [
        { email: normalizedEmail },
        { email: { $regex: new RegExp(`^${(user.email || "").replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") } },
        { phone: user.phone }
      ]
    });

    if (existingUser) {
      // Update existing user - ensure email is lowercase
      await usersCollection.updateOne(
        { _id: existingUser._id },
        { 
          $set: {
            email: normalizedEmail || existingUser.email,
            password: user.password, // Update password in case it changed
            updatedAt: new Date()
          }
        }
      );
    } else {
      // Insert new user
      await usersCollection.insertOne({
        ...user,
        email: normalizedEmail
      });
    }
  }

  console.log(`✅ Seeded ${users.length} users`);
}

async function seedCategories(db: any) {
  console.log("📁 Seeding categories...");

  const categoriesCollection = db.collection("categories");

  const categories = [
    {
      name: "Natural Hair Growth Products",
      slug: "natural-hair-growth-products",
      description: "Products for natural hair growth and care",
      order: 1,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Beard Hair Growth for Men",
      slug: "beard-hair-growth-men",
      description: "Products specifically for men's beard growth",
      order: 2,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Hair Care",
      slug: "hair-care",
      description: "Shampoo, anti-dandruff, and hair care products",
      order: 3,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Facial Care",
      slug: "facial-care",
      description: "Serums, acne treatment products, and facial care",
      order: 4,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Supplements",
      slug: "supplements",
      description: "Health supplements and vitamins",
      order: 5,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Women Wellness",
      slug: "women-wellness",
      description: "Supplements and products for women's wellness",
      parentId: null, // Will be set to Supplements ID
      order: 1,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Men Wellness",
      slug: "men-wellness",
      description: "Supplements and products for men's wellness",
      parentId: null, // Will be set to Supplements ID
      order: 2,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Gummies",
      slug: "gummies",
      description: "Vitamin and supplement gummies",
      parentId: null, // Will be set to Supplements ID
      order: 3,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Menstrual Pain Solutions",
      slug: "menstrual-pain-solutions",
      description: "Products to help with menstrual pain and discomfort",
      order: 6,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Insert main categories first
  const mainCategories = categories.filter((c) => !c.parentId);
  for (const category of mainCategories) {
    await categoriesCollection.updateOne(
      { slug: category.slug },
      { $setOnInsert: category },
      { upsert: true }
    );
  }

  // Get Supplements ID and update subcategories
  const supplements = await categoriesCollection.findOne({
    slug: "supplements",
  });
  if (supplements) {
    const subcategories = categories.filter((c) =>
      ["women-wellness", "men-wellness", "gummies"].includes(c.slug)
    );

    for (const subcategory of subcategories) {
      await categoriesCollection.updateOne(
        { slug: subcategory.slug },
        {
          $setOnInsert: {
            ...subcategory,
            parentId: supplements._id,
          },
        },
        { upsert: true }
      );
    }
  }

  // Insert remaining categories
  const remaining = categories.filter(
    (c) =>
      !["women-wellness", "men-wellness", "gummies"].includes(c.slug) &&
      !c.parentId
  );
  for (const category of remaining) {
    await categoriesCollection.updateOne(
      { slug: category.slug },
      { $setOnInsert: category },
      { upsert: true }
    );
  }

  console.log(`✅ Seeded ${categories.length} categories`);
}

async function seedAdminSettings(db: any) {
  console.log("⚙️ Seeding admin settings...");

  const settingsCollection = db.collection("adminsettings");

  // Get admin user ID
  const adminUser = await db.collection("users").findOne({
    email: "admin@etoroo.com",
  });

  const adminSettings = {
    deliveryFees: {
      winneba: 15,
      mankesim: 30,
      accra: 50,
      capeCoast: 50,
      takoradi: 50,
      kumasi: 65,
      sunyani: 70,
      international: 0, // Calculated separately
    },
    serviceFees: {
      ghana: 3, // per item
      international: 30, // per item
    },
    deliveryTimes: {
      winneba: { min: 4, max: 24 }, // hours
      accraCentral: { min: 6, max: 24 }, // hours
      outsideAccraCentral: { min: 48, max: 120 }, // hours (2-5 days)
      international: { min: 1008, max: 1344 }, // hours (6-8 weeks)
    },
    settings: {
      currency: {
        default: "GHS",
        supported: ["GHS", "USD"],
      },
      freeShippingThreshold: 200, // GHS
      lowStockThreshold: 10,
      orderPrefix: "ORD",
      maintenanceMode: false,
      allowGuestCheckout: true,
      requireEmailVerification: false,
      requirePhoneVerification: false,
      maxCartItems: 100,
      maxQuantityPerItem: 99,
    },
    payment: {
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || "", // Should be encrypted
      testMode: true,
      allowedMethods: ["momo", "card", "bank"],
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      emailProvider: "resend",
      smsProvider: "mnotify",
      emailFrom: "info@toroglo.com",
      smsFrom: "toroglo",
    },
    seo: {
      siteName: "Toroglo",
      siteDescription:
        "Shop vitamins, supplements, and natural health products",
      defaultMetaTags: {
        title: "Toroglo - Vitamins, Supplements, Natural Health Products",
        description:
          "Shop vitamins, supplements, and natural health products at toroglo.com. Best prices on premium brands.",
        keywords: [
          "vitamins",
          "supplements",
          "health",
          "wellness",
          "natural products",
        ],
      },
    },
    business: {
      name: "Toroglo",
      email: "info@toroglo.com",
      phone: "+233537182367",
      address: {
        street: "123 Business Street",
        city: "Accra",
        region: "Greater Accra",
        country: "Ghana",
        postalCode: "00233",
      },
      taxId: "",
      registrationNumber: "",
    },
    socialMedia: {
      facebook: "https://facebook.com/toroglo",
      instagram: "https://instagram.com/toroglo",
      twitter: "https://twitter.com/toroglo",
      youtube: "",
      linkedin: "",
    },
    updatedAt: new Date(),
    updatedBy: adminUser?._id || null,
  };

  // Ensure only one document exists - delete all and insert one
  await settingsCollection.deleteMany({});
  await settingsCollection.insertOne(adminSettings);

  console.log("✅ Seeded admin settings (single record)");
}

async function seedAdminInfo(db: any) {
  console.log("📄 Seeding admin info...");

  const adminInfoCollection = db.collection("admininfo");

  // Get admin user ID
  const adminUser = await db.collection("users").findOne({
    email: "admin@toroglo.com",
  });

  const adminInfoRecords = [
    {
      type: "privacy_policy",
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: `
        <h1>Privacy Policy</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <p>We respect your privacy and are committed to protecting your personal data...</p>
        <h2>Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li>Name and contact information</li>
          <li>Payment information</li>
          <li>Shipping address</li>
        </ul>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Process and fulfill your orders</li>
          <li>Send you order confirmations and updates</li>
          <li>Improve our services</li>
        </ul>
      `,
      excerpt:
        "Our privacy policy explains how we collect, use, and protect your personal information.",
      author: adminUser?._id || null,
      status: "published",
      order: 1,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "terms_of_service",
      title: "Terms of Service",
      slug: "terms-of-service",
      content: `
        <h1>Terms of Service</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <p>Please read these terms of service carefully before using our website...</p>
        <h2>Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by these terms...</p>
        <h2>Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials on our website...</p>
      `,
      excerpt: "Terms and conditions for using our e-commerce platform.",
      author: adminUser?._id || null,
      status: "published",
      order: 2,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "faq",
      title: "Frequently Asked Questions",
      slug: "faq",
      content: `
        <h1>Frequently Asked Questions</h1>
        <div class="faq-item">
          <h3>How do I place an order?</h3>
          <p>To place an order, simply add items to your cart and proceed to checkout...</p>
        </div>
        <div class="faq-item">
          <h3>What payment methods do you accept?</h3>
          <p>We accept Mobile Money (MoMo) for Ghanaian customers and Paystack for international payments...</p>
        </div>
        <div class="faq-item">
          <h3>How long does delivery take?</h3>
          <p>Delivery times vary by location. Please check our shipping policy for details...</p>
        </div>
      `,
      excerpt: "Common questions and answers about our services.",
      author: adminUser?._id || null,
      status: "published",
      order: 3,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "contact",
      title: "Contact Us",
      slug: "contact",
      content: `
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Get in touch with us through any of the following channels:</p>
        <h2>Customer Service</h2>
        <p>Email: info@toroglo.com</p>
        <p>Phone: +233 537 182 367</p>
        <p>Hours: Monday - Friday, 9:00 AM - 5:00 PM GMT</p>
      `,
      excerpt: "Get in touch with our customer service team.",
      author: adminUser?._id || null,
      status: "published",
      order: 4,
      metadata: {
        email: "info@toroglo.com",
        phone: "+233537182367",
        address: "123 Business Street, Accra, Ghana",
      },
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "shipping_policy",
      title: "Shipping & Delivery Policy",
      slug: "shipping-policy",
      content: `
        <h1>Shipping & Delivery Policy</h1>
        <h2>Delivery Times</h2>
        <ul>
          <li><strong>Winneba:</strong> 4hr - 24 hours</li>
          <li><strong>Accra and Central Region:</strong> 6hrs to 24hrs</li>
          <li><strong>Outside Accra and Central Region:</strong> 2 - 5 days</li>
          <li><strong>International:</strong> 6-8 weeks by ship</li>
        </ul>
        <h2>Delivery Costs</h2>
        <ul>
          <li>Winneba: 15 GHS</li>
          <li>Mankesim: 30 GHS</li>
          <li>Accra, Cape Coast, Takoradi: 50 GHS</li>
          <li>Kumasi: 65 GHS</li>
          <li>Sunyani: 70 GHS</li>
        </ul>
      `,
      excerpt: "Information about our shipping and delivery policies.",
      author: adminUser?._id || null,
      status: "published",
      order: 5,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "return_policy",
      title: "Return Policy",
      slug: "return-policy",
      content: `
        <h1>Return Policy</h1>
        <p>We offer a 30-day return policy on all products...</p>
        <h2>Return Conditions</h2>
        <ul>
          <li>Items must be unused and in original packaging</li>
          <li>Proof of purchase required</li>
          <li>Return shipping costs are the customer's responsibility</li>
        </ul>
      `,
      excerpt: "Our return and refund policy.",
      author: adminUser?._id || null,
      status: "published",
      order: 6,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "about_us",
      title: "About Us",
      slug: "about-us",
      content: `
        <h1>About Toroglo</h1>
        <p>Toroglo is your trusted source for vitamins, supplements, and natural health products...</p>
        <h2>Our Mission</h2>
        <p>To provide high-quality health and wellness products at affordable prices...</p>
        <h2>Our Values</h2>
        <ul>
          <li>Quality</li>
          <li>Customer Service</li>
          <li>Transparency</li>
        </ul>
      `,
      excerpt: "Learn more about Toroglo and our mission.",
      author: adminUser?._id || null,
      status: "published",
      order: 7,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "refund_policy",
      title: "Refund Policy",
      slug: "refund-policy",
      content: `
        <h1>Refund Policy</h1>
        <p>We offer refunds for eligible products within 30 days of purchase...</p>
        <h2>Refund Process</h2>
        <ol>
          <li>Contact our customer service</li>
          <li>Provide order number and reason</li>
          <li>Return the product (if applicable)</li>
          <li>Receive refund within 4-7 business days</li>
        </ol>
      `,
      excerpt: "Our refund policy and process.",
      author: adminUser?._id || null,
      status: "published",
      order: 8,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "cancellation_policy",
      title: "Cancellation Policy",
      slug: "cancellation-policy",
      content: `
        <h1>Order Cancellation Policy</h1>
        <p>You can cancel your order before it is shipped...</p>
        <h2>How to Cancel</h2>
        <p>Contact us within 24 hours of placing your order for immediate cancellation.</p>
      `,
      excerpt: "Information about cancelling orders.",
      author: adminUser?._id || null,
      status: "published",
      order: 9,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "accessibility",
      title: "Accessibility Statement",
      slug: "accessibility",
      content: `
        <h1>Accessibility Statement</h1>
        <p>We are committed to ensuring digital accessibility for people with disabilities...</p>
        <h2>Our Commitment</h2>
        <p>We aim to conform to WCAG 2.1 Level AA standards.</p>
      `,
      excerpt: "Our commitment to web accessibility.",
      author: adminUser?._id || null,
      status: "published",
      order: 10,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "help_article",
      title: "How to Track Your Order",
      slug: "how-to-track-order",
      content: `
        <h1>How to Track Your Order</h1>
        <p>You can track your order in several ways:</p>
        <ol>
          <li>Log into your account and go to Orders</li>
          <li>Use the tracking number sent to your email</li>
          <li>Contact customer service with your order number</li>
        </ol>
      `,
      excerpt: "Learn how to track your order status.",
      author: adminUser?._id || null,
      status: "published",
      order: 1,
      tags: ["orders", "tracking", "shipping"],
      metadata: {
        category: "Orders",
        relatedArticles: [],
      },
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: "help_article",
      title: "Payment Methods",
      slug: "payment-methods",
      content: `
        <h1>Payment Methods</h1>
        <p>We accept the following payment methods:</p>
        <ul>
          <li>Mobile Money (MoMo) - For Ghanaian customers</li>
          <li>Credit/Debit Cards - Via Paystack</li>
          <li>Bank Transfer - Via Paystack</li>
        </ul>
      `,
      excerpt: "Accepted payment methods.",
      author: adminUser?._id || null,
      status: "published",
      order: 2,
      tags: ["payment", "checkout"],
      metadata: {
        category: "Payment",
        relatedArticles: [],
      },
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Insert admin info records (multiple records allowed)
  // Use upsert to avoid duplicates based on slug
  for (const record of adminInfoRecords) {
    // Remove updatedAt from record to avoid conflict with $set
    const { updatedAt, ...recordWithoutUpdatedAt } = record;

    await adminInfoCollection.updateOne(
      { slug: record.slug },
      {
        $setOnInsert: {
          ...recordWithoutUpdatedAt,
          createdAt: record.createdAt || new Date(),
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  console.log(
    `✅ Seeded ${adminInfoRecords.length} admin info records (multiple records)`
  );
}

async function seedSMSTemplates(db: any) {
  console.log("📱 Seeding SMS templates...");
  const templatesCollection = db.collection("sms_templates");
  const adminUser = await db.collection("users").findOne({
    email: "admin@toroglo.com",
  });

  // Import SMS template constants
  const { SMSEventType, DEFAULT_SMS_TEMPLATES, SMS_TEMPLATE_VARIABLES } =
    await import("../lib/notifications/sms-templates");

  // Create templates for all event types
  const defaultTemplates = Object.values(SMSEventType).map((eventType) => ({
    eventType,
    name: eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    message: DEFAULT_SMS_TEMPLATES[eventType],
    variables: SMS_TEMPLATE_VARIABLES[eventType],
    status: "active",
    isDefault: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    updatedBy: adminUser?._id || null,
  }));

  // Insert templates (upsert to avoid duplicates)
  for (const template of defaultTemplates) {
    // Remove updatedAt from template to avoid conflict with $set
    const { updatedAt, ...templateWithoutUpdatedAt } = template;

    await templatesCollection.updateOne(
      { eventType: template.eventType, isDefault: true },
      {
        $setOnInsert: {
          ...templateWithoutUpdatedAt,
          createdAt: template.createdAt || new Date(),
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  console.log(
    `✅ Seeded ${defaultTemplates.length} SMS templates (default templates)`
  );
}

// Run seed
seed();

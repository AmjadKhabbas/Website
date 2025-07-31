// Database schema definitions for cPanel deployment
const { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, jsonb, index } = require("drizzle-orm/pg-core");

// Categories table
const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull().default("blue"),
  itemCount: integer("item_count").notNull().default(0),
});

// Brands table
const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

// Products table
const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url").notNull(),
  imageUrls: text("image_urls").array().default([]),
  categoryId: integer("category_id").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("0.0"),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  tags: text("tags"),
  bulkDiscounts: jsonb("bulk_discounts").default([]),
});

// Cart items table
const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// Sessions table for authentication
const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for healthcare professionals
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  licenseNumber: varchar("license_number", { length: 100 }),
  institution: varchar("institution", { length: 255 }),
  isApproved: boolean("is_approved").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users table
const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default('admin'),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('pending'),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  paymentInfo: jsonb("payment_info"),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  processedBy: integer("processed_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table
const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

// Featured carousel table
const featuredCarousel = pgTable("featured_carousel", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Carousel items table (homepage banners)
const carouselItems = pgTable("carousel_items", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  linkUrl: varchar("link_url", { length: 500 }),
  buttonText: varchar("button_text", { length: 100 }),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Newsletter subscriptions
const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

// Referrals table
const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerEmail: varchar("referrer_email", { length: 255 }).notNull(),
  refereeEmail: varchar("referee_email", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

// EHRI accounts table
const ehriAccounts = pgTable("ehri_accounts", {
  id: serial("id").primaryKey(),
  ehriId: varchar("ehri_id").notNull().unique(),
  email: varchar("email").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: varchar("verification_token"),
  linkedAt: timestamp("linked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = {
  categories,
  brands,
  products,
  cartItems,
  sessions,
  users,
  adminUsers,
  orders,
  orderItems,
  featuredCarousel,
  carouselItems,
  newsletters,
  referrals,
  ehriAccounts,
};
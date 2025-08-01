import { pgTable, text, integer, boolean, numeric, timestamp, varchar, json, index, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: varchar("color", { length: 50 }).notNull().default("blue"),
  itemCount: integer("item_count").notNull().default(0),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url").notNull(),
  imageUrls: json("image_urls").default("[]"),
  categoryId: integer("category_id").notNull(),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("0.0"),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  tags: text("tags"),
  bulkDiscounts: json("bulk_discounts").default("[]"),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  }),
);

// Ehri account linking table
export const ehriAccounts = pgTable("ehri_accounts", {
  id: serial("id").primaryKey(),
  ehriId: varchar("ehri_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  linkedAt: timestamp("linked_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Medical professionals user table with license verification  
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  
  // Authentication Information
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // bcrypt hashed password
  
  // Personal Information
  fullName: varchar("full_name", { length: 255 }).notNull(),
  
  // Medical License Information
  licenseNumber: varchar("license_number", { length: 100 }).notNull(),
  collegeName: varchar("college_name", { length: 255 }).notNull(), // Professional Association Name
  provinceState: varchar("province_state", { length: 100 }), // Province or State of Registration (optional)
  licenseExpiryDate: varchar("license_expiry_date", { length: 50 }).notNull(), // License expiry date
  
  // Practice Information
  practiceAddress: text("practice_address").notNull(),
  
  // Account Status & Verification
  isApproved: boolean("is_approved").notNull().default(false),
  isLicenseVerified: boolean("is_license_verified").notNull().default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by", { length: 255 }),
  
  // Saved payment information (encrypted for convenience)
  savedCardInfo: json("saved_card_info"), // { last4, expiryMonth, expiryYear, cardType, billingAddress }
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Orders table for purchase history
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  orderNumber: varchar("order_number", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, declined, shipped, delivered, cancelled
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Shipping & Billing Information
  shippingAddress: json("shipping_address").notNull(),
  billingAddress: json("billing_address").notNull(),
  
  // Doctor's Banking Information (Admin Only)
  doctorBankingInfo: json("doctor_banking_info").notNull(), // { bankName, accountNumber, routingNumber, accountType }
  institutionNumber: varchar("institution_number", { length: 100 }).notNull(),
  
  // Card Information (Admin Only)
  cardInfo: json("card_info").notNull(), // { last4, expiryMonth, expiryYear, cardType }
  
  // Payment Details
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("pending"), // pending, paid, failed, refunded
  
  // Doctor Information
  doctorEmail: varchar("doctor_email", { length: 255 }).notNull(),
  doctorName: varchar("doctor_name", { length: 255 }).notNull(),
  doctorPhone: varchar("doctor_phone", { length: 50 }),
  
  // Admin Actions
  approvedBy: varchar("approved_by", { length: 255 }), // Admin email who approved/declined
  approvedAt: timestamp("approved_at"),
  declineReason: text("decline_reason"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Order items table for detailed purchase history
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(), // Store name at time of purchase
  productImageUrl: varchar("product_image_url", { length: 500 }), // Store image URL at time of purchase
});

// Referrals table for doctor referral program
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  specialty: varchar("specialty", { length: 255 }).notNull(),
  licenseNumber: varchar("license_number", { length: 100 }).notNull(),
  yearsOfExperience: varchar("years_of_experience", { length: 50 }),
  referredBy: varchar("referred_by", { length: 255 }),
  referrerContact: varchar("referrer_contact", { length: 255 }),
  additionalNotes: text("additional_notes"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Newsletter subscription table
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Admin users table for secure admin access
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Carousel items table for managing hero slideshow
export const carouselItems = pgTable("carousel_items", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  description: text("description").notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  originalPrice: varchar("original_price", { length: 50 }),
  discount: varchar("discount", { length: 20 }),
  discountPercentage: integer("discount_percentage"),
  imageUrl: text("image_url").notNull(),
  backgroundGradient: varchar("background_gradient", { length: 200 }).default("linear-gradient(135deg, #667eea 0%, #764ba2 100%)"),
  textColor: varchar("text_color", { length: 50 }).default("#ffffff"),
  onSale: boolean("on_sale").default(false).notNull(),
  badgeText: varchar("badge_text", { length: 50 }),
  badgeColor: varchar("badge_color", { length: 50 }).default("#ef4444"),
  animationType: varchar("animation_type", { length: 50 }).default("fade"),
  displayDuration: integer("display_duration").default(5000),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Featured products carousel for scrolling display
export const featuredCarousel = pgTable("featured_carousel", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

// Schema validation for new tables
export const insertEhriAccountSchema = createInsertSchema(ehriAccounts).omit({
  id: true,
  isVerified: true,
  linkedAt: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isApproved: true,
  isLicenseVerified: true,
  approvedAt: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  subscribedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCarouselItemSchema = createInsertSchema(carouselItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeaturedCarouselSchema = createInsertSchema(featuredCarousel).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for better TypeScript support
export type Category = typeof categories.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Product = typeof products.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type EhriAccount = typeof ehriAccounts.$inferSelect;
export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type Newsletter = typeof newsletters.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type CarouselItem = typeof carouselItems.$inferSelect;
export type FeaturedCarousel = typeof featuredCarousel.$inferSelect;

// Relations for better query support
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  featuredCarousel: many(featuredCarousel),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const featuredCarouselRelations = relations(featuredCarousel, ({ one }) => ({
  product: one(products, {
    fields: [featuredCarousel.productId],
    references: [products.id],
  }),
}));
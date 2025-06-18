import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull().default("blue"),
  itemCount: integer("item_count").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url").notNull(),
  categoryId: integer("category_id").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("0.0"),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  tags: text("tags").array(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Ehri account linking table
export const ehriAccounts = pgTable("ehri_accounts", {
  id: serial("id").primaryKey(),
  ehriId: varchar("ehri_id").notNull().unique(),
  email: varchar("email").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: varchar("verification_token"),
  linkedAt: timestamp("linked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical professionals user table with license verification
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  
  // Authentication Information
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(), // bcrypt hashed password
  
  // Personal Information
  fullName: varchar("full_name").notNull(),
  
  // Medical License Information
  licenseNumber: varchar("license_number").notNull(),
  collegeName: varchar("college_name").notNull(), // Professional Association Name
  provinceState: varchar("province_state").notNull(), // Province or State of Registration
  
  // Practice Information
  practiceName: varchar("practice_name").notNull(),
  practiceAddress: text("practice_address").notNull(),
  
  // Account Status & Verification
  isApproved: boolean("is_approved").notNull().default(false),
  isLicenseVerified: boolean("is_license_verified").notNull().default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table for purchase history
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  orderNumber: varchar("order_number").notNull().unique(),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  billingAddress: jsonb("billing_address").notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table for detailed purchase history
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  productName: varchar("product_name").notNull(), // Store name at time of purchase
  productImageUrl: varchar("product_image_url"), // Store image URL at time of purchase
});

// Referrals table for doctor referral program
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  clinicName: varchar("clinic_name").notNull(),
  address: varchar("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  specialty: varchar("specialty").notNull(),
  licenseNumber: varchar("license_number").notNull(),
  yearsOfExperience: varchar("years_of_experience"),
  referredBy: varchar("referred_by"),
  referrerContact: varchar("referrer_contact"),
  additionalNotes: text("additional_notes"),
  status: varchar("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users table for secure admin access
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  name: varchar("name").notNull(),
  role: varchar("role").notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
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

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

// Database relations
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
  orderItems: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Authentication types
export type InsertEhriAccount = z.infer<typeof insertEhriAccountSchema>;
export type EhriAccount = typeof ehriAccounts.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export type ProductWithCategory = Product & { category: Category };
export type CartItemWithProduct = CartItem & { product: Product };
export type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };
export type OrderItemWithProduct = OrderItem & { product: Product };

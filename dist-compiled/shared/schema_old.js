"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featuredCarouselRelations = exports.categoriesRelations = exports.productsRelations = exports.orderItemsRelations = exports.ordersRelations = exports.usersRelations = exports.insertNewsletterSchema = exports.insertFeaturedCarouselSchema = exports.insertCarouselItemSchema = exports.insertAdminUserSchema = exports.insertReferralSchema = exports.insertOrderItemSchema = exports.insertOrderSchema = exports.insertUserSchema = exports.insertEhriAccountSchema = exports.insertCartItemSchema = exports.insertProductSchema = exports.insertBrandSchema = exports.insertCategorySchema = exports.featuredCarousel = exports.carouselItems = exports.adminUsers = exports.newsletters = exports.referrals = exports.orderItems = exports.orders = exports.users = exports.ehriAccounts = exports.sessions = exports.cartItems = exports.products = exports.brands = exports.categories = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_2 = require("drizzle-orm");
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.text)("icon").notNull(),
    color: (0, pg_core_1.varchar)("color", { length: 50 }).notNull().default("blue"),
    itemCount: (0, pg_core_1.integer)("item_count").notNull().default(0),
});
exports.brands = (0, pg_core_1.pgTable)("brands", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    imageUrl: (0, pg_core_1.text)("image_url"),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
});
exports.products = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    price: (0, pg_core_1.numeric)("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: (0, pg_core_1.numeric)("original_price", { precision: 10, scale: 2 }),
    imageUrl: (0, pg_core_1.text)("image_url").notNull(),
    imageUrls: (0, pg_core_1.json)("image_urls").default([]),
    categoryId: (0, pg_core_1.integer)("category_id").notNull(),
    rating: (0, pg_core_1.numeric)("rating", { precision: 3, scale: 1 }).notNull().default("0.0"),
    reviewCount: (0, pg_core_1.integer)("review_count").notNull().default(0),
    inStock: (0, pg_core_1.boolean)("in_stock").notNull().default(true),
    featured: (0, pg_core_1.boolean)("featured").notNull().default(false),
    tags: (0, pg_core_1.text)("tags"),
    bulkDiscounts: (0, pg_core_1.json)("bulk_discounts").default([]),
});
exports.cartItems = (0, pg_core_1.pgTable)("cart_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    sessionId: (0, pg_core_1.varchar)("session_id", { length: 255 }).notNull(),
    productId: (0, pg_core_1.integer)("product_id").notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull().default(1),
});
// Session storage table for authentication
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid", { length: 255 }).primaryKey(),
    sess: (0, pg_core_1.json)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => ({
    expireIdx: (0, pg_core_1.index)("IDX_session_expire").on(table.expire),
}));
// Ehri account linking table
exports.ehriAccounts = (0, pg_core_1.pgTable)("ehri_accounts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    ehriId: (0, pg_core_1.varchar)("ehri_id", { length: 255 }).notNull().unique(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    isVerified: (0, pg_core_1.boolean)("is_verified").notNull().default(false),
    verificationToken: (0, pg_core_1.varchar)("verification_token", { length: 255 }),
    linkedAt: (0, pg_core_1.timestamp)("linked_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
// Medical professionals user table with license verification  
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    // Authentication Information
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(), // bcrypt hashed password
    // Personal Information
    fullName: (0, pg_core_1.varchar)("full_name", { length: 255 }).notNull(),
    // Medical License Information
    licenseNumber: (0, pg_core_1.varchar)("license_number", { length: 100 }).notNull(),
    collegeName: (0, pg_core_1.varchar)("college_name", { length: 255 }).notNull(), // Professional Association Name
    provinceState: (0, pg_core_1.varchar)("province_state", { length: 100 }), // Province or State of Registration (optional)
    licenseExpiryDate: (0, pg_core_1.varchar)("license_expiry_date", { length: 50 }).notNull(), // License expiry date
    // Practice Information
    practiceAddress: (0, pg_core_1.text)("practice_address").notNull(),
    // Account Status & Verification
    isApproved: (0, pg_core_1.boolean)("is_approved").notNull().default(false),
    isLicenseVerified: (0, pg_core_1.boolean)("is_license_verified").notNull().default(false),
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    approvedBy: (0, pg_core_1.varchar)("approved_by", { length: 255 }),
    // Saved payment information (encrypted for convenience)
    savedCardInfo: (0, pg_core_1.json)("saved_card_info"), // { last4, expiryMonth, expiryYear, cardType, billingAddress }
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
// Orders table for purchase history
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id", { length: 255 }).notNull(),
    orderNumber: (0, pg_core_1.varchar)("order_number", { length: 255 }).notNull().unique(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("pending"), // pending, approved, declined, shipped, delivered, cancelled
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 10, scale: 2 }).notNull(),
    // Shipping & Billing Information
    shippingAddress: (0, pg_core_1.json)("shipping_address").notNull(),
    billingAddress: (0, pg_core_1.json)("billing_address").notNull(),
    // Doctor's Banking Information (Admin Only)
    doctorBankingInfo: (0, pg_core_1.json)("doctor_banking_info").notNull(), // { bankName, accountNumber, routingNumber, accountType }
    institutionNumber: (0, pg_core_1.varchar)("institution_number", { length: 100 }).notNull(),
    // Card Information (Admin Only)
    cardInfo: (0, pg_core_1.json)("card_info").notNull(), // { last4, expiryMonth, expiryYear, cardType }
    // Payment Details
    paymentMethod: (0, pg_core_1.varchar)("payment_method", { length: 50 }).notNull(),
    paymentStatus: (0, pg_core_1.varchar)("payment_status", { length: 50 }).notNull().default("pending"), // pending, paid, failed, refunded
    // Doctor Information
    doctorEmail: (0, pg_core_1.varchar)("doctor_email", { length: 255 }).notNull(),
    doctorName: (0, pg_core_1.varchar)("doctor_name", { length: 255 }).notNull(),
    doctorPhone: (0, pg_core_1.varchar)("doctor_phone", { length: 50 }),
    // Admin Actions
    approvedBy: (0, pg_core_1.varchar)("approved_by", { length: 255 }), // Admin email who approved/declined
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    declineReason: (0, pg_core_1.text)("decline_reason"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
// Order items table for detailed purchase history
exports.orderItems = (0, pg_core_1.pgTable)("order_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    orderId: (0, pg_core_1.integer)("order_id").notNull(),
    productId: (0, pg_core_1.integer)("product_id").notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    unitPrice: (0, pg_core_1.numeric)("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalPrice: (0, pg_core_1.numeric)("total_price", { precision: 10, scale: 2 }).notNull(),
    productName: (0, pg_core_1.varchar)("product_name", { length: 255 }).notNull(), // Store name at time of purchase
    productImageUrl: (0, pg_core_1.varchar)("product_image_url", { length: 500 }), // Store image URL at time of purchase
});
// Referrals table for doctor referral program
exports.referrals = (0, pg_core_1.pgTable)("referrals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 255 }).notNull(),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    phone: (0, pg_core_1.varchar)("phone", { length: 50 }).notNull(),
    specialty: (0, pg_core_1.varchar)("specialty", { length: 255 }).notNull(),
    licenseNumber: (0, pg_core_1.varchar)("license_number", { length: 100 }).notNull(),
    yearsOfExperience: (0, pg_core_1.varchar)("years_of_experience", { length: 50 }),
    referredBy: (0, pg_core_1.varchar)("referred_by", { length: 255 }),
    referrerContact: (0, pg_core_1.varchar)("referrer_contact", { length: 255 }),
    additionalNotes: (0, pg_core_1.text)("additional_notes"),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).default("pending"), // pending, approved, rejected
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
// Newsletter subscription table
exports.newsletters = (0, pg_core_1.pgTable)("newsletters", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    subscribedAt: (0, pg_core_1.timestamp)("subscribed_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
});
// Admin users table for secure admin access
exports.adminUsers = (0, pg_core_1.pgTable)("admin_users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)("password_hash", { length: 255 }).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    role: (0, pg_core_1.varchar)("role", { length: 50 }).notNull().default("admin"),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    lastLoginAt: (0, pg_core_1.timestamp)("last_login_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
// Carousel items table for managing hero slideshow
exports.carouselItems = (0, pg_core_1.pgTable)("carousel_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    subtitle: (0, pg_core_1.varchar)("subtitle", { length: 255 }),
    description: (0, pg_core_1.text)("description").notNull(),
    price: (0, pg_core_1.varchar)("price", { length: 50 }).notNull(),
    originalPrice: (0, pg_core_1.varchar)("original_price", { length: 50 }),
    discount: (0, pg_core_1.varchar)("discount", { length: 20 }),
    discountPercentage: (0, pg_core_1.integer)("discount_percentage"),
    imageUrl: (0, pg_core_1.text)("image_url").notNull(),
    backgroundGradient: (0, pg_core_1.varchar)("background_gradient", { length: 200 }).default("linear-gradient(135deg, #667eea 0%, #764ba2 100%)"),
    textColor: (0, pg_core_1.varchar)("text_color", { length: 50 }).default("#ffffff"),
    onSale: (0, pg_core_1.boolean)("on_sale").default(false).notNull(),
    badgeText: (0, pg_core_1.varchar)("badge_text", { length: 50 }),
    badgeColor: (0, pg_core_1.varchar)("badge_color", { length: 50 }).default("#ef4444"),
    animationType: (0, pg_core_1.varchar)("animation_type", { length: 50 }).default("fade"),
    displayDuration: (0, pg_core_1.integer)("display_duration").default(5000),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
// Featured products carousel for scrolling display
exports.featuredCarousel = (0, pg_core_1.pgTable)("featured_carousel", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    productId: (0, pg_core_1.integer)("product_id").notNull(),
    displayOrder: (0, pg_core_1.integer)("display_order").notNull().default(0),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
exports.insertCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.categories).omit({
    id: true,
});
exports.insertBrandSchema = (0, drizzle_zod_1.createInsertSchema)(exports.brands).omit({
    id: true,
});
exports.insertProductSchema = (0, drizzle_zod_1.createInsertSchema)(exports.products).omit({
    id: true,
});
exports.insertCartItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cartItems).omit({
    id: true,
});
// Schema validation for new tables
exports.insertEhriAccountSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ehriAccounts).omit({
    id: true,
    isVerified: true,
    linkedAt: true,
    createdAt: true,
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    isApproved: true,
    isLicenseVerified: true,
    approvedAt: true,
    approvedBy: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orders).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertOrderItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orderItems).omit({
    id: true,
});
exports.insertReferralSchema = (0, drizzle_zod_1.createInsertSchema)(exports.referrals).omit({
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertAdminUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.adminUsers).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
});
exports.insertCarouselItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.carouselItems).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertFeaturedCarouselSchema = (0, drizzle_zod_1.createInsertSchema)(exports.featuredCarousel).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertNewsletterSchema = (0, drizzle_zod_1.createInsertSchema)(exports.newsletters).omit({
    id: true,
    subscribedAt: true,
});
// Database relations
exports.usersRelations = (0, drizzle_orm_2.relations)(exports.users, ({ many }) => ({
    orders: many(exports.orders),
}));
exports.ordersRelations = (0, drizzle_orm_2.relations)(exports.orders, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.orders.userId],
        references: [exports.users.id],
    }),
    items: many(exports.orderItems),
}));
exports.orderItemsRelations = (0, drizzle_orm_2.relations)(exports.orderItems, ({ one }) => ({
    order: one(exports.orders, {
        fields: [exports.orderItems.orderId],
        references: [exports.orders.id],
    }),
    product: one(exports.products, {
        fields: [exports.orderItems.productId],
        references: [exports.products.id],
    }),
}));
exports.productsRelations = (0, drizzle_orm_2.relations)(exports.products, ({ one, many }) => ({
    category: one(exports.categories, {
        fields: [exports.products.categoryId],
        references: [exports.categories.id],
    }),
    orderItems: many(exports.orderItems),
}));
exports.categoriesRelations = (0, drizzle_orm_2.relations)(exports.categories, ({ many }) => ({
    products: many(exports.products),
}));
exports.featuredCarouselRelations = (0, drizzle_orm_2.relations)(exports.featuredCarousel, ({ one }) => ({
    product: one(exports.products, {
        fields: [exports.featuredCarousel.productId],
        references: [exports.products.id],
    }),
}));
//# sourceMappingURL=schema_old.js.map
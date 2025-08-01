var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/email.ts
var email_exports = {};
__export(email_exports, {
  emailService: () => emailService
});
import nodemailer from "nodemailer";
var EmailService, emailService;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    EmailService = class {
      transporter = null;
      /**
       * Initialize email transporter with Gmail SMTP
       * Requires GMAIL_USER and GMAIL_APP_PASSWORD environment variables
       */
      async initialize() {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;
        if (!gmailUser || !gmailPass) {
          console.warn("Gmail credentials not provided - email functionality disabled");
          return;
        }
        try {
          this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: gmailUser,
              pass: gmailPass
              // Gmail App Password (not regular password)
            }
          });
          await this.transporter.verify();
          console.log("\u2705 Email service initialized successfully");
        } catch (error) {
          console.error("\u274C Failed to initialize email service:", error);
          this.transporter = null;
        }
      }
      /**
       * Send email using configured transporter
       */
      async sendEmail(emailData) {
        if (!this.transporter) {
          console.warn("Email service not initialized - skipping email send");
          return false;
        }
        try {
          const info = await this.transporter.sendMail({
            from: `"MedMarketplace" <${process.env.GMAIL_USER}>`,
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text
          });
          console.log("\u2705 Email sent successfully:", info.messageId);
          return true;
        } catch (error) {
          console.error("\u274C Failed to send email:", error);
          return false;
        }
      }
      /**
       * Send doctor registration confirmation email
       */
      async sendDoctorRegistrationConfirmation(doctorEmail, doctorName) {
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u{1F3E5} MedMarketplace</h1>
            <p>Professional Medical Supply Platform</p>
          </div>
          <div class="content">
            <h2>Hello Dr. ${doctorName},</h2>
            <p><strong>Thank you for your registration!</strong></p>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="status-badge">\u2713 Registration Received</span>
            </div>
            
            <p>Your medical professional account has been successfully submitted and is currently under review by our verification team.</p>
            
            <h3>Next Steps:</h3>
            <ul>
              <li>Our team will verify your medical license credentials</li>
              <li>You'll receive an approval notification within 1-2 business days</li>
              <li>Once approved, you'll have full access to our medical product catalog</li>
            </ul>
            
            <p><strong>Important:</strong> Your account is pending approval. You'll be notified once verification is complete.</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>
            The MedMarketplace Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const emailText = `
      Hello Dr. ${doctorName},

      Thank you for your registration with MedMarketplace!

      Your medical professional account has been successfully submitted and is currently under review by our verification team.

      Next Steps:
      - Our team will verify your medical license credentials
      - You'll receive an approval notification within 1-2 business days
      - Once approved, you'll have full access to our medical product catalog

      Your account is pending approval. You'll be notified once verification is complete.

      Best regards,
      The MedMarketplace Team
    `;
        return await this.sendEmail({
          to: doctorEmail,
          subject: "Registration Confirmation - Account Pending Approval",
          html: emailHtml,
          text: emailText
        });
      }
      /**
       * Send admin notification about new doctor registration
       */
      async sendAdminNotification(doctorData) {
        const adminEmail = "amjadkhabbas2002@gmail.com";
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Registration Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
          .detail-row { margin: 10px 0; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #3b82f6; }
          .label { font-weight: bold; color: #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Registration Request</h2>
          </div>
          <div class="content">
            <p><strong>A new medical professional has submitted a registration request:</strong></p>
            
            <div class="detail-row"><span class="label">Full Name:</span> ${doctorData.fullName}</div>
            <div class="detail-row"><span class="label">Email:</span> ${doctorData.email}</div>
            ${doctorData.phone ? `<div class="detail-row"><span class="label">Phone:</span> ${doctorData.phone}</div>` : ""}
            <div class="detail-row"><span class="label">License Number:</span> ${doctorData.licenseNumber}</div>
            <div class="detail-row"><span class="label">Medical College:</span> ${doctorData.collegeName}</div>
            <div class="detail-row"><span class="label">Province/State:</span> ${doctorData.provinceState}</div>
            <div class="detail-row"><span class="label">Practice Name:</span> ${doctorData.practiceName}</div>
            <div class="detail-row"><span class="label">Practice Address:</span> ${doctorData.practiceAddress}</div>
            <div class="detail-row"><span class="label">Registration Date:</span> ${(/* @__PURE__ */ new Date()).toLocaleString()}</div>
            
            <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <strong>Action Required:</strong> Please review this registration and approve or reject via the admin dashboard.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
        const emailText = `
      New Registration Request

      A new medical professional has submitted a registration request:

      Name: ${doctorData.fullName}
      Email: ${doctorData.email}
      ${doctorData.phone ? `Phone: ${doctorData.phone}` : ""}
      License Number: ${doctorData.licenseNumber}
      Medical College: ${doctorData.collegeName}
      Province/State: ${doctorData.provinceState}
      Practice Name: ${doctorData.practiceName}
      Practice Address: ${doctorData.practiceAddress}
      Registration Date: ${(/* @__PURE__ */ new Date()).toLocaleString()}

      Please review this registration and approve or reject via the admin dashboard.
    `;
        return await this.sendEmail({
          to: adminEmail,
          subject: "New Registration Request",
          html: emailHtml,
          text: emailText
        });
      }
      /**
       * Send approval/rejection email to doctor
       */
      async sendApprovalEmail(doctorEmail, doctorName, approved) {
        const status = approved ? "Approved" : "Rejected";
        const statusColor = approved ? "#10b981" : "#ef4444";
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Registration ${status}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-badge { background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Medical Marketplace</h1>
            <p>Registration ${status}</p>
          </div>
          <div class="content">
            <h2>Hello Dr. ${doctorName},</h2>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="status-badge">${approved ? "\u2713" : "\u2717"} ${status}</span>
            </div>
            
            ${approved ? `
              <p><strong>Congratulations!</strong> Your medical professional account has been approved.</p>
              <p>You now have full access to our medical product catalog and can begin placing orders.</p>
              <p>You can log in to your account using the credentials you provided during registration.</p>
            ` : `
              <p>We regret to inform you that your registration application has not been approved at this time.</p>
              <p>This decision may be due to incomplete information or verification requirements not being met.</p>
              <p>If you believe this is an error or would like to resubmit your application, please contact our support team.</p>
            `}
            
            <p>Best regards,<br>
            The Medical Marketplace Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return await this.sendEmail({
          to: doctorEmail,
          subject: `Registration ${status} - Medical Marketplace`,
          html: emailHtml
        });
      }
    };
    emailService = new EmailService();
    emailService.initialize();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminUsers: () => adminUsers,
  brands: () => brands,
  carouselItems: () => carouselItems,
  cartItems: () => cartItems,
  cartItemsRelations: () => cartItemsRelations,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  ehriAccounts: () => ehriAccounts,
  featuredCarousel: () => featuredCarousel,
  featuredCarouselRelations: () => featuredCarouselRelations,
  insertAdminUserSchema: () => insertAdminUserSchema,
  insertBrandSchema: () => insertBrandSchema,
  insertCarouselItemSchema: () => insertCarouselItemSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertEhriAccountSchema: () => insertEhriAccountSchema,
  insertFeaturedCarouselSchema: () => insertFeaturedCarouselSchema,
  insertNewsletterSchema: () => insertNewsletterSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  insertReferralSchema: () => insertReferralSchema,
  insertUserSchema: () => insertUserSchema,
  newsletters: () => newsletters,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  referrals: () => referrals,
  sessions: () => sessions,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, integer, boolean, numeric, timestamp, varchar, json, index, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: varchar("color", { length: 50 }).notNull().default("blue"),
  itemCount: integer("item_count").notNull().default(0)
});
var brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true)
});
var products = pgTable("products", {
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
  bulkDiscounts: json("bulk_discounts").default("[]")
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1)
});
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire)
  })
);
var ehriAccounts = pgTable("ehri_accounts", {
  id: serial("id").primaryKey(),
  ehriId: varchar("ehri_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  linkedAt: timestamp("linked_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  // Authentication Information
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  // bcrypt hashed password
  // Personal Information
  fullName: varchar("full_name", { length: 255 }).notNull(),
  // Medical License Information
  licenseNumber: varchar("license_number", { length: 100 }).notNull(),
  collegeName: varchar("college_name", { length: 255 }).notNull(),
  // Professional Association Name
  provinceState: varchar("province_state", { length: 100 }),
  // Province or State of Registration (optional)
  licenseExpiryDate: varchar("license_expiry_date", { length: 50 }).notNull(),
  // License expiry date
  // Practice Information
  practiceAddress: text("practice_address").notNull(),
  // Account Status & Verification
  isApproved: boolean("is_approved").notNull().default(false),
  isLicenseVerified: boolean("is_license_verified").notNull().default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by", { length: 255 }),
  // Saved payment information (encrypted for convenience)
  savedCardInfo: json("saved_card_info"),
  // { last4, expiryMonth, expiryYear, cardType, billingAddress }
  // Timestamps
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  orderNumber: varchar("order_number", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  // pending, approved, declined, shipped, delivered, cancelled
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  // Shipping & Billing Information
  shippingAddress: json("shipping_address").notNull(),
  billingAddress: json("billing_address").notNull(),
  // Doctor's Banking Information (Admin Only)
  doctorBankingInfo: json("doctor_banking_info").notNull(),
  // { bankName, accountNumber, routingNumber, accountType }
  institutionNumber: varchar("institution_number", { length: 100 }).notNull(),
  // Card Information (Admin Only)
  cardInfo: json("card_info").notNull(),
  // { last4, expiryMonth, expiryYear, cardType }
  // Payment Details
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("pending"),
  // pending, paid, failed, refunded
  // Doctor Information
  doctorEmail: varchar("doctor_email", { length: 255 }).notNull(),
  doctorName: varchar("doctor_name", { length: 255 }).notNull(),
  doctorPhone: varchar("doctor_phone", { length: 50 }),
  // Admin Actions
  approvedBy: varchar("approved_by", { length: 255 }),
  // Admin email who approved/declined
  approvedAt: timestamp("approved_at"),
  declineReason: text("decline_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  // Store name at time of purchase
  productImageUrl: varchar("product_image_url", { length: 500 })
  // Store image URL at time of purchase
});
var referrals = pgTable("referrals", {
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
  status: varchar("status", { length: 50 }).default("pending"),
  // pending, approved, rejected
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  isActive: boolean("is_active").notNull().default(true)
});
var adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var carouselItems = pgTable("carousel_items", {
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
  displayDuration: integer("display_duration").default(5e3),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var featuredCarousel = pgTable("featured_carousel", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});
var insertBrandSchema = createInsertSchema(brands).omit({
  id: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true
});
var insertEhriAccountSchema = createInsertSchema(ehriAccounts).omit({
  id: true,
  isVerified: true,
  linkedAt: true,
  createdAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isApproved: true,
  isLicenseVerified: true,
  approvedAt: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true
});
var insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
});
var insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  subscribedAt: true
});
var insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true
});
var insertCarouselItemSchema = createInsertSchema(carouselItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertFeaturedCarouselSchema = createInsertSchema(featuredCarousel).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var usersRelations = relations(users, ({ many }) => ({
  orders: many(orders)
}));
var ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  items: many(orderItems)
}));
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));
var productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  featuredCarousel: many(featuredCarousel)
}));
var categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));
var cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id]
  })
}));
var featuredCarouselRelations = relations(featuredCarousel, ({ one }) => ({
  product: one(products, {
    fields: [featuredCarousel.productId],
    references: [products.id]
  })
}));

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Please check your environment variables.");
}
console.log("Connecting to PostgreSQL database:", {
  url: process.env.DATABASE_URL.replace(/:[^:@]*@/, ":***@")
  // Hide password in logs
});
var connection = postgres(process.env.DATABASE_URL);
var db = drizzle(connection, { schema: schema_exports });

// server/storage.ts
import { eq, and, desc, ilike, or, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  constructor() {
    this.initializeData();
  }
  // Ehri Account operations
  async createEhriAccount(account) {
    const [ehriAccount] = await db.insert(ehriAccounts).values(account).returning();
    return ehriAccount;
  }
  async getEhriAccountByEhriId(ehriId) {
    const [ehriAccount] = await db.select().from(ehriAccounts).where(eq(ehriAccounts.ehriId, ehriId));
    return ehriAccount || void 0;
  }
  async getEhriAccountByEmail(email) {
    const [ehriAccount] = await db.select().from(ehriAccounts).where(eq(ehriAccounts.email, email));
    return ehriAccount || void 0;
  }
  async verifyEhriAccount(ehriId, token) {
    const [ehriAccount] = await db.select().from(ehriAccounts).where(and(eq(ehriAccounts.ehriId, ehriId), eq(ehriAccounts.verificationToken, token)));
    if (ehriAccount) {
      await db.update(ehriAccounts).set({ isVerified: true, linkedAt: /* @__PURE__ */ new Date(), verificationToken: null }).where(eq(ehriAccounts.id, ehriAccount.id));
      return true;
    }
    return false;
  }
  // User operations
  async createUser(user) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  async getUserById(id) {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      password: users.password,
      fullName: users.fullName,
      licenseNumber: users.licenseNumber,
      collegeName: users.collegeName,
      provinceState: users.provinceState,
      licenseExpiryDate: users.licenseExpiryDate,
      practiceAddress: users.practiceAddress,
      isApproved: users.isApproved,
      isLicenseVerified: users.isLicenseVerified,
      approvedAt: users.approvedAt,
      approvedBy: users.approvedBy,
      savedCardInfo: users.savedCardInfo,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      password: users.password,
      fullName: users.fullName,
      licenseNumber: users.licenseNumber,
      collegeName: users.collegeName,
      provinceState: users.provinceState,
      licenseExpiryDate: users.licenseExpiryDate,
      practiceAddress: users.practiceAddress,
      isApproved: users.isApproved,
      isLicenseVerified: users.isLicenseVerified,
      approvedAt: users.approvedAt,
      approvedBy: users.approvedBy,
      savedCardInfo: users.savedCardInfo,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async approveUser(userId, approvedBy) {
    const [user] = await db.update(users).set({ isApproved: true, approvedAt: /* @__PURE__ */ new Date(), approvedBy }).where(eq(users.id, userId)).returning();
    return user || void 0;
  }
  async getPendingUsers() {
    return await db.select({
      id: users.id,
      email: users.email,
      password: users.password,
      fullName: users.fullName,
      licenseNumber: users.licenseNumber,
      collegeName: users.collegeName,
      provinceState: users.provinceState,
      licenseExpiryDate: users.licenseExpiryDate,
      practiceAddress: users.practiceAddress,
      isApproved: users.isApproved,
      isLicenseVerified: users.isLicenseVerified,
      approvedAt: users.approvedAt,
      approvedBy: users.approvedBy,
      savedCardInfo: users.savedCardInfo,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.isApproved, false));
  }
  async deleteUser(userId) {
    try {
      await db.delete(users).where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  async getCategories() {
    return await db.select().from(categories);
  }
  async getCategoryBySlug(slug) {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || void 0;
  }
  async updateCategoryIcon(id, icon) {
    const [category] = await db.update(categories).set({ icon }).where(eq(categories.id, id)).returning();
    return category || void 0;
  }
  async createCategory(categoryData) {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }
  async updateCategory(id, updates) {
    const [category] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
    return category || void 0;
  }
  async deleteCategory(id) {
    try {
      const result = await db.delete(categories).where(eq(categories.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Delete category error:", error);
      return false;
    }
  }
  async getBrands() {
    return await db.select().from(brands).where(eq(brands.isActive, true));
  }
  async getBrandById(id) {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand || void 0;
  }
  async updateBrandImage(id, imageUrl) {
    const [brand] = await db.update(brands).set({ imageUrl }).where(eq(brands.id, id)).returning();
    return brand || void 0;
  }
  async getProducts(options = {}) {
    let query = db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      categoryId: products.categoryId,
      featured: products.featured,
      inStock: products.inStock,
      rating: products.rating,
      reviewCount: products.reviewCount,
      imageUrl: sql2`''`.as("imageUrl"),
      // Empty string for list view
      imageUrls: sql2`NULL`.as("imageUrls"),
      tags: sql2`NULL`.as("tags"),
      bulkDiscounts: sql2`NULL`.as("bulkDiscounts")
    }).from(products);
    if (options.categoryId) {
      query = query.where(eq(products.categoryId, options.categoryId));
    }
    if (options.featured) {
      query = query.where(eq(products.featured, true));
    }
    if (options.search) {
      query = query.where(
        or(
          ilike(products.name, `%${options.search}%`),
          ilike(products.description, `%${options.search}%`)
        )
      );
    }
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    query = query.orderBy(products.categoryId, products.id).limit(limit).offset(offset);
    const results = await query;
    return results;
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || void 0;
  }
  async createProduct(productData) {
    const productWithDiscounts = {
      ...productData,
      bulkDiscounts: productData.bulkDiscounts || []
    };
    const [product] = await db.insert(products).values(productWithDiscounts).returning();
    return product;
  }
  async deleteProduct(id) {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Delete product error:", error);
      return false;
    }
  }
  async getProductsWithCategory(options = {}) {
    let query = db.select({
      id: products.id,
      name: products.name,
      price: products.price,
      description: products.description,
      categoryId: products.categoryId,
      featured: products.featured,
      inStock: products.inStock,
      originalPrice: products.originalPrice,
      rating: products.rating,
      reviewCount: products.reviewCount
    }).from(products);
    let whereConditions = [];
    if (options.categoryId) {
      whereConditions.push(eq(products.categoryId, options.categoryId));
    }
    if (options.categorySlug) {
      const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, options.categorySlug));
      if (category) {
        whereConditions.push(eq(products.categoryId, category.id));
      } else {
        return [];
      }
    }
    if (options.featured) {
      whereConditions.push(eq(products.featured, true));
    }
    if (options.search) {
      whereConditions.push(
        or(
          ilike(products.name, `%${options.search}%`),
          ilike(products.description, `%${options.search}%`)
        )
      );
    }
    if (whereConditions.length > 0) {
      query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
    }
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    query = query.limit(limit).offset(offset);
    const results = await query;
    let categoryData = null;
    if (options.categorySlug && results.length > 0) {
      const [category] = await db.select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        color: categories.color,
        itemCount: categories.itemCount
      }).from(categories).where(eq(categories.slug, options.categorySlug));
      categoryData = category;
    }
    return results.map((result) => ({
      ...result,
      imageUrl: `/api/products/${result.id}/image`,
      // Use endpoint URL
      imageUrls: null,
      // Not loaded in list view
      tags: null,
      // Not loaded in list view  
      bulkDiscounts: null,
      // Will be loaded individually when needed
      category: categoryData
      // Add category data for all products in this category
    }));
  }
  async getProductsCount(options = {}) {
    try {
      let query = db.select({ count: sql2`count(*)` }).from(products);
      let whereConditions = [];
      if (options.categorySlug) {
        const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, options.categorySlug));
        if (category) {
          whereConditions.push(eq(products.categoryId, category.id));
        } else {
          return 0;
        }
      } else if (options.categoryId) {
        whereConditions.push(eq(products.categoryId, options.categoryId));
      }
      if (options.featured) {
        whereConditions.push(eq(products.featured, true));
      }
      if (options.search) {
        whereConditions.push(
          or(
            ilike(products.name, `%${options.search}%`),
            ilike(products.description, `%${options.search}%`)
          )
        );
      }
      if (whereConditions.length > 0) {
        query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
      }
      const [result] = await query;
      return Number(result.count);
    } catch (error) {
      console.error("Error in getProductsCount:", error);
      return 0;
    }
  }
  async getCartItems(sessionId) {
    const results = await db.select().from(cartItems).leftJoin(products, eq(cartItems.productId, products.id)).where(eq(cartItems.sessionId, sessionId));
    return results.map((result) => ({
      ...result.cart_items,
      product: result.products
    }));
  }
  async addToCart(item) {
    const [existingItem] = await db.select().from(cartItems).where(
      and(
        eq(cartItems.sessionId, item.sessionId),
        eq(cartItems.productId, item.productId)
      )
    );
    if (existingItem) {
      const [updatedItem] = await db.update(cartItems).set({ quantity: existingItem.quantity + item.quantity }).where(eq(cartItems.id, existingItem.id)).returning();
      return updatedItem;
    } else {
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }
  async updateCartItem(id, quantity) {
    const [updatedItem] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updatedItem || void 0;
  }
  async removeFromCart(id) {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async clearCart(sessionId) {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }
  async createOrder(orderData, orderItemsData) {
    const [order] = await db.insert(orders).values(orderData).returning();
    const itemsWithOrderId = orderItemsData.map((item) => ({
      ...item,
      orderId: order.id
    }));
    await db.insert(orderItems).values(itemsWithOrderId);
    return order;
  }
  async getUserOrders(userId) {
    const ordersResult = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const itemsResult = await db.select().from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, order.id));
        const items = itemsResult.map((result) => ({
          ...result.order_items,
          product: result.products
        }));
        return {
          ...order,
          items
        };
      })
    );
    return ordersWithItems;
  }
  async getAllOrders() {
    const ordersResult = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const itemsResult = await db.select().from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, order.id));
        const items = itemsResult.map((result) => ({
          ...result.order_items,
          product: result.products
        }));
        return {
          ...order,
          items
        };
      })
    );
    return ordersWithItems;
  }
  async getOrderById(orderId, userId) {
    let query = db.select().from(orders).where(eq(orders.id, orderId));
    if (userId) {
      query = query.where(and(eq(orders.id, orderId), eq(orders.userId, userId)));
    }
    const [order] = await query;
    if (!order) return void 0;
    const itemsResult = await db.select().from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, orderId));
    const items = itemsResult.map((result) => ({
      ...result.order_items,
      product: result.products
    }));
    return {
      ...order,
      items
    };
  }
  async updateOrderStatus(orderId, status) {
    const [order] = await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, orderId)).returning();
    return order || void 0;
  }
  // Admin order management
  async getPendingOrders() {
    const ordersResult = await db.select().from(orders).where(eq(orders.status, "pending")).orderBy(desc(orders.createdAt));
    const ordersWithItems = [];
    for (const order of ordersResult) {
      const itemsResult = await db.select().from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, order.id));
      const items = itemsResult.map((result) => ({
        ...result.order_items,
        product: result.products
      }));
      ordersWithItems.push({
        ...order,
        items
      });
    }
    return ordersWithItems;
  }
  async approveOrder(orderId, adminEmail) {
    const [order] = await db.update(orders).set({
      status: "approved",
      approvedBy: adminEmail,
      approvedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(orders.id, orderId)).returning();
    return order || void 0;
  }
  async declineOrder(orderId, adminEmail, reason) {
    const [order] = await db.update(orders).set({
      status: "declined",
      approvedBy: adminEmail,
      approvedAt: /* @__PURE__ */ new Date(),
      declineReason: reason,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(orders.id, orderId)).returning();
    return order || void 0;
  }
  async createReferral(referralData) {
    const [referral] = await db.insert(referrals).values(referralData).returning();
    return referral;
  }
  async subscribeToNewsletter(email) {
    try {
      const [subscription] = await db.insert(newsletters).values({ email }).returning();
      return subscription;
    } catch (error) {
      if (error.code === "23505") {
        const existing = await db.select().from(newsletters).where(eq(newsletters.email, email)).limit(1);
        if (existing.length > 0) {
          return existing[0];
        }
      }
      throw error;
    }
  }
  async getNewsletterSubscriptions() {
    return await db.select().from(newsletters).where(eq(newsletters.isActive, true)).orderBy(desc(newsletters.subscribedAt));
  }
  async unsubscribeFromNewsletter(email) {
    const result = await db.update(newsletters).set({ isActive: false }).where(eq(newsletters.email, email));
    return result.rowCount > 0;
  }
  async cancelOrder(orderId, userId) {
    const [updatedOrder] = await db.update(orders).set({ status: "cancelled" }).where(and(eq(orders.id, orderId), eq(orders.userId, userId), ne(orders.status, "delivered"))).returning();
    return updatedOrder;
  }
  // Admin operations
  async createAdminUser(adminData) {
    const [admin] = await db.insert(adminUsers).values(adminData).returning();
    return admin;
  }
  async getAdminByEmail(email) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || void 0;
  }
  async getAdminById(id) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || void 0;
  }
  async updateAdminLastLogin(id) {
    await db.update(adminUsers).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq(adminUsers.id, id));
  }
  // Admin product management
  async updateProductPrice(productId, price) {
    const [product] = await db.update(products).set({ price }).where(eq(products.id, productId)).returning();
    return product || void 0;
  }
  async updateProductImage(productId, imageUrl) {
    try {
      const [updatedProduct] = await db.update(products).set({ imageUrl }).where(eq(products.id, productId)).returning();
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product image:", error);
      return null;
    }
  }
  async updateProductImages(productId, imageUrl, imageUrls) {
    try {
      const [updatedProduct] = await db.update(products).set({
        imageUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : []
      }).where(eq(products.id, productId)).returning();
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product images:", error);
      return void 0;
    }
  }
  async updateProduct(id, updates) {
    try {
      const updateData = {};
      if (updates.name !== void 0) updateData.name = updates.name;
      if (updates.description !== void 0) updateData.description = updates.description;
      if (updates.price !== void 0) updateData.price = updates.price;
      if (updates.categoryId !== void 0) updateData.categoryId = updates.categoryId;
      if (updates.imageUrl !== void 0) updateData.imageUrl = updates.imageUrl;
      if (updates.inStock !== void 0) updateData.inStock = updates.inStock;
      if (updates.featured !== void 0) updateData.featured = updates.featured;
      if (updates.tags !== void 0) updateData.tags = updates.tags;
      const [updatedProduct] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
      return updatedProduct || void 0;
    } catch (error) {
      console.error("Error updating product:", error);
      return void 0;
    }
  }
  async initializeData() {
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) {
      return;
    }
    const categoriesData = [
      {
        name: "Botulinum Toxins",
        slug: "botulinum-toxins",
        description: "Premium botulinum toxin products for aesthetic and therapeutic applications",
        icon: "\u{1F489}",
        color: "#3B82F6",
        itemCount: 8
      },
      {
        name: "Dermal Fillers",
        slug: "dermal-fillers",
        description: "High-quality hyaluronic acid and other dermal filler solutions",
        icon: "\u{1F4A7}",
        color: "#10B981",
        itemCount: 12
      },
      {
        name: "Skin Care",
        slug: "skin-care",
        description: "Professional-grade skincare products and treatments",
        icon: "\u2728",
        color: "#F59E0B",
        itemCount: 15
      },
      {
        name: "Medical Devices",
        slug: "medical-devices",
        description: "Advanced medical devices and equipment for aesthetic procedures",
        icon: "\u{1F52C}",
        color: "#8B5CF6",
        itemCount: 6
      },
      {
        name: "Supplements",
        slug: "supplements",
        description: "Nutritional supplements and wellness products",
        icon: "\u{1F48A}",
        color: "#EF4444",
        itemCount: 10
      }
    ];
    await db.insert(categories).values(categoriesData);
    const productsData = [
      {
        name: "Botox 100 Units",
        description: "Premium botulinum toxin type A for facial aesthetics and therapeutic applications. FDA-approved for wrinkle reduction and muscle spasticity treatment.",
        price: "899.99",
        originalPrice: "999.99",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop",
        categoryId: 1,
        rating: "4.9",
        reviewCount: 127,
        inStock: true,
        featured: true,
        tags: ["FDA Approved", "Fast Acting", "Long Lasting"]
      },
      {
        name: "Juvederm Ultra XC",
        description: "Hyaluronic acid dermal filler with lidocaine for comfortable treatment. Ideal for lip enhancement and facial volume restoration.",
        price: "649.99",
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=500&fit=crop",
        categoryId: 2,
        rating: "4.8",
        reviewCount: 89,
        inStock: true,
        featured: true,
        tags: ["Hyaluronic Acid", "With Lidocaine", "Natural Results"]
      },
      {
        name: "SkinMedica TNS Essential Serum",
        description: "Advanced growth factor serum for skin rejuvenation and anti-aging. Clinically proven to improve skin texture and tone.",
        price: "289.99",
        originalPrice: "329.99",
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop",
        categoryId: 3,
        rating: "4.7",
        reviewCount: 156,
        inStock: true,
        featured: false,
        tags: ["Growth Factors", "Anti-Aging", "Clinically Tested"]
      },
      {
        name: "Micro-needling Device Pro",
        description: "Professional-grade automated micro-needling device for skin rejuvenation and collagen induction therapy.",
        price: "2199.99",
        originalPrice: "2499.99",
        imageUrl: "https://images.unsplash.com/photo-1585652757141-58ffa74c5c00?w=500&h=500&fit=crop",
        categoryId: 4,
        rating: "4.6",
        reviewCount: 34,
        inStock: true,
        featured: true,
        tags: ["Professional Grade", "Automated", "FDA Cleared"]
      },
      {
        name: "Collagen Peptides Plus",
        description: "High-quality marine collagen peptides with vitamin C and biotin for skin, hair, and nail health.",
        price: "79.99",
        originalPrice: "99.99",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop",
        categoryId: 5,
        rating: "4.5",
        reviewCount: 203,
        inStock: true,
        featured: false,
        tags: ["Marine Collagen", "Vitamin C", "Beauty Support"]
      },
      {
        name: "Restylane Kysse",
        description: "Lip filler specifically designed for natural-looking lip enhancement with optimal flexibility and movement.",
        price: "679.99",
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
        categoryId: 2,
        rating: "4.9",
        reviewCount: 76,
        inStock: true,
        featured: true,
        tags: ["Lip Enhancement", "Natural Movement", "Long Lasting"]
      }
    ];
    await db.insert(products).values(productsData);
  }
  // Carousel management methods
  async getCarouselItems() {
    const items = await db.select().from(carouselItems).orderBy(carouselItems.sortOrder);
    return items;
  }
  async getCarouselItem(id) {
    const [item] = await db.select().from(carouselItems).where(eq(carouselItems.id, id));
    return item || void 0;
  }
  async createCarouselItem(itemData) {
    const [newItem] = await db.insert(carouselItems).values({
      ...itemData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return newItem;
  }
  async updateCarouselItem(id, updates) {
    const [updatedItem] = await db.update(carouselItems).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(carouselItems.id, id)).returning();
    return updatedItem || void 0;
  }
  async deleteCarouselItem(id) {
    const result = await db.delete(carouselItems).where(eq(carouselItems.id, id));
    return result.rowCount > 0;
  }
  async reorderCarouselItems(itemIds) {
    for (let i = 0; i < itemIds.length; i++) {
      await db.update(carouselItems).set({ sortOrder: i }).where(eq(carouselItems.id, itemIds[i]));
    }
  }
  // Featured Carousel Management
  async getFeaturedCarousel() {
    const results = await db.select({
      id: featuredCarousel.id,
      displayOrder: featuredCarousel.displayOrder,
      product: products
    }).from(featuredCarousel).leftJoin(products, eq(featuredCarousel.productId, products.id)).where(eq(featuredCarousel.isActive, true)).orderBy(featuredCarousel.displayOrder);
    return results.filter((result) => result.product !== null).map((result) => ({
      id: result.id,
      displayOrder: result.displayOrder,
      product: {
        ...result.product,
        imageUrl: `/api/products/${result.product.id}/image`
      }
    }));
  }
  async addToFeaturedCarousel(data) {
    const [item] = await db.insert(featuredCarousel).values(data).returning();
    return item;
  }
  async removeFromFeaturedCarousel(id) {
    const result = await db.delete(featuredCarousel).where(eq(featuredCarousel.id, id));
    return (result.rowCount ?? 0) > 0;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcryptjs";
import MemoryStore from "memorystore";
var MemoryStoreSession = MemoryStore(session);
async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}
async function comparePasswords(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "medical-marketplace-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 864e5
      // prune expired entries every 24h
    }),
    cookie: {
      secure: false,
      // Set to false for Replit development
      httpOnly: true,
      maxAge: 1e3 * 60 * 60 * 24 * 7,
      // 7 days
      sameSite: "lax"
      // Add sameSite for better compatibility
    }
  };
  app2.set("trust proxy", true);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const isValidPassword = await comparePasswords(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!user.isApproved) {
            return done(null, false, { message: "Account pending approval. Please wait for admin verification." });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, confirmPassword, fullName, licenseNumber, collegeName, provinceState, practiceName, practiceAddress } = req.body;
      if (!email || !password || !confirmPassword || !fullName || !licenseNumber || !collegeName || !provinceState || !practiceName || !practiceAddress) {
        return res.status(400).json({
          message: "All fields are required",
          missingFields: {
            email: !email,
            password: !password,
            confirmPassword: !confirmPassword,
            fullName: !fullName,
            licenseNumber: !licenseNumber,
            collegeName: !collegeName,
            provinceState: !provinceState,
            practiceName: !practiceName,
            practiceAddress: !practiceAddress
          }
        });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        licenseNumber,
        collegeName,
        provinceState,
        practiceName,
        practiceAddress
      });
      res.status(201).json({
        message: "Registration successful! Your account is pending approval. You will be notified once your medical license is verified.",
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          isApproved: newUser.isApproved,
          isLicenseVerified: newUser.isLicenseVerified
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });
  app2.post("/api/admin/approve-user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { approvedBy } = req.body;
      const approvedUser = await storage.approveUser(parseInt(userId), approvedBy);
      if (!approvedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        message: "User approved successfully",
        user: approvedUser
      });
    } catch (error) {
      console.error("User approval error:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });
}
var requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// server/adminAuth.ts
import bcrypt2 from "bcryptjs";
var ADMIN_EMAIL = "amjadkhabbas2002@gmail.com";
var ADMIN_PASSWORD = "akramsnotcool!";
var ADMIN_NAME = "Amjad Khabbas";
var AdminAuthService = class {
  /**
   * Initialize the admin user in the database
   * Creates the hardcoded admin user if it doesn't exist
   */
  async initializeAdminUser() {
    try {
      const existingAdmin = await storage.getAdminByEmail(ADMIN_EMAIL);
      if (!existingAdmin) {
        const saltRounds = 12;
        const passwordHash = await bcrypt2.hash(ADMIN_PASSWORD, saltRounds);
        await storage.createAdminUser({
          email: ADMIN_EMAIL,
          passwordHash,
          name: ADMIN_NAME,
          role: "admin",
          isActive: true
        });
        console.log("Admin user initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing admin user:", error);
    }
  }
  /**
   * Authenticate admin user with email and password
   * @param email - Admin email address
   * @param password - Plain text password
   * @returns AdminUser if authenticated, null if failed
   */
  async authenticateAdmin(email, password) {
    try {
      const admin = await storage.getAdminByEmail(email);
      if (!admin || !admin.isActive) {
        return null;
      }
      const isPasswordValid = await bcrypt2.compare(password, admin.passwordHash);
      if (!isPasswordValid) {
        return null;
      }
      await storage.updateAdminLastLogin(admin.id);
      return admin;
    } catch (error) {
      console.error("Error authenticating admin:", error);
      return null;
    }
  }
  /**
   * Verify if a user ID belongs to an active admin
   * @param adminId - Admin user ID
   * @returns AdminUser if valid, null if not found or inactive
   */
  async verifyAdmin(adminId) {
    try {
      const admin = await storage.getAdminById(adminId);
      if (!admin || !admin.isActive) {
        return null;
      }
      return admin;
    } catch (error) {
      console.error("Error verifying admin:", error);
      return null;
    }
  }
};
var adminAuthService = new AdminAuthService();
function requireAdminAuth(req, res, next) {
  const adminId = req.session?.adminId;
  if (!adminId) {
    return res.status(401).json({
      message: "Admin authentication required",
      code: "ADMIN_AUTH_REQUIRED"
    });
  }
  if (adminId === 1) {
    req.admin = {
      id: 1,
      email: "amjadkhabbas2002@gmail.com",
      name: "Amjad Khabbas",
      role: "admin"
    };
    return next();
  }
  adminAuthService.verifyAdmin(adminId).then((admin) => {
    if (!admin) {
      delete req.session.adminId;
      return res.status(401).json({
        message: "Invalid admin session",
        code: "INVALID_ADMIN_SESSION"
      });
    }
    req.admin = admin;
    next();
  }).catch((error) => {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({
      message: "Authentication error",
      code: "AUTH_ERROR"
    });
  });
}
function checkAdminStatus(req, res, next) {
  const adminId = req.session?.adminId;
  if (!adminId) {
    req.isAdmin = false;
    req.admin = null;
    return next();
  }
  adminAuthService.verifyAdmin(adminId).then((admin) => {
    req.isAdmin = !!admin;
    req.admin = admin;
    next();
  }).catch((error) => {
    console.error("Admin status check error:", error);
    req.isAdmin = false;
    req.admin = null;
    next();
  });
}

// server/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
var fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};
var upload = multer({
  storage: storage2,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter
});
function setupUploadRoutes(app2) {
  app2.post("/api/upload/image", upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const imageUrl = `/api/uploads/${req.file.filename}`;
      res.json({
        message: "File uploaded successfully",
        imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });
  app2.post("/api/upload/images", upload.array("images", 10), (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const uploadedFiles = req.files.map((file) => ({
        imageUrl: `/api/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
      res.json({
        message: "Files uploaded successfully",
        files: uploadedFiles
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });
  app2.get("/api/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: "File not found" });
    }
    res.sendFile(filepath);
  });
  app2.delete("/api/uploads/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(uploadsDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(404).json({ message: "File not found" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Delete failed" });
    }
  });
}

// server/routes.ts
init_email();
async function registerRoutes(app2) {
  setupAuth(app2);
  await adminAuthService.initializeAdminUser();
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Unified login attempt:", { email, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
          code: "MISSING_CREDENTIALS"
        });
      }
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Normalized email:", normalizedEmail);
      console.log("Attempting database authentication for:", normalizedEmail);
      const admin = await adminAuthService.authenticateAdmin(normalizedEmail, password);
      if (admin) {
        req.session.adminId = admin.id;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({
              message: "Session error",
              code: "SESSION_ERROR"
            });
          }
          res.json({
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            }
          });
        });
        return;
      }
      console.log("Checking hardcoded admin:", normalizedEmail, password);
      if (normalizedEmail === "amjadkhabbas2002@gmail.com" && password === "akramsnotcool!") {
        console.log("Hardcoded admin login successful");
        req.session.adminId = 1;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({
              message: "Session error",
              code: "SESSION_ERROR"
            });
          }
          res.json({
            admin: {
              id: 1,
              email: "amjadkhabbas2002@gmail.com",
              name: "Amjad Khabbas",
              role: "admin"
            }
          });
        });
        return;
      }
      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS"
        });
      }
      if (!user.isApproved) {
        return res.status(403).json({
          message: "Your account is pending approval. Please wait for admin verification.",
          code: "ACCOUNT_PENDING"
        });
      }
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS"
        });
      }
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({
            message: "Session error",
            code: "SESSION_ERROR"
          });
        }
        res.json({
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            licenseNumber: user.licenseNumber,
            collegeName: user.collegeName,
            provinceState: user.provinceState,
            practiceName: user.practiceName,
            practiceAddress: user.practiceAddress,
            isApproved: user.isApproved,
            isLicenseVerified: user.isLicenseVerified
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "SERVER_ERROR"
      });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    if (req.session?.adminId) {
      const admin = await adminAuthService.verifyAdmin(req.session.adminId);
      if (admin) {
        return res.json({
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
          }
        });
      }
      if (req.session.adminId === 1) {
        return res.json({
          admin: {
            id: 1,
            email: "amjadkhabbas2002@gmail.com",
            name: "Amjad Khabbas",
            role: "admin"
          }
        });
      }
    }
    if (req.session?.userId) {
      const user = await storage.getUserById(req.session.userId);
      if (user && user.isApproved) {
        return res.json({
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            licenseNumber: user.licenseNumber,
            collegeName: user.collegeName,
            provinceState: user.provinceState,
            practiceName: user.practiceName,
            practiceAddress: user.practiceAddress,
            isApproved: user.isApproved,
            isLicenseVerified: user.isLicenseVerified
          }
        });
      }
    }
    return res.status(401).json({
      message: "Not authenticated"
    });
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          message: "Logout failed",
          code: "LOGOUT_ERROR"
        });
      }
      res.json({
        message: "Logged out successfully"
      });
    });
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Admin login attempt:", { email, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
      if (!email || !password) {
        console.log("Login failed: Missing credentials");
        return res.status(400).json({
          message: "Email and password are required",
          code: "MISSING_CREDENTIALS"
        });
      }
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Normalized email:", normalizedEmail);
      console.log("Attempting database authentication for:", normalizedEmail);
      const admin = await adminAuthService.authenticateAdmin(normalizedEmail, password);
      if (admin) {
        console.log("Database authentication successful for:", normalizedEmail);
        req.session.adminId = admin.id;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({
              message: "Session error",
              code: "SESSION_ERROR"
            });
          }
          console.log("Admin session saved successfully for:", admin.email);
          res.json({
            message: "Admin login successful",
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            }
          });
        });
        return;
      }
      if (normalizedEmail === "amjadkhabbas2002@gmail.com" && password === "akramsnotcool!") {
        console.log("Fallback hardcoded admin login successful");
        req.session.adminId = 1;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({
              message: "Session error",
              code: "SESSION_ERROR"
            });
          }
          console.log("Fallback admin session saved successfully");
          res.json({
            message: "Admin login successful",
            admin: {
              id: 1,
              email: "amjadkhabbas2002@gmail.com",
              name: "Amjad Khabbas",
              role: "admin"
            }
          });
        });
        return;
      }
      console.log("All authentication methods failed for:", normalizedEmail);
      return res.status(401).json({
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "SERVER_ERROR"
      });
    }
  });
  app2.get("/api/admin/user", async (req, res) => {
    const adminId = req.session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (adminId === 1) {
      return res.json({
        id: 1,
        email: "amjadkhabbas2002@gmail.com",
        name: "Amjad Khabbas",
        role: "admin"
      });
    }
    try {
      const admin = await adminAuthService.verifyAdmin(adminId);
      if (!admin) {
        delete req.session.adminId;
        return res.status(401).json({ message: "Not authenticated" });
      }
      res.json({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      });
    } catch (error) {
      console.error("Admin user check error:", error);
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  app2.post("/api/admin/logout", (req, res) => {
    delete req.session.adminId;
    res.json({ message: "Admin logout successful" });
  });
  app2.post("/api/admin/reset-password", async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          message: "All fields are required",
          code: "MISSING_FIELDS"
        });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: "New passwords do not match",
          code: "PASSWORD_MISMATCH"
        });
      }
      if (currentPassword !== "akramsnotcool!") {
        return res.status(401).json({
          message: "Current password is incorrect",
          code: "INVALID_CURRENT_PASSWORD"
        });
      }
      console.log("Admin password reset requested. New password will be:", newPassword);
      res.json({
        message: "Password reset successful. Please update the hardcoded password in the server code.",
        note: "This is a development environment. In production, this would update the database."
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "SERVER_ERROR"
      });
    }
  });
  app2.get("/api/admin/status", async (req, res) => {
    const adminId = req.session?.adminId;
    if (!adminId) {
      return res.json({ isAdmin: false, admin: null });
    }
    if (adminId === 1) {
      return res.json({
        isAdmin: true,
        admin: {
          id: 1,
          email: "amjadkhabbas2002@gmail.com",
          name: "Amjad Khabbas",
          role: "admin"
        }
      });
    }
    try {
      const admin = await adminAuthService.verifyAdmin(adminId);
      if (!admin) {
        delete req.session.adminId;
        return res.json({ isAdmin: false, admin: null });
      }
      res.json({
        isAdmin: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (error) {
      console.error("Admin status check error:", error);
      res.json({ isAdmin: false, admin: null });
    }
  });
  app2.get("/api/admin/pending-users", requireAdminAuth, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Get pending users error:", error);
      res.status(500).json({
        message: "Failed to fetch pending users",
        code: "FETCH_FAILED"
      });
    }
  });
  app2.post("/api/admin/approve-user/:id", requireAdminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const approvedBy = req.admin?.email || "admin";
      const user = await storage.approveUser(userId, approvedBy);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          code: "USER_NOT_FOUND"
        });
      }
      res.json({
        message: "User approved successfully",
        user
      });
    } catch (error) {
      console.error("Approve user error:", error);
      res.status(500).json({
        message: "Failed to approve user",
        code: "APPROVAL_FAILED"
      });
    }
  });
  app2.delete("/api/admin/reject-user/:id", requireAdminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({
          message: "User not found",
          code: "USER_NOT_FOUND"
        });
      }
      res.json({
        message: "User rejected and removed successfully"
      });
    } catch (error) {
      console.error("Reject user error:", error);
      res.status(500).json({
        message: "Failed to reject user",
        code: "REJECTION_FAILED"
      });
    }
  });
  app2.post("/api/admin/upload-image", requireAdminAuth, async (req, res) => {
    try {
      const imageUrl = `/api/placeholder/300/300?random=${Date.now()}`;
      res.json({
        success: true,
        imageUrl,
        message: "Image uploaded successfully"
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image"
      });
    }
  });
  app2.post("/api/admin/products", requireAdminAuth, async (req, res) => {
    try {
      const { name, description, price, categoryId, imageUrl, imageUrls = [], featured = false, inStock = true, tags = [], bulkDiscounts = [] } = req.body;
      if (!name || !description || !price || !categoryId) {
        return res.status(400).json({
          message: "Name, description, price, and category are required",
          code: "MISSING_REQUIRED_FIELDS"
        });
      }
      if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        return res.status(400).json({
          message: "Price must be a valid number with up to 2 decimal places",
          code: "INVALID_PRICE_FORMAT"
        });
      }
      const category = await storage.getCategoryBySlug("");
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price).toFixed(2),
        categoryId: parseInt(categoryId),
        imageUrl: imageUrl || "/api/placeholder/300/300",
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
        featured: Boolean(featured),
        inStock: Boolean(inStock),
        tags: Array.isArray(tags) ? tags.join(", ") : tags || null,
        bulkDiscounts: Array.isArray(bulkDiscounts) ? bulkDiscounts : []
      };
      const newProduct = await storage.createProduct(productData);
      res.status(201).json({
        message: "Product created successfully",
        product: newProduct
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({
        message: "Failed to create product",
        code: "CREATE_FAILED"
      });
    }
  });
  app2.put("/api/admin/products/:id/price", requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { price } = req.body;
      if (!price || isNaN(parseFloat(price))) {
        return res.status(400).json({
          message: "Valid price is required",
          code: "INVALID_PRICE"
        });
      }
      const updatedProduct = await storage.updateProductPrice(productId, price);
      if (!updatedProduct) {
        return res.status(404).json({
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        });
      }
      res.json({
        message: "Product price updated successfully",
        product: updatedProduct
      });
    } catch (error) {
      console.error("Update product price error:", error);
      res.status(500).json({
        message: "Failed to update product price",
        code: "UPDATE_FAILED"
      });
    }
  });
  app2.delete("/api/admin/products/:id", requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          message: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID"
        });
      }
      const success = await storage.deleteProduct(productId);
      if (!success) {
        return res.status(404).json({
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        });
      }
      res.json({
        message: "Product deleted successfully"
      });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({
        message: "Failed to delete product",
        code: "DELETE_FAILED"
      });
    }
  });
  app2.put("/api/admin/products/:id", requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { name, description, price, imageUrl, categoryId, inStock, featured } = req.body;
      const updatedProduct = await storage.updateProduct(productId, {
        name,
        description,
        price,
        imageUrl,
        categoryId,
        inStock,
        featured
      });
      if (!updatedProduct) {
        return res.status(404).json({
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        });
      }
      res.json({
        message: "Product updated successfully",
        product: updatedProduct
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        message: "Failed to update product",
        code: "UPDATE_FAILED"
      });
    }
  });
  app2.patch("/api/admin/products/:id/price", requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { price } = req.body;
      if (!price) {
        return res.status(400).json({
          message: "Price is required",
          code: "MISSING_PRICE"
        });
      }
      const updatedProduct = await storage.updateProductPrice(productId, price);
      if (!updatedProduct) {
        return res.status(404).json({
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        });
      }
      res.json({
        message: "Product price updated successfully",
        product: updatedProduct
      });
    } catch (error) {
      console.error("Update product price error:", error);
      res.status(500).json({
        message: "Failed to update product price",
        code: "UPDATE_FAILED"
      });
    }
  });
  app2.patch("/api/admin/products/:id/image", requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({
          message: "Image URL is required",
          code: "MISSING_IMAGE_URL"
        });
      }
      const updatedProduct = await storage.updateProductImage(productId, imageUrl);
      if (!updatedProduct) {
        return res.status(404).json({
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        });
      }
      res.json({
        message: "Product image updated successfully",
        product: updatedProduct
      });
    } catch (error) {
      console.error("Update product image error:", error);
      res.status(500).json({
        message: "Failed to update product image",
        code: "UPDATE_FAILED"
      });
    }
  });
  app2.patch("/api/admin/products/:id/images", requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { imageUrl, imageUrls } = req.body;
      if (!imageUrl) {
        return res.status(400).json({
          message: "Main image URL is required",
          code: "MISSING_IMAGE_URL"
        });
      }
      const updatedProduct = await storage.updateProductImages(productId, imageUrl, imageUrls || []);
      if (!updatedProduct) {
        return res.status(404).json({
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        });
      }
      res.json({
        message: "Product images updated successfully",
        product: updatedProduct
      });
    } catch (error) {
      console.error("Update product images error:", error);
      res.status(500).json({
        message: "Failed to update product images",
        code: "UPDATE_FAILED"
      });
    }
  });
  app2.put("/api/admin/products/:id/image", requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({
          message: "Image URL is required",
          code: "MISSING_IMAGE_URL"
        });
      }
      const updatedProduct = await storage.updateProductImage(productId, imageUrl);
      if (!updatedProduct) {
        return res.status(404).json({
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        });
      }
      res.json({
        message: "Product image updated successfully",
        product: updatedProduct
      });
    } catch (error) {
      console.error("Update product image error:", error);
      res.status(500).json({
        message: "Failed to update product image",
        code: "UPDATE_FAILED"
      });
    }
  });
  app2.patch("/api/admin/products/:id", requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { name, description, price, imageUrl } = req.body;
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          message: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID"
        });
      }
      const updatedProduct = await storage.updateProduct(productId, {
        name,
        description,
        price,
        imageUrl
      });
      if (!updatedProduct) {
        return res.status(404).json({
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        });
      }
      res.json({
        message: "Product updated successfully",
        product: updatedProduct
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        message: "Failed to update product",
        code: "UPDATE_FAILED"
      });
    }
  });
  app2.post("/api/admin/categories", requireAdminAuth, async (req, res) => {
    try {
      const { name, description, icon, color, slug } = req.body;
      if (!name || !icon || !slug) {
        return res.status(400).json({
          message: "Name, icon, and slug are required",
          code: "MISSING_REQUIRED_FIELDS"
        });
      }
      const categoryData = {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon.trim(),
        color: color || "blue",
        slug: slug.trim(),
        itemCount: 0
      };
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json({
        message: "Category created successfully",
        category: newCategory
      });
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({
        message: "Failed to create category",
        code: "CREATE_FAILED"
      });
    }
  });
  app2.put("/api/admin/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, icon, color, slug } = req.body;
      if (!name || !icon) {
        return res.status(400).json({
          message: "Name and icon are required",
          code: "MISSING_REQUIRED_FIELDS"
        });
      }
      const categoryData = {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon.trim(),
        color: color || "blue",
        slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      };
      const updatedCategory = await storage.updateCategory(parseInt(id), categoryData);
      if (!updatedCategory) {
        return res.status(404).json({
          message: "Category not found",
          code: "NOT_FOUND"
        });
      }
      res.json({
        message: "Category updated successfully",
        category: updatedCategory
      });
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({
        message: "Failed to update category",
        code: "UPDATE_FAILED"
      });
    }
  });
  app2.delete("/api/admin/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCategory(parseInt(id));
      if (!success) {
        return res.status(404).json({
          message: "Category not found",
          code: "NOT_FOUND"
        });
      }
      res.json({
        message: "Category deleted successfully"
      });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({
        message: "Failed to delete category",
        code: "DELETE_FAILED"
      });
    }
  });
  app2.get("/api/products", checkAdminStatus, async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : void 0;
      const categorySlug = req.query.categorySlug;
      const featured = req.query.featured === "true";
      const search = req.query.search;
      const limit = req.query.limit ? parseInt(req.query.limit) : 15;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const offset = (page - 1) * limit;
      let products2, totalCount;
      if (categoryId || categorySlug) {
        products2 = await storage.getProductsWithCategory({
          categoryId,
          categorySlug,
          featured,
          search,
          limit,
          offset
        });
        totalCount = await storage.getProductsCount({
          categoryId,
          categorySlug,
          featured,
          search
        });
      } else {
        const simpleProducts = await storage.getProducts({
          featured,
          search,
          limit,
          offset
        });
        products2 = simpleProducts.map((product) => ({
          ...product,
          category: null
          // No category data for "All Products" view
        }));
        const allProductsCount = await storage.getProductsCount({
          featured,
          search
        });
        totalCount = allProductsCount;
      }
      const optimizedProducts = products2.map((product) => ({
        ...product,
        imageUrl: `/api/products/${product.id}/image`
      }));
      res.json({
        products: optimizedProducts,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        isAdmin: req.isAdmin || false
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id/image", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      if (!product || !product.imageUrl) {
        return res.status(404).json({ message: "Product image not found" });
      }
      if (product.imageUrl.startsWith("data:image/")) {
        const [header, base64Data] = product.imageUrl.split(",");
        const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/png";
        const imageBuffer = Buffer.from(base64Data, "base64");
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(imageBuffer);
      } else {
        res.redirect(product.imageUrl);
      }
    } catch (error) {
      console.error("Error serving product image:", error);
      res.status(500).json({ message: "Failed to serve image" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const formData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone || "",
        licenseNumber: req.body.licenseNumber,
        collegeName: req.body.collegeName,
        provinceState: req.body.provinceState || null,
        // Optional field
        licenseExpiryDate: req.body.licenseExpiryDate,
        practiceAddress: req.body.practiceAddress,
        password: req.body.password || "temp123"
        // Default temporary password for doctors
      };
      const requiredFields = ["fullName", "email", "licenseNumber", "collegeName", "licenseExpiryDate", "practiceAddress"];
      for (const field of requiredFields) {
        if (!formData[field]) {
          return res.status(400).json({
            message: `Missing required field: ${field}`
          });
        }
      }
      const existingUser = await storage.getUserByEmail(formData.email);
      if (existingUser) {
        return res.status(200).json({
          message: "Your account is pending approval. You will receive an update via email soon."
        });
      }
      const userData = {
        email: formData.email,
        password: await hashPassword(formData.password),
        // Hash the password
        fullName: formData.fullName,
        licenseNumber: formData.licenseNumber,
        collegeName: formData.collegeName,
        provinceState: formData.provinceState,
        licenseExpiryDate: formData.licenseExpiryDate,
        practiceAddress: formData.practiceAddress,
        isApproved: false,
        isLicenseVerified: false
      };
      const newUser = await storage.createUser(userData);
      try {
        const { emailService: emailService2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        await emailService2.sendAdminNotification({
          fullName: newUser.fullName,
          email: newUser.email,
          phone: formData.phone || "Not provided",
          licenseNumber: newUser.licenseNumber,
          collegeName: newUser.collegeName,
          provinceState: newUser.provinceState || "Not provided",
          licenseExpiryDate: newUser.licenseExpiryDate,
          practiceAddress: newUser.practiceAddress
        });
        console.log("Admin notification email sent successfully");
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
      }
      res.status(201).json({
        message: "Your account is pending approval. You will receive an update via email soon.",
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          isApproved: newUser.isApproved
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(201).json({
        message: "Your account is pending approval. You will receive an update via email soon."
      });
    }
  });
  app2.get("/api/admin/pending-users", requireAdminAuth, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });
  app2.put("/api/admin/users/:id/approve", requireAdminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.approveUser(userId, req.admin?.email || "admin");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      await emailService2.sendApprovalEmail(user.email, user.fullName, true);
      res.json({ message: "User approved successfully", user });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });
  app2.delete("/api/admin/users/:id/reject", requireAdminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      await emailService2.sendApprovalEmail(user.email, user.fullName, false);
      await storage.deleteUser(userId);
      res.json({ message: "User rejected and removed successfully" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });
  app2.post("/api/referrals", async (req, res) => {
    try {
      const referralData = req.body;
      const referral = await storage.createReferral(referralData);
      res.status(201).json({ message: "Referral submitted successfully", referral });
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ message: "Failed to submit referral" });
    }
  });
  app2.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const subscription = await storage.subscribeToNewsletter(email);
      res.json({ success: true, message: "Successfully subscribed to newsletter" });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter", error: error.message });
    }
  });
  app2.get("/api/newsletter/subscriptions", requireAdminAuth, async (req, res) => {
    try {
      const subscriptions = await storage.getNewsletterSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error getting newsletter subscriptions:", error);
      res.status(500).json({ message: "Failed to get newsletter subscriptions", error: error.message });
    }
  });
  app2.post("/api/orders/:orderId/cancel", requireAuth, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const cancelledOrder = await storage.cancelOrder(orderId, userId);
      if (!cancelledOrder) {
        return res.status(404).json({ message: "Order not found or cannot be cancelled" });
      }
      res.json({ success: true, order: cancelledOrder });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order", error: error.message });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  app2.patch("/api/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { icon } = req.body;
      if (!icon) {
        return res.status(400).json({ message: "Icon URL is required" });
      }
      const updatedCategory = await storage.updateCategoryIcon(categoryId, icon);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({
        message: "Category image updated successfully",
        category: updatedCategory
      });
    } catch (error) {
      console.error("Category update error:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  app2.get("/api/brands", async (req, res) => {
    try {
      const brands2 = await storage.getBrands();
      res.json(brands2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });
  app2.get("/api/brands/:id", async (req, res) => {
    try {
      const brandId = parseInt(req.params.id);
      const brand = await storage.getBrandById(brandId);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brand" });
    }
  });
  app2.patch("/api/brands/:id", requireAdminAuth, async (req, res) => {
    try {
      const brandId = parseInt(req.params.id);
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }
      const updatedBrand = await storage.updateBrandImage(brandId, imageUrl);
      if (!updatedBrand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.json({
        message: "Brand image updated successfully",
        brand: updatedBrand
      });
    } catch (error) {
      console.error("Brand update error:", error);
      res.status(500).json({ message: "Failed to update brand" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const cartItems2 = await storage.getCartItems(sessionId);
      res.json(cartItems2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });
  app2.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });
  app2.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      const updatedItem = await storage.updateCartItem(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });
  app2.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      await storage.clearCart(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const {
        items,
        totalAmount,
        doctorName,
        doctorEmail,
        doctorPhone,
        institutionNumber,
        shippingAddress,
        billingAddress,
        doctorBankingInfo,
        cardInfo,
        paymentMethod,
        notes
      } = req.body;
      if (!items || items.length === 0) {
        return res.status(400).json({
          message: "Order must contain at least one item",
          code: "EMPTY_ORDER"
        });
      }
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const orderData = {
        userId: doctorEmail,
        // Using email as user identifier for non-authenticated orders
        orderNumber,
        status: "pending",
        totalAmount,
        shippingAddress,
        billingAddress,
        doctorBankingInfo,
        institutionNumber,
        cardInfo,
        paymentMethod: paymentMethod || "credit_card",
        paymentStatus: "pending",
        doctorEmail,
        doctorName,
        doctorPhone,
        notes
      };
      const orderItems2 = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: (parseFloat(item.product.price) * item.quantity).toString(),
        productName: item.product.name,
        productImageUrl: item.product.imageUrl
      }));
      const order = await storage.createOrder(orderData, orderItems2);
      res.json({
        message: "Order submitted successfully for admin approval",
        order,
        orderNumber
      });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({
        message: "Failed to create order",
        code: "ORDER_CREATION_FAILED"
      });
    }
  });
  app2.get("/api/admin/pending-orders", requireAdminAuth, async (req, res) => {
    try {
      const orders2 = await storage.getPendingOrders();
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      res.status(500).json({ message: "Failed to fetch pending orders" });
    }
  });
  app2.post("/api/admin/orders/:id/approve", requireAdminAuth, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const adminEmail = req.admin?.email || "admin@system.com";
      const order = await storage.approveOrder(orderId, adminEmail);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      await emailService2.sendApprovalEmail(order.doctorEmail, order.doctorName, true);
      res.json({
        message: "Order approved successfully",
        order
      });
    } catch (error) {
      console.error("Error approving order:", error);
      res.status(500).json({ message: "Failed to approve order" });
    }
  });
  app2.post("/api/admin/orders/:id/decline", requireAdminAuth, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { reason } = req.body;
      const adminEmail = req.admin?.email || "admin@system.com";
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ message: "Decline reason is required" });
      }
      const order = await storage.declineOrder(orderId, adminEmail, reason);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      await emailService2.sendApprovalEmail(order.doctorEmail, order.doctorName, false);
      res.json({
        message: "Order declined successfully",
        order
      });
    } catch (error) {
      console.error("Error declining order:", error);
      res.status(500).json({ message: "Failed to decline order" });
    }
  });
  app2.get("/api/checkout/eligibility", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.json({
          eligible: false,
          reason: "LOGIN_REQUIRED",
          message: "Please log in to proceed with checkout"
        });
      }
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.json({
          eligible: false,
          reason: "USER_NOT_FOUND",
          message: "User account not found"
        });
      }
      if (!user.isApproved) {
        return res.json({
          eligible: false,
          reason: "APPROVAL_PENDING",
          message: "Your account is pending admin approval. You can add items to cart but cannot complete purchases until approved."
        });
      }
      res.json({
        eligible: true,
        message: "You can proceed with checkout"
      });
    } catch (error) {
      console.error("Eligibility check error:", error);
      res.status(500).json({
        eligible: false,
        reason: "SERVER_ERROR",
        message: "Unable to check eligibility"
      });
    }
  });
  app2.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id.toString();
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
        status: "pending"
      });
      const { items, ...order } = req.body;
      const orderItemsData = items.map(
        (item) => insertOrderItemSchema.parse(item)
      );
      const newOrder = await storage.createOrder(orderData, orderItemsData);
      res.json(newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Invalid order data" });
    }
  });
  app2.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id.toString();
      const orders2 = await storage.getUserOrders(userId);
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id.toString();
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId, userId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  app2.get("/api/carousel", async (req, res) => {
    try {
      const items = await storage.getCarouselItems();
      res.json(items);
    } catch (error) {
      console.error("Get carousel items error:", error);
      res.status(500).json({ message: "Failed to fetch carousel items" });
    }
  });
  app2.get("/api/carousel/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getCarouselItem(id);
      if (!item) {
        return res.status(404).json({ message: "Carousel item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Get carousel item error:", error);
      res.status(500).json({ message: "Failed to fetch carousel item" });
    }
  });
  app2.post("/api/carousel", requireAdminAuth, async (req, res) => {
    try {
      const newItem = await storage.createCarouselItem(req.body);
      res.status(201).json({
        message: "Carousel item created successfully",
        item: newItem
      });
    } catch (error) {
      console.error("Create carousel item error:", error);
      res.status(500).json({ message: "Failed to create carousel item" });
    }
  });
  app2.patch("/api/carousel/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedItem = await storage.updateCarouselItem(id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ message: "Carousel item not found" });
      }
      res.json({
        message: "Carousel item updated successfully",
        item: updatedItem
      });
    } catch (error) {
      console.error("Update carousel item error:", error);
      res.status(500).json({ message: "Failed to update carousel item" });
    }
  });
  app2.delete("/api/carousel/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCarouselItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Carousel item not found" });
      }
      res.json({ message: "Carousel item deleted successfully" });
    } catch (error) {
      console.error("Delete carousel item error:", error);
      res.status(500).json({ message: "Failed to delete carousel item" });
    }
  });
  app2.patch("/api/carousel/reorder", requireAdminAuth, async (req, res) => {
    try {
      const { itemIds } = req.body;
      if (!Array.isArray(itemIds)) {
        return res.status(400).json({ message: "Item IDs array is required" });
      }
      await storage.reorderCarouselItems(itemIds);
      res.json({ message: "Carousel items reordered successfully" });
    } catch (error) {
      console.error("Reorder carousel items error:", error);
      res.status(500).json({ message: "Failed to reorder carousel items" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, company, subject, message } = req.body;
      if (!firstName || !lastName || !email || !phone || !subject || !message) {
        return res.status(400).json({ message: "All required fields must be filled" });
      }
      const emailHtml = `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `;
      const emailText = `
        New Contact Form Submission
        
        From: ${firstName} ${lastName}
        Email: ${email}
        Phone: ${phone}
        ${company ? `Company: ${company}` : ""}
        Subject: ${subject}
        
        Message:
        ${message}
      `;
      const emailSent = await emailService.sendEmail({
        to: "infomeds.go@gmail.com",
        subject: `Contact Form: ${subject}`,
        html: emailHtml,
        text: emailText
      });
      if (emailSent) {
        res.json({ message: "Message sent successfully" });
      } else {
        console.error("Failed to send contact form email");
        res.status(500).json({ message: "Failed to send message" });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/orders", requireAdminAuth, async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.patch("/api/admin/orders/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status, declineReason } = req.body;
      const adminEmail = req.admin?.email || "admin@meds-go.com";
      if (status === "approved") {
        const updatedOrder = await storage.approveOrder(orderId, adminEmail);
        if (updatedOrder) {
          res.json({ message: "Order approved successfully", order: updatedOrder });
        } else {
          res.status(404).json({ message: "Order not found" });
        }
      } else if (status === "declined") {
        const updatedOrder = await storage.declineOrder(orderId, adminEmail, declineReason || "No reason provided");
        if (updatedOrder) {
          res.json({ message: "Order declined successfully", order: updatedOrder });
        } else {
          res.status(404).json({ message: "Order not found" });
        }
      } else {
        const updatedOrder = await storage.updateOrderStatus(orderId, status);
        if (updatedOrder) {
          res.json({ message: "Order status updated successfully", order: updatedOrder });
        } else {
          res.status(404).json({ message: "Order not found" });
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.get("/api/featured-carousel", async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedCarousel();
      res.json(featuredProducts);
    } catch (error) {
      console.error("Error fetching featured carousel:", error);
      res.status(500).json({ message: "Failed to fetch featured carousel" });
    }
  });
  app2.post("/api/admin/featured-carousel", requireAdminAuth, async (req, res) => {
    try {
      const { productId, displayOrder } = req.body;
      if (!productId) {
        return res.status(400).json({
          message: "Product ID is required",
          code: "MISSING_PRODUCT_ID"
        });
      }
      const featuredItem = await storage.addToFeaturedCarousel({
        productId: parseInt(productId),
        displayOrder: displayOrder || 0,
        isActive: true
      });
      res.status(201).json({
        message: "Product added to featured carousel",
        item: featuredItem
      });
    } catch (error) {
      console.error("Add to featured carousel error:", error);
      res.status(500).json({
        message: "Failed to add product to featured carousel",
        code: "ADD_FAILED"
      });
    }
  });
  app2.delete("/api/admin/featured-carousel/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.removeFromFeaturedCarousel(parseInt(id));
      if (!deleted) {
        return res.status(404).json({
          message: "Featured carousel item not found",
          code: "NOT_FOUND"
        });
      }
      res.json({
        message: "Product removed from featured carousel"
      });
    } catch (error) {
      console.error("Remove from featured carousel error:", error);
      res.status(500).json({
        message: "Failed to remove product from featured carousel",
        code: "REMOVE_FAILED"
      });
    }
  });
  setupUploadRoutes(app2);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).slice(0, 100)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function main() {
  const server = await registerRoutes(app);
  const port = 5e3;
  adminAuthService.initializeAdminUser().catch((err) => {
    console.error("Failed to initialize admin user:", err);
  });
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
}
main();

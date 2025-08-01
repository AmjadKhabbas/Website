"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("@shared/schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
class DatabaseStorage {
    constructor() {
        this.initializeData();
    }
    // Ehri Account operations
    async createEhriAccount(account) {
        const [ehriAccount] = await db_1.db.insert(schema_1.ehriAccounts).values(account).returning();
        return ehriAccount;
    }
    async getEhriAccountByEhriId(ehriId) {
        const [ehriAccount] = await db_1.db.select().from(schema_1.ehriAccounts).where((0, drizzle_orm_1.eq)(schema_1.ehriAccounts.ehriId, ehriId));
        return ehriAccount || undefined;
    }
    async getEhriAccountByEmail(email) {
        const [ehriAccount] = await db_1.db.select().from(schema_1.ehriAccounts).where((0, drizzle_orm_1.eq)(schema_1.ehriAccounts.email, email));
        return ehriAccount || undefined;
    }
    async verifyEhriAccount(ehriId, token) {
        const [ehriAccount] = await db_1.db
            .select()
            .from(schema_1.ehriAccounts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ehriAccounts.ehriId, ehriId), (0, drizzle_orm_1.eq)(schema_1.ehriAccounts.verificationToken, token)));
        if (ehriAccount) {
            await db_1.db
                .update(schema_1.ehriAccounts)
                .set({ isVerified: true, linkedAt: new Date(), verificationToken: null })
                .where((0, drizzle_orm_1.eq)(schema_1.ehriAccounts.id, ehriAccount.id));
            return true;
        }
        return false;
    }
    // User operations
    async createUser(user) {
        const [newUser] = await db_1.db.insert(schema_1.users).values(user).returning();
        return newUser;
    }
    async getUserById(id) {
        const [user] = await db_1.db.select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            password: schema_1.users.password,
            fullName: schema_1.users.fullName,
            licenseNumber: schema_1.users.licenseNumber,
            collegeName: schema_1.users.collegeName,
            provinceState: schema_1.users.provinceState,
            licenseExpiryDate: schema_1.users.licenseExpiryDate,
            practiceAddress: schema_1.users.practiceAddress,
            isApproved: schema_1.users.isApproved,
            isLicenseVerified: schema_1.users.isLicenseVerified,
            approvedAt: schema_1.users.approvedAt,
            approvedBy: schema_1.users.approvedBy,
            savedCardInfo: schema_1.users.savedCardInfo,
            createdAt: schema_1.users.createdAt,
            updatedAt: schema_1.users.updatedAt,
        }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return user || undefined;
    }
    async getUserByEmail(email) {
        const [user] = await db_1.db.select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            password: schema_1.users.password,
            fullName: schema_1.users.fullName,
            licenseNumber: schema_1.users.licenseNumber,
            collegeName: schema_1.users.collegeName,
            provinceState: schema_1.users.provinceState,
            licenseExpiryDate: schema_1.users.licenseExpiryDate,
            practiceAddress: schema_1.users.practiceAddress,
            isApproved: schema_1.users.isApproved,
            isLicenseVerified: schema_1.users.isLicenseVerified,
            approvedAt: schema_1.users.approvedAt,
            approvedBy: schema_1.users.approvedBy,
            savedCardInfo: schema_1.users.savedCardInfo,
            createdAt: schema_1.users.createdAt,
            updatedAt: schema_1.users.updatedAt,
        }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        return user || undefined;
    }
    async approveUser(userId, approvedBy) {
        const [user] = await db_1.db
            .update(schema_1.users)
            .set({ isApproved: true, approvedAt: new Date(), approvedBy })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
            .returning();
        return user || undefined;
    }
    async getPendingUsers() {
        return await db_1.db
            .select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            password: schema_1.users.password,
            fullName: schema_1.users.fullName,
            licenseNumber: schema_1.users.licenseNumber,
            collegeName: schema_1.users.collegeName,
            provinceState: schema_1.users.provinceState,
            licenseExpiryDate: schema_1.users.licenseExpiryDate,
            practiceAddress: schema_1.users.practiceAddress,
            isApproved: schema_1.users.isApproved,
            isLicenseVerified: schema_1.users.isLicenseVerified,
            approvedAt: schema_1.users.approvedAt,
            approvedBy: schema_1.users.approvedBy,
            savedCardInfo: schema_1.users.savedCardInfo,
            createdAt: schema_1.users.createdAt,
            updatedAt: schema_1.users.updatedAt,
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.isApproved, false));
    }
    async deleteUser(userId) {
        try {
            await db_1.db
                .delete(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            return true;
        }
        catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    }
    async getCategories() {
        return await db_1.db.select().from(schema_1.categories);
    }
    async getCategoryBySlug(slug) {
        const [category] = await db_1.db.select().from(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.slug, slug));
        return category || undefined;
    }
    async updateCategoryIcon(id, icon) {
        const [category] = await db_1.db
            .update(schema_1.categories)
            .set({ icon })
            .where((0, drizzle_orm_1.eq)(schema_1.categories.id, id))
            .returning();
        return category || undefined;
    }
    async createCategory(categoryData) {
        const [category] = await db_1.db
            .insert(schema_1.categories)
            .values(categoryData)
            .returning();
        return category;
    }
    async updateCategory(id, updates) {
        const [category] = await db_1.db
            .update(schema_1.categories)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_1.categories.id, id))
            .returning();
        return category || undefined;
    }
    async deleteCategory(id) {
        try {
            const result = await db_1.db
                .delete(schema_1.categories)
                .where((0, drizzle_orm_1.eq)(schema_1.categories.id, id));
            return result.rowCount !== null && result.rowCount > 0;
        }
        catch (error) {
            console.error('Delete category error:', error);
            return false;
        }
    }
    async getBrands() {
        return await db_1.db.select().from(schema_1.brands).where((0, drizzle_orm_1.eq)(schema_1.brands.isActive, true));
    }
    async getBrandById(id) {
        const [brand] = await db_1.db.select().from(schema_1.brands).where((0, drizzle_orm_1.eq)(schema_1.brands.id, id));
        return brand || undefined;
    }
    async updateBrandImage(id, imageUrl) {
        const [brand] = await db_1.db
            .update(schema_1.brands)
            .set({ imageUrl })
            .where((0, drizzle_orm_1.eq)(schema_1.brands.id, id))
            .returning();
        return brand || undefined;
    }
    async getProducts(options = {}) {
        // Select only essential fields to prevent 64MB response limit
        let query = db_1.db.select({
            id: schema_1.products.id,
            name: schema_1.products.name,
            description: schema_1.products.description,
            price: schema_1.products.price,
            originalPrice: schema_1.products.originalPrice,
            categoryId: schema_1.products.categoryId,
            featured: schema_1.products.featured,
            inStock: schema_1.products.inStock,
            rating: schema_1.products.rating,
            reviewCount: schema_1.products.reviewCount,
            imageUrl: (0, drizzle_orm_1.sql) `''`.as('imageUrl'), // Empty string for list view
            imageUrls: (0, drizzle_orm_1.sql) `NULL`.as('imageUrls'),
            tags: (0, drizzle_orm_1.sql) `NULL`.as('tags'),
            bulkDiscounts: (0, drizzle_orm_1.sql) `NULL`.as('bulkDiscounts')
        }).from(schema_1.products);
        if (options.categoryId) {
            query = query.where((0, drizzle_orm_1.eq)(schema_1.products.categoryId, options.categoryId));
        }
        if (options.featured) {
            query = query.where((0, drizzle_orm_1.eq)(schema_1.products.featured, true));
        }
        if (options.search) {
            query = query.where((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.products.name, `%${options.search}%`), (0, drizzle_orm_1.ilike)(schema_1.products.description, `%${options.search}%`)));
        }
        // Apply limit and offset for pagination
        const limit = options.limit || 100;
        const offset = options.offset || 0;
        // Order by category to ensure variety across categories
        query = query.orderBy(schema_1.products.categoryId, schema_1.products.id).limit(limit).offset(offset);
        const results = await query;
        return results;
    }
    async getProduct(id) {
        const [product] = await db_1.db.select().from(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, id));
        return product || undefined;
    }
    async createProduct(productData) {
        // Ensure bulkDiscounts is properly formatted for database storage
        const productWithDiscounts = {
            ...productData,
            bulkDiscounts: productData.bulkDiscounts || []
        };
        const [product] = await db_1.db
            .insert(schema_1.products)
            .values(productWithDiscounts)
            .returning();
        return product;
    }
    async deleteProduct(id) {
        try {
            const result = await db_1.db
                .delete(schema_1.products)
                .where((0, drizzle_orm_1.eq)(schema_1.products.id, id));
            return result.rowCount !== null && result.rowCount > 0;
        }
        catch (error) {
            console.error('Delete product error:', error);
            return false;
        }
    }
    async getProductsWithCategory(options = {}) {
        // Completely minimal query excluding all large fields and category joins
        let query = db_1.db
            .select({
            id: schema_1.products.id,
            name: schema_1.products.name,
            price: schema_1.products.price,
            description: schema_1.products.description,
            categoryId: schema_1.products.categoryId,
            featured: schema_1.products.featured,
            inStock: schema_1.products.inStock,
            originalPrice: schema_1.products.originalPrice,
            rating: schema_1.products.rating,
            reviewCount: schema_1.products.reviewCount
        })
            .from(schema_1.products);
        let whereConditions = [];
        if (options.categoryId) {
            whereConditions.push((0, drizzle_orm_1.eq)(schema_1.products.categoryId, options.categoryId));
        }
        // Handle category filtering without joins to avoid large responses
        if (options.categorySlug) {
            // Get category ID first
            const [category] = await db_1.db
                .select({ id: schema_1.categories.id })
                .from(schema_1.categories)
                .where((0, drizzle_orm_1.eq)(schema_1.categories.slug, options.categorySlug));
            if (category) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.products.categoryId, category.id));
            }
            else {
                // Category not found, return empty result
                return [];
            }
        }
        if (options.featured) {
            whereConditions.push((0, drizzle_orm_1.eq)(schema_1.products.featured, true));
        }
        if (options.search) {
            whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.products.name, `%${options.search}%`), (0, drizzle_orm_1.ilike)(schema_1.products.description, `%${options.search}%`)));
        }
        // Apply all where conditions
        if (whereConditions.length > 0) {
            query = query.where(whereConditions.length === 1 ? whereConditions[0] : (0, drizzle_orm_1.and)(...whereConditions));
        }
        // Apply default limit and offset for pagination
        const limit = options.limit || 20;
        const offset = options.offset || 0;
        query = query.limit(limit).offset(offset);
        const results = await query;
        // If we need category data, fetch it separately for the specific categoryId
        let categoryData = null;
        if (options.categorySlug && results.length > 0) {
            const [category] = await db_1.db
                .select({
                id: schema_1.categories.id,
                name: schema_1.categories.name,
                slug: schema_1.categories.slug,
                description: schema_1.categories.description,
                icon: schema_1.categories.icon,
                color: schema_1.categories.color,
                itemCount: schema_1.categories.itemCount
            })
                .from(schema_1.categories)
                .where((0, drizzle_orm_1.eq)(schema_1.categories.slug, options.categorySlug));
            categoryData = category;
        }
        return results.map(result => ({
            ...result,
            imageUrl: `/api/products/${result.id}/image`, // Use endpoint URL
            imageUrls: null, // Not loaded in list view
            tags: null, // Not loaded in list view  
            bulkDiscounts: null, // Will be loaded individually when needed
            category: categoryData, // Add category data for all products in this category
        }));
    }
    async getProductsCount(options = {}) {
        try {
            let query = db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.products);
            let whereConditions = [];
            if (options.categorySlug) {
                // First get the category ID
                const [category] = await db_1.db
                    .select({ id: schema_1.categories.id })
                    .from(schema_1.categories)
                    .where((0, drizzle_orm_1.eq)(schema_1.categories.slug, options.categorySlug));
                if (category) {
                    whereConditions.push((0, drizzle_orm_1.eq)(schema_1.products.categoryId, category.id));
                }
                else {
                    return 0; // Category not found
                }
            }
            else if (options.categoryId) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.products.categoryId, options.categoryId));
            }
            if (options.featured) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.products.featured, true));
            }
            if (options.search) {
                whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.products.name, `%${options.search}%`), (0, drizzle_orm_1.ilike)(schema_1.products.description, `%${options.search}%`)));
            }
            // Apply all where conditions
            if (whereConditions.length > 0) {
                query = query.where(whereConditions.length === 1 ? whereConditions[0] : (0, drizzle_orm_1.and)(...whereConditions));
            }
            const [result] = await query;
            return Number(result.count);
        }
        catch (error) {
            console.error('Error in getProductsCount:', error);
            return 0;
        }
    }
    async getCartItems(sessionId) {
        const results = await db_1.db
            .select()
            .from(schema_1.cartItems)
            .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.cartItems.productId, schema_1.products.id))
            .where((0, drizzle_orm_1.eq)(schema_1.cartItems.sessionId, sessionId));
        return results.map(result => ({
            ...result.cart_items,
            product: result.products
        }));
    }
    async addToCart(item) {
        // Check if item already exists in cart
        const [existingItem] = await db_1.db
            .select()
            .from(schema_1.cartItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.cartItems.sessionId, item.sessionId), (0, drizzle_orm_1.eq)(schema_1.cartItems.productId, item.productId)));
        if (existingItem) {
            // Update quantity if item exists
            const [updatedItem] = await db_1.db
                .update(schema_1.cartItems)
                .set({ quantity: existingItem.quantity + item.quantity })
                .where((0, drizzle_orm_1.eq)(schema_1.cartItems.id, existingItem.id))
                .returning();
            return updatedItem;
        }
        else {
            // Add new item
            const [newItem] = await db_1.db.insert(schema_1.cartItems).values(item).returning();
            return newItem;
        }
    }
    async updateCartItem(id, quantity) {
        const [updatedItem] = await db_1.db
            .update(schema_1.cartItems)
            .set({ quantity })
            .where((0, drizzle_orm_1.eq)(schema_1.cartItems.id, id))
            .returning();
        return updatedItem || undefined;
    }
    async removeFromCart(id) {
        const result = await db_1.db.delete(schema_1.cartItems).where((0, drizzle_orm_1.eq)(schema_1.cartItems.id, id));
        return (result.rowCount ?? 0) > 0;
    }
    async clearCart(sessionId) {
        await db_1.db.delete(schema_1.cartItems).where((0, drizzle_orm_1.eq)(schema_1.cartItems.sessionId, sessionId));
    }
    async createOrder(orderData, orderItemsData) {
        const [order] = await db_1.db.insert(schema_1.orders).values(orderData).returning();
        // Add order ID to each order item
        const itemsWithOrderId = orderItemsData.map(item => ({
            ...item,
            orderId: order.id
        }));
        await db_1.db.insert(schema_1.orderItems).values(itemsWithOrderId);
        return order;
    }
    async getUserOrders(userId) {
        const ordersResult = await db_1.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
        const ordersWithItems = await Promise.all(ordersResult.map(async (order) => {
            const itemsResult = await db_1.db
                .select()
                .from(schema_1.orderItems)
                .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.orderItems.productId, schema_1.products.id))
                .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, order.id));
            const items = itemsResult.map(result => ({
                ...result.order_items,
                product: result.products
            }));
            return {
                ...order,
                items
            };
        }));
        return ordersWithItems;
    }
    async getAllOrders() {
        const ordersResult = await db_1.db
            .select()
            .from(schema_1.orders)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
        const ordersWithItems = await Promise.all(ordersResult.map(async (order) => {
            const itemsResult = await db_1.db
                .select()
                .from(schema_1.orderItems)
                .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.orderItems.productId, schema_1.products.id))
                .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, order.id));
            const items = itemsResult.map(result => ({
                ...result.order_items,
                product: result.products
            }));
            return {
                ...order,
                items
            };
        }));
        return ordersWithItems;
    }
    async getOrderById(orderId, userId) {
        let query = db_1.db.select().from(schema_1.orders).where((0, drizzle_orm_1.eq)(schema_1.orders.id, orderId));
        if (userId) {
            query = query.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.orders.id, orderId), (0, drizzle_orm_1.eq)(schema_1.orders.userId, userId)));
        }
        const [order] = await query;
        if (!order)
            return undefined;
        const itemsResult = await db_1.db
            .select()
            .from(schema_1.orderItems)
            .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.orderItems.productId, schema_1.products.id))
            .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, orderId));
        const items = itemsResult.map(result => ({
            ...result.order_items,
            product: result.products
        }));
        return {
            ...order,
            items
        };
    }
    async updateOrderStatus(orderId, status) {
        const [order] = await db_1.db
            .update(schema_1.orders)
            .set({ status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.orders.id, orderId))
            .returning();
        return order || undefined;
    }
    // Admin order management
    async getPendingOrders() {
        const ordersResult = await db_1.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.status, "pending"))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
        const ordersWithItems = [];
        for (const order of ordersResult) {
            const itemsResult = await db_1.db
                .select()
                .from(schema_1.orderItems)
                .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.orderItems.productId, schema_1.products.id))
                .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, order.id));
            const items = itemsResult.map(result => ({
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
        const [order] = await db_1.db
            .update(schema_1.orders)
            .set({
            status: "approved",
            approvedBy: adminEmail,
            approvedAt: new Date(),
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.orders.id, orderId))
            .returning();
        return order || undefined;
    }
    async declineOrder(orderId, adminEmail, reason) {
        const [order] = await db_1.db
            .update(schema_1.orders)
            .set({
            status: "declined",
            approvedBy: adminEmail,
            approvedAt: new Date(),
            declineReason: reason,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.orders.id, orderId))
            .returning();
        return order || undefined;
    }
    async createReferral(referralData) {
        const [referral] = await db_1.db.insert(schema_1.referrals).values(referralData).returning();
        return referral;
    }
    async subscribeToNewsletter(email) {
        try {
            const [subscription] = await db_1.db.insert(schema_1.newsletters).values({ email }).returning();
            return subscription;
        }
        catch (error) {
            // If duplicate email, return existing subscription
            if (error.code === '23505') {
                const existing = await db_1.db.select().from(schema_1.newsletters).where((0, drizzle_orm_1.eq)(schema_1.newsletters.email, email)).limit(1);
                if (existing.length > 0) {
                    return existing[0];
                }
            }
            throw error;
        }
    }
    async getNewsletterSubscriptions() {
        return await db_1.db.select().from(schema_1.newsletters).where((0, drizzle_orm_1.eq)(schema_1.newsletters.isActive, true)).orderBy((0, drizzle_orm_1.desc)(schema_1.newsletters.subscribedAt));
    }
    async unsubscribeFromNewsletter(email) {
        const result = await db_1.db.update(schema_1.newsletters).set({ isActive: false }).where((0, drizzle_orm_1.eq)(schema_1.newsletters.email, email));
        return result.rowCount > 0;
    }
    async cancelOrder(orderId, userId) {
        const [updatedOrder] = await db_1.db
            .update(schema_1.orders)
            .set({ status: 'cancelled' })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.orders.id, orderId), (0, drizzle_orm_1.eq)(schema_1.orders.userId, userId), ne(schema_1.orders.status, 'delivered')))
            .returning();
        return updatedOrder;
    }
    // Admin operations
    async createAdminUser(adminData) {
        const [admin] = await db_1.db.insert(schema_1.adminUsers).values(adminData).returning();
        return admin;
    }
    async getAdminByEmail(email) {
        const [admin] = await db_1.db.select().from(schema_1.adminUsers).where((0, drizzle_orm_1.eq)(schema_1.adminUsers.email, email));
        return admin || undefined;
    }
    async getAdminById(id) {
        const [admin] = await db_1.db.select().from(schema_1.adminUsers).where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, id));
        return admin || undefined;
    }
    async updateAdminLastLogin(id) {
        await db_1.db
            .update(schema_1.adminUsers)
            .set({ lastLoginAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, id));
    }
    // Admin product management
    async updateProductPrice(productId, price) {
        const [product] = await db_1.db
            .update(schema_1.products)
            .set({ price })
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId))
            .returning();
        return product || undefined;
    }
    async updateProductImage(productId, imageUrl) {
        try {
            const [updatedProduct] = await db_1.db
                .update(schema_1.products)
                .set({ imageUrl })
                .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId))
                .returning();
            return updatedProduct;
        }
        catch (error) {
            console.error('Error updating product image:', error);
            return null;
        }
    }
    async updateProductImages(productId, imageUrl, imageUrls) {
        try {
            const [updatedProduct] = await db_1.db
                .update(schema_1.products)
                .set({
                imageUrl,
                imageUrls: imageUrls.length > 0 ? imageUrls : []
            })
                .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId))
                .returning();
            return updatedProduct;
        }
        catch (error) {
            console.error('Error updating product images:', error);
            return undefined;
        }
    }
    async updateProduct(id, updates) {
        try {
            const updateData = {};
            if (updates.name !== undefined)
                updateData.name = updates.name;
            if (updates.description !== undefined)
                updateData.description = updates.description;
            if (updates.price !== undefined)
                updateData.price = updates.price;
            if (updates.categoryId !== undefined)
                updateData.categoryId = updates.categoryId;
            if (updates.imageUrl !== undefined)
                updateData.imageUrl = updates.imageUrl;
            if (updates.inStock !== undefined)
                updateData.inStock = updates.inStock;
            if (updates.featured !== undefined)
                updateData.featured = updates.featured;
            if (updates.tags !== undefined)
                updateData.tags = updates.tags;
            const [updatedProduct] = await db_1.db
                .update(schema_1.products)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.products.id, id))
                .returning();
            return updatedProduct || undefined;
        }
        catch (error) {
            console.error('Error updating product:', error);
            return undefined;
        }
    }
    async initializeData() {
        // Check if we already have data
        const existingCategories = await db_1.db.select().from(schema_1.categories).limit(1);
        if (existingCategories.length > 0) {
            return; // Data already exists
        }
        // Initialize categories
        const categoriesData = [
            {
                name: "Botulinum Toxins",
                slug: "botulinum-toxins",
                description: "Premium botulinum toxin products for aesthetic and therapeutic applications",
                icon: "💉",
                color: "#3B82F6",
                itemCount: 8
            },
            {
                name: "Dermal Fillers",
                slug: "dermal-fillers",
                description: "High-quality hyaluronic acid and other dermal filler solutions",
                icon: "💧",
                color: "#10B981",
                itemCount: 12
            },
            {
                name: "Skin Care",
                slug: "skin-care",
                description: "Professional-grade skincare products and treatments",
                icon: "✨",
                color: "#F59E0B",
                itemCount: 15
            },
            {
                name: "Medical Devices",
                slug: "medical-devices",
                description: "Advanced medical devices and equipment for aesthetic procedures",
                icon: "🔬",
                color: "#8B5CF6",
                itemCount: 6
            },
            {
                name: "Supplements",
                slug: "supplements",
                description: "Nutritional supplements and wellness products",
                icon: "💊",
                color: "#EF4444",
                itemCount: 10
            }
        ];
        await db_1.db.insert(schema_1.categories).values(categoriesData);
        // Initialize products
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
        await db_1.db.insert(schema_1.products).values(productsData);
    }
    // Carousel management methods
    async getCarouselItems() {
        const items = await db_1.db.select().from(schema_1.carouselItems).orderBy(schema_1.carouselItems.sortOrder);
        return items;
    }
    async getCarouselItem(id) {
        const [item] = await db_1.db.select().from(schema_1.carouselItems).where((0, drizzle_orm_1.eq)(schema_1.carouselItems.id, id));
        return item || undefined;
    }
    async createCarouselItem(itemData) {
        const [newItem] = await db_1.db
            .insert(schema_1.carouselItems)
            .values({
            ...itemData,
            createdAt: new Date(),
            updatedAt: new Date()
        })
            .returning();
        return newItem;
    }
    async updateCarouselItem(id, updates) {
        const [updatedItem] = await db_1.db
            .update(schema_1.carouselItems)
            .set({
            ...updates,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.carouselItems.id, id))
            .returning();
        return updatedItem || undefined;
    }
    async deleteCarouselItem(id) {
        const result = await db_1.db.delete(schema_1.carouselItems).where((0, drizzle_orm_1.eq)(schema_1.carouselItems.id, id));
        return result.rowCount > 0;
    }
    async reorderCarouselItems(itemIds) {
        for (let i = 0; i < itemIds.length; i++) {
            await db_1.db
                .update(schema_1.carouselItems)
                .set({ sortOrder: i })
                .where((0, drizzle_orm_1.eq)(schema_1.carouselItems.id, itemIds[i]));
        }
    }
    // Featured Carousel Management
    async getFeaturedCarousel() {
        const results = await db_1.db
            .select({
            id: schema_1.featuredCarousel.id,
            displayOrder: schema_1.featuredCarousel.displayOrder,
            product: schema_1.products
        })
            .from(schema_1.featuredCarousel)
            .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.featuredCarousel.productId, schema_1.products.id))
            .where((0, drizzle_orm_1.eq)(schema_1.featuredCarousel.isActive, true))
            .orderBy(schema_1.featuredCarousel.displayOrder);
        // Filter out results where product is null (invalid product_id)
        return results
            .filter(result => result.product !== null)
            .map(result => ({
            id: result.id,
            displayOrder: result.displayOrder,
            product: {
                ...result.product,
                imageUrl: `/api/products/${result.product.id}/image`
            }
        }));
    }
    async addToFeaturedCarousel(data) {
        const [item] = await db_1.db.insert(schema_1.featuredCarousel).values(data).returning();
        return item;
    }
    async removeFromFeaturedCarousel(id) {
        const result = await db_1.db.delete(schema_1.featuredCarousel).where((0, drizzle_orm_1.eq)(schema_1.featuredCarousel.id, id));
        return (result.rowCount ?? 0) > 0;
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
//# sourceMappingURL=storage.js.map
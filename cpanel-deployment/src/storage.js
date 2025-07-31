// Database storage layer for cPanel deployment
const { eq, desc, asc, and, or, sql, like } = require('drizzle-orm');
const { db } = require('./db.js');
const schema = require('./schema.js');

class DatabaseStorage {
  // User management
  async createUser(userData) {
    const [user] = await db.insert(schema.users).values(userData).returning();
    return user;
  }

  async getUserByEmail(email) {
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return users[0] || null;
  }

  async getUserById(id) {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0] || null;
  }

  async updateUserApproval(userId, isApproved) {
    const [user] = await db.update(schema.users)
      .set({ isApproved, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers() {
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  // Admin user management
  async createAdminUser(adminData) {
    const [admin] = await db.insert(schema.adminUsers).values(adminData).returning();
    return admin;
  }

  async getAdminByEmail(email) {
    const admins = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
    return admins[0] || null;
  }

  async getAdminById(id) {
    const admins = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, id));
    return admins[0] || null;
  }

  async updateAdminLastLogin(adminId) {
    await db.update(schema.adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.adminUsers.id, adminId));
  }

  // Product management
  async getAllProducts(limit = 50, offset = 0) {
    return await db.select().from(schema.products)
      .orderBy(desc(schema.products.featured), asc(schema.products.name))
      .limit(limit)
      .offset(offset);
  }

  async getProductById(id) {
    const products = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return products[0] || null;
  }

  async getProductsByCategory(categoryId, limit = 15, offset = 0) {
    return await db.select().from(schema.products)
      .where(eq(schema.products.categoryId, categoryId))
      .orderBy(desc(schema.products.featured), asc(schema.products.name))
      .limit(limit)
      .offset(offset);
  }

  async createProduct(productData) {
    const [product] = await db.insert(schema.products).values(productData).returning();
    return product;
  }

  async updateProduct(id, productData) {
    const [product] = await db.update(schema.products)
      .set(productData)
      .where(eq(schema.products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id) {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  }

  // Category management
  async getAllCategories() {
    return await db.select().from(schema.categories).orderBy(asc(schema.categories.name));
  }

  async getCategoryById(id) {
    const categories = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
    return categories[0] || null;
  }

  async createCategory(categoryData) {
    const [category] = await db.insert(schema.categories).values(categoryData).returning();
    return category;
  }

  // Brand management
  async getAllBrands() {
    return await db.select().from(schema.brands)
      .where(eq(schema.brands.isActive, true))
      .orderBy(asc(schema.brands.name));
  }

  async getBrandById(id) {
    const brands = await db.select().from(schema.brands).where(eq(schema.brands.id, id));
    return brands[0] || null;
  }

  // Cart management
  async getCartItems(sessionId) {
    return await db.select().from(schema.cartItems)
      .where(eq(schema.cartItems.sessionId, sessionId));
  }

  async addCartItem(sessionId, productId, quantity) {
    const [item] = await db.insert(schema.cartItems)
      .values({ sessionId, productId, quantity })
      .returning();
    return item;
  }

  async updateCartItemQuantity(sessionId, productId, quantity) {
    const [item] = await db.update(schema.cartItems)
      .set({ quantity })
      .where(and(
        eq(schema.cartItems.sessionId, sessionId),
        eq(schema.cartItems.productId, productId)
      ))
      .returning();
    return item;
  }

  async removeCartItem(sessionId, productId) {
    await db.delete(schema.cartItems)
      .where(and(
        eq(schema.cartItems.sessionId, sessionId),
        eq(schema.cartItems.productId, productId)
      ));
  }

  async clearCart(sessionId) {
    await db.delete(schema.cartItems)
      .where(eq(schema.cartItems.sessionId, sessionId));
  }

  // Order management
  async createOrder(orderData) {
    const [order] = await db.insert(schema.orders).values(orderData).returning();
    return order;
  }

  async createOrderItem(orderItemData) {
    const [orderItem] = await db.insert(schema.orderItems).values(orderItemData).returning();
    return orderItem;
  }

  async getAllOrders() {
    return await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
  }

  async getOrderById(id) {
    const orders = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    return orders[0] || null;
  }

  async getOrderItems(orderId) {
    return await db.select().from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, orderId));
  }

  async updateOrderStatus(orderId, status, adminId, adminNotes) {
    const [order] = await db.update(schema.orders)
      .set({ 
        status, 
        processedBy: adminId, 
        adminNotes,
        updatedAt: new Date()
      })
      .where(eq(schema.orders.id, orderId))
      .returning();
    return order;
  }

  // Featured carousel management
  async getFeaturedCarousel() {
    return await db.select().from(schema.featuredCarousel)
      .where(eq(schema.featuredCarousel.isActive, true))
      .orderBy(asc(schema.featuredCarousel.displayOrder));
  }

  async addToFeaturedCarousel(productId, displayOrder) {
    const [item] = await db.insert(schema.featuredCarousel)
      .values({ productId, displayOrder })
      .returning();
    return item;
  }

  async removeFromFeaturedCarousel(id) {
    await db.delete(schema.featuredCarousel).where(eq(schema.featuredCarousel.id, id));
  }

  // Carousel items (homepage banners)
  async getAllCarouselItems() {
    return await db.select().from(schema.carouselItems)
      .where(eq(schema.carouselItems.isActive, true))
      .orderBy(asc(schema.carouselItems.displayOrder));
  }

  async createCarouselItem(itemData) {
    const [item] = await db.insert(schema.carouselItems).values(itemData).returning();
    return item;
  }

  // Newsletter management
  async subscribeNewsletter(email) {
    const [subscription] = await db.insert(schema.newsletters)
      .values({ email })
      .returning();
    return subscription;
  }

  async getAllNewsletterSubscriptions() {
    return await db.select().from(schema.newsletters)
      .where(eq(schema.newsletters.isActive, true))
      .orderBy(desc(schema.newsletters.subscribedAt));
  }
}

const storage = new DatabaseStorage();

module.exports = { storage };
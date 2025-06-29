import { 
  ehriAccounts, categories, brands, products, cartItems, users, orders, orderItems, referrals, adminUsers, carouselItems,
  type EhriAccount, type InsertEhriAccount, type Category, type Brand, type InsertBrand, type Product, type CartItem, type User, type Order, type OrderItem, type Referral, type AdminUser, type InsertAdminUser,
  type InsertCategory, type InsertProduct, type InsertCartItem, type InsertUser, type InsertOrder, type InsertOrderItem, type InsertReferral,
  type CarouselItem, type InsertCarouselItem,
  type ProductWithCategory, type CartItemWithProduct, type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Ehri Account operations
  createEhriAccount(account: InsertEhriAccount): Promise<EhriAccount>;
  getEhriAccountByEhriId(ehriId: string): Promise<EhriAccount | undefined>;
  getEhriAccountByEmail(email: string): Promise<EhriAccount | undefined>;
  verifyEhriAccount(ehriId: string, token: string): Promise<boolean>;

  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  approveUser(userId: number, approvedBy: string): Promise<User | undefined>;
  getPendingUsers(): Promise<User[]>;
  deleteUser(userId: number): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  updateCategoryIcon(id: number, icon: string): Promise<Category | undefined>;

  // Brands
  getBrands(): Promise<Brand[]>;
  getBrandById(id: number): Promise<Brand | undefined>;
  updateBrandImage(id: number, imageUrl: string): Promise<Brand | undefined>;

  // Products
  getProducts(options?: {
    categoryId?: number;
    featured?: boolean;
    limit?: number;
    search?: string;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsWithCategory(options?: {
    categoryId?: number;
    featured?: boolean;
    limit?: number;
    search?: string;
  }): Promise<ProductWithCategory[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;

  // Cart
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;

  // Orders and Purchase History
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getUserOrders(userId: string): Promise<OrderWithItems[]>;
  getOrderById(orderId: number, userId?: string): Promise<OrderWithItems | undefined>;
  updateOrderStatus(orderId: number, status: string): Promise<Order | undefined>;
  
  // Admin order management
  getPendingOrders(): Promise<OrderWithItems[]>;
  approveOrder(orderId: number, adminEmail: string): Promise<Order | undefined>;
  declineOrder(orderId: number, adminEmail: string, reason: string): Promise<Order | undefined>;

  // Referrals
  createReferral(referral: InsertReferral): Promise<Referral>;

  // Admin operations
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  getAdminById(id: number): Promise<AdminUser | undefined>;
  updateAdminLastLogin(id: number): Promise<void>;

  // Admin product management
  updateProductPrice(productId: number, price: string): Promise<Product | undefined>;
  updateProductImage(productId: number, imageUrl: string): Promise<Product | undefined>;
  updateProductImages(productId: number, imageUrl: string, imageUrls: string[]): Promise<Product | undefined>;
  updateProduct(productId: number, data: { name?: string; description?: string; price?: string; imageUrl?: string; categoryId?: number; inStock?: boolean; featured?: boolean }): Promise<Product | undefined>;

  // Carousel management
  getCarouselItems(): Promise<any[]>;
  getCarouselItem(id: number): Promise<any | undefined>;
  createCarouselItem(item: any): Promise<any>;
  updateCarouselItem(id: number, updates: any): Promise<any | undefined>;
  deleteCarouselItem(id: number): Promise<boolean>;
  reorderCarouselItems(itemIds: number[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  // Ehri Account operations
  async createEhriAccount(account: InsertEhriAccount): Promise<EhriAccount> {
    const [ehriAccount] = await db.insert(ehriAccounts).values(account).returning();
    return ehriAccount;
  }

  async getEhriAccountByEhriId(ehriId: string): Promise<EhriAccount | undefined> {
    const [ehriAccount] = await db.select().from(ehriAccounts).where(eq(ehriAccounts.ehriId, ehriId));
    return ehriAccount || undefined;
  }

  async getEhriAccountByEmail(email: string): Promise<EhriAccount | undefined> {
    const [ehriAccount] = await db.select().from(ehriAccounts).where(eq(ehriAccounts.email, email));
    return ehriAccount || undefined;
  }

  async verifyEhriAccount(ehriId: string, token: string): Promise<boolean> {
    const [ehriAccount] = await db
      .select()
      .from(ehriAccounts)
      .where(and(eq(ehriAccounts.ehriId, ehriId), eq(ehriAccounts.verificationToken, token)));

    if (ehriAccount) {
      await db
        .update(ehriAccounts)
        .set({ isVerified: true, linkedAt: new Date(), verificationToken: null })
        .where(eq(ehriAccounts.id, ehriAccount.id));
      return true;
    }
    return false;
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async approveUser(userId: number, approvedBy: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isApproved: true, approvedAt: new Date(), approvedBy })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getPendingUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isApproved, false));
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      await db
        .delete(users)
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async updateCategoryIcon(id: number, icon: string): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set({ icon })
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands).where(eq(brands.isActive, true));
  }

  async getBrandById(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand || undefined;
  }

  async updateBrandImage(id: number, imageUrl: string): Promise<Brand | undefined> {
    const [brand] = await db
      .update(brands)
      .set({ imageUrl })
      .where(eq(brands.id, id))
      .returning();
    return brand || undefined;
  }

  async getProducts(options: {
    categoryId?: number;
    featured?: boolean;
    limit?: number;
    search?: string;
  } = {}): Promise<Product[]> {
    let query = db.select().from(products);

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

    if (options.limit) {
      query = query.limit(options.limit);
    }

    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    // Ensure bulkDiscounts is properly formatted for database storage
    const productWithDiscounts = {
      ...productData,
      bulkDiscounts: productData.bulkDiscounts || []
    };
    
    const [product] = await db
      .insert(products)
      .values(productWithDiscounts)
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(products)
        .where(eq(products.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  }

  async getProductsWithCategory(options: {
    categoryId?: number;
    categorySlug?: string;
    featured?: boolean;
    limit?: number;
    search?: string;
  } = {}): Promise<ProductWithCategory[]> {
    let query = db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (options.categoryId) {
      query = query.where(eq(products.categoryId, options.categoryId));
    }

    if (options.categorySlug) {
      query = query.where(eq(categories.slug, options.categorySlug));
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

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const results = await query;
    return results.map(result => ({
      ...result.products,
      category: result.categories!
    }));
  }

  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const results = await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));

    return results.map(result => ({
      ...result.cart_items,
      product: result.products!
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.sessionId, item.sessionId),
          eq(cartItems.productId, item.productId)
        )
      );

    if (existingItem) {
      // Update quantity if item exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + item.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async createOrder(orderData: InsertOrder, orderItemsData: InsertOrderItem[]): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();

    // Add order ID to each order item
    const itemsWithOrderId = orderItemsData.map(item => ({
      ...item,
      orderId: order.id
    }));

    await db.insert(orderItems).values(itemsWithOrderId);

    return order;
  }

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const ordersResult = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const itemsResult = await db
          .select()
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        const items = itemsResult.map(result => ({
          ...result.order_items,
          product: result.products!
        }));

        return {
          ...order,
          items
        };
      })
    );

    return ordersWithItems;
  }

  async getOrderById(orderId: number, userId?: string): Promise<OrderWithItems | undefined> {
    let query = db.select().from(orders).where(eq(orders.id, orderId));

    if (userId) {
      query = query.where(and(eq(orders.id, orderId), eq(orders.userId, userId)));
    }

    const [order] = await query;
    if (!order) return undefined;

    const itemsResult = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    const items = itemsResult.map(result => ({
      ...result.order_items,
      product: result.products!
    }));

    return {
      ...order,
      items
    };
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return order || undefined;
  }

  // Admin order management
  async getPendingOrders(): Promise<OrderWithItems[]> {
    const ordersResult = await db
      .select()
      .from(orders)
      .where(eq(orders.status, "pending"))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems: OrderWithItems[] = [];

    for (const order of ordersResult) {
      const itemsResult = await db
        .select()
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      const items = itemsResult.map(result => ({
        ...result.order_items,
        product: result.products!
      }));

      ordersWithItems.push({
        ...order,
        items
      });
    }

    return ordersWithItems;
  }

  async approveOrder(orderId: number, adminEmail: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ 
        status: "approved", 
        approvedBy: adminEmail,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order || undefined;
  }

  async declineOrder(orderId: number, adminEmail: string, reason: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ 
        status: "declined", 
        approvedBy: adminEmail,
        approvedAt: new Date(),
        declineReason: reason,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order || undefined;
  }

  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(referralData).returning();
    return referral;
  }

  // Admin operations
  async createAdminUser(adminData: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db.insert(adminUsers).values(adminData).returning();
    return admin;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  async getAdminById(id: number): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || undefined;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  // Admin product management
  async updateProductPrice(productId: number, price: string): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ price })
      .where(eq(products.id, productId))
      .returning();
    return product || undefined;
  }

  async updateProductImage(productId: number, imageUrl: string): Promise<Product | undefined> {
    try {
      const [updatedProduct] = await db
        .update(products)
        .set({ imageUrl })
        .where(eq(products.id, productId))
        .returning();

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product image:', error);
      return null;
    }
  }

  async updateProductImages(productId: number, imageUrl: string, imageUrls: string[]): Promise<Product | undefined> {
    try {
      const [updatedProduct] = await db
        .update(products)
        .set({ 
          imageUrl,
          imageUrls: imageUrls.length > 0 ? imageUrls : []
        })
        .where(eq(products.id, productId))
        .returning();

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product images:', error);
      return undefined;
    }
  }

  async updateProduct(id: number, updates: { 
    name?: string; 
    description?: string; 
    price?: string; 
    imageUrl?: string; 
    categoryId?: number;
    inStock?: boolean; 
    featured?: boolean; 
    tags?: string;
  }): Promise<Product | undefined> {
    try {
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.categoryId !== undefined) updateData.categoryId = updates.categoryId;
      if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
      if (updates.inStock !== undefined) updateData.inStock = updates.inStock;
      if (updates.featured !== undefined) updateData.featured = updates.featured;
      if (updates.tags !== undefined) updateData.tags = updates.tags;

      const [updatedProduct] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();

      return updatedProduct || undefined;
    } catch (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
  }

  private async initializeData() {
    // Check if we already have data
    const existingCategories = await db.select().from(categories).limit(1);
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

    await db.insert(categories).values(categoriesData);

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

    await db.insert(products).values(productsData);
  }

  // Carousel management methods
  async getCarouselItems(): Promise<any[]> {
    const items = await db.select().from(carouselItems).orderBy(carouselItems.sortOrder);
    return items;
  }

  async getCarouselItem(id: number): Promise<any | undefined> {
    const [item] = await db.select().from(carouselItems).where(eq(carouselItems.id, id));
    return item || undefined;
  }

  async createCarouselItem(itemData: any): Promise<any> {
    const [newItem] = await db
      .insert(carouselItems)
      .values({
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newItem;
  }

  async updateCarouselItem(id: number, updates: any): Promise<any | undefined> {
    const [updatedItem] = await db
      .update(carouselItems)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(carouselItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deleteCarouselItem(id: number): Promise<boolean> {
    const result = await db.delete(carouselItems).where(eq(carouselItems.id, id));
    return result.rowCount > 0;
  }

  async reorderCarouselItems(itemIds: number[]): Promise<void> {
    for (let i = 0; i < itemIds.length; i++) {
      await db
        .update(carouselItems)
        .set({ sortOrder: i })
        .where(eq(carouselItems.id, itemIds[i]));
    }
  }
}

export const storage = new DatabaseStorage();
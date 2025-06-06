import { 
  ehriAccounts, categories, products, cartItems, users, orders, orderItems, referrals,
  type EhriAccount, type InsertEhriAccount, type Category, type Product, type CartItem, type User, type Order, type OrderItem, type Referral,
  type InsertCategory, type InsertProduct, type InsertCartItem, type InsertUser, type InsertOrder, type InsertOrderItem, type InsertReferral,
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
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
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
  
  // Referrals
  createReferral(referral: InsertReferral): Promise<Referral>;
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

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
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

  async getProductsWithCategory(options: {
    categoryId?: number;
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
      .set({ orderStatus: status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return order || undefined;
  }

  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(referralData).returning();
    return referral;
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
}

export const storage = new DatabaseStorage();
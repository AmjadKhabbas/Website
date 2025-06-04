import { 
  categories, products, cartItems, users, orders, orderItems, referrals,
  type Category, type Product, type CartItem, type User, type Order, type OrderItem, type Referral,
  type InsertCategory, type InsertProduct, type InsertCartItem, type UpsertUser, type InsertOrder, type InsertOrderItem, type InsertReferral,
  type ProductWithCategory, type CartItemWithProduct, type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, or } from "drizzle-orm";

export interface IStorage {
  // User operations (required for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  // User operations (required for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    // Initialize sample medical categories if database is empty
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
      await this.initializeData();
    }
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  // Products
  async getProducts(options: {
    categoryId?: number;
    featured?: boolean;
    limit?: number;
    search?: string;
  } = {}): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    if (options.categoryId) {
      conditions.push(eq(products.categoryId, options.categoryId));
    }
    if (options.featured !== undefined) {
      conditions.push(eq(products.featured, options.featured));
    }
    if (options.search) {
      conditions.push(
        or(
          ilike(products.name, `%${options.search}%`),
          ilike(products.description, `%${options.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsWithCategory(options: {
    categoryId?: number;
    featured?: boolean;
    limit?: number;
    search?: string;
  } = {}): Promise<ProductWithCategory[]> {
    let query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        originalPrice: products.originalPrice,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        rating: products.rating,
        reviewCount: products.reviewCount,
        inStock: products.inStock,
        featured: products.featured,
        tags: products.tags,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
          itemCount: categories.itemCount,
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    const conditions = [];
    if (options.categoryId) {
      conditions.push(eq(products.categoryId, options.categoryId));
    }
    if (options.featured !== undefined) {
      conditions.push(eq(products.featured, options.featured));
    }
    if (options.search) {
      conditions.push(
        or(
          ilike(products.name, `%${options.search}%`),
          ilike(products.description, `%${options.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    return await query;
  }

  // Cart operations
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    return await db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          originalPrice: products.originalPrice,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          rating: products.rating,
          reviewCount: products.reviewCount,
          inStock: products.inStock,
          featured: products.featured,
          tags: products.tags,
        }
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.sessionId, item.sessionId),
        eq(cartItems.productId, item.productId)
      ));

    if (existingItem) {
      // Update quantity if item exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db
        .insert(cartItems)
        .values(item)
        .returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Orders and Purchase History
  async createOrder(orderData: InsertOrder, orderItemsData: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      // Create the order
      const [order] = await tx.insert(orders).values(orderData).returning();
      
      // Create order items
      const orderItemsWithOrderId = orderItemsData.map(item => ({
        ...item,
        orderId: order.id
      }));
      
      await tx.insert(orderItems).values(orderItemsWithOrderId);
      
      return order;
    });
  }

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
        shippingAddress: orders.shippingAddress,
        billingAddress: orders.billingAddress,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    // Get items for each order
    const ordersWithItems = [];
    for (const order of userOrders) {
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          productName: orderItems.productName,
          productImageUrl: orderItems.productImageUrl,
          product: {
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            originalPrice: products.originalPrice,
            imageUrl: products.imageUrl,
            categoryId: products.categoryId,
            rating: products.rating,
            reviewCount: products.reviewCount,
            inStock: products.inStock,
            featured: products.featured,
            tags: products.tags,
          }
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems;
  }

  async getOrderById(orderId: number, userId?: string): Promise<OrderWithItems | undefined> {
    const conditions = [eq(orders.id, orderId)];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(and(...conditions));

    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
        productName: orderItems.productName,
        productImageUrl: orderItems.productImageUrl,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          originalPrice: products.originalPrice,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          rating: products.rating,
          reviewCount: products.reviewCount,
          inStock: products.inStock,
          featured: products.featured,
          tags: products.tags,
        }
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return { ...order, items };
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }

  // Referrals
  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values(referralData)
      .returning();
    return referral;
  }

  private async initializeData() {
    // Initialize medical categories
    const categoriesData = [
      { name: "Botulinum Toxins", slug: "botulinum-toxins", description: "Professional botulinum toxin products", icon: "Syringe", color: "blue", itemCount: 24 },
      { name: "Dermal Fillers", slug: "dermal-fillers", description: "High-quality dermal filler products", icon: "Droplet", color: "teal", itemCount: 18 },
      { name: "Orthopedic", slug: "orthopedic", description: "Orthopedic medical supplies", icon: "Bone", color: "green", itemCount: 32 },
      { name: "Rheumatology", slug: "rheumatology", description: "Rheumatology treatment products", icon: "Heart", color: "red", itemCount: 15 },
      { name: "Weightloss & Gynecology", slug: "weightloss-gynecology", description: "Specialized medical products", icon: "Scale", color: "purple", itemCount: 21 }
    ];

    for (const categoryData of categoriesData) {
      await db.insert(categories).values(categoryData).onConflictDoNothing();
    }

    // Initialize sample medical products
    const medicalCategories = await db.select().from(categories);
    const botoxCategory = medicalCategories.find(c => c.slug === "botulinum-toxins");
    const fillersCategory = medicalCategories.find(c => c.slug === "dermal-fillers");
    const orthoCategory = medicalCategories.find(c => c.slug === "orthopedic");

    if (botoxCategory && fillersCategory && orthoCategory) {
      const productsData = [
        {
          name: "Botox 100 Units",
          description: "Professional grade botulinum toxin for medical use",
          price: "450.00",
          originalPrice: "500.00",
          imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
          categoryId: botoxCategory.id,
          rating: "4.9",
          reviewCount: 156,
          inStock: true,
          featured: true,
          tags: ["professional", "botox"]
        },
        {
          name: "Juvederm Ultra XC",
          description: "Hyaluronic acid dermal filler with lidocaine",
          price: "320.00",
          imageUrl: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=400&fit=crop",
          categoryId: fillersCategory.id,
          rating: "4.8",
          reviewCount: 243,
          inStock: true,
          featured: true,
          tags: ["dermal", "filler"]
        },
        {
          name: "Restylane Silk",
          description: "Premium dermal filler for subtle lip enhancement",
          price: "380.00",
          originalPrice: "420.00",
          imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop",
          categoryId: fillersCategory.id,
          rating: "4.7",
          reviewCount: 189,
          inStock: true,
          featured: false,
          tags: ["lip", "enhancement"]
        },
        {
          name: "Dysport 300 Units",
          description: "Fast-acting botulinum toxin for wrinkle treatment",
          price: "425.00",
          imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop",
          categoryId: botoxCategory.id,
          rating: "4.6",
          reviewCount: 127,
          inStock: true,
          featured: false,
          tags: ["botulinum", "wrinkle"]
        },
        {
          name: "Orthopedic Injection Kit",
          description: "Complete injection kit for orthopedic procedures",
          price: "285.00",
          imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop",
          categoryId: orthoCategory.id,
          rating: "4.5",
          reviewCount: 89,
          inStock: true,
          featured: true,
          tags: ["orthopedic", "injection"]
        },
        {
          name: "Radiesse 1.5ml",
          description: "Calcium hydroxylapatite dermal filler",
          price: "395.00",
          imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=400&fit=crop",
          categoryId: fillersCategory.id,
          rating: "4.4",
          reviewCount: 156,
          inStock: false,
          featured: false,
          tags: ["calcium", "volumizing"]
        }
      ];

      for (const productData of productsData) {
        await db.insert(products).values(productData).onConflictDoNothing();
      }
    }
  }
}

export const storage = new DatabaseStorage();
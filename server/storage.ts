import { categories, products, cartItems, type Category, type Product, type CartItem, type InsertCategory, type InsertProduct, type InsertCartItem, type ProductWithCategory, type CartItemWithProduct } from "@shared/schema";

export interface IStorage {
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
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentCartItemId: number;

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const categoryData: Omit<Category, 'id'>[] = [
      { name: "Electronics", slug: "electronics", description: "Latest gadgets and technology", icon: "fas fa-laptop", color: "blue", itemCount: 2450 },
      { name: "Fashion", slug: "fashion", description: "Trendy clothing and accessories", icon: "fas fa-tshirt", color: "pink", itemCount: 3120 },
      { name: "Home", slug: "home", description: "Home decor and furniture", icon: "fas fa-home", color: "green", itemCount: 1890 },
      { name: "Sports", slug: "sports", description: "Sports equipment and gear", icon: "fas fa-basketball-ball", color: "orange", itemCount: 1250 },
      { name: "Books", slug: "books", description: "Books and educational materials", icon: "fas fa-book", color: "purple", itemCount: 5670 },
      { name: "Health", slug: "health", description: "Health and wellness products", icon: "fas fa-heartbeat", color: "teal", itemCount: 980 },
    ];

    categoryData.forEach((category) => {
      const id = this.currentCategoryId++;
      this.categories.set(id, { ...category, id });
    });

    // Initialize products
    const productData: Omit<Product, 'id'>[] = [
      {
        name: "iPhone 15 Pro",
        description: "Latest smartphone with advanced features and premium design",
        price: "999.00",
        originalPrice: "1249.00",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        categoryId: 1,
        rating: "4.8",
        reviewCount: 1250,
        inStock: true,
        featured: true,
        tags: ["smartphone", "apple", "premium"],
      },
      {
        name: "Premium Headphones",
        description: "Noise-canceling wireless headphones with superior sound quality",
        price: "299.00",
        originalPrice: "399.00",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        categoryId: 1,
        rating: "4.6",
        reviewCount: 890,
        inStock: true,
        featured: true,
        tags: ["headphones", "wireless", "audio"],
      },
      {
        name: "Luxury Watch",
        description: "Elegant timepiece with premium materials and craftsmanship",
        price: "1299.00",
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        categoryId: 2,
        rating: "4.9",
        reviewCount: 456,
        inStock: true,
        featured: true,
        tags: ["watch", "luxury", "accessories"],
      },
      {
        name: "Sport Sneakers",
        description: "Comfortable athletic shoes perfect for daily wear and exercise",
        price: "129.00",
        originalPrice: "179.00",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        categoryId: 4,
        rating: "4.7",
        reviewCount: 2100,
        inStock: true,
        featured: true,
        tags: ["sneakers", "sports", "comfortable"],
      },
      {
        name: "Gaming Laptop",
        description: "High-performance laptop for gaming and professional work",
        price: "1599.00",
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        categoryId: 1,
        rating: "4.5",
        reviewCount: 678,
        inStock: true,
        featured: false,
        tags: ["laptop", "gaming", "performance"],
      },
      {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with precision tracking",
        price: "49.99",
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        categoryId: 1,
        rating: "4.3",
        reviewCount: 324,
        inStock: true,
        featured: false,
        tags: ["mouse", "wireless", "ergonomic"],
      },
    ];

    productData.forEach((product) => {
      const id = this.currentProductId++;
      this.products.set(id, { ...product, id });
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async getProducts(options: {
    categoryId?: number;
    featured?: boolean;
    limit?: number;
    search?: string;
  } = {}): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (options.categoryId) {
      products = products.filter(p => p.categoryId === options.categoryId);
    }

    if (options.featured !== undefined) {
      products = products.filter(p => p.featured === options.featured);
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (options.limit) {
      products = products.slice(0, options.limit);
    }

    return products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsWithCategory(options: {
    categoryId?: number;
    featured?: boolean;
    limit?: number;
    search?: string;
  } = {}): Promise<ProductWithCategory[]> {
    const products = await this.getProducts(options);
    return products.map(product => {
      const category = this.categories.get(product.categoryId)!;
      return { ...product, category };
    });
  }

  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
    return items.map(item => {
      const product = this.products.get(item.productId)!;
      return { ...item, product };
    });
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.sessionId === insertItem.sessionId && item.productId === insertItem.productId
    );

    if (existingItem) {
      // Update quantity
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + (insertItem.quantity || 1) };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }

    // Create new item
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { ...insertItem, quantity: insertItem.quantity || 1, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemsToRemove = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.sessionId === sessionId)
      .map(([id, _]) => id);
    
    itemsToRemove.forEach(id => this.cartItems.delete(id));
  }
}

export const storage = new MemStorage();

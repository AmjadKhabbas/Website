-- MySQL Schema for Meds-Go Medical Marketplace
-- This replaces the PostgreSQL schema from the Node.js version

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS ehri_accounts;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS carousel_items;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Categories table
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Brands table
CREATE TABLE brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  image_url VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url VARCHAR(255) NOT NULL,
  image_urls JSON, -- Array of additional product images
  category_id INT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  in_stock BOOLEAN DEFAULT TRUE,
  tags TEXT,
  bulk_discounts JSON, -- Array of bulk discount tiers
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_featured (featured),
  INDEX idx_price (price)
);

-- EHRI accounts table (for professional verification)
CREATE TABLE ehri_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ehri_id VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  verification_token VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table (healthcare professionals)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  
  -- Medical License Information
  license_number VARCHAR(100) NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  province_state VARCHAR(100) NOT NULL,
  
  -- Practice Information
  practice_name VARCHAR(255) NOT NULL,
  practice_address TEXT NOT NULL,
  
  -- Account Status & Verification
  is_approved BOOLEAN DEFAULT FALSE,
  is_license_verified BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP NULL,
  approved_by VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_approved (is_approved)
);

-- Admin users table
CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, declined, shipped, delivered, cancelled
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Shipping & Billing Information
  shipping_address JSON NOT NULL,
  billing_address JSON NOT NULL,
  
  -- Doctor's Banking Information (Admin Only)
  doctor_banking_info JSON NOT NULL,
  institution_number VARCHAR(20) NOT NULL,
  
  -- Card Information (Admin Only)
  card_info JSON NOT NULL,
  
  -- Admin actions
  admin_notes TEXT,
  approved_by VARCHAR(255),
  declined_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_order_number (order_number)
);

-- Order items table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
);

-- Cart items table (session-based)
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  
  INDEX idx_session (session_id),
  INDEX idx_product (product_id)
);

-- Referrals table
CREATE TABLE referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_email VARCHAR(255) NOT NULL,
  referee_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, expired
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  
  INDEX idx_referrer (referrer_email),
  INDEX idx_referee (referee_email)
);

-- Carousel items table
CREATE TABLE carousel_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  price VARCHAR(20),
  original_price VARCHAR(20),
  discount VARCHAR(20),
  discount_percentage INT DEFAULT 0,
  image_url VARCHAR(255) NOT NULL,
  background_gradient VARCHAR(255),
  text_color VARCHAR(20) DEFAULT '#000000',
  accent_color VARCHAR(20) DEFAULT '#007bff',
  badge_color VARCHAR(20) DEFAULT '#28a745',
  on_sale BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_active (is_active),
  INDEX idx_sort (sort_order)
);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Botulinum Toxins', 'botulinum-toxins', 'Professional grade botulinum toxin products for cosmetic and medical procedures', 'Syringe'),
('Dermal Fillers', 'dermal-fillers', 'Hyaluronic acid and other dermal filler products for facial enhancement', 'Sparkles'),
('Orthopedic', 'orthopedic', 'Orthopedic supplies and equipment for medical procedures', 'Bone'),
('Skincare', 'skincare', 'Professional skincare products and treatments', 'Heart'),
('Medical Equipment', 'medical-equipment', 'Professional medical equipment and tools', 'Stethoscope');

-- Insert default brands
INSERT INTO brands (name, image_url, description) VALUES
('Allergan', '/api/placeholder/150/75', 'Leading pharmaceutical company specializing in medical aesthetics'),
('Galderma', '/api/placeholder/150/75', 'Global leader in dermatology and aesthetic medicine'),
('Merz', '/api/placeholder/150/75', 'Innovative healthcare company focused on aesthetics'),
('Ipsen', '/api/placeholder/150/75', 'Global specialty-driven pharmaceutical group');

-- Insert sample products
INSERT INTO products (name, description, price, original_price, image_url, image_urls, category_id, featured, bulk_discounts, rating, review_count) VALUES
('Botox® Cosmetic 100U', 'FDA-approved botulinum toxin for the treatment of glabellar lines, crow''s feet, and forehead lines. Professional use only.', 599.99, 699.99, '/api/placeholder/400/400', '[]', 1, TRUE, '[{"quantity": 5, "discount": 5}, {"quantity": 10, "discount": 10}, {"quantity": 20, "discount": 15}]', 4.8, 124),
('Juvederm® Voluma XC', 'Hyaluronic acid dermal filler for cheek augmentation and correction of age-related volume loss. Includes lidocaine for comfort.', 549.99, NULL, '/api/placeholder/400/400', '[]', 2, TRUE, '[{"quantity": 3, "discount": 5}, {"quantity": 6, "discount": 8}, {"quantity": 12, "discount": 12}]', 4.7, 89),
('Restylane® Lyft', 'Hyaluronic acid filler for cheek augmentation and correction of nasolabial folds. Long-lasting results up to 18 months.', 499.99, 599.99, '/api/placeholder/400/400', '[]', 2, FALSE, '[{"quantity": 4, "discount": 6}, {"quantity": 8, "discount": 10}]', 4.6, 67);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, full_name) VALUES
('admin@medsgo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator');

-- Insert sample carousel items
INSERT INTO carousel_items (title, subtitle, description, price, original_price, discount, discount_percentage, image_url, background_gradient, on_sale, sort_order) VALUES
('Premium Botox Treatment', 'Professional Grade', 'FDA-approved botulinum toxin for cosmetic procedures with guaranteed authenticity and proper storage.', '599.99', '699.99', '15% OFF', 15, '/api/placeholder/500/400', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', TRUE, 1),
('Dermal Filler Collection', 'Complete Kit', 'Comprehensive hyaluronic acid filler collection for various facial enhancement procedures.', '1299.99', '1599.99', '20% OFF', 20, '/api/placeholder/500/400', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', FALSE, 2),
('Medical Equipment Sale', 'Professional Tools', 'High-quality injection equipment and treatment tools for medical professionals.', '899.99', '1199.99', '25% OFF', 25, '/api/placeholder/500/400', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', TRUE, 3);
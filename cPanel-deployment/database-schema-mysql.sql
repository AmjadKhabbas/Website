-- Meds-Go Medical Marketplace Database Schema (MySQL)
-- Created: August 1, 2025
-- Compatible with: MySQL 5.7+ and cPanel hosting

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Database: meds_go

-- Table structure for table `categories`
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `icon` text NOT NULL,
  `color` varchar(50) NOT NULL DEFAULT 'blue',
  `item_count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `brands`
CREATE TABLE `brands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image_url` text,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `brands_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `products`
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2),
  `image_url` text NOT NULL,
  `image_urls` json DEFAULT ('[]'),
  `category_id` int(11) NOT NULL,
  `rating` decimal(3,1) NOT NULL DEFAULT 0.0,
  `review_count` int(11) NOT NULL DEFAULT 0,
  `in_stock` tinyint(1) NOT NULL DEFAULT 1,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `tags` text,
  `bulk_discounts` json DEFAULT ('[]'),
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_featured` (`featured`),
  KEY `idx_in_stock` (`in_stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `cart_items`
CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `sessions`
CREATE TABLE `sessions` (
  `sid` varchar(255) NOT NULL,
  `sess` json NOT NULL,
  `expire` timestamp NOT NULL,
  PRIMARY KEY (`sid`),
  KEY `idx_expire` (`expire`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `ehri_accounts`
CREATE TABLE `ehri_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ehri_id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_token` varchar(255),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ehri_accounts_ehri_id_unique` (`ehri_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `users`
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `clinic_name` varchar(255) NOT NULL,
  `clinic_address` text NOT NULL,
  `clinic_city` varchar(255) NOT NULL,
  `clinic_state` varchar(100) NOT NULL,
  `clinic_postal_code` varchar(20) NOT NULL,
  `clinic_country` varchar(100) NOT NULL DEFAULT 'Canada',
  `medical_license_number` varchar(255) NOT NULL,
  `license_province` varchar(100) NOT NULL,
  `license_expiry_date` varchar(50) NOT NULL,
  `specialty` varchar(255) NOT NULL,
  `years_of_practice` int(11) NOT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `approval_status` varchar(50) NOT NULL DEFAULT 'pending',
  `approved_at` timestamp NULL,
  `approved_by` varchar(255),
  `saved_card_info` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `idx_is_approved` (`is_approved`),
  KEY `idx_approval_status` (`approval_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `orders`
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` json NOT NULL,
  `billing_address` json NOT NULL,
  `doctor_banking_info` json NOT NULL,
  `institution_number` varchar(100) NOT NULL,
  `card_info` json NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_status` varchar(50) NOT NULL DEFAULT 'pending',
  `notes` text,
  `admin_notes` text,
  `shipping_tracking_number` varchar(255),
  `estimated_delivery_date` varchar(50),
  `actual_delivery_date` varchar(50),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `order_items`
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image_url` varchar(500),
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `referrals`
CREATE TABLE `referrals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `clinic_name` varchar(255) NOT NULL,
  `referring_doctor_id` int(11),
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_referring_doctor_id` (`referring_doctor_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `newsletters`
CREATE TABLE `newsletters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `subscribed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletters_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `admin_users`
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `carousel_items`
CREATE TABLE `carousel_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255),
  `description` text NOT NULL,
  `price` varchar(50) NOT NULL,
  `original_price` varchar(50),
  `discount` varchar(20),
  `discount_percentage` int(11),
  `image_url` text NOT NULL,
  `background_gradient` varchar(200) DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  `text_color` varchar(50) DEFAULT '#ffffff',
  `on_sale` tinyint(1) NOT NULL DEFAULT 0,
  `badge_text` varchar(50),
  `badge_color` varchar(50) DEFAULT '#ef4444',
  `animation_type` varchar(50) DEFAULT 'fade',
  `display_duration` int(11) DEFAULT 5000,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `featured_carousel`
CREATE TABLE `featured_carousel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: admin123)
INSERT INTO `admin_users` (`email`, `password_hash`, `name`, `role`) VALUES
('admin@medsgo.com', '$2b$12$XvW3O1Zs6YzKmBxQy9RDKe6Y7JgLtHzQs3NpFr8VxCd2WqEr1McTe', 'Administrator', 'admin');

-- Insert sample categories
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `color`, `item_count`) VALUES
('Botulinum Toxins', 'botulinum-toxins', 'Professional botulinum toxin products', 'Syringe', 'blue', 0),
('Dermal Fillers', 'dermal-fillers', 'Premium dermal filler products', 'Heart', 'purple', 0),
('Orthopedic', 'orthopedic', 'Orthopedic medical supplies', 'Bone', 'green', 0),
('Rheumatology', 'rheumatology', 'Rheumatology treatments', 'Activity', 'orange', 0),
('Medical Devices', 'medical-devices', 'Professional medical devices', 'Stethoscope', 'red', 0);

-- Insert sample brands
INSERT INTO `brands` (`name`, `slug`, `description`, `is_active`) VALUES
('Allergan', 'allergan', 'Leading pharmaceutical company', 1),
('Galderma', 'galderma', 'Dermatology specialist', 1),
('Merz', 'merz', 'Aesthetic medicine leader', 1),
('Ipsen', 'ipsen', 'Global biopharmaceutical', 1);

COMMIT;
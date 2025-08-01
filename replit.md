# Meds-Go Medical Marketplace

## Overview

Meds-Go is a specialized medical marketplace web application that connects healthcare professionals with premium medical products including botulinum toxins, dermal fillers, orthopedic supplies, and other professional-grade medical equipment. The platform features strict licensing verification, admin management capabilities, and a comprehensive e-commerce system tailored for the medical industry.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Zustand for cart management and global state
- **Data Fetching**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling
- **Animations**: Framer Motion for smooth interactions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with session-based auth using express-session
- **Password Hashing**: bcryptjs for secure password storage
- **File Uploads**: Multer for image handling
- **Email**: Nodemailer with Gmail SMTP integration

### UI Design System
- **Design Language**: Medical-focused theme with professional blue color palette
- **Component Library**: Shadcn/ui components with "new-york" style
- **Styling**: Tailwind CSS with custom medical color variables
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Dark Mode**: Complete theme support with CSS custom properties

## Key Components

### Authentication System
- **Dual Authentication**: Separate login flows for regular users (doctors) and admin users
- **User Verification**: Medical license verification process for healthcare professionals
- **Admin Management**: Dedicated admin panel with user approval workflows
- **Session Management**: Express sessions with memory store for development

### E-commerce Features
- **Product Catalog**: Categories, brands, and detailed product listings
- **Shopping Cart**: Persistent cart with bulk discount calculations
- **Bulk Pricing**: Dynamic discount tiers based on quantity
- **Image Gallery**: Multi-image product displays with zoom functionality
- **Search & Filter**: Advanced product search with category filtering

### Admin Dashboard
- **User Management**: Approve pending healthcare professional registrations
- **Product Management**: CRUD operations for products with image upload
- **Order Management**: Process and track customer orders
- **Carousel Management**: Dynamic homepage banner content management
- **Analytics**: Order tracking and user approval workflows

### Content Management
- **Dynamic Carousel**: Admin-configurable homepage slideshow
- **Product Images**: Support for multiple product images with gallery view
- **Category Management**: Organized product categories with custom icons
- **Brand Management**: Featured brand listings with logos

## Data Flow

### User Registration Flow
1. Healthcare professional submits registration with credentials
2. System validates medical license information
3. Admin reviews and approves/rejects application
4. Approved users gain full marketplace access

### Order Processing Flow
1. Authenticated user adds products to cart
2. Bulk discounts automatically calculated
3. User proceeds through checkout with shipping/billing info
4. Order submitted to admin for processing
5. Admin reviews and fulfills orders

### Product Management Flow
1. Admin creates products with images and pricing
2. Bulk discount tiers configured per product
3. Products organized into categories and brands
4. Featured products highlighted on homepage

## External Dependencies

### Database
- **ORM**: Drizzle ORM with MySQL dialect (migrated from PostgreSQL)
- **Provider**: MySQL 5.7+ (cPanel compatible, migrated from Neon PostgreSQL)
- **Driver**: mysql2 connection pooling (replaced @neondatabase/serverless)
- **Schema**: Comprehensive MySQL schema with 15 tables covering users, products, orders, and admin entities
- **Migrations**: Direct SQL import via phpMyAdmin using database-schema-mysql.sql

### File Storage
- **Images**: Local file upload with multer (uploads directory)
- **Product Images**: Support for multiple images per product
- **Image Processing**: Basic validation for supported formats (JPEG, PNG, GIF, WebP)

### Email Services
- **Provider**: Gmail SMTP with app passwords
- **Use Cases**: User registration confirmations, order notifications
- **Fallback**: Graceful degradation when email credentials unavailable

### Third-Party Integrations
- **Authentication**: Passport.js with local strategy
- **UI Components**: Radix UI for accessible components
- **Icons**: Lucide React for consistent iconography
- **Analytics**: Ready for integration with tracking services

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with fast refresh
- **Database**: Neon serverless PostgreSQL connection
- **Session Storage**: Memory store for development sessions
- **File Uploads**: Local storage in uploads directory

### Production Considerations
- **Build Process**: Vite production build with code splitting
- **Static Assets**: Bundled and optimized for CDN deployment
- **Database**: Production-ready Neon PostgreSQL cluster
- **Session Storage**: Recommended upgrade to Redis or database sessions
- **File Storage**: Consider cloud storage (AWS S3, Cloudinary) for images
- **Security**: HTTPS required, secure session configuration

### Environment Variables
- `DATABASE_URL`: Neon PostgreSQL connection string
- `SESSION_SECRET`: Secure session encryption key
- `GMAIL_USER`: Email service account
- `GMAIL_APP_PASSWORD`: Gmail app-specific password
- `NODE_ENV`: Environment mode (development/production)

## Changelog

```
Changelog:
- August 1, 2025. MAJOR: Complete PostgreSQL to MySQL migration for cPanel deployment
  - CHECKPOINT: Successfully migrated entire project from PostgreSQL/Neon to MySQL:
    * Converted all 15 database tables from PostgreSQL to MySQL syntax
    * Updated schema definitions: SERIAL→AUTO_INCREMENT, JSONB→JSON, BOOLEAN→TINYINT(1)
    * Replaced @neondatabase/serverless with mysql2 driver throughout project
    * Created complete MySQL schema file (database-schema-mysql.sql) for phpMyAdmin import
    * Updated connection code to support both DATABASE_URL and individual cPanel credentials
    * Built final deployment package (1.1MB) ready for cPanel public_html upload
    * All 92 products preserved across 5 categories with full functionality
    * No Replit dependencies - completely self-contained cPanel package
- August 1, 2025. MAJOR: Complete PostgreSQL to MySQL migration for cPanel deployment
  - CHECKPOINT: Successfully migrated entire project from PostgreSQL/Neon to MySQL:
    * Converted all 15 database tables from PostgreSQL to MySQL syntax
    * Updated schema definitions: SERIAL→AUTO_INCREMENT, JSONB→JSON, BOOLEAN→TINYINT(1)
    * Replaced @neondatabase/serverless with mysql2 driver throughout project
    * Created complete MySQL schema file (database-schema-mysql.sql) for phpMyAdmin import
    * Updated connection code to support both DATABASE_URL and individual cPanel credentials
    * Built final deployment package (1.1MB) ready for cPanel public_html upload
    * All 92 products preserved across 5 categories with full functionality
    * No Replit dependencies - completely self-contained cPanel package
- July 30, 2025. Enhanced featured products carousel with clickable navigation
  - CHECKPOINT: Featured products carousel fully functional with:
    * Replaced "OUR BRANDS" section with scrolling featured products carousel
    * Added database schema and API routes for admin-managed featured products
    * Created smooth auto-scrolling carousel with product navigation links
    * Admin can add/remove products from carousel via management interface
    * Each carousel product now links to individual product detail pages (/product/{id})
    * Fixed database WebAssembly configuration to prevent memory errors
- July 9, 2025. Enhanced admin order management with complete payment visibility
  - CHECKPOINT: Admin can now see ALL order information including:
    * Full unmasked card numbers (not ****1234)
    * Complete CVC/CVV codes
    * Cardholder names and card types
    * Full banking details (account numbers, routing numbers, bank names)
    * Complete shipping and billing addresses
    * All sensitive information displayed directly in admin dashboard
  - Removed "Payment Information (Confidential)" text - replaced with actual data
  - Added color-coded sections: red for payment info, blue for shipping, green for billing
  - Admin dashboard now shows comprehensive order details for complete management
- July 9, 2025. Fixed critical checkout form submission issue
  - Resolved billing address validation preventing form submission
  - Removed institution number and clinic name requirements per user request
  - Added comprehensive card information display for admin users only
  - Enhanced admin order details with full transaction date/time display
  - Implemented secure payment information viewing with clear admin-only warnings
- July 8, 2025. Added comprehensive admin order management system
  - Implemented admin order viewing with complete purchase history
  - Added order status management (pending, approved, declined, shipped)
  - Created secure banking/payment information display for admin users
  - Added comprehensive doctor information display for each order
  - Integrated order approval/decline workflow with admin controls
- July 8, 2025. Implemented server-side pagination to handle large product categories
  - Fixed 64MB database response limit issue for Dermal Fillers category (49 products)
  - Added pagination with 15 items per page for regular users, 50 for admin users
  - Preserved all 92 existing products in database with proper accessibility
  - Improved query performance by avoiding large joins
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
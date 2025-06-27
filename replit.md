# Medical Marketplace Application

## Overview

This is a full-stack web application for a medical marketplace, allowing healthcare professionals to browse, order, and manage medical supplies and equipment. The application features both a customer-facing interface for doctors and an administrative dashboard for managing products, orders, and user approvals.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: Zustand for cart management and global state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for development and building
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion for smooth interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with session-based auth
- **Session Storage**: Express-session with memory store
- **File Uploads**: Multer for handling image uploads

### Database Schema
- **Users**: Doctor registration with license verification
- **Admin Users**: Separate admin authentication system
- **Products**: Medical supplies with categories, pricing, and bulk discounts
- **Categories**: Product categorization system
- **Brands**: Product brand management
- **Cart Items**: Shopping cart functionality
- **Orders**: Order management with bank transfer payment
- **EHRI Accounts**: External healthcare registry integration
- **Carousel Items**: Homepage banner management

## Key Components

### Authentication System
- **Dual Authentication**: Separate systems for regular users (doctors) and administrators
- **User Registration**: Doctor registration with license verification and admin approval workflow
- **Admin Authentication**: Hardcoded admin credentials with bcrypt password hashing
- **Session Management**: Cookie-based sessions with HTTP-only security

### Product Management
- **Product Catalog**: Comprehensive product listing with categories and search
- **Bulk Pricing**: Multi-tier discount system based on quantity
- **Image Management**: Multiple product images with upload functionality
- **Inventory Tracking**: Stock status and featured product management

### Shopping Cart
- **Session-based Cart**: Cart persistence using browser storage
- **Bulk Discount Calculation**: Automatic price calculation based on quantity tiers
- **Real-time Updates**: Live cart updates with quantity changes

### Payment Processing
- **Bank Transfer**: Primary payment method with bank details collection
- **Stripe Integration**: Alternative payment processor (configured but not primary)
- **Order Management**: Complete order lifecycle tracking

### Administrative Features
- **User Approval**: Manual approval workflow for doctor registrations
- **Product Administration**: CRUD operations for products, categories, and pricing
- **Order Management**: View and manage customer orders with bank details
- **Carousel Management**: Homepage banner content management

## Data Flow

1. **User Registration**: Doctors register → Admin approval required → Account activation
2. **Product Browsing**: Category navigation → Product search/filter → Product details
3. **Cart Management**: Add to cart → Quantity adjustment → Bulk discount calculation
4. **Checkout Process**: Cart review → Shipping details → Bank transfer info → Order confirmation
5. **Order Fulfillment**: Admin views orders → Bank transfer verification → Order processing

## External Dependencies

- **@neondatabase/serverless**: PostgreSQL database connection
- **@sendgrid/mail**: Email service for notifications (alternative to Gmail)
- **@stripe/stripe-js**: Payment processing capabilities
- **bcryptjs**: Password hashing for security
- **passport**: Authentication middleware
- **multer**: File upload handling
- **drizzle-orm**: Database ORM and migrations

## Deployment Strategy

- **Development**: Vite dev server with hot reloading
- **Build Process**: Vite build for client + esbuild for server
- **Production**: Node.js server serving built assets
- **Database**: Neon PostgreSQL serverless database
- **Static Assets**: Local file storage for uploads
- **Session Storage**: Memory store (suitable for single-instance deployment)

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 27, 2025. Initial setup
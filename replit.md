# Medical Marketplace Application

## Overview

This is a full-stack medical marketplace application built with Express.js backend, React frontend, and PostgreSQL database. The platform connects medical professionals with pharmaceutical products, featuring admin controls, user authentication, and e-commerce functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: Zustand for cart management, React Query for server state
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite with hot module replacement
- **Animations**: Framer Motion for smooth interactions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with HTTP connection pooling
- **Authentication**: Passport.js with local strategy and bcrypt password hashing
- **Session Management**: Express sessions with in-memory store
- **File Uploads**: Multer for image handling
- **Email Service**: Nodemailer with Gmail SMTP support

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database
- **Connection Method**: HTTP-based connection for better stability
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- **Dual Authentication**: Supports both regular users and admin users
- **Password Security**: bcrypt with 12 salt rounds for secure hashing
- **Session Management**: HTTP-only cookies with 7-day expiration
- **Role-based Access**: Separate authentication flows for users and admins

### E-commerce Features
- **Product Management**: Full CRUD operations with image galleries
- **Shopping Cart**: Persistent cart with session tracking
- **Bulk Pricing**: Tiered discount system for quantity purchases
- **Checkout Process**: Bank transfer payment method integration
- **Order Management**: Complete order tracking and admin oversight

### User Management
- **Registration**: Medical professional verification system
- **Approval Workflow**: Admin approval required for new users
- **Profile Management**: Professional credentials and practice information
- **License Verification**: Mandatory license number validation

### Admin Panel
- **Dashboard**: Overview of orders, users, and products
- **User Approval**: Manage pending user registrations
- **Product Management**: Add, edit, and delete products with image galleries
- **Order Oversight**: View and manage all customer orders with bank details
- **Carousel Management**: Dynamic homepage banner management

## Data Flow

### User Registration Flow
1. User submits registration with professional credentials
2. Password is hashed with bcrypt and stored securely
3. Account enters pending status awaiting admin approval
4. Admin reviews and approves/rejects the application
5. Approved users can access the marketplace

### Order Processing Flow
1. User adds products to cart with quantity-based pricing
2. Cart persists across sessions with unique session ID
3. User proceeds to checkout with shipping information
4. Bank transfer details are collected securely
5. Order is created with encrypted bank information
6. Admin can view and process orders through dashboard

### Product Management Flow
1. Admin uploads product images via drag-and-drop interface
2. Product details including bulk pricing tiers are configured
3. Products are categorized and tagged for searchability
4. Real-time inventory and pricing updates through admin panel

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **bcryptjs**: Password hashing and verification
- **passport**: Authentication middleware
- **multer**: File upload handling
- **nodemailer**: Email service integration

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **framer-motion**: Animation library
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation and type safety

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the application
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration management

## Deployment Strategy

### Build Configuration
- **Frontend Build**: Vite builds to `dist/public` directory
- **Backend Build**: esbuild compiles server to `dist/index.js`
- **Static Assets**: Served from build output directory
- **Environment Variables**: Database URL and session secrets required

### Production Considerations
- Database connection uses HTTP pooling for reliability
- Session store configured for memory-based storage
- File uploads stored locally with configurable limits
- CORS and security headers configured for production use

### Environment Setup
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secure session encryption key
- `GMAIL_USER`: Email service authentication (optional)
- `GMAIL_APP_PASSWORD`: Gmail app password for notifications

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 27, 2025. Initial setup
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
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Provider**: Neon Database (serverless PostgreSQL)
- **Schema**: Comprehensive schema covering users, products, orders, and admin entities
- **Migrations**: Automated schema management with drizzle-kit

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
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
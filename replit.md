# Medical Marketplace Application

## Project Overview
A specialized medical marketplace platform that enables secure, professional transactions between healthcare providers and medical product suppliers. The platform focuses on providing a streamlined, compliant purchasing experience with advanced authentication and verification mechanisms.

## Architecture
- **Frontend**: React with TypeScript, Vite, TailwindCSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with admin/user roles
- **Payment**: Manual bank information processing (no automated payments)
- **Security**: Enhanced encryption, rate limiting, input validation

## Recent Changes
- **2025-01-26**: Implemented carousel product linking system allowing admin to link carousel items to specific products
- **2025-01-26**: Added comprehensive security measures including:
  - AES-256 encryption for sensitive data
  - Rate limiting for API endpoints
  - Input validation and sanitization
  - Security headers with Helmet
  - Anti-phishing protection for forms
  - Secure form components with visual security indicators
- **2025-01-26**: Enhanced billing system with saved address functionality
- **2025-01-26**: Implemented compact product view for better space utilization

## Security Features
- **Data Encryption**: All sensitive data (bank details, credit card info) encrypted using AES-256-GCM
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: All user inputs sanitized to prevent XSS and injection attacks
- **Security Headers**: CSP, HSTS, and other security headers implemented
- **Audit Logging**: Security events logged for monitoring
- **Secure Forms**: Visual security indicators and encrypted input fields

## User Preferences
- Focus on maximum security for financial data
- Compact product views for better organization
- Manual payment processing instead of automated systems
- Admin control over carousel product linking

## Database Schema
- **Users**: Medical professionals with license verification
- **Products**: Medical products with categories and bulk pricing
- **Orders**: Manual payment processing with encrypted bank details
- **Carousel**: Hero section items with product linking capability
- **Admin**: Separate admin user system

## Key Features
- Medical professional verification system
- Bulk discount pricing
- Carousel management with product linking
- Secure manual payment processing
- Comprehensive admin dashboard
- Real-time order management
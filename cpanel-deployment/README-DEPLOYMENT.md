# Meds-Go Medical Marketplace - cPanel Deployment Guide

## Overview
This is a complete Node.js/Express medical marketplace application with all backend configuration files exposed for cPanel hosting. No hidden dependencies or Replit-specific services.

## What's Included
✅ **Complete Backend Configuration**:
- `config.js` - All environment variables in one file
- `src/db.js` - Database connection configuration  
- `src/schema.js` - Complete database schema definitions
- `src/storage.js` - Database operations layer
- `.env.example` - Alternative environment file template

✅ **Self-Contained Application**:
- Single `index.js` entry point
- Built application in `dist/` folder
- Static assets in `dist/public/`
- File upload directory `uploads/`
- All dependencies listed in `package.json`

✅ **No External Dependencies**:
- No Replit-specific services
- No hidden environment variables
- WebAssembly disabled for shared hosting compatibility

## Prerequisites
Your cPanel hosting must support:
- Node.js (version 18 or higher)
- MySQL database (version 5.7 or higher)
- File upload permissions

## Database Requirements
⚠️ **IMPORTANT**: This project REQUIRES a MySQL database. It cannot run without one.

### Database Tables (MySQL)
The application uses the following MySQL tables:
- `users` - Healthcare professionals
- `admin_users` - Admin accounts  
- `products` - Medical products catalog
- `categories` - Product categories
- `brands` - Product brands
- `orders` - Customer orders
- `cart_items` - Shopping cart items
- `featured_carousel` - Homepage featured products
- `carousel_items` - Homepage banners
- `newsletters` - Email subscriptions
- `sessions` - User sessions
- `referrals` - Doctor referral program
- `ehri_accounts` - EHRI account linking
- `order_items` - Order line items

## Deployment Steps

### 1. Database Setup
1. Create a MySQL database in cPanel
2. Import the SQL script `database-schema-mysql.sql` via phpMyAdmin
3. Note down your database connection details:
   - Host (usually localhost)
   - Port (usually 3306)
   - Database name
   - Username  
   - Password

### 2. Configuration Options

**Option A: Using config.js (Recommended)**
1. Open `config.js` and update ALL values:
   ```javascript
   DATABASE_URL: "mysql://username:password@host:port/database_name"
   // OR use individual credentials:
   DB_HOST: "localhost"
   DB_USER: "your_cpanel_db_user"
   DB_PASSWORD: "your_cpanel_db_password"
   DB_NAME: "your_cpanel_db_name"
   SESSION_SECRET: "your-unique-secret-key"
   GMAIL_USER: "your-email@gmail.com"
   GMAIL_APP_PASSWORD: "your-gmail-app-password"
   STRIPE_SECRET_KEY: "sk_live_your_stripe_key"
   // ... other settings
   ```

**Option B: Using .env file**
1. Copy `.env.example` to `.env`
2. Update all values in the `.env` file
3. The application will automatically load these

**Backend Configuration Files Available**:
- `src/db.js` - Database connection setup
- `src/schema.js` - All database table definitions
- `src/storage.js` - Database operations (CRUD functions)

### 3. Upload Files
1. Zip the entire `cpanel-deployment` folder
2. Upload to your `public_html` directory (or subdomain folder)
3. Extract the files
4. Ensure the `uploads` folder has write permissions (755 or 777)

### 4. Install Dependencies
In cPanel File Manager or SSH:
```bash
cd /path/to/your/app
npm install
```

### 5. Start the Application
In cPanel Node.js Selector:
1. Set the startup file to: `index.js`
2. Set Node.js version to 18 or higher
3. Start the application

## Environment Variables (Alternative to config.js)
If your cPanel supports .env files, you can create one instead of using config.js:

```env
DATABASE_URL=postgresql://username:password@host:port/database_name
SESSION_SECRET=your-unique-secret-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
STRIPE_SECRET_KEY=sk_live_your_stripe_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_key
NODE_ENV=production
PORT=3000
```

## Security Checklist
- [ ] Change default admin password in database
- [ ] Update SESSION_SECRET to a unique value
- [ ] Use production Stripe keys
- [ ] Verify DATABASE_URL uses SSL connection
- [ ] Set proper file permissions on uploads folder
- [ ] Test all payment flows before going live

## File Structure
```
cpanel-deployment/
├── index.js           # Main entry point
├── config.js          # Configuration file
├── package.json       # Dependencies
├── database-schema.sql # Database setup
├── dist/              # Built application
│   ├── index.js       # Server bundle
│   └── public/        # Static assets
└── uploads/           # File upload directory
```

## Troubleshooting

### Common Issues:
1. **Database Connection Error**: Verify DATABASE_URL format and credentials
2. **Module Not Found**: Run `npm install` in the application directory
3. **Permission Denied**: Check file permissions on uploads folder
4. **Port Already in Use**: Change PORT in config.js
5. **WebAssembly Errors**: The app includes WebAssembly disable configuration

### Logs:
Check cPanel error logs for detailed error messages.

## Support
For technical support with this deployment, ensure you have:
- Access to cPanel with Node.js support
- PostgreSQL database access
- Domain/subdomain configured properly

## Production Notes
- The application serves both API endpoints and frontend assets
- File uploads are stored in the `uploads` directory
- Session data is stored in PostgreSQL
- Email notifications require Gmail SMTP configuration
- Payment processing requires valid Stripe configuration